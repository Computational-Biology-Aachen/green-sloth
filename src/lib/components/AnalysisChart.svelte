<!--
 @component
 Renders an analysis result as either a single LineChart or, when the analysis
 declares a `plot` layout, a LineChartGrid whose subplots are partitioned either
 explicitly (by series label) or automatically by order of magnitude.
-->
<script lang="ts">
  import {
    LineChart,
    LineChartGrid,
    type LineChartGridItem,
    type PhaseRegion,
  } from "@computational-biology-aachen/design";
  import type { PlotLayout } from "../types";
  import {
    partitionByGroups,
    partitionByOrderOfMagnitude,
    type LineChartData,
  } from "../utils";

  let {
    data,
    plot,
    loading,
    yMax,
    phases,
    lineDisplay,
  }: {
    data: LineChartData;
    plot?: PlotLayout;
    loading: boolean;
    yMax?: number;
    phases?: PhaseRegion[];
    lineDisplay: "current" | "last" | "first";
  } = $props();

  const grid = $derived.by(() => {
    if (!plot || plot.type === "single") return null;

    const groups =
      plot.type === "magnitude"
        ? partitionByOrderOfMagnitude(data.datasets)
        : partitionByGroups(data.datasets, plot.groups);

    const charts: LineChartGridItem[] = groups.map((group) => ({
      data: { labels: data.labels, datasets: group },
      ...(yMax !== undefined ? { yMax } : {}),
    }));

    return {
      charts,
      columns: plot.columns ?? 2,
      shareX: plot.shareX ?? true,
      shareY: plot.shareY ?? false,
    };
  });
</script>

{#if grid}
  <LineChartGrid
    charts={grid.charts}
    columns={grid.columns}
    shareX={grid.shareX}
    shareY={grid.shareY}
    loading={loading}
    phases={phases}
    lineDisplay={lineDisplay}
  />
{:else}
  <LineChart
    data={data}
    loading={loading}
    yMax={yMax}
    phases={phases}
    lineDisplay={lineDisplay}
  />
{/if}
