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
  import { runValidation, type ValidationResult } from "../validation/run";
  import type { LinePlot, Validation } from "../validation/types";

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
        const total = Object.keys(v.scenarios).length;
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

  function lineSeries(plot: LinePlot, result: ValidationResult) {
    return plot.y.map((line) => ({
      ...decimate(
        result.column(line.x ?? plot.x),
        result.column(line.of),
        plot.logX ? { log: true } : {},
      ),
      ...(line.label ? { label: line.label } : {}),
      ...(line.axis ? { axis: line.axis } : {}),
      ...(line.style ? { style: line.style } : {}),
      ...(line.err ? { err: result.column(line.err) } : {}),
    }));
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
          <div class="plots">
            {#each validation.plots as plot, i (i)}
              <div class:wide={plot.type === "heatmap"}>
                {#if plot.title}<p class="plot-title">{plot.title}</p>{/if}
                {#if plot.type === "line"}
                  <PlotChart
                    series={lineSeries(plot, status.result)}
                    xLabel={plot.xLabel}
                    yLabel={plot.yLabel}
                    yRightLabel={plot.yRightLabel}
                    xLim={plot.xLim}
                    yLim={plot.yLim}
                    yRightLim={plot.yRightLim}
                    logX={plot.logX}
                    phases={plot.phases}
                  />
                {:else if plot.type === "scatter"}
                  <PlotChart
                    series={plot.series.map((s) => ({
                      x: thin(status.result.column(s.x)),
                      y: thin(status.result.column(s.y)),
                      style: "markers" as const,
                      ...(s.label ? { label: s.label } : {}),
                    }))}
                    xLabel={plot.xLabel}
                    yLabel={plot.yLabel}
                    xLim={plot.lim}
                    yLim={plot.lim}
                    identity={plot.identity ? plot.lim : undefined}
                  />
                {:else if plot.type === "stackedBar"}
                  <StackedBarChart
                    categories={plot.categories}
                    stacks={plot.stacks.map((stack) => ({
                      label: stack.label,
                      values: stack.of.map((e) => asNumber(status.result, e)),
                    }))}
                    yLabel={plot.yLabel}
                    yLim={plot.yLim}
                  />
                {:else}
                  <HeatmapChart
                    rows={plot.rows}
                    columns={plot.columns}
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

  .wide {
    grid-column: 1 / -1;
  }

  .plot-title {
    font-weight: 600;
  }
</style>
