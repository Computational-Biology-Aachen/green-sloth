<!--
 @component
 Small spectrum preview: the curve normalised to its own max, with the area
 under it filled by a visible-spectrum gradient (as the mxl-models notebook's
 `plot_spectrum`). Values are assumed evenly spaced over [xMin, xMax].
-->
<script lang="ts">
  let {
    values,
    xMin,
    xMax,
    unit = "",
  }: { values: number[]; xMin: number; xMax: number; unit?: string } = $props();

  const uid = $props.id();

  const W = 200;
  const H = 80;
  const PLOT_H = 64;

  // Wavelength anchor points (nm) and their approximate sRGB colours.
  const STOPS: Array<[number, string]> = [
    [400, "rgb(148, 0, 255)"],
    [450, "rgb(0, 0, 255)"],
    [500, "rgb(0, 255, 255)"],
    [550, "rgb(0, 255, 0)"],
    [580, "rgb(255, 255, 0)"],
    [600, "rgb(255, 128, 0)"],
    [650, "rgb(255, 0, 0)"],
    [700, "rgb(255, 0, 0)"],
  ];

  const stops = $derived(
    STOPS.filter(([wl]) => wl >= xMin && wl <= xMax).map(([wl, color]) => ({
      offset: (wl - xMin) / (xMax - xMin),
      color,
    })),
  );

  const line = $derived.by(() => {
    const max = Math.max(...values);
    const n = values.length - 1;
    return values
      .map((v, i) => {
        const x = (i / n) * W;
        const y = PLOT_H - (v / max) * (PLOT_H - 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join("");
  });
</script>

<svg
  viewBox="0 0 {W} {H}"
  aria-hidden="true"
>
  <defs>
    <linearGradient id="{uid}-grad">
      {#each stops as stop (stop.offset)}
        <stop
          offset={stop.offset}
          stop-color={stop.color}
        />
      {/each}
    </linearGradient>
  </defs>
  <path
    d="{line}L{W},{PLOT_H}L0,{PLOT_H}Z"
    fill="url(#{uid}-grad)"
    fill-opacity="0.4"
  />
  <path
    d={line}
    class="curve"
  />
  <line
    x1="0"
    x2={W}
    y1={PLOT_H}
    y2={PLOT_H}
    class="axis"
  />
  <text
    x="0"
    y={H - 2}
    text-anchor="start">{xMin}</text
  >
  <text
    x={W}
    y={H - 2}
    text-anchor="end">{xMax} {unit}</text
  >
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .curve {
    fill: none;
    stroke: currentColor;
    stroke-linejoin: round;
    stroke-width: 1.2;
  }
  .axis {
    stroke: var(--color-text-muted);
    stroke-width: 1;
  }
  text {
    fill: var(--color-text-muted);
    font-size: 11px;
  }
</style>
