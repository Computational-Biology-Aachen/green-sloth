<!--
 @component
 A model's validations: the figures reproducing its publication. Unlike the
 dashboard's analyses these are slow, so they only run on an explicit click, and
 always on a freshly built model, so sliders and fits don't affect them.
-->
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

  type Status =
    | { state: "idle" }
    | { state: "running"; done: number; total: number }
    | { state: "done"; seconds: number; result: ValidationResult }
    | { state: "failed"; message: string };

  let statuses = $state<Record<string, Status>>({});
  // Figures start closed; running one opens it so its result can be seen.
  let opened = $state<Record<string, boolean>>({});
  let pool: ValidationPool | undefined;
  let running = $state(false);
  let cancelled = false;

  // Slugs share this component across navigation; a new model starts clean.
  $effect.pre(() => {
    void slug;
    statuses = {};
    opened = {};
    return () => {
      pool?.terminate();
      pool = undefined;
      running = false;
    };
  });

  async function freshModel(): Promise<KineticModelBuilder> {
    const model = await buildModel(slug);
    if (!(model instanceof KineticModelBuilder)) {
      throw new Error("Validations need a kinetic model");
    }
    return model;
  }

  async function run(targets: Validation[]) {
    running = true;
    cancelled = false;
    pool = createValidationPool();
    const active = pool;
    for (const v of targets) {
      statuses[v.id] = { state: "idle" };
      opened[v.id] = true;
    }
    try {
      for (const v of targets) {
        if (cancelled) break;
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
                statuses[v.id] = { state: "running", done, total };
              },
            },
          );
          statuses[v.id] = {
            state: "done",
            seconds: (performance.now() - started) / 1000,
            result,
          };
        } catch (e) {
          statuses[v.id] = cancelled
            ? { state: "idle" }
            : {
                state: "failed",
                message: e instanceof Error ? e.message : String(e),
              };
        }
      }
    } finally {
      active.terminate();
      if (pool === active) {
        pool = undefined;
        running = false;
      }
    }
  }

  function cancel() {
    cancelled = true;
    pool?.terminate();
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
    {#if running}
      <Button onclick={cancel}>Cancel</Button>
    {:else}
      <Button onclick={() => run(validations)}>Run all</Button>
    {/if}
  </Row>
  {#each validations as validation (validation.id)}
    {@const status = statuses[validation.id] ?? { state: "idle" }}
    <Accordion
      title={validation.title}
      open={opened[validation.id] ?? false}
    >
      <div class="validation">
        <Row
          justify="end"
          wrap
        >
          {#if status.state === "running"}
            <span>{status.done} / {status.total} simulations</span>
          {:else if status.state === "done"}
            <span>{status.seconds.toFixed(1)} s</span>
          {/if}
          <Button
            disabled={running}
            onclick={() => run([validation])}>Run</Button
          >
        </Row>
        {#if status.state === "failed"}
          <p role="alert">{status.message}</p>
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
                    {#if plot.panel}<span class="panel">{plot.panel}</span>{/if}
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
