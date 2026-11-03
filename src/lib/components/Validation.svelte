<!--
 @component
 A model's validations: the figures reproducing its publication. Unlike the
 dashboard's analyses these are slow, so a figure only runs when it is opened,
 and always on a freshly built model, so sliders and fits don't affect them.
-->
<script
  lang="ts"
  module
>
  import type { ValidationResult as Result } from "../validation/run";

  // Finished figures of the model shown last; outlives the component, which the
  // page's tabs unmount. One model at a time keeps it small.
  const cache: {
    slug: string;
    done: Map<string, { seconds: number; result: Result }>;
  } = { slug: "", done: new Map() };
</script>

<script lang="ts">
  import {
    Accordion,
    Button,
    HeatmapChart,
    PlotChart,
    StackedBarChart,
  } from "@computational-biology-aachen/design";
  import Row from "@computational-biology-aachen/design/Row.svelte";
  import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import { buildModel } from "../loadModel";
  import {
    createValidationPool,
    type ValidationPool,
  } from "../validation/browser";
  import { decimate } from "../validation/decimate";
  import { expandScans } from "../validation/helpers";
  import { runValidation, type ValidationResult } from "../validation/run";
  import type {
    LinePlot,
    Plot,
    Rule,
    SeriesStyle,
    Validation,
  } from "../validation/types";

  let {
    slug,
    validations,
  }: {
    slug: string;
    validations: Validation[];
  } = $props();

  type Done = { seconds: number; result: ValidationResult };
  type Status =
    | { state: "idle" }
    | { state: "queued" }
    | { state: "running"; done: number; total: number }
    | ({ state: "done" } & Done)
    | { state: "failed"; message: string }
    | { state: "cancelled" };

  let statuses = $state<Record<string, Status>>({});
  let opened = $state<Record<string, boolean>>({});
  // Waiting figures, run one after another on a shared worker pool.
  let queue: Validation[] = [];
  let pool: ValidationPool | undefined;
  // The figure being simulated; its token goes stale when it is cancelled.
  let current: { id: string; token: object } | undefined;
  let draining = false;
  let busy = $state(false);

  // Slugs share this component across navigation; a new model starts clean.
  // Finished figures of the same model come back from the cache, e.g. after a
  // tab switch unmounted this component.
  $effect.pre(() => {
    if (cache.slug !== slug) {
      cache.slug = slug;
      cache.done = new Map();
    }
    statuses = Object.fromEntries(
      [...cache.done].map(([id, d]) => [id, { state: "done", ...d }]),
    );
    opened = Object.fromEntries([...cache.done.keys()].map((id) => [id, true]));
    return () => stopAll("idle");
  });

  async function freshModel(): Promise<KineticModelBuilder> {
    const model = await buildModel(slug);
    if (!(model instanceof KineticModelBuilder)) {
      throw new Error("Validations need a kinetic model");
    }
    return model;
  }

  function enqueue(v: Validation) {
    const state = statuses[v.id]?.state ?? "idle";
    if (state === "done" || state === "queued" || state === "running") return;
    statuses[v.id] = { state: "queued" };
    queue.push(v);
    busy = true;
    if (!draining) void drain();
  }

  async function drain() {
    draining = true;
    try {
      for (let v = queue.shift(); v; v = queue.shift()) await runOne(v);
    } finally {
      draining = false;
      busy = false;
      pool?.terminate();
      pool = undefined;
    }
  }

  async function runOne(v: Validation) {
    const token = {};
    current = { id: v.id, token };
    const live = () => current?.token === token;
    const active = (pool ??= createValidationPool());
    const total = Object.keys(expandScans(v).scenarios).length;
    statuses[v.id] = { state: "running", done: 0, total };
    const started = performance.now();
    try {
      const result = await runValidation(
        v,
        await freshModel(),
        active.simulate,
        {
          concurrency: active.concurrency,
          onProgress: (done, total) => {
            if (live()) statuses[v.id] = { state: "running", done, total };
          },
        },
      );
      if (!live()) return;
      const done = { seconds: (performance.now() - started) / 1000, result };
      cache.done.set(v.id, done);
      statuses[v.id] = { state: "done", ...done };
    } catch (e) {
      if (!live()) return;
      statuses[v.id] = {
        state: "failed",
        message: e instanceof Error ? e.message : String(e),
      };
    } finally {
      if (live()) current = undefined;
    }
  }

  /** Stop one figure: drop it from the queue, or kill the run it is in. */
  function stop(id: string, state: "idle" | "cancelled") {
    const waiting = queue.findIndex((v) => v.id === id);
    if (waiting >= 0) {
      queue.splice(waiting, 1);
      statuses[id] = { state };
    } else if (current?.id === id) {
      current = undefined;
      // Terminating the workers is the only way to stop a solve; the next
      // queued figure gets a fresh pool.
      pool?.terminate();
      pool = undefined;
      statuses[id] = { state };
    }
  }

  function stopAll(state: "idle" | "cancelled") {
    for (const v of [...queue]) stop(v.id, state);
    if (current) stop(current.id, state);
  }

  // Opening a figure runs it; closing it before it finishes cancels it.
  function toggled(v: Validation, e: Event) {
    const details = e.target as HTMLDetailsElement;
    if (details.parentElement !== e.currentTarget) return;
    opened[v.id] = details.open;
    if (details.open) enqueue(v);
    else stop(v.id, "idle");
  }

  function runAll() {
    for (const v of validations) {
      opened[v.id] = true;
      enqueue(v);
    }
  }

  const MAX_CHART_POINTS = 2000;

  /** A scatter has no order to decimate along, so take evenly spaced points. */
  function thin(col: number[]): number[] {
    const stride = Math.ceil(col.length / MAX_CHART_POINTS);
    return stride <= 1 ? col : col.filter((_, i) => i % stride === 0);
  }

  // Specs give sizes in matplotlib points; charts are drawn smaller than a
  // matplotlib figure, so one point maps to about one pixel.
  const PX_PER_PT = 1.3;

  /** A series' styling, from matplotlib units to the chart's. */
  function style(s: SeriesStyle, markers: boolean) {
    return {
      ...(s.color ? { color: s.color } : {}),
      ...(s.marker ? { marker: s.marker } : {}),
      ...(s.markerFace ? { markerFace: s.markerFace } : {}),
      ...(s.markerEdge ? { markerEdge: s.markerEdge } : {}),
      ...(s.dash ? { dash: s.dash } : {}),
      ...(s.alpha !== undefined ? { alpha: s.alpha } : {}),
      ...(s.zorder !== undefined ? { zorder: s.zorder } : {}),
      ...(s.markEvery !== undefined ? { markEvery: s.markEvery } : {}),
      lineWidth: (s.lineWidth ?? 1.5) * PX_PER_PT,
      ...(markers || s.marker
        ? { markerSize: (s.markerSize ?? 6) * 0.6 * PX_PER_PT }
        : {}),
    };
  }

  function lineSeries(plot: LinePlot, result: ValidationResult) {
    return plot.y.map((line) => {
      const allX = result.column(line.x ?? plot.x);
      const range = line.xRange;
      const keep = (_: number, i: number) =>
        !range || (allX[i] >= range[0] && allX[i] <= range[1]);
      const column = (src: string) => result.column(src).filter(keep);
      const x = allX.filter(keep);
      const y = column(line.of);
      const fillTo = line.fillTo ? column(line.fillTo) : undefined;
      const err = line.err ? column(line.err) : undefined;
      const sign = line.colorBySign;
      const segmentColors = sign
        ? column(sign.of).map((v) => (v >= 0 ? sign.positive : sign.negative))
        : undefined;
      // Fills, error bars and segment colours index the raw points, so they
      // skip decimation.
      const raw =
        line.fillTo !== undefined ||
        line.err !== undefined ||
        sign !== undefined;
      return {
        ...(raw ? { x, y } : decimate(x, y, plot.logX ? { log: true } : {})),
        ...(line.label ? { label: line.label } : {}),
        ...(line.axis ? { axis: line.axis } : {}),
        ...(line.style ? { style: line.style } : {}),
        ...(err ? { err } : {}),
        ...(line.errLineWidth !== undefined
          ? { errLineWidth: line.errLineWidth * PX_PER_PT }
          : {}),
        ...(line.capSize !== undefined
          ? { capSize: line.capSize * PX_PER_PT }
          : {}),
        ...(fillTo ? { fillTo } : {}),
        ...(segmentColors ? { segmentColors } : {}),
        ...(line.endLabel ? { endLabel: line.endLabel } : {}),
        ...style(line, line.style === "markers"),
      };
    });
  }

  const annotations = (plot: Plot, result: ValidationResult) =>
    plot.annotations?.map((a) => ({
      ...a,
      x: typeof a.x === "string" ? asNumber(result, a.x) : a.x,
      y: typeof a.y === "string" ? asNumber(result, a.y) : a.y,
      ...(a.size !== undefined ? { size: a.size * PX_PER_PT } : {}),
    }));

  const rules = (rs: Rule[] | undefined) =>
    rs?.map((r) => ({
      ...r,
      lineWidth: (r.lineWidth ?? 1.5) * PX_PER_PT,
    }));

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  /**
   * The figure's grid: `columns` panels per row, or one count per row. Rows of
   * different lengths share a grid of their least common multiple of columns.
   */
  function layout(v: Validation) {
    if (v.columns === undefined) return undefined;
    const rows = typeof v.columns === "number" ? [v.columns] : v.columns;
    const columns = rows.reduce((a, b) => (a * b) / gcd(a, b));
    const spans = v.plots.map((_, i) => {
      let k = i;
      for (const n of rows.slice(0, -1)) {
        if (k < n) return columns / n;
        k -= n;
      }
      return columns / rows[rows.length - 1];
    });
    return { columns, spans };
  }

  const asNumber = (result: ValidationResult, src: string) =>
    result.value(src) as number;
