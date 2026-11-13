<script lang="ts">
  import { mechanisms } from "#lib/mechanisms/index.js";
  import { resolve } from "$app/paths";
  import {
    H1,
    Section,
    SectionHeader,
    Text,
  } from "@computational-biology-aachen/design";
</script>

<svelte:head>
  <title>Mechanism Atlas - GreenSloth</title>
  <meta
    name="description"
    content="How published photosynthesis models represent key processes: the mechanistic choices, their equations, and which models make them."
  />
</svelte:head>

<SectionHeader width="narrow">
  <H1 color="light">Mechanism Atlas</H1>
  <Text color="on-primary">
    Every model of photosynthesis makes choices: lump Rubisco into one
    Michaelis–Menten term or resolve its regulation, drive ATP synthase by ΔpH
    alone or by the full proton motive force. These pages collect the choices
    made across the literature, with their equations and assumptions, as a
    reference for designing new models.
  </Text>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <ul class="grid">
    {#each mechanisms as m (m.slug)}
      {@const implemented = new Set(m.rows.flatMap((r) => r.slug ?? [])).size}
      <li>
        <a
          class="card"
          href={resolve("/mechanisms/[slug]", { slug: m.slug })}
        >
          <span class="title">{m.title}</span>
          <span class="summary">{m.summary}</span>
          <span class="stats">
            {m.decisions.length} decisions · {m.rows.length} papers · {implemented}
            in GreenSloth
          </span>
        </a>
      </li>
    {/each}
  </ul>
</Section>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: var(--gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    transition:
      transform var(--transition),
      box-shadow var(--transition);
    box-shadow: var(--shadow-sm);
    border-top: 4px solid var(--color-primary);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    padding: var(--space-4);
    height: 100%;
    color: var(--color-text);
    text-decoration: none;
  }

  .card:hover,
  .card:focus-visible {
    transform: translateY(-3px);
    box-shadow: var(--shadow-primary);
  }

  .title {
    color: var(--color-primary);
    font-weight: var(--weight-bold);
    font-size: 1.25rem;
  }

  .summary {
    flex: 1;
    line-height: var(--line-height-base);
  }

  .stats {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
