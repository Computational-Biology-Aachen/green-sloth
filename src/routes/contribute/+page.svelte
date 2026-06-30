<script lang="ts">
  import { browser } from "$app/environment";
  import { base } from "$app/paths";
  import ModelDashboard from "$lib/ModelDashboard.svelte";
  import type { ModelAnalysis } from "$lib/types";
  import {
    Button,
    Code,
    H1,
    H2,
    InfoBox,
    InputChoice,
    InputText,
    Link,
    Pre,
    Section,
    SectionHeader,
    Text,
  } from "@computational-biology-aachen/design";
  import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import { mxlJsonToModel } from "@computational-biology-aachen/mxlweb-core/mxl";
  import { sbmlToModel } from "@computational-biology-aachen/mxlweb-core/sbml";

  const repo = "https://github.com/Computational-Biology-Aachen/green-sloth";

  // --- model input -----------------------------------------------------------
  let format = $state<"mxl.json" | "sbml">("mxl.json");
  let modelSource = $state("");

  // Build the model from whatever's pasted; surface parse/schema errors inline.
  const built = $derived.by(
    (): { model: KineticModelBuilder | null; error: string | null } => {
      if (modelSource.trim() === "") return { model: null, error: null };
      try {
        const m =
          format === "sbml"
            ? sbmlToModel(modelSource)
            : mxlJsonToModel(modelSource);
        if (!(m instanceof KineticModelBuilder)) {
          return {
            model: null,
            error:
              "Not a kinetic model — greensloth only renders kinetic models.",
          };
        }
        return { model: m, error: null };
      } catch (e) {
        return {
          model: null,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    },
  );

  const previewAnalyses: ModelAnalysis[] = [
    {
      type: "timecourse",
      tEnd: 100,
      nTimePoints: 200,
      plot: { type: "magnitude" },
    },
  ];

  async function onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) modelSource = await file.text();
  }

  // --- metadata --------------------------------------------------------------
  let slug = $state("");
  let title = $state("");
  let doi = $state("");
  let tags = $state("");
  let modelMd = $state("");
  let commentMd = $state("");
  let schemeSvg = $state("");

  const tagList = $derived(
    tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  );

  // The typed presentation file the contributor would otherwise hand-write.
  const metaTs = $derived(`import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: ${JSON.stringify(slug)},
  title: ${JSON.stringify(title)},
  DOI: ${JSON.stringify(doi)},
  tags: {
    "Part of Photosynthesis": [${tagList.map((t) => JSON.stringify(t)).join(", ")}],
    Demonstrations: [],
  },
  analyses: [{ type: "timecourse", tEnd: 100, nTimePoints: 500 }],
};
`);

  // Prefill the small fields of the issue form; the large model file and SVG are
  // copied to the clipboard and pasted into the opened issue (URLs can't carry
  // tens of KB).
  const issueUrl = $derived.by(() => {
    const p = new URLSearchParams({
      template: "model-contribution.yml",
      title: `[model] ${slug}`,
      slug,
      model_format: format === "sbml" ? "sbml" : "mxl.json (preferred)",
      meta_ts: metaTs,
      model_md: modelMd,
      comment_md: commentMd,
    });
    return `${repo}/issues/new?${p.toString()}`;
  });

  const ready = $derived(
    built.model !== null &&
      slug.trim() !== "" &&
      title.trim() !== "" &&
      modelMd.trim() !== "",
  );

  let copied = $state<string | null>(null);
  async function copy(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    copied = label;
    setTimeout(() => (copied = null), 1500);
  }
</script>

