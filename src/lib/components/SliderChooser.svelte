<!--
 @component
 Lets the user pick which parameters / initial values get a slider on the
 dashboard, and each slider's range. Choices are session-only overrides on
 top of the sliders a model declares in its model.ts — nothing is persisted
 and the model definition itself is untouched.
-->
<script lang="ts">
  import { Button, Row } from "@computational-biology-aachen/design";
  import H2 from "@computational-biology-aachen/design/H2.svelte";
  import {
    defaultSliderRange,
    effectiveSlider,
    type SliderCandidate,
    type SliderOverride,
  } from "../sliders";

  let {
    candidates,
    overrides = $bindable(),
    popovertarget,
  }: {
    candidates: SliderCandidate[];
    overrides: Record<string, SliderOverride>;
    popovertarget: string;
  } = $props();

  let query = $state("");
  const visible = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return candidates;
    return candidates.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    );
  });
  const groups = $derived([
    {
      title: "Parameters",
      rows: visible.filter((c) => c.kind === "parameter"),
    },
    {
      title: "Initial values",
      rows: visible.filter((c) => c.kind === "variable"),
    },
  ]);

  function update(candidate: SliderCandidate, patch: Partial<SliderOverride>) {
    const current = effectiveSlider(candidate, overrides[candidate.key]);
    // Enabling a slider that model.ts doesn't declare starts from a range
    // around the *current* value (it may have been fitted since loading).
    const base =
      patch.enabled && !current.enabled && !candidate.declared
        ? { ...current, ...defaultSliderRange(candidate.value) }
        : current;
    overrides = { ...overrides, [candidate.key]: { ...base, ...patch } };
  }
</script>

<div class="chooser">
  <Row
    stack
    justify="between"
    gap="0.5rem"
  >
    <H2>Sliders</H2>
    <div class="actions">
      <Button
        variant="secondary"
        disabled={Object.keys(overrides).length === 0}
        onclick={() => (overrides = {})}>Restore model defaults</Button
      >
      <Button
        popovertarget={popovertarget}
        popovertargetaction="hide">Close</Button
      >
    </div>
  </Row>

  <input
    class="search"
    type="search"
    placeholder="Filter by name"
    aria-label="Filter by name"
    bind:value={query}
  />

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Slider</th>
          <th>Name</th>
          <th>Value</th>
          <th>Min</th>
          <th>Max</th>
          <th>Step</th>
        </tr>
      </thead>
      <tbody>
        {#each groups as group (group.title)}
          {#if group.rows.length > 0}
            <tr class="group"><td colspan="6">{group.title}</td></tr>
          {/if}
          {#each group.rows as c (c.key)}
            {@const slider = effectiveSlider(c, overrides[c.key])}
            <tr class:disabled={!slider.enabled}>
              <td>
                <input
                  type="checkbox"
                  aria-label="Show slider for {c.name}"
                  checked={slider.enabled}
                  onchange={(e) =>
                    update(c, {
                      enabled: (e.target as HTMLInputElement).checked,
                    })}
                />
              </td>
              <td>
                {c.name}
                {#if c.name !== c.id}<span class="id">{c.id}</span>{/if}
              </td>
              <td class="num">{Number(c.value.toPrecision(4))}</td>
              {#each ["min", "max", "step"] as const as field (field)}
                <td>
                  <input
                    type="number"
                    step="any"
                    aria-label="{field} for {c.name}"
                    value={slider[field]}
                    disabled={!slider.enabled}
                    onchange={(e) =>
                      update(c, {
                        [field]: (e.target as HTMLInputElement).value,
                      })}
                  />
                </td>
              {/each}
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>
  </div>
  {#if visible.length === 0}
    <p class="empty">No parameters match “{query}”.</p>
  {/if}
</div>

<style>
  .chooser {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  input {
    border: var(--border);
    border-radius: var(--radius-lg);
    background-color: transparent;
    padding: 0.35rem 0.5rem;
    font-size: inherit;
    font-family: inherit;
  }
  input:hover {
    border: var(--border-primary);
  }
  input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    border: var(--border);
    border-style: dashed;
  }
  input[type="number"] {
    width: 7rem;
  }
  .search {
    max-width: 20rem;
  }
  .table-wrap {
    border: var(--border);
    border-radius: var(--radius-lg);
    max-height: 60vh;
    overflow: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    text-align: left;
  }
  th,
  td {
    padding: 0.4rem 0.75rem;
    font-size: 0.875rem;
  }
  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #e5e7eb;
    font-weight: var(--weight-bold);
    font-size: 0.7rem;
    text-transform: uppercase;
  }
  tr.group td {
    padding-top: 0.75rem;
    color: var(--color-text-muted);
    font-weight: var(--weight-bold);
    font-size: 0.75rem;
    text-transform: uppercase;
  }
  tr.disabled td:nth-child(2),
  tr.disabled td:nth-child(3) {
    color: var(--color-text-muted);
  }
  .id {
    margin-left: 0.35rem;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-family: var(--font-mono, monospace);
  }
  .num {
    font-variant-numeric: tabular-nums;
  }
  .empty {
    margin: 0;
    color: var(--color-text-muted);
  }
</style>
