<script lang="ts">
  import ModelDashboard from "$lib/ModelDashboard.svelte";
  import ModelTables from "$lib/ModelTables.svelte";
  import {
    Figure,
    H1,
    H2,
    InfoBox,
    Section,
    SectionHeader,
    Text,
  } from "@computational-biology-aachen/design";
  import type { ModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // Eager glob so the ModelBuilder is available both at prerender (tables) and
  // on the client (interactive dashboard).
  const modelModules = import.meta.glob("../../../lib/models/*/model.ts", {
    eager: true,
  }) as Record<string, { initModel: () => ModelBuilder }>;

  function initFor(slug: string): ModelBuilder | null {
    const key = Object.keys(modelModules).find(
      (p) => p.match(/\/models\/([^/]+)\//)?.[1] === slug,
    );
    return key ? modelModules[key].initModel() : null;
  }

  const model = $derived(initFor(data.slug));
</script>

<svelte:head>
  <title>{data.meta.title} — GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
  <H1 color="light">{data.meta.title}</H1>
  {#if data.meta.DOI}
    <a
      href={data.meta.DOI}
      target="_blank"
      rel="noreferrer"
      class="doi"
    >
      {data.meta.DOI}
    </a>
  {/if}
</SectionHeader>

<!-- Scheme + description -->
{#if data.schemeUrl || data.descHtml}
  <Section
    variant="light"
    width="narrow"
  >
    {#if data.descHtml}
      <div class="prose">{@html data.descHtml}</div>
    {/if}
    {#if data.schemeUrl}
      <H2>Scheme</H2>
      <Figure
        src={data.schemeUrl}
        alt="{data.meta.title} scheme"
      />
    {/if}
  </Section>
{/if}

<!-- Analysis dashboard -->
<Section
  variant="surface"
  width="narrow"
>
  <H2>Analysis</H2>
  {#if model}
    <ModelDashboard
      model={model}
      analyses={data.meta.analyses}
    />
  {:else}
    <Text>Model could not be loaded.</Text>
  {/if}
</Section>

<!-- Model definition tables -->
{#if model}
  <Section
    variant="light"
    width="narrow"
  >
    <H2>Model definition</H2>
    <ModelTables model={model} />
  </Section>
{/if}

<!-- Curator comment -->
{#if data.commentHtml}
  <Section
    variant="surface"
    width="narrow"
  >
    <InfoBox header="Curator's note">
      <div class="prose">{@html data.commentHtml}</div>
    </InfoBox>
  </Section>
{/if}

<style>
  .doi {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    word-break: break-all;
  }

  .prose :global(img) {
    max-width: 100%;
  }
</style>
