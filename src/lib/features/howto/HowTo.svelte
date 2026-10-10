<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import {
        H1,
        H2,
        Section,
        SectionHeader,
        Text,
        Row,
        Pair,
        Button,
        Ol,
        Li,
        Bold,
        Link,
        Code,
        Pre,
        Accordion,
    } from "@computational-biology-aachen/design";

    const repo = "https://github.com/Computational-Biology-Aachen/green-sloth";

    let section = $state(page.url.searchParams.get("section") || "website");

    $effect(() => {
        const urlSection = page.url.searchParams.get("section");

        if (urlSection) {
            section = urlSection;

            const url = new URL(page.url);
            url.searchParams.delete("section");
            goto(url, { replaceState: true, keepFocus: true, noScroll: true });
        }
    });

    function setSection(newSection: string) {
        section = newSection;
    }

    const folder = `src/lib/models/<slug>/
  model.mxl.json    # the model as data  (or model.sbml, model.ts)
  meta.ts           # meta information about the model
  model.md          # prose description shown on the model page
  scheme.svg        # reaction scheme diagram       (optional)
  figs/             # directory for the validation figures
  validation.*ipynb    # scripts for the validation figures (does not need to be Python)
  curatornotes.md   # notes for the validation      (optional)`;
  

  const metaTs = `import contributors from "$lib/contributors";
import type { ModelMeta } from "$lib/types";

export const meta: ModelMeta = {
  slug: "<autoryear>",
  title: "<Author> <Year>",
  DOI: "<doi>",
  journal: "<Journal>",
  license: "<License>",
  tags: {
    "Part of Photosynthesis": [<tags>],
    "Model type": [<tags>],
    "Explains data": [<tags>],
    Organism: [<tags>],
    "PMF description": [<tags>],
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
};`;

  const verifyCode = `npm install
npm run validate:models   # schema-validate + smoke-check every model
npm run dev               # open the model page, confirm the analyses run`;
</script>

<svelte:head>
  <title>How To - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
    <Row justify="between">
        <H1 color="light">How To</H1>
        <Pair justify="end">
            <Button 
                variant="inverted"
                class={section === "website" ? "inverted active-tab" : "inverted"}
                onclick={() => setSection("website")}
            >Website</Button>
            <Button
                variant="inverted"
                class={section === "contribute" ? "inverted active-tab" : "inverted"}
                onclick={() => setSection("contribute")}
            >Contribute</Button>
        </Pair>
    </Row>
</SectionHeader>

