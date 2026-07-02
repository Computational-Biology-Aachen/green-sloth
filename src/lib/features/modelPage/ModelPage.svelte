<script lang="ts">
  import { base } from "$app/paths";
  import ModelDashboard from "$lib/components/KineticModelDashboard.svelte";
  import ModelTables from "$lib/components/KineticModelTables.svelte";
  import SSModelDashboard from "$lib/components/SSModelDashboard.svelte";
  import SSModelTables from "$lib/components/SSModelTables.svelte";
  import { buildModel } from "$lib/loadModel";
  import type { ModelMeta } from "$lib/types";
  import {
    Accordion,
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
  } from "@computational-biology-aachen/design";
  import Icon from "@computational-biology-aachen/design/Icon.svelte";
  import Row from "@computational-biology-aachen/design/Row.svelte";
  import {
    KineticModelBuilder,
    ModelBuilderBase,
    SteadyStateModelBuilder,
  } from "@computational-biology-aachen/mxlweb-core";
  import { modelToSbml } from "@computational-biology-aachen/mxlweb-core/sbml";
  import { error } from "@sveltejs/kit";
  import Markdown, { type Plugin } from "svelte-exmarkdown";

  let {
    data,
  }: {
    data: {
      slug: string;
      meta: ModelMeta;
      schemeUrl: string | null;
      desc: string | null;
      changes: string | null;
    };
  } = $props();

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
  const modelPaperFigs = import.meta.glob(
    "$lib/models/*/figs/*.{png,jpg,svg,jpeg}",
    {
      eager: true,
      query: "?url",
      import: "default",
    },
  ) as Record<string, string>;

  const paperFigures = $derived(
    Object.entries(modelPaperFigs)
      // Filter: Keep only the paths that contain the current model's slug
      .filter(([path]) => path.includes(`/models/${data.slug}/figs/`))
      .map(([path, url]) => {
        const fileNameWithExt = path.split("/").pop() || "";
        let cleanTitle = fileNameWithExt.substring(
          0,
          fileNameWithExt.lastIndexOf("."),
        );
        cleanTitle = cleanTitle.replace(/[-_]/g, " ");
        cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        return {
          src: url,
          title: cleanTitle,
        };
      }),
  );

  function initFor(slug: string): ModelBuilderBase {
    const model = buildModel(slug);
    if (model === null) {
      error(404, `Model "${slug}" not found`);
    }
    return model;
  }

  const model = $derived(initFor(data.slug));

  const curationHistory = $derived(
    [...data.meta.contributors].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    ),
  );

  function formatCurationDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }

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
    if (model instanceof KineticModelBuilder)
      return downloadText(
        model.buildMxlpy(),
        `${data.slug.replace(/[^A-Za-z0-9]/g, "_")}.py`,
        "text/x-python",
      );
    if (model instanceof SteadyStateModelBuilder)
      return downloadText(
        model.buildMxlpy(),
        `${data.slug.replace(/[^A-Za-z0-9]/g, "_")}.py`,
        "text/x-python",
      );
  }

  function saveMxlweb() {
    downloadText(
      model.buildMxlweb(),
      `${data.slug.replace(/[^A-Za-z0-9]/g, "_")}.ts`,
      "text/typescript",
    );
  }

  function saveMxlJson() {
    downloadText(
      model.buildMxlJson(data.slug),
      `${data.slug.replace(/[^A-Za-z0-9]/g, "_")}.json`,
      "text/json",
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
      {#if model instanceof KineticModelBuilder}
        <ButtonMenuItem onclick={saveModel}>SBML</ButtonMenuItem>
        <ButtonMenuItem onclick={saveMxlpy}>MxlPy</ButtonMenuItem>
      {/if}
      {#if model instanceof SteadyStateModelBuilder}
        <ButtonMenuItem onclick={saveMxlpy}>MxlPy</ButtonMenuItem>
      {/if}
      <ButtonMenuItem onclick={saveMxlJson}>mxl.json</ButtonMenuItem>
      <ButtonMenuItem onclick={saveMxlweb}>mxlweb</ButtonMenuItem>
      <ButtonMenuItem onclick={savePython}>Python</ButtonMenuItem>
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

  {#if model instanceof KineticModelBuilder}
    <ModelDashboard
      model={model}
      analyses={data.meta.analyses}
    />
  {:else if model instanceof SteadyStateModelBuilder}
    <SSModelDashboard
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
    {#if model instanceof KineticModelBuilder}
      <ModelTables model={model} />
    {:else if model instanceof SteadyStateModelBuilder}
      <SSModelTables model={model} />
    {:else}
      <Text>Model could not be loaded.</Text>
    {/if}
  </Section>
{/if}

<!-- Curator comment -->
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

  <H2>Curation</H2>
  {#if curationHistory.length !== 0}
    <Ul>
      {#each curationHistory as entry (entry.date.getTime() + entry.contributor.key)}
        <Li>
          {formatCurationDate(entry.date)}: {entry.desc} by
          <Link href="{base}/contributors#{entry.contributor.key}"
            >{entry.contributor.name}</Link
          >
        </Li>
      {/each}
    </Ul>
  {/if}
  {#if paperFigures.length !== 0}
    <InfoBox header="Curator's note">
      <Text
        >This model was validated by reproducing the following figures of the <Link
          href="https://doi.org/{data.meta.DOI}">original publication</Link
        >.
      </Text>
      <Accordion title="Figures">
        {#each paperFigures as fig (fig.src)}
          <Accordion title={fig.title}>
            <Image
              src={fig.src}
              alt="Page figure"
            />
          </Accordion>
        {/each}
      </Accordion>
    </InfoBox>
  {:else}
    <InfoBox
      header="Validation fiigures missing"
      variant="warning"
    >
      This model implementation has not been validated yet.</InfoBox
    >
  {/if}
</Section>

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