<svelte:head>
  <title>Contribute a model - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
  <H1 color="light">Submit a model</H1>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <Text>
    Paste a model below, check it simulates, fill in the details, and open a
    pre-filled contribution issue — a workflow turns it into a pull request. No
    clone, no toolchain. Producing the model file (e.g. with
    <Link href="https://github.com/Computational-Biology-Aachen/mxlpy"
      >mxlpy</Link
    >
    or from SBML) is described in
    <Link href="{base}/contributing">the contributing guide</Link>.
  </Text>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>1. Model</H2>
  <InputChoice
    id="format"
    label="Format"
    bind:value={format}
  >
    <option value="mxl.json">mxl.json (preferred)</option>
    <option value="sbml">SBML</option>
  </InputChoice>
  <textarea
    class="file"
    rows="10"
    bind:value={modelSource}
    placeholder={format === "sbml"
      ? "Paste your SBML (model.sbml) here…"
      : "Paste your model.mxl.json here…"}></textarea>
  <input
    type="file"
    accept=".json,.xml,.sbml"
    onchange={onFile}
  />

  {#if built.error}
    <InfoBox
      header="Invalid model"
      variant="warning"
    >
      <Code>{built.error}</Code>
    </InfoBox>
  {:else if built.model}
    <Text>
      ✓ Valid kinetic model — {built.model.getNames().length} variables,
      {built.model.getParameterNames().length} parameters.
    </Text>
  {/if}
</Section>

{#if browser && built.model}
  <Section
    variant="light"
    width="narrow"
  >
    <H2>Live preview</H2>
    <ModelDashboard
      model={built.model}
      analyses={previewAnalyses}
    />
  </Section>
{/if}

<Section
  variant="light"
  width="narrow"
>
  <H2>2. Metadata</H2>
  <InputText
    id="slug"
    label="Slug"
    bind:value={slug}
  />
  <InputText
    id="title"
    label="Title"
    bind:value={title}
  />
  <InputText
    id="doi"
    label="DOI"
    bind:value={doi}
  />
  <InputText
    id="tags"
    label="Tags (comma-separated)"
    bind:value={tags}
  />
  <Text>Generated <Code>meta.ts</Code>:</Text>
  <Pre>{metaTs}</Pre>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>3. Description</H2>
  <Text
    ><Code>model.md</Code> — what the model describes, organism, reference:</Text
  >
  <textarea
    class="file"
    rows="5"
    bind:value={modelMd}></textarea>
  <Text><Code>comment.md</Code> — one line on validation (optional):</Text>
  <textarea
    class="file"
    rows="2"
    bind:value={commentMd}></textarea>
  <Text
    ><Code>scheme.svg</Code> — reaction-scheme diagram markup (optional):</Text
  >
  <textarea
    class="file"
    rows="4"
    bind:value={schemeSvg}></textarea>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>4. Submit</H2>
  <Text>
    Opening the issue pre-fills the slug, metadata and description. The model
    file{schemeSvg.trim() ? " and SVG are" : " is"} too large for a URL — copy
    {schemeSvg.trim() ? "them" : "it"} and paste into the matching box on the issue.
  </Text>
  <div class="actions">
    <Button
      variant="secondary"
      onclick={() => copy("model", modelSource)}
      disabled={built.model === null}
    >
      {copied === "model"
        ? "Copied!"
        : `Copy ${format === "sbml" ? "SBML" : "mxl.json"}`}
    </Button>
    {#if schemeSvg.trim()}
      <Button
        variant="secondary"
        onclick={() => copy("svg", schemeSvg)}
      >
        {copied === "svg" ? "Copied!" : "Copy scheme.svg"}
      </Button>
    {/if}
    <Button
      variant="primary"
      href={ready ? issueUrl : undefined}
      disabled={!ready}
    >
      Open contribution issue
    </Button>
  </div>
  {#if !ready}
    <Text
      >Add a valid model, a slug, a title and a description to continue.</Text
    >
  {/if}
</Section>

<style>
  .file {
    box-sizing: border-box;
    margin-bottom: var(--space-2, 8px);
    border: 1px solid var(--color-border, #ccc);
    border-radius: var(--radius-md, 6px);
    padding: var(--space-2, 8px);
    width: 100%;
    font-size: 0.85rem;
    font-family: var(--font-mono, monospace);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2, 8px);
  }
</style>
