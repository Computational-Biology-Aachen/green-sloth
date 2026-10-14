<!--
 @component
 Interactive-lite analysis dashboard: auto-runs every analysis declared in the
 model's meta (time courses and PAM protocols) on mount and exposes sliders for
 any parameter/variable that declares one in its model.ts. Moving a slider
 re-runs all analyses. Client-only (runs a Web Worker).
-->
<script lang="ts">
  import { browser } from "$app/env";
  import {
    Button,
    H3,
    Popover,
    Slider2 as Slider,
  } from "@computational-biology-aachen/design";
  import H2 from "@computational-biology-aachen/design/H2.svelte";
  import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import { untrack } from "svelte";
  import { backends } from "../stores/backends";
  import type { ModelAnalysis } from "../types";
  import Fit from "./Fit.svelte";
  import Pam from "./Pam.svelte";
  import TimeCourse from "./TimeCourse.svelte";

  let {
    model,
    analyses,
  }: {
    model: KineticModelBuilder;
    analyses: ModelAnalysis[];
  } = $props();

  const DEFAULT_TIMEOUT = 30;
  const DEFAULT_N_TIME_POINTS = 500;

  type Runnable = { runSimulation: (model: KineticModelBuilder) => void };
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

  // The model's state as loaded, so "Reset" can undo an applied fit (and any
  // slider moves). A shallow copy suffices: updateParameter/updateVariable
  // replace entries rather than mutating them. Covers every parameter, not
  // just slider ones, since a fit can change parameters without a slider.
  const originals = $derived.by(() => {
    const m = model;
    return untrack(() => ({
      parameters: new Map(m.parameters),
      variables: new Map(m.variables),
    }));
  });

  function syncSlidersAndRerun() {
    for (const def of sliderDefs) {
      const value =
        def.kind === "parameter"
          ? model.parameters.get(def.id)?.value
          : model.variables.get(def.id)?.value;
      if (typeof value === "number") values[def.key] = value;
    }
    for (const ref of analysisRefs) ref?.runSimulation(model);
  }

  function resetParameters() {
    for (const [id, par] of originals.parameters) {
      model.updateParameter(id, par);
    }
    for (const [id, vari] of originals.variables) {
      model.updateVariable(id, vari);
    }
    syncSlidersAndRerun();
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
      <Button popovertarget="fit-editor">Fit to data</Button>
      <Button onclick={resetParameters}>Reset</Button>
    </div>
    {#each analyses as analysis, i (i)}
      <div class="analysis">
        {#if analysis.title}
          <H3>{analysis.title}</H3>
        {/if}
        {#if analysis.type === "pam"}
          <Pam
            bind:this={analysisRefs[i]}
            model={model}
            pamProtocol={analysis.pamProtocol}
            ppfdKey={analysis.ppfdKey}
            fluoKey={analysis.fluoKey}
            yMax={analysis.yMax}
            backend={backends.wasmRadau5}
            selectedKeys={analysis.variables}
            normalizedKeys={analysis.normalizedKeys}
            showDerived={analysis.showDerived ?? false}
            nTimePoints={analysis.nTimePoints ?? DEFAULT_N_TIME_POINTS}
            timeoutInSeconds={analysis.timeoutInSeconds ?? DEFAULT_TIMEOUT}
            lineDisplay={lineDisplay}
            plot={analysis.plot}
          />
        {:else if analysis.type == "timecourse"}
          <TimeCourse
            bind:this={analysisRefs[i]}
            model={model}
            tEnd={analysis.tEnd}
            backend={backends.wasmRadau5}
            selectedKeys={analysis.variables}
            normalizedKeys={analysis.normalizedKeys}
            showDerived={analysis.showDerived ?? false}
            nTimePoints={analysis.nTimePoints ?? DEFAULT_N_TIME_POINTS}
            timeoutInSeconds={analysis.timeoutInSeconds ?? DEFAULT_TIMEOUT}
            lineDisplay={lineDisplay}
            plot={analysis.plot}
          />
        {:else}
          <H2>Whoopsi</H2>
        {/if}
      </div>
    {/each}
  </div>

  <Popover
    size="lg"
    popovertarget="fit-editor"
  >
    <Fit
      model={model}
      popovertarget="fit-editor"
      onApply={syncSlidersAndRerun}
    />
  </Popover>
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
    font-size: var(--text-sm);
  }
  label {
    white-space: nowrap;
  }
  .solid {
    border: var(--border);
  }
</style>
