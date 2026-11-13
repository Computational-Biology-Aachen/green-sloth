<!--
  @component

  Papers × decisions table for a mechanism page. Column headers deep-link to
  the decision's section; rows implemented in green-sloth link to their model.
-->
<script lang="ts">
  import type { MechanismMeta } from "#lib/mechanisms/types.js";
  import { resolve } from "$app/paths";

  let { meta }: { meta: MechanismMeta } = $props();

  const rows = $derived(
    [...meta.rows].sort(
      (a, b) => a.year - b.year || a.citation.localeCompare(b.citation),
    ),
  );

  function cell(decisionId: string, choice: string | string[] | undefined) {
    if (choice === undefined) return "–";
    const options = meta.decisions.find((d) => d.id === decisionId)?.options;
    return [choice]
      .flat()
      .map((id) => options?.find((o) => o.id === id)?.label ?? id)
      .join(", ");
  }
</script>

<!-- Focusable so keyboard users can scroll the overflowing content. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="scroll"
  role="region"
  aria-label="{meta.title} comparison matrix"
  tabindex="0"
>
  <table>
    <thead>
      <tr>
        <th scope="col">Paper</th>
        {#each meta.decisions as d (d.id)}
          <th scope="col"><a href="#{d.id}">{d.label}</a></th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.id)}
        <tr class:implemented={row.slug}>
          <th scope="row">
            {#if row.doi}
              <a
                href="https://doi.org/{row.doi}"
                target="_blank"
                rel="noopener noreferrer">{row.citation}</a
              >
            {:else}
              {row.citation}
            {/if}
            {#if row.slug}
              <a
                class="badge"
                href={resolve("/models/[slug]", { slug: row.slug })}
                title="Explore {row.citation} in green-sloth">model</a
              >
            {/if}
          </th>
          {#each meta.decisions as d (d.id)}
            <td>{cell(d.id, row.choices[d.id])}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .scroll {
    border: var(--border);
    border-radius: var(--radius-md);
    max-width: 100%;
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: var(--text-sm);
    line-height: 1.35;
  }

  th,
  td {
    vertical-align: top;
    border-bottom: var(--border);
    padding: var(--space-2) var(--space-3);
    text-align: left;
  }

  thead th {
    background: var(--color-bg);
    font-weight: var(--weight-bold);
    white-space: nowrap;
  }

  thead a {
    color: inherit;
  }

  tbody th {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--color-surface);
    font-weight: var(--weight-medium);
    white-space: nowrap;
  }

  td {
    min-width: 10rem;
  }

  tr.implemented th {
    box-shadow: inset 3px 0 0 var(--color-primary);
  }

  a {
    color: var(--color-primary);
  }

  .badge {
    margin-left: var(--space-2);
    border-radius: var(--radius-full);
    background: var(--color-primary);
    padding: 0 var(--space-2);
    color: var(--color-text-inverse);
    font-size: var(--text-callout);
    text-decoration: none;
  }

  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: none;
  }
</style>
