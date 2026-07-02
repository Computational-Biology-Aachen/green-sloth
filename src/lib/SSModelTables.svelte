<!--
 @component
 Read-only reference tables for a model, derived purely from a KineticModelBuilder.
 Four accordions: Parameters, Variables, Derived (assignments), Reactions.
-->
<script lang="ts">
  import { Accordion, Math } from "@computational-biology-aachen/design";
  import {
    getTexNames,
    SteadyStateModelBuilder,
  } from "@computational-biology-aachen/mxlweb-core";
  import { Base } from "@computational-biology-aachen/mxlweb-core/mathml";

  let { model }: { model: SteadyStateModelBuilder } = $props();

  const texNames = $derived(
    getTexNames([], model.parameters, model.assignments, []),
  );

  function sym(id: string): string {
    return texNames.get(id) ?? id;
  }

  function valueTex(value: number | Base): string | null {
    return value instanceof Base ? value.toTex(texNames) : null;
  }
</script>

{#snippet symCell(id: string)}
  <td class="sym"
    ><Math
      tex={sym(id)}
      display={false}
    /></td
  >
{/snippet}

{#if model.parameters.size > 0}
  <Accordion title="Parameters">
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Symbol</th><th>ID</th><th>Value</th></tr>
        </thead>
        <tbody>
          {#each model.parameters as [id, par] (id)}
            <tr>
              {@render symCell(id)}
              <td class="id">{id}</td>
              <td class="num">{par.value}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Accordion>
{/if}

{#if model.assignments.size > 0}
  <Accordion title="Derived quantities">
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Symbol</th><th>ID</th><th>Equation</th></tr>
        </thead>
        <tbody>
          {#each model.assignments as [id, ass] (id)}
            <tr>
              {@render symCell(id)}
              <td class="id">{id}</td>
              <td class="eq">
                <Math
                  tex={`${sym(id)} = ${ass.fn.toTex(texNames)}`}
                  display={false}
                />
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Accordion>
{/if}

<style>
  .table-wrap {
    padding: var(--space-2);
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.85rem;
  }

  th,
  td {
    vertical-align: middle;
    border-bottom: 1px solid var(--color-border);
    padding: 0.35rem 0.75rem;
    text-align: left;
  }

  th {
    background: var(--color-surface);
    font-weight: var(--weight-semibold);
    white-space: nowrap;
  }

  .id {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-family: var(--font-mono);
  }

  .num {
    font-variant-numeric: tabular-nums;
  }
</style>