{#if section === "website"}
    <Section variant="light" width="narrow">
        <H1>1. Find a model</H1>
        <Text>
            Using the website find a model that you are interested in. With he help of the tags, the live simulation, and the model comparisions, you should find a model that you may want to use for your own research or educational purposes.
        </Text>
        <H1>2. Download the model</H1>
        <Text>
            Once a model is chosen, you can download it in several formats. Suggested is the usage of MxlPy, yet if you wish to use the model in another programming language, you can also download it in an SBML format, or also a raw Python file. Please keep in mind to repsect the license of the model and the work of the original authors. GreenSloth is meant as a repository of models, and does not own the rights to the models.
        </Text>
        <H1>3. Using the MxlPy version</H1>
        <Text>
            We recommend using the MxlPy version of each model, as the python package is great for ODE models. Additionally, the creators of GreenSloth are also the creators of MxlPy, and thus most of the models have been built using the Python package. All the models are barebones ODE models, therefore only needing the MxlPy package to run. Look at the <a href="https://cpbl.rwth-aachen.de/MxlPy/latest/" target="_blank">MxlPy documentation</a> for more information on how to use the package and the models.
        </Text>
    </Section>
{:else if section === "contribute"}
    <Section variant="light" width="narrow">
        <H1>Two ways to contribute</H1>
        <Ol>
            <Li>
            <Bold>From the browser, no setup.</Bold> Use the <Link href={resolve("/contribute")}>in-app builder</Link>: paste your model, confirm it simulates in the live preview, fill in the metadata, and open a pre-filled issue. A workflow validates it and opens the pull request for you.
            </Li>
            <Li>
            <Bold>As a pull request yourself.</Bold> Clone the repo, drop a
            <Code>src/lib/models/&lt;slug&gt;/</Code> folder (below), run the checks, and open a PR. A more comprehensive guide can be found in <Link href="{repo}/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</Link>
            </Li>
        </Ol>
        <H1>How a model looks like</H1>
        <Text>
            Models are auto-discovered directories under <Code>src/lib/models/&lt;slug&gt;/</Code>. The <Bold>required</Bold> files are the <Code>meta.ts</Code> and a model file in any supported format:
        </Text>
        <Ol>
            <Li><Code>model.mxl.json</Code> (preferred)</Li>
            <Li><Code>model.sbml</Code></Li>
            <Li><Code>model.ts</Code></Li>
        </Ol>
        <Pre>{folder}</Pre>
        <Text>
            The <Code>&lt;slug&gt;</Code>, which is the directory name will be the name of the model on the website, and must match the <Code>slug</Code> field in <Code>meta.ts</Code>.
        </Text>
        <H2>1. The model file</H2>
        <Text>
            The model file itself is data. It is recommended to let a tool write the model file for you:
        </Text>
        <Ol>
            <Li><a href="https://github.com/Computational-Biology-Aachen/mxlpy" target="_blank" rel="noopener noreferrer"><Code>MxlPy</Code></a>: A python package for working with ODE models, that has the canonical <Code>.mxl.json</Code> export.</Li>
            <Li><Bold>SBML</Bold>: Use a tool that exports an <Code>sbml</Code> file and drop it in the folder and greensloth converts it on load with <Code>sbmlToModel</Code>.</Li>
            <Li>Handwriting a <Code>model.ts</Code> file to correspond to your model. (Very tedious)</Li>
        </Ol>
        <H2>2. The <Code>meta.ts</Code> file</H2>
        <Text>
            The <Code>meta.ts</Code> file contains the metadata of the model, such as the title, DOI, tags, and dashboard analyses. It is required for the model to be correctly displayed on the website.
        </Text>
        <Pre>{metaTs}</Pre>
        <Accordion title="Each field explained">
            <Text>
                The <Code>meta.ts</Code> file is a TypeScript file that exports a <Code>meta</Code> object of type <Code>ModelMeta</Code>. The <Code>ModelMeta</Code> type is defined in <Code>$lib/types</Code>. The <Code>meta</Code> object contains the following fields:
            </Text>
            <Ol>
                <Li><Bold>slug</Bold>: The slug of the model, which is the directory name.</Li>
                <Li><Bold>title</Bold>: The title of the model, often the first Author's surname and the year of publication.</Li>
                <Li><Bold>DOI</Bold>: The DOI of the model.</Li>
                <Li><Bold>journal</Bold>: The journal of the model.</Li>
                <Li><Bold>license</Bold>: If the publication is open access, this field should be filled with the license information. If non-open access, but a scheme is recreated, 'Recreated' should be added</Li>
                <Li><Bold>tags</Bold>: The tags of the model. The <Code>Object</Code> should include all available tag categories, if the model does not have a tag of that category, the array should be empty. The avaiable Tags can be found in the <a href="{repo}/blob/main/src/lib/tags.ts" target="_blank" rel="noopener noreferrer"><Code>tags.ts</Code></a> file.</Li>
                <Li><Bold>analyses</Bold>: The analyses of the model.</Li>
                <Li><Bold>contributors</Bold>: The contributors of the model.</Li>
            </Ol>
        </Accordion>
        <H2>3. The model depiction</H2>
        <Text>
            The model depiction is done in two ways. One is a brief description of the model, as shown in the publication. It should include the model's purpose, the model's structure, and the model's assumptions. This is done in the <Code>model.md</Code> file.
        </Text>
        <Text>
            The other is a reaction scheme diagram, which is a visual representation of the model's reactions. It should include all reactions, all species, and all compartments. The reaction scheme diagram should be in SVG format and should be named <Code>scheme.svg</Code>. Depending on the license of the publication, the scheme can be directly taken from there, or it can bre loosely recreated. If the scheme is recreated, it should be mentioned in the <Code>license</Code> field of the <Code>meta.ts</Code> file. This step is optional, but highly recommended, as it helps to understand the model better.
        </Text>
        <H2>4. The model validation</H2>
        <Text>
            The model reimplementation should be validated by recreating the original publication's figures. The validation figures should be placed in the <Code>figs/</Code> directory, and the script to generate them should be included by calling it <Code>validation.*ipynb</Code>. It does not have to be written in Python, but a Jupyter Notebook is definitely recommended. If there are errors in the validation, but the it is still considered a good addition to the GreenSloth website, a <Code>curatornotes.md</Code> file should be added to explain the errors and the reasoning behind it.
        </Text>
        <H2>5. Verify and open a PR</H2>
        <Pre>{verifyCode}</Pre>
            <Text>
                Then open a pull request against <Link href={repo}>green-sloth</Link>. CI re-runs <Code>validate:models</Code> and a build on every PR.
            </Text>
    </Section>
{/if}

<style>
  :global(H1) {
    width: 100%;
  }

  :global(button.inverted) {
    border: 0.2em solid var(--color-primary);
  }
  :global(button.active-tab) {
    border-bottom: 0.2em solid var(--color-accent) !important;
}
</style>
