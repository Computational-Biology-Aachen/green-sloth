<script lang="ts">
  import { browser } from "$app/env";
  import ModelDashboard from "#lib/components/KineticModelDashboard.svelte";
  import { AVAILABLE_TAGS } from "#lib/tags.js";
  import type { ModelAnalysis } from "#lib/types.js";
  import {
    Button,
    Code,
    H2,
    InfoBox,
    InputChoice,
    InputText,
    Pre,
    Section,
    Text,
    Bold,
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
  let journal = $state("");
  let license = $state("");
  let tags = $state<Record<string, string[]>>(
    Object.fromEntries(Object.keys(AVAILABLE_TAGS).map((c) => [c, []])),
  );
  let modelMd = $state("");
  let commentMd = $state("");
  let schemeSvg = $state("");
  let curatorNotesMd = $state("");

  function toggleTag(category: string, tag: string) {
    if (tags[category]?.includes(tag)) {
      tags[category] = tags[category].filter((t) => t !== tag);
    } else {
      tags[category] = [...(tags[category] || []), tag];
    }
  }

  // The typed presentation file the contributor would otherwise hand-write.
  const metaTs = $derived(`import contributors from "#lib/contributors.js";
import type { ModelMeta } from "#lib/types.js";

export const meta: ModelMeta = {
  slug: ${JSON.stringify(slug)},
  title: ${JSON.stringify(title)},
  DOI: ${JSON.stringify(doi)},
  journal: ${JSON.stringify(journal)},
  license: ${JSON.stringify(license)},
  tags: {
    ${
      tags
        ? Object.entries(tags)
            .map(
              ([category, tags]) =>
                `${JSON.stringify(category)}: [${tags
                  .map((t) => JSON.stringify(t))
                  .join(", ")}]`,
            )
            .join(",\n    ")
        : ""
    }
  },
  analyses: [<analyses>],
  contributors: [
    {
      desc: "Initial implementation",
      date: <date>,
      contributor: <contributor>,
    },
    {
      desc: "Maintenance",
      date: <date>,
      contributor: <contributor>,
    },
  ],
};`);

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
      curatornotes_md: curatorNotesMd,
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

<Section
  variant="light"
  width="narrow"
>
  <Text>
    Here is a step-by-step workflow to contribute a model to GreenSloth. Most of
    the mandatory infromation needed for submission is collected here, and then
    with justa press of a button, a pre-filled is opened on GitHub. Some things
    will need to be added manually, but the workflow is designed to minimize the
    amount of manual work needed.
  </Text>
  <H2>1. The Model</H2>
  <Text>
    Import the model you want to contribute and if you are doing this in a
    desktop browser, you will see a live timecourse simulation of the model.
  </Text>
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
    aria-label="Model source"
    placeholder={format === "sbml"
      ? "Paste your SBML (model.sbml) here…"
      : "Paste your model.mxl.json here…"}></textarea>
  <input
    type="file"
    accept=".json,.xml,.sbml"
    aria-label="Upload model file"
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
  {#if browser && built.model}
    <H2>Live preview</H2>
    <ModelDashboard
      model={built.model}
      analyses={previewAnalyses}
    />
  {/if}

  <H2>2. The Metadata</H2>
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
    id="journal"
    label="Journal"
    bind:value={journal}
  />
  <InputChoice
    id="license"
    label="License"
    bind:value={license}
  >
    <option value="© CC BY">CC BY</option>
    <option value="© CC BY-SA">CC BY-SA</option>
    <option value="© CC BY-ND">CC BY-ND</option>
    <option value="© CC BY-NC">CC BY-NC</option>
    <option value="© CC BY-NC-SA">CC BY-NC-SA</option>
    <option value="© CC BY-NC-ND">CC BY-NC-ND</option>
    <option value="Recreated">Recreated</option>
  </InputChoice>
  <Text>Available tags</Text>
  <div class="tag-container">
    {#each Object.entries(AVAILABLE_TAGS) as [category, options] (category)}
      <div class="tag-category-label">
        <Bold>{category}:</Bold>
      </div>
      <div class="tag-options">
        {#each options as tag (tag)}
          <Button
            class={tags[category]?.includes(tag)
              ? "primary tag-button"
              : "inverted tag-button"}
            onclick={() => toggleTag(category, tag)}
          >
            {tag}
          </Button>
        {/each}
      </div>
    {/each}
  </div>
  <Text>Generated <Code>meta.ts</Code>:</Text>
  <Pre>{metaTs}</Pre>

  <H2>3. The Description</H2>
  <Text
    ><Code>model.md</Code> — Short description/summary of the model and what it describes.</Text
  >
  <textarea
    class="file"
    rows="5"
    bind:value={modelMd}></textarea>
  <Text
    ><Code>comment.md</Code> (Optional) — Short comment on the model implementation.</Text
  >
  <textarea
    class="file"
    rows="2"
    bind:value={commentMd}></textarea>
  <Text
    ><Code>scheme.svg</Code> (Optional) — Model Scheme in an <Code>svg</Code> format.
    Please paste the SVG code here. If it works, a preview will be shown.</Text
  >
  <textarea
    class="file"
    rows="4"
    bind:value={schemeSvg}></textarea>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class="center">{@html schemeSvg}</div>

  <H2>4. The validation</H2>
  <Text>
    The model implementation is validated by the recreation of the figures from
    the publication. As the figures are too big to be included in the submission
    form, you can only add the optional curator notes here. You should add the
    figures and the validation code file to the GitHub issue yourself.
  </Text>
  <textarea
    class="file"
    rows="2"
    bind:value={curatorNotesMd}></textarea>
  <Text
    ><Code>curatornotes.md</Code> (Optional) — A short note on the model validation
    by the recreation of the publication figures.</Text
  >

  <H2>5. Submit</H2>
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
  .tag-container {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: var(--space-2, 8px);
    row-gap: var(--space-4, 8px);
    align-items: start;
  }
  :global(.tag-header) {
    grid-row: 1 / -1;
    grid-column: 1;
  }
  .tag-category-label {
    padding-top: 0.5rem;
  }

  .tag-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2em;
  }
  :global(.tag-button) {
    border: 0.19em solid var(--color-primary, #ccc) !important;
  }

  .file {
    box-sizing: border-box;
    margin-bottom: var(--space-2, 8px);
    border: 1px solid var(--color-border, #ccc);
    border-radius: var(--radius-md, 6px);
    padding: var(--space-2, 8px);
    width: 100%;
    font-size: var(--text-sm);
    font-family: var(--font-mono, monospace);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2, 8px);
  }
</style>
