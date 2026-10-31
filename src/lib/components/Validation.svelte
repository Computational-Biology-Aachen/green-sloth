<!--
 @component
 A model's validations: the figures reproducing its publication. Unlike the
 dashboard's analyses these are slow, so they only run on an explicit click, and
 always on a freshly built model, so sliders and fits don't affect them.
-->
<script lang="ts">
  import {
    Button,
    H3,
    HeatmapChart,
    PlotChart,
    StackedBarChart,
  } from "@computational-biology-aachen/design";
  import H2 from "@computational-biology-aachen/design/H2.svelte";
  import Row from "@computational-biology-aachen/design/Row.svelte";
  import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import { buildModel } from "../loadModel";
  import {
    createValidationPool,
    type ValidationPool,
  } from "../validation/browser";
  import { toMxlpyNotebook } from "../validation/export/mxlpy";
  import { runValidation, type ValidationResult } from "../validation/run";
  import type { Validation } from "../validation/types";

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
  let pool: ValidationPool | undefined;
  let running = $state(false);

  // Slugs share this component across navigation; a new model starts clean.
  $effect.pre(() => {
    void slug;
    statuses = {};
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
    pool = createValidationPool();
    const active = pool;
    for (const v of targets) statuses[v.id] = { state: "idle" };
    try {
      for (const v of targets) {
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
          statuses[v.id] = {
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
    pool?.terminate();
  }

  const MAX_CHART_POINTS = 1000;

  /** Thins long columns for drawing; validations can return 1e5 samples. */
  function thin(col: number[]): number[] {
    const stride = Math.ceil(col.length / MAX_CHART_POINTS);
    return stride <= 1 ? col : col.filter((_, i) => i % stride === 0);
  }

  const asNumber = (result: ValidationResult, src: string) =>
    result.value(src) as number;

  async function downloadNotebook() {
    const notebook = toMxlpyNotebook(slug, await freshModel(), validations);
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(notebook, null, 1)], {
        type: "application/x-ipynb+json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}_validation.ipynb`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<Row
  justify="between"
  wrap
>
  <H2>Validation</H2>
  <Row justify="end">
    <Button onclick={downloadNotebook}>MxlPy notebook</Button>
    {#if running}
      <Button onclick={cancel}>Cancel</Button>
    {:else}
      <Button onclick={() => run(validations)}>Run all</Button>
    {/if}
  </Row>
</Row>

<div class="validations">
  {#each validations as validation (validation.id)}
    {@const status = statuses[validation.id] ?? { state: "idle" }}
    <div class="validation">
      <Row
        justify="between"
        wrap
      >
        <H3>{validation.title}</H3>
        <Row justify="end">
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
      </Row>
      {#if status.state === "failed"}
        <p role="alert">{status.message}</p>
      {:else if status.state === "done"}
        <div class="plots">
          {#each validation.plots as plot, i (i)}
            <div>
              {#if plot.title}<p class="plot-title">{plot.title}</p>{/if}
              {#if plot.type === "line"}
                <PlotChart
                  series={plot.y.map((line) => ({
                    x: thin(status.result.column(line.x ?? plot.x)),
                    y: thin(status.result.column(line.of)),
                    ...(line.label ? { label: line.label } : {}),
                    ...(line.axis ? { axis: line.axis } : {}),
                    ...(line.style ? { style: line.style } : {}),
                    ...(line.err
                      ? { err: thin(status.result.column(line.err)) }
                      : {}),
                  }))}
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

  .plot-title {
    font-weight: 600;
  }
</style>
