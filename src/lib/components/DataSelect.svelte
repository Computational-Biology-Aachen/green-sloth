<!--
 @component
 Card-style radio group for a meta-declared {@link DataSelect}: one card per
 option, exactly one active; inactive ones are greyed out.
-->
<script lang="ts">
  import type { DataSelect } from "../types";
  import SpectrumThumb from "./SpectrumThumb.svelte";

  let {
    select,
    values,
    active = $bindable(),
    onchange,
  }: {
    select: DataSelect;
    values: Record<string, number[]> | null;
    active: string;
    onchange: (key: string) => void;
  } = $props();

  const name = $props.id();
</script>

<fieldset>
  <legend>{select.title}</legend>
  <div class="grid">
    {#each select.options as option (option.key)}
      <label class:active={active === option.key}>
        <input
          type="radio"
          name={name}
          value={option.key}
          disabled={values === null}
          bind:group={active}
          onchange={() => onchange(option.key)}
        />
        <span class="title">{option.label}</span>
        {#if select.preview?.kind === "spectrum"}
          {#if values?.[option.key]}
            <SpectrumThumb
              values={values[option.key]}
              xMin={select.preview.xMin}
              xMax={select.preview.xMax}
              unit={select.preview.unit}
            />
          {:else}
            <div class="skeleton"></div>
          {/if}
        {/if}
      </label>
    {/each}
  </div>
</fieldset>

<style>
  fieldset {
    margin: 0;
    border: none;
    padding: 0;
    min-width: 0;
  }
  legend {
    margin-bottom: var(--space-2);
    padding: 0;
    font-weight: var(--weight-medium);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-3);
  }
  @media (max-width: 640px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  label {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    opacity: 0.5;
    filter: grayscale(1);
    transition: var(--transition);
    cursor: pointer;
    border: var(--border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    padding: var(--space-3);
  }
  label:hover {
    opacity: 0.8;
  }
  label.active {
    opacity: 1;
    filter: none;
    box-shadow: 0 0 0 1px var(--color-accent);
    border-color: var(--color-accent);
  }
  label:has(input:focus-visible) {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .title {
    font-size: var(--text-sm);
    text-align: center;
  }
  .skeleton {
    border-radius: var(--radius-sm);
    background: var(--color-border);
    aspect-ratio: 200 / 80;
  }
</style>
