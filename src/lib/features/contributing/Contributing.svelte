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



