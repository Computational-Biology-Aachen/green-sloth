<script lang="ts">
  import {
    Code,
    H1,
    H2,
    H3,
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

  const modelTs = `import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import { Mul, Name, Num } from "@computational-biology-aachen/mxlweb-core/mathml";

export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("k", { value: 0.1, texName: "k" })
    .addVariable("A", { value: 1.0, texName: "A" })
    .addReaction("v1", {
      fn: new Mul([new Name("k"), new Name("A")]),
      stoichiometry: [{ name: "A", value: new Num(-1.0) }],
      texName: "v\\\\_1",
    });
}`;

  const metaTs = `import { defaultPamProtocol } from "$lib/models/pamProtocols";
import type { ModelMeta } from "$lib/types";

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

  const mxlpyCode = `from mxlpy.meta import generate_model_code_mxlweb

ts_source = generate_model_code_mxlweb(
    model,
    tex_names={"vx": "V_x"},                       # optional
    sliders={"PPFD": {"min": "0", "max": "1000", "step": "10"}},  # optional
    docstring="Author et al. (Year), ...",        # optional
)
# write ts_source to src/lib/models/<slug>/model.ts`;

  const sbmlCode = `from mxlpy import sbml
from mxlpy.meta import generate_model_code_mxlweb

model = sbml.read("model.xml")
ts_source = generate_model_code_mxlweb(model)`;

  const verifyCode = `npm install
npm run check     # TypeScript + Svelte type checking
npm run lint      # ESLint + Prettier
npm run dev       # open the model page, confirm the analyses run`;
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
    in your browser. This page describes how to add one today. The full write-up
    lives in
    <Link href="{repo}/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</Link>.
  </Text>

  <InfoBox header="Heading toward a simpler path">
    <Text>
      The current path is code-based, a model is a small TypeScript folder.
      We're moving to a data-first format (SBML / <Code>.mxl.json</Code> plus JSON
      metadata) so models can be contributed as data and validated automatically.
      Follow
      <Link href="{repo}/issues/8">issue #8</Link> for progress. Until it lands, use
      the steps below, and the
      <Link href="#shortcuts">shortcuts</Link> if you already have the model.
    </Text>
  </InfoBox>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>What a model is</H2>
  <Text>
    Models are auto-discovered: drop a folder under
    <Code>src/lib/models/&lt;slug&gt;/</Code> and it registers itself, there's no
    central list to edit. A model appears on the site only when it has both
    <Code>model.ts</Code> and <Code>meta.ts</Code>.
  </Text>
  <Pre
    >{`src/lib/models/<slug>/
  model.ts      # builds the KineticModelBuilder  (the model itself)
  meta.ts       # title, DOI, tags, dashboard analyses
  model.md      # prose description shown on the model page
  comment.md    # short validation note
  scheme.svg    # reaction scheme diagram`}</Pre
  >
  <Text>
    Pick a <Code>&lt;slug&gt;</Code> like <Code>matuszynska2016_npq</Code>; it
    must match the <Code>slug</Code> field in <Code>meta.ts</Code>.
  </Text>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <H2>Steps</H2>

  <H3>1. <Code>model.ts</Code>, the model</H3>
  <Text>
    Export an <Code>initModel()</Code> returning a
    <Code>KineticModelBuilder</Code> from
    <Code>@computational-biology-aachen/mxlweb-core</Code>. Rate laws are
    written as MathML AST nodes (<Code>addParameter</Code>,
    <Code>addVariable</Code>, <Code>addAssignment</Code> for derived quantities, <Code
      >addReaction</Code
    >).
  </Text>
  <Pre>{modelTs}</Pre>
  <Text>
    See the existing models under <Code>src/lib/models/</Code> —
    <Link href="{repo}/blob/main/src/lib/models/matuszynska2016_npq/model.ts"
      >matuszynska2016_npq</Link
    > is a complete reference. Writing the MathML by hand is the tedious part: if
    you already have the model elsewhere, generate it instead (see shortcuts).
  </Text>

  <H3>2. <Code>meta.ts</Code>, presentation metadata</H3>
  <Pre>{metaTs}</Pre>
  <Text>
    The full <Code>ModelMeta</Code> and analysis options (plot layouts, normalization,
    PAM protocols, timeouts) are documented in
    <Code>src/lib/types.ts</Code>.
  </Text>

  <H3>3. Description, comment and diagram</H3>
  <Ol>
    <Li>
      <Code>model.md</Code>, a couple of paragraphs: what the model describes,
      the organism, the key reference (link the DOI).
    </Li>
    <Li>
      <Code>comment.md</Code>, one line on how the model was validated.
    </Li>
    <Li><Code>scheme.svg</Code>, a diagram of the reaction scheme.</Li>
  </Ol>

  <H3>4. Verify and open a PR</H3>
  <Pre>{verifyCode}</Pre>
  <Text>
    Then open a pull request against
    <Link href={repo}>green-sloth</Link>.
  </Text>
</Section>

<Section
  variant="light"
  width="narrow"
>
  <span id="shortcuts"></span>
  <H2>Shortcuts if you already have the model</H2>
  <Text>You usually don't need to hand-write <Code>model.ts</Code>.</Text>

  <H3>a) You have an mxlpy model</H3>
  <Text>
    <Link href="https://github.com/Computational-Biology-Aachen/mxlpy"
      >mxlpy</Link
    > has codegen for mxlweb. <Code>generate_model_code_mxlweb</Code> emits the exact
    <Code>KineticModelBuilder</Code> TypeScript you'd otherwise write by hand, a drop-in
    <Code>model.ts</Code>. You still write
    <Code>meta.ts</Code> and the markdown/SVG yourself.
  </Text>
  <Pre>{mxlpyCode}</Pre>

  <H3>b) You have an SBML model</H3>
  <Text>Read the SBML with mxlpy, then codegen as above:</Text>
  <Pre>{sbmlCode}</Pre>
  <Text>
    Or convert it directly in TypeScript without Python —
    <Code>mxlweb-core</Code> ships
    <Code>sbmlToModel(xml)</Code> from its <Code>/sbml</Code> entry point, which you
    can use in a one-off script to emit <Code>model.ts</Code>.
  </Text>

  <InfoBox
    header="Always verify"
    variant="warning"
  >
    <Text>
      Whichever shortcut you use, run <Code>npm run dev</Code> and confirm the model
      simulates and the dashboard analyses look right before opening a PR.
    </Text>
  </InfoBox>
</Section>
