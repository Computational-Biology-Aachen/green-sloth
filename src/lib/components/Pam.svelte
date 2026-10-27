<!--
 @component
 Pulse amplitude modulation (PAM) scan
-->

<script lang="ts">
  import {
    type PhaseRegion,
    Icon,
    Ol,
    Li,
    Accordion,
  } from "@computational-biology-aachen/design";
  import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import {
    computeNpq,
    expandProtocol,
    findPeaks,
    interpolateAtIndices,
    normalizeToMax,
    type PamGroup,
  } from "@computational-biology-aachen/mxlweb-core/pam";
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
    pamProtocol,
    yMax,
    timeoutInSeconds,
    backend,
    ppfdKey,
    fluoKey,
    showDerived = false,
    selectedKeys = undefined,
    normalizedKeys = undefined,
    nTimePoints,
    lineDisplay,
    plot,
  }: {
    model: KineticModelBuilder;
    pamProtocol: PamGroup[];
    yMax?: number | undefined;
    timeoutInSeconds: number;
    backend: Backend;
    ppfdKey: string;
    fluoKey?: string;
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

    if (timeoutInSecondsId) clearTimeout(timeoutInSecondsId);
    err = undefined;

    timeoutInSecondsId = setTimeout(() => {
      if (currentRequestId === requestId) {
        err = {
          message: "Simulation timed out",
          hints: ["Increase the simulation timeout via the ≡ menu"],
        };
        loading = false;
      }
    }, timeoutInSeconds * 1000);

    const protocol = expandProtocol(pamProtocol, ppfdKey);

    const order = derivedKeys(model);
    // In `order`, as the chart reads the derived columns back in that order.
    const derivedSelection =
      showDerived && selectedKeys
        ? order.filter((k) => selectedKeys.includes(k))
        : undefined;

    const req = backend.buildRequest(model, {
      userParameters: [ppfdKey],
      derivedSelection,
    });
    backend.getPool().postMessage({
      ...req,
      initialValues: model.resolveInitialValues(),
      rhsNames: model.getNames(),
      allDerivedNames: order,
      selectDerivedNames: derivedSelection ?? order,
      tEnd: 0,
      requestId: requestId,
      protocol: protocol,
      calculateDerived: showDerived,
      nTimePoints: nTimePoints,
    });
  }

  let maxPFD = $derived(
    Math.max(0, ...pamProtocol.flatMap((g) => g.steps.map((s) => s.pfd))),
  );

  function stepColor(pfd: number): string {
    if (pfd === 0) return "rgba(0,0,0,0.08)";
    const ratio = maxPFD > 0 ? pfd / maxPFD : 1;
    const alpha = (0.06 + ratio * 0.24).toFixed(2);
    return `rgba(255,200,0,${alpha})`;
  }

  let phaseRegions = $derived.by(() => {
    const regions: PhaseRegion[] = [];
    let t = 0;
    for (const group of pamProtocol) {
      for (let i = 0; i < group.repetitions; i++) {
        for (const step of group.steps) {
          const end = t + step.duration;
          regions.push({ start: t, end, color: stepColor(step.pfd) });
          t = end;
        }
      }
    }
    return regions;
  });

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

    const showNpq = !selectedKeys || selectedKeys.includes("NPQ");
    const fluoIdx = fluoKey !== undefined ? activeDerived.indexOf(fluoKey) : -1;

    let npqDataset: { label: string; data: number[] } | undefined;
    if (fluoIdx !== -1 && showNpq) {
      const fluoNorm = normalizeToMax(
        arrayColumn(result.values, nVars + fluoIdx) as number[],
      );
      const peakIndices = findPeaks(fluoNorm, 0.2);
      const npqValues = interpolateAtIndices(
        peakIndices,
        computeNpq(fluoNorm, peakIndices),
        fluoNorm.length,
        "akima",
      );
      npqDataset = { label: "NPQ", data: npqValues };
    }

    return {
      labels: result.time as number[],
      datasets: [
        ...varDatasets,
        ...derivedDatasets,
        ...(npqDataset ? [npqDataset] : []),
      ],
    };
  });

  function handleResults(data: SimulationResult) {
    if (data.requestId === currentRequestId) {
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
  <p style="color: var(--color-text-muted); font-style: italic">
    <Icon style="color: var(--color-text-muted)">info</Icon>
    This is a simulated PAM scan using a generic protocol. It should not be interpreted
    as a prediction of the actual behavior of the system. The default protocol looks
    as follows:
  </p>
  <Accordion title="Protocol">
    <Ol>
      {#each pamProtocol as phase (phase)}
        {@const minPfd = Math.min(...phase.steps.map((step) => step.pfd))}
        {@const maxPfd = Math.max(...phase.steps.map((step) => step.pfd))}
        <Li>
          <p style="color: var(--color-text-muted); font-style: italic">
            Light used: {minPfd} | Saturating Pulse: {maxPfd} | Repitions: {phase.repetitions}
          </p>
        </Li>
      {/each}
    </Ol>
  </Accordion>

  {#if err}
    <SimErrDisplay err={err} />
  {:else}
    <AnalysisChart
      data={lineData}
      plot={plot}
      loading={loading}
      yMax={yMax}
      phases={phaseRegions}
      lineDisplay={lineDisplay}
    />
  {/if}
</div>

<style>
  div {
    width: 100%;
  }
</style>
