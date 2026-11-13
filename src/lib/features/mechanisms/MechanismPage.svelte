<script lang="ts">
  import { anchoredMdPlugins } from "#lib/markdown.js";
  import type { MechanismMeta } from "#lib/mechanisms/types.js";
  import { resolve } from "$app/paths";
  import {
    H1,
    H2,
    Section,
    SectionHeader,
    Text,
  } from "@computational-biology-aachen/design";
  import Markdown from "svelte-exmarkdown";
  import DecisionMatrix from "./DecisionMatrix.svelte";
  import LineageGraph from "./LineageGraph.svelte";

  let { meta, md }: { meta: MechanismMeta; md: string } = $props();
</script>

<svelte:head>
  <title>{meta.title} - Mechanism Atlas - GreenSloth</title>
  <meta
    name="description"
    content={meta.summary}
  />
</svelte:head>

<SectionHeader width="narrow">
  <a
    class="crumb"
    href={resolve("/mechanisms")}>← Mechanism Atlas</a
  >
  <H1 color="light">{meta.title}</H1>
  <Text color="on-primary">{meta.summary}</Text>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <H2>At a glance</H2>
  <Text>
    Which choice each paper makes. Highlighted rows are implemented in
    GreenSloth; column headers jump to the explanation of each decision.
  </Text>
  <DecisionMatrix meta={meta} />

  {#if meta.branches}
    <H2>Lineage</H2>
    <LineageGraph meta={meta} />
  {/if}

  <div class="body">
    <Markdown
      md={md}
      plugins={anchoredMdPlugins}
    />
  </div>
</Section>

<style>
  .crumb {
    opacity: 0.85;
    color: var(--color-text-inverse);
    font-size: var(--text-sm);
    text-decoration: none;
  }

  .crumb:hover,
  .crumb:focus-visible {
    opacity: 1;
    text-decoration: underline;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }

  .body :global(.md-anchor) {
    display: block;
    scroll-margin-top: calc(var(--nav-height) + var(--space-4));
  }

  .body :global(.katex-display) {
    overflow-x: auto;
    overflow-y: hidden;
  }
</style>
