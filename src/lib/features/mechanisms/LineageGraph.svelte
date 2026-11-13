<!--
  @component

  Lineage of a model family: one swim-lane per branch, papers placed by year
  (pushed right when they would overlap), edges from `buildsOn`. Implemented
  papers are filled and link to their green-sloth model; the rest link to
  their DOI.
-->
<script lang="ts">
  import type { MechanismMeta, MechanismRow } from "#lib/mechanisms/types.js";
  import { resolve } from "$app/paths";

  let { meta }: { meta: MechanismMeta } = $props();

  const LABEL_W = 170;
  const LANE_H = 56;
  const NODE_W = 128;
  const NODE_H = 26;
  const GAP = 8;
  const PX_PER_YEAR = 24;
  const AXIS_H = 28;

  type Node = { row: MechanismRow; x: number; y: number };

  const layout = $derived.by(() => {
    const lanes = meta.branches ?? [];
    const placed = meta.rows.filter((r) =>
      lanes.some((l) => l.id === r.branch),
    );
    const years = placed.map((r) => r.year);
    const y0 = Math.floor(Math.min(...years) / 5) * 5;
    const y1 = Math.ceil(Math.max(...years) / 5) * 5;
    const xOf = (year: number) => LABEL_W + (year - y0) * PX_PER_YEAR;

    const nodes: Record<string, Node> = {};
    lanes.forEach((lane, i) => {
      let right = -Infinity;
      for (const row of placed
        .filter((r) => r.branch === lane.id)
        .sort((a, b) => a.year - b.year)) {
        const x = Math.max(xOf(row.year), right + GAP);
        right = x + NODE_W;
        nodes[row.id] = {
          row,
          x,
          y: AXIS_H + i * LANE_H + (LANE_H - NODE_H) / 2,
        };
      }
    });

    const edges = Object.values(nodes).flatMap((child) =>
      (child.row.buildsOn ?? []).flatMap((pid) => {
        const parent = nodes[pid];
        return parent ? [{ id: `${pid}->${child.row.id}`, parent, child }] : [];
      }),
    );

    const ticks: number[] = [];
    for (let y = y0; y <= y1; y += 5) ticks.push(y);
    const width = Math.max(
      xOf(y1),
      ...Object.values(nodes).map((n) => n.x + NODE_W),
    );
    return {
      lanes,
      nodes: Object.values(nodes),
      edges,
      ticks,
      xOf,
      width: width + GAP,
      height: AXIS_H + lanes.length * LANE_H,
    };
  });

  // Same lane: straight arrow between neighbours. Across lanes: leave the
  // parent from its top/bottom and bend into the child, so edges never run
  // backwards through other nodes.
  function edgePath(p: Node, c: Node): string {
    const py = p.y + NODE_H / 2;
    const cy = c.y + NODE_H / 2;
    if (p.y === c.y) return `M${p.x + NODE_W},${py} H${c.x}`;
    const down = c.y > p.y;
    const sx = p.x + NODE_W / 2;
    const sy = down ? p.y + NODE_H : p.y;
    if (c.x >= sx) return `M${sx},${sy} C${sx},${cy} ${sx},${cy} ${c.x},${cy}`;
    const ex = c.x + NODE_W / 2;
    const ey = down ? c.y : c.y + NODE_H;
    const my = (sy + ey) / 2;
    return `M${sx},${sy} C${sx},${my} ${ex},${my} ${ex},${ey}`;
  }

  let focused = $state<string | null>(null);

  function edgeState(e: { parent: Node; child: Node }): string {
    if (focused)
      return e.parent.row.id === focused || e.child.row.id === focused
        ? "active"
        : "dim";
    return e.parent.y === e.child.y ? "" : "cross";
  }

  function hrefOf(row: MechanismRow): string | undefined {
    if (row.slug) return resolve("/models/[slug]", { slug: row.slug });
    return row.doi ? `https://doi.org/${row.doi}` : undefined;
  }
</script>

<!-- Focusable so keyboard users can scroll the overflowing content. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="scroll"
  role="region"
  aria-label="{meta.title} lineage graph"
  tabindex="0"
