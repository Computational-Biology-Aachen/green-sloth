<script lang="ts">
  import ModelDashboard from "$lib/ModelDashboard.svelte";
  import ModelTables from "$lib/ModelTables.svelte";
  import {
    Bold,
    Code,
    Figure,
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    Image,
    InfoBox,
    Li,
    Link,
    Pre,
    Section,
    SectionHeader,
    Sub,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Ul,
  } from "@computational-biology-aachen/design";
  import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import Markdown, { type Plugin } from "svelte-exmarkdown";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // Render model markdown with the corporate-design components in place of the
  // default HTML elements; anything unmapped falls back to plain HTML.
  const mdPlugins: Plugin[] = [
    {
      renderer: {
        p: Text,
        h1: H1,
        h2: H2,
        h3: H3,
        h4: H4,
        h5: H5,
        h6: H6,
        a: Link,
        strong: Bold,
        img: Image,
        sub: Sub,
        ul: Ul,
        li: Li,
        code: Code,
        pre: Pre,
        table: Table,
        thead: Thead,
        tbody: Tbody,
        tr: Tr,
        th: Th,
        td: Td,
      },
    },
  ];

  // Eager glob so the KineticModelBuilder is available both at prerender (tables) and
  // on the client (interactive dashboard).
  const modelModules = import.meta.glob("../../../lib/models/*/model.ts", {
    eager: true,
  }) as Record<string, { initModel: () => KineticModelBuilder }>;

  function initFor(slug: string): KineticModelBuilder | null {
    const key = Object.keys(modelModules).find(
      (p) => p.match(/\/models\/([^/]+)\//)?.[1] === slug,
    );
    return key ? modelModules[key].initModel() : null;
  }

  const model = $derived(initFor(data.slug));

  let citationCount: number | null = $state(null);
  let citationLoading = $state(false);

  $effect(() => {
    const doi = data.meta.DOI;
    if (!doi) return;
    citationCount = null;
    citationLoading = true;
    fetch(`https://api.opencitations.net/index/v1/citation-count/${doi}`)
      .then((r) => r.json())
      .then((d: Array<{ count: string }>) => {
        citationCount = Number(d[0]?.count);
        citationLoading = false;
      })
      .catch(() => {
        citationLoading = false;
      });
  });
</script>

<svelte:head>
  <title>{data.meta.title} - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
  <H1 color="light">{data.meta.title}</H1>
  {#if data.meta.DOI}
    <div class="doi-row">
      <a
        href="https://doi.org/{data.meta.DOI}"
        target="_blank"
        rel="noreferrer"
        class="doi"
      >
        doi: {data.meta.DOI}
      </a>
      <a
        href="https://api.opencitations.net/index/v2/citations/doi:{data.meta
          .DOI}"
      >
        {#if citationLoading}
          <span class="citation-badge citation-badge--loading">...</span>
        {:else if citationCount !== null}
          <span class="citation-badge">{citationCount} citations</span>
        {/if}</a
      >
    </div>
  {/if}
</SectionHeader>

<!-- Scheme + description -->
{#if data.schemeUrl || data.desc}
  <Section
    variant="light"
    width="narrow"
  >
    {#if data.desc}
      <Markdown
        md={data.desc}
        plugins={mdPlugins}
      />
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
{#if data.comment || data.changes}
  <Section
    variant="surface"
    width="narrow"
  >
    {#if data.changes}
      <InfoBox
        header="Changes"
        variant="warning"
      >
        <Markdown
          md={data.changes}
          plugins={mdPlugins}
        />
      </InfoBox>
    {/if}
    {#if data.comment}
      <InfoBox header="Curator's note">
        <Markdown
          md={data.comment}
          plugins={mdPlugins}
        />
      </InfoBox>
    {/if}
  </Section>
{/if}

<style>
  .doi-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .doi {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    word-break: break-all;
  }

  .citation-badge {
    display: inline-block;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.15em 0.6em;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .citation-badge--loading {
    color: rgba(255, 255, 255, 0.5);
  }
</style>
