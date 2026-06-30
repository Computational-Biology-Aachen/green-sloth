<script lang="ts">
  import { base } from "$app/paths";
  import {
    Bold,
    Code,
    H1,
    H2,
    InfoBox,
    Li,
    Link,
    Ol,
    Pre,
    Section,
    SectionHeader,
    Text,
  } from "@computational-biology-aachen/design";

  const repo = "https://github.com/Computational-Biology-Aachen/green-sloth";

  const folder = `src/lib/models/<slug>/
  model.mxl.json   # the model as data  (or model.sbml)
  meta.ts          # title, DOI, tags, dashboard analyses
  model.md         # prose description shown on the model page
  comment.md       # short validation note            (optional)
  scheme.svg       # reaction scheme diagram           (optional)`;

  const metaTs = `import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "authoryear",
  title: "Author Year, Journal",
  DOI: "10.xxxx/xxxxx",
  tags: {
    "Part of Photosynthesis": ["PSII", "PQ Cycle"],
    Demonstrations: ["PAM Simulation"],
  },
  analyses: [
    { type: "timecourse", title: "Time course", tEnd: 100, nTimePoints: 500 },
  ],
};`;

  const fromTs = `# Hand-written model.ts is still supported as the authoring source.
# After writing src/lib/models/<slug>/model.ts, generate the data file:
npm run generate:mxl     # writes model.mxl.json next to every model.ts`;

  const verifyCode = `npm install
npm run validate:models   # schema-validate + smoke-check every model
npm run dev               # open the model page, confirm the analyses run`;
</script>

<svelte:head>
  <title>Contributing - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
  <H1 color="light">Contribute a model</H1>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <Text>
    GreenSloth ships curated photosynthesis ODE models, each simulated entirely
    in your browser. A model is now <Bold>data</Bold>, not code: a small folder
    you can add through the GitHub web UI. The full write-up lives in
    <Link href="{repo}/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</Link>.
  </Text>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>Two ways to contribute</H2>
  <Ol>
    <Li>
      <Bold>From the browser, no setup.</Bold> Use the
      <Link href="{base}/contribute">in-app builder</Link>: paste your model,
      confirm it simulates in the live preview, fill in the metadata, and open a
      pre-filled issue. A workflow validates it and opens the pull request for
      you.
    </Li>
    <Li>
      <Bold>As a pull request yourself.</Bold> Clone the repo, drop a
      <Code>src/lib/models/&lt;slug&gt;/</Code> folder (below), run the checks, and
      open a PR.
    </Li>
  </Ol>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>What a model is</H2>
  <Text>
    Models are auto-discovered: drop a folder under
    <Code>src/lib/models/&lt;slug&gt;/</Code> and it registers itself. A model appears
    on the site when it has a <Code>meta.ts</Code> and a model file in any supported
    format — <Code>model.mxl.json</Code> (preferred),
    <Code>model.sbml</Code>, or a hand-written <Code>model.ts</Code>.
  </Text>
  <Pre>{folder}</Pre>
  <Text>
    Pick a <Code>&lt;slug&gt;</Code> like <Code>matuszynska2016_npq</Code>; it
    must match the <Code>slug</Code> field in <Code>meta.ts</Code>.
  </Text>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>1. The model file</H2>
  <Text>
    The model itself is data. You don't hand-write it — export it from a tool:
  </Text>
  <Ol>
    <Li>
      <Bold>mxlpy</Bold> (<Link
        href="https://github.com/Computational-Biology-Aachen/mxlpy">repo</Link
      >) exports the canonical <Code>.mxl.json</Code> directly — the format greensloth
      loads first.
    </Li>
    <Li>
      <Bold>SBML</Bold> works as-is: drop your <Code>model.sbml</Code> in the folder
      and greensloth converts it on load with
      <Code>sbmlToModel</Code>.
    </Li>
    <Li>
      <Bold>A hand-written <Code>model.ts</Code></Bold> (a
      <Code>KineticModelBuilder</Code>) stays supported as the authoring source;
      generate its data file with the script:
    </Li>
  </Ol>
  <Pre>{fromTs}</Pre>
  <InfoBox header="Validate before you submit">
    <Text>
      The <Link href="{base}/contribute">in-app builder</Link> loads your model and
      runs it live — the quickest way to confirm a <Code>.mxl.json</Code> or
      <Code>.sbml</Code> file is well-formed before opening a contribution.
    </Text>
  </InfoBox>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>2. <Code>meta.ts</Code>, presentation metadata</H2>
  <Text>
    Presentation stays typed TypeScript — title, DOI, tags and the dashboard
    analyses. The builder generates this for you; the full <Code>ModelMeta</Code
    >
    and analysis options are documented in <Code>src/lib/types.ts</Code>.
  </Text>
  <Pre>{metaTs}</Pre>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>3. Description and diagram</H2>
  <Ol>
    <Li>
      <Code>model.md</Code> — a couple of paragraphs: what the model describes, the
      organism, the key reference (link the DOI).
    </Li>
    <Li
      ><Code>comment.md</Code> — one line on how the model was validated (optional).</Li
    >
    <Li
      ><Code>scheme.svg</Code> — a diagram of the reaction scheme (optional).</Li
    >
  </Ol>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>4. Verify and open a PR</H2>
  <Pre>{verifyCode}</Pre>
  <Text>
    Then open a pull request against <Link href={repo}>green-sloth</Link>. CI
    re-runs <Code>validate:models</Code> and a build on every PR.
  </Text>
</Section>