</script>

<div class="validations">
  <Row justify="end">
    {#if busy}
      <Button onclick={() => stopAll("cancelled")}>Cancel</Button>
    {:else}
      <Button onclick={runAll}>Run all</Button>
    {/if}
  </Row>
  {#each validations as validation (validation.id)}
    {@const status = statuses[validation.id] ?? { state: "idle" }}
    <div ontogglecapture={(e) => toggled(validation, e)}>
      <Accordion
        title={validation.title}
        open={opened[validation.id] ?? false}
      >
        <div class="validation">
          <Row
            justify="end"
            wrap
          >
            <span aria-live="polite">
              {#if status.state === "queued"}
                Queued
              {:else if status.state === "running"}
                {status.done} / {status.total} simulations
              {:else if status.state === "done"}
                {status.seconds.toFixed(1)} s
              {/if}
            </span>
          </Row>
          {#if status.state === "failed" || status.state === "cancelled"}
            <p role={status.state === "failed" ? "alert" : undefined}>
              {status.state === "failed" ? status.message : "Cancelled."}
            </p>
            <Row justify="end">
              <Button onclick={() => enqueue(validation)}>Retry</Button>
            </Row>
          {:else if status.state === "done"}
            {@const grid = layout(validation)}
            <div
              class="plots"
              class:fixed={grid !== undefined}
              style:--columns={grid?.columns}
            >
              {#each validation.plots as plot, i (i)}
                <div
                  class:wide={plot.type === "heatmap" && grid === undefined}
                  style:--span={grid?.spans[i] ?? 1}
                >
                  {#if plot.title || plot.panel}
                    <p class="plot-title">
                      {#if plot.panel}<span class="panel">{plot.panel}</span
                        >{/if}
                      {plot.title ?? ""}
                    </p>
                  {/if}
                  {#if plot.type === "line"}
                    <PlotChart
                      series={lineSeries(plot, status.result)}
                      xLabel={plot.xLabel}
                      yLabel={plot.yLabel}
                      yRightLabel={plot.yRightLabel}
                      xLim={plot.xLim}
                      yLim={plot.yLim}
                      yRightLim={plot.yRightLim}
                      yColor={plot.yColor}
                      yRightColor={plot.yRightColor}
                      axes={plot.axes}
                      xTicks={plot.xTicks}
                      xTickLabels={plot.xTickLabels}
                      yTicks={plot.yTicks}
                      yRightTicks={plot.yRightTicks}
                      logX={plot.logX}
                      logY={plot.logY}
                      reverseX={plot.reverseX}
                      reverseY={plot.reverseY}
                      phases={plot.phases}
                      hLines={rules(plot.hLines)}
                      vLines={rules(plot.vLines)}
                      annotations={annotations(plot, status.result)}
                      legend={plot.legend}
                      legendTitle={plot.legendTitle}
                      legendPosition={plot.legendPosition}
                      grid={plot.grid ?? false}
                      margin={0.05}
                    />
                  {:else if plot.type === "scatter"}
                    <PlotChart
                      series={plot.series.map((s) => ({
                        x: thin(status.result.column(s.x)),
                        y: thin(status.result.column(s.y)),
                        style: "markers" as const,
                        ...(s.label ? { label: s.label } : {}),
                        ...style(s, true),
                        zorder: s.zorder ?? 1,
                      }))}
                      xLabel={plot.xLabel}
                      yLabel={plot.yLabel}
                      xLim={plot.xLim ?? plot.lim}
                      yLim={plot.yLim ?? plot.lim}
                      xTicks={plot.xTicks}
                      yTicks={plot.yTicks}
                      identity={plot.identity ? plot.lim : undefined}
                      annotations={annotations(plot, status.result)}
                      legend={plot.legend}
                      legendTitle={plot.legendTitle}
                      legendPosition={plot.legendPosition}
                      grid={plot.grid ?? false}
                      margin={0.05}
                    />
                  {:else if plot.type === "stackedBar"}
                    <StackedBarChart
                      categories={plot.categories}
                      stacks={plot.stacks.map((stack) => ({
                        label: stack.label,
                        values: stack.of.map((e) => asNumber(status.result, e)),
                        ...(stack.color ? { color: stack.color } : {}),
                      }))}
                      yLabel={plot.yLabel}
                      yLim={plot.yLim}
                      yTicks={plot.yTicks}
                      reverseLegend={plot.reverseLegend}
                      grid={plot.grid ?? false}
                    />
                  {:else}
                    <HeatmapChart
                      rows={plot.rows}
                      columns={plot.columns}
                      colormap={plot.colormap}
                      xLabel={plot.xLabel}
                      yLabel={plot.yLabel}
                      values={plot.z.map((row) =>
                        row.map((e) => asNumber(status.result, e)),
                      )}
                    />
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </Accordion>
    </div>
  {/each}
</div>

<style>
  .validations,
  .validation {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 100%;
  }

  .plots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-3);
  }

  /* The figure's own grid where there is room for it. */
  @media (min-width: 720px) {
    .plots.fixed {
      grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
    }

    .plots.fixed > * {
      grid-column: span var(--span);
    }
  }

  .wide {
    grid-column: 1 / -1;
  }

  .plot-title {
    font-weight: 600;
  }

  .panel {
    margin-right: var(--space-2);
    font-weight: 700;
  }
</style>
