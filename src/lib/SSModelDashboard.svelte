<!--
 @component
 Interactive-lite analysis dashboard: auto-runs every analysis declared in the
 model's meta (time courses and PAM protocols) on mount and exposes sliders for
 any parameter/variable that declares one in its model.ts. Moving a slider
 re-runs all analyses. Client-only (runs a Web Worker).
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { H3, Slider2 as Slider } from "@computational-biology-aachen/design";
  import H2 from "@computational-biology-aachen/design/H2.svelte";
  import type { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import Sweep from "./Sweep.svelte";
  import type { ModelAnalysis } from "./types";

  let {
    model,
    analyses,
  }: {
    model: SteadyStateModelBuilder;
    analyses: ModelAnalysis[];
  } = $props();

  const DEFAULT_TIMEOUT = 30;
  const DEFAULT_N_TIME_POINTS = 500;

  type Runnable = { runSimulation: (model: SteadyStateModelBuilder) => void };
  let analysisRefs = $state<Array<Runnable | undefined>>([]);

  type SliderDef = {
    key: string;
    id: string;
    kind: "parameter" | "variable";
    name: string;
    initial: number;
    min: string;
    max: string;
    step: string;
    desc?: string;
  };

  // Static slider config for params/vars that declare a slider in model.ts.
  const sliderDefs = $derived.by<SliderDef[]>(() => {
    const out: SliderDef[] = [];
    for (const [id, par] of model.parameters) {
      if (par.slider) {
        out.push({
          key: `p:${id}`,
          id,
          kind: "parameter",
          name: par.displayName ?? id,
          initial: par.value,
          ...par.slider,
        });
      }
    }
    for (const [id, vari] of model.variables) {
      if (vari.slider && typeof vari.value === "number") {
        out.push({
          key: `v:${id}`,
          id,
          kind: "variable",
          name: vari.displayName ?? id,
          initial: vari.value,
          ...vari.slider,
        });
      }
    }
    return out;
  });

  // Whether to overlay the previous run as a dashed reference line.
  let displayReference = $state(true);
  const lineDisplay = $derived(displayReference ? "last" : "current");

  // Current slider values, seeded from the defs.
  let values = $state<Record<string, number>>({});
  $effect(() => {
    for (const def of sliderDefs) {
      if (!(def.key in values)) values[def.key] = def.initial;
    }
  });

  function onSlide(def: SliderDef) {
    const value = values[def.key];
    if (def.kind === "parameter") {
      const par = model.parameters.get(def.id);
      if (par) model.updateParameter(def.id, { ...par, value });
    } else {
      const vari = model.variables.get(def.id);
      if (vari) model.updateVariable(def.id, { ...vari, value });
    }
    for (const ref of analysisRefs) ref?.runSimulation(model);
  }
</script>

{#if browser}
  <div class="dashboard">
    {#if sliderDefs.length > 0}
      <div class="sliders">
        {#each sliderDefs as def (def.key)}
          <Slider
            name={def.name}
            desc={def.desc ?? ""}
            min={def.min}
            max={def.max}
            step={def.step}
            bind:val={values[def.key]}
            callback={() => onSlide(def)}
          />
        {/each}
      </div>
    {/if}
    <div class="controls">
      <label for="display-reference">Display reference?</label>
      <input
        id="display-reference"
        class="solid"
        type="checkbox"
        bind:checked={displayReference}
      />
    </div>
    {#each analyses as analysis, i (i)}
      <div class="analysis">
        {#if analysis.title}
          <H3>{analysis.title}</H3>
        {/if}
        {#if analysis.type === "sweep"}
          <Sweep
            model={model}
            analysis={analysis}
            lineDisplay={lineDisplay}
          />
        {:else}
          <H2>Whoopsi, wrong analysis</H2>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
  }

  .analysis {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
  }

  .sliders {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-3);
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--gap);
    margin-left: auto;
  }
  input {
    border-radius: var(--radius-lg);
    background-color: transparent;
    padding: 0.35rem 0.5rem;
    width: 100%;
    font-size: 0.875rem;
  }
  label {
    white-space: nowrap;
  }
  .solid {
    border: var(--border);
  }
</style>