>
  <svg
    width={layout.width}
    height={layout.height}
    viewBox="0 0 {layout.width} {layout.height}"
    role="img"
    aria-label="Lineage of {meta.title}: papers by year and branch, arrows point from a paper to the papers that build on it"
  >
    <defs>
      <marker
        id="lineage-arrow"
        viewBox="0 0 8 8"
        refX="7"
        refY="4"
        markerWidth="7"
        markerHeight="7"
        orient="auto"
      >
        <path
          d="M0,0 L8,4 L0,8 z"
          class="arrow"
        />
      </marker>
    </defs>

    {#each layout.lanes as lane, i (lane.id)}
      <rect
        class="lane"
        class:odd={i % 2 === 1}
        x="0"
        y={AXIS_H + i * LANE_H}
        width={layout.width}
        height={LANE_H}
      />
      <text
        class="lane-label"
        x="8"
        y={AXIS_H + i * LANE_H + LANE_H / 2}>{lane.label}</text
      >
    {/each}

    {#each layout.ticks as year (year)}
      <line
        class="tick"
        x1={layout.xOf(year)}
        x2={layout.xOf(year)}
        y1={AXIS_H - 6}
        y2={layout.height}
      />
      <text
        class="tick-label"
        x={layout.xOf(year)}
        y={AXIS_H - 10}>{year}</text
      >
    {/each}

    {#each layout.edges as e (e.id)}
      <path
        class="edge {edgeState(e)}"
        d={edgePath(e.parent, e.child)}
        marker-end="url(#lineage-arrow)"
      />
    {/each}

    {#each layout.nodes as n (n.row.id)}
      {@const href = hrefOf(n.row)}
      <a
        href={href}
        target={n.row.slug ? undefined : "_blank"}
        rel={n.row.slug ? undefined : "noopener noreferrer"}
        class="node"
        class:implemented={n.row.slug}
        onmouseenter={() => (focused = n.row.id)}
        onmouseleave={() => (focused = null)}
        onfocus={() => (focused = n.row.id)}
        onblur={() => (focused = null)}
      >
        <title
          >{n.row.citation}{n.row.slug
            ? " (explore in green-sloth)"
            : ""}</title
        >
        <rect
          x={n.x}
          y={n.y}
          width={NODE_W}
          height={NODE_H}
          rx="13"
        />
        <text
          x={n.x + NODE_W / 2}
          y={n.y + NODE_H / 2}>{n.row.citation}</text
        >
      </a>
    {/each}
  </svg>
</div>

<div class="legend">
  <span><span class="swatch implemented"></span>In green-sloth</span>
  <span><span class="swatch"></span>Literature only</span>
  <span>Hover or focus a paper to trace what it builds on</span>
</div>

<style>
  .scroll {
    border: var(--border);
    border-radius: var(--radius-md);
    max-width: 100%;
    overflow-x: auto;
  }

  svg {
    display: block;
    font-family: var(--font-sans);
  }

  .lane {
    fill: var(--color-surface);
  }

  .lane.odd {
    fill: var(--color-bg);
  }

  .lane-label {
    fill: var(--color-text);
    font-weight: var(--weight-bold);
    font-size: 12px;
    dominant-baseline: middle;
  }

  .tick {
    stroke: var(--color-border);
    stroke-dasharray: 2 4;
  }

  .tick-label {
    fill: var(--color-text-muted);
    font-size: 11px;
    text-anchor: middle;
  }

  .edge {
    fill: none;
    stroke: var(--color-text-muted);
    stroke-width: 1.25;
  }

  .edge.cross {
    stroke-opacity: 0.3;
  }

  .edge.dim {
    stroke-opacity: 0.08;
  }

  .edge.active {
    stroke: var(--color-accent);
    stroke-width: 2;
  }

  .arrow {
    fill: var(--color-text-muted);
  }

  .node rect {
    fill: var(--color-surface);
    stroke: var(--color-primary);
    stroke-width: 1.5;
  }

  .node text {
    fill: var(--color-primary);
    font-size: 11px;
    dominant-baseline: middle;
    text-anchor: middle;
  }

  .node.implemented rect {
    fill: var(--color-primary);
  }

  .node.implemented text {
    fill: var(--color-text-inverse);
    font-weight: var(--weight-bold);
  }

  .node:hover rect,
  .node:focus-visible rect {
    stroke: var(--color-accent);
    stroke-width: 2.5;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .swatch {
    display: inline-block;
    vertical-align: -2px;
    margin-right: var(--space-1);
    border: 1.5px solid var(--color-primary);
    border-radius: var(--radius-full);
    width: 1.5rem;
    height: 0.8rem;
  }

  .swatch.implemented {
    background: var(--color-primary);
  }
</style>
