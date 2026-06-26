<script lang="ts">
  import ModelDashboard from "$lib/ModelDashboard.svelte";
  import ModelTables from "$lib/ModelTables.svelte";
  import {
    Bold,
    ButtonMenu,
    ButtonMenuItem,
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
    Accordion,
  } from "@computational-biology-aachen/design";
  import Icon from "@computational-biology-aachen/design/Icon.svelte";
  import Row from "@computational-biology-aachen/design/Row.svelte";
  import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import { modelToSbml } from "@computational-biology-aachen/mxlweb-core/sbml";
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

  // Eager glob so the KineticModelBuilder is available both at prerender (tables) and
  // on the client (interactive dashboard).
  const modelPaperFigs = import.meta.glob("$lib/models/*/figs/*.{png,jpg,svg,jpeg}", {
    eager: true,
    query: '?url',
    import: 'default'
  }) as Record<string, string>;

  const paperFigures = $derived(
    Object.entries(modelPaperFigs)
      // Filter: Keep only the paths that contain the current model's slug
      .filter(([path]) => path.includes(`/models/${data.slug}/figs/`))
      .map(([path, url]) => {
        const fileNameWithExt = path.split('/').pop() || '';
        let cleanTitle = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.'));
        cleanTitle = cleanTitle.replace(/[-_]/g, ' ');
        cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        return {
          src: url,
          title: cleanTitle
        };
      })
  );

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

  function downloadText(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveModel() {
    // SBML is a reaction-network format; only kinetic models can be exported.
    if (!(model instanceof KineticModelBuilder)) return;
    downloadText(
      modelToSbml(model, data.slug),
      `${data.slug.replace(/[^A-Za-z0-9]/g, "_")}.sbml`,
      "application/xml",
    );
  }

  function savePython() {
    if (!(model instanceof KineticModelBuilder)) return;
    downloadText(
      model.buildPython([]),
      `${data.slug.replace(/[^A-Za-z0-9]/g, "_")}.py`,
      "text/x-python",
    );
  }

  function saveMxlpy() {
    if (!(model instanceof KineticModelBuilder)) return;
    downloadText(
      model.buildMxlpy(),
      `${data.slug.replace(/[^A-Za-z0-9]/g, "_")}.py`,
      "text/x-python",
    );
  }
</script>

<svelte:head>
  <title>{data.meta.title} - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
  <Row justify="between">
    <H1 color="light">{data.meta.title}</H1>

    <ButtonMenu variant="inverted">
      {#snippet label()}
        <Icon>download</Icon>
      {/snippet}
      <ButtonMenuItem onclick={saveModel}>SBML</ButtonMenuItem>
      <ButtonMenuItem onclick={savePython}>Python</ButtonMenuItem>
      <ButtonMenuItem onclick={saveMxlpy}>MxlPy</ButtonMenuItem>
    </ButtonMenu>
  </Row>
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
    {#if paperFigures.length !== 0}
      <Accordion title="Validation">
        <InfoBox
          header="Please refer to the main publications to directly compare!"
          variant="warning"
        ></InfoBox>
        <InfoBox header="Jupyter Notebook">
          <Markdown
            md={`The code to recreate these figures can be seen in [the mxl-model repository](https://github.com/Computational-Biology-Aachen/mxl-models/blob/main/docs/${data.slug}.ipynb)`}
            plugins={mdPlugins}
          />
        </InfoBox>
        {#each paperFigures as fig}
        <Accordion title={fig.title}>
          <Image src={fig.src} alt="Page figure"/>
        </Accordion>
          
        {/each}
      </Accordion>
    {/if}
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
