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
</script>

<svelte:head>
  <title>{data.meta.title} - GreenSloth</title>
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
{#if data.comment}
  <Section
    variant="surface"
    width="narrow"
  >
    <InfoBox header="Curator's note">
      <Markdown
        md={data.comment}
        plugins={mdPlugins}
      />
    </InfoBox>
  </Section>
{/if}

<style>
  .doi {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    word-break: break-all;
  }
</style>
