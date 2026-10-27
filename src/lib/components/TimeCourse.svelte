<!--
 @component
 Time course (simulation over time)
-->

<script lang="ts">
  import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import { onMount } from "svelte";
  import type { Backend } from "../stores/backends";
  import {
    WorkerManager,
    type SimulationError,
    type SimulationResult,
  } from "@computational-biology-aachen/mxlweb-core/workers";
  import type { PlotLayout } from "../types";
  import { arrayColumn, derivedKeys } from "../utils";
  import AnalysisChart from "./AnalysisChart.svelte";
  import { SimErrDisplay } from "@computational-biology-aachen/mxlweb-core/fit";

  let {
    model,
    tEnd,
    yMax,
    timeoutInSeconds,
    backend,
    showDerived = false,
    selectedKeys = undefined,
    normalizedKeys = undefined,
    nTimePoints,
    lineDisplay,
    plot,
  }: {
    model: KineticModelBuilder;
    tEnd: number;
    yMax?: number | undefined;
    timeoutInSeconds: number;
    backend: Backend;
    showDerived?: boolean;
    selectedKeys?: string[];
    normalizedKeys?: string[];
    nTimePoints: number;
    lineDisplay: "current" | "last" | "first";
    plot?: PlotLayout;
  } = $props();

  let loading = $state(true);
  let err: SimulationError | undefined = $state(undefined);
  let result = $state<{ time: number[]; values: number[][] }>({
    time: [],
    values: [],
  });

  let currentRequestId = $state<string | null>(null);
  let timeoutInSecondsId = $state<ReturnType<typeof setTimeout> | null>(null);

  export function runSimulation(model: KineticModelBuilder) {
    loading = true;
    const requestId = WorkerManager.generateRequestId();
    currentRequestId = requestId;

    // Clear any existing timeoutInSeconds
    if (timeoutInSecondsId) clearTimeout(timeoutInSecondsId);
    err = undefined;

    // Set a timeoutInSeconds for the request
    timeoutInSecondsId = setTimeout(() => {
      if (currentRequestId === requestId) {
        err = {
          message: "Simulation timed out",
          hints: ["Increase the simulation timeout via the ≡ menu"],
        };
        loading = false;
      }
    }, timeoutInSeconds * 1000);

    const order = derivedKeys(model);
    // In `order`, as the chart reads the derived columns back in that order.
    const derivedSelection =
      showDerived && selectedKeys
        ? order.filter((k) => selectedKeys.includes(k))
        : undefined;

    const req = backend.buildRequest(model, { derivedSelection });
    backend.getPool().postMessage({
      ...req,
      initialValues: model.resolveInitialValues(),
      rhsNames: model.getNames(),
      allDerivedNames: order,
      selectDerivedNames: derivedSelection ?? order,
      tEnd: tEnd,
      requestId: requestId,
      calculateDerived: showDerived,
      nTimePoints: nTimePoints,
    });
  }

  function normalizeToMax(data: number[]): number[] {
    const max = Math.max(...data);
    if (max === 0 || !isFinite(max)) return data;
    return data.map((v) => v / max);
  }

  function maybeNormalize(key: string, data: number[]): number[] {
    return normalizedKeys?.includes(key) ? normalizeToMax(data) : data;
  }
  function label(key: string): string {
    const name = displayNames.get(key) ?? key;
    return normalizedKeys?.includes(key) ? `Norm(${name})` : name;
  }
  const displayNames = $derived(model.getDisplayNames());

  let lineData = $derived.by(() => {
    const nVars = model.variables.size;
    const visible = (key: string) =>
      !selectedKeys || selectedKeys.includes(key);

    const varDatasets = [...model.variables.keys()]
      .map((name, idx) => ({ name, idx }))
      .filter(({ name }) => visible(name))
      .map(({ name, idx }) => ({
        label: label(name),
        data: maybeNormalize(name, arrayColumn(result.values, idx) as number[]),
      }));

    if (!showDerived)
      return { labels: result.time as number[], datasets: varDatasets };

    const allDerived = derivedKeys(model);
    const activeDerived = selectedKeys
      ? allDerived.filter((k) => selectedKeys.includes(k))
      : allDerived;

    const derivedDatasets = activeDerived.map((name, i) => ({
      label: label(name),
      data: maybeNormalize(
        name,
        arrayColumn(result.values, nVars + i) as number[],
      ),
    }));

    return {
      labels: result.time as number[],
      datasets: [...varDatasets, ...derivedDatasets],
    };
  });

  function handleResults(data: SimulationResult) {
    if (data.requestId === currentRequestId) {
      // Clear the timeoutInSeconds since we got a response
      if (timeoutInSecondsId) {
        clearTimeout(timeoutInSecondsId);
        timeoutInSecondsId = null;
      }

      if (data.err !== undefined) {
        err = data.err;
        loading = false;
      } else {
        result = { time: data.time, values: data.values };
        loading = false;
      }
    }
  }

  $effect(() => {
    const unsub = backend.getPool().onMessage(handleResults);
    return unsub;
  });

  onMount(() => {
    runSimulation(model);
    return () => {
      if (timeoutInSecondsId) clearTimeout(timeoutInSecondsId);
    };
  });
</script>

<div>
  {#if err}
    <SimErrDisplay err={err} />
  {:else}
    <AnalysisChart
      data={lineData}
      plot={plot}
      loading={loading}
      yMax={yMax}
      lineDisplay={lineDisplay}
    />
  {/if}
</div>

<style>
  div {
    width: 100%;
  }
</style>
