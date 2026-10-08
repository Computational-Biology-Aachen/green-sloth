<script lang="ts">
    import { page } from "$app/stores";
    import { base } from "$app/paths";
    import greenslothLogo from "$lib/assets/greensloth-logo-inv.svg";
    import {
        H1,
        Section,
        SectionHeader,
        Text,
        Row,
        Pair,
        Button,
    } from "@computational-biology-aachen/design";
    import Contributors from "../contributors/Contributors.svelte";

    let section = $state($page.url.searchParams.get("section") || "use");

    function setSection(newSection: string) {
        section = newSection;
    }
</script>

<svelte:head>
  <title>How To - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
    <Row justify="between">
        <H1 color="light">How To</H1>
        <Pair justify="end">
            <Button variant="inverted" onclick={() => setSection("use")}>Use</Button>
            <Button variant="inverted" onclick={() => setSection("contribute")}>Contribute</Button>
        </Pair>
    </Row>
</SectionHeader>

{#if section === "use"}
    <Section variant="light" width="narrow">
        <H1>1. Find a model</H1>
        <Text>
            Using the website find a model that you are interested in. With he help of the tags, the live simulation, and the model comparisions, you should find a model that you may want to use for your own research or educational purposes.
        </Text>
        <H1>2. Download the model</H1>
        <Text>
            Once a model is chosen, you can download it in several formats. Suggested is the usage of Python, yet if you wish to use the model in another programming language, you can also download it in an SBML format. Please keep in mind to repsect the license of the model and the work of the original authors. GreenSloth is meant as a repository of models, and does not own the rights to the models.
        </Text>
        <H1>3. Using the MxlPy version</H1>
        <Text>
            We recommend using the MxlPy version of each model, as the python package is great for ODE models. Additionally, the creators of GreenSloth are also the creators of MxlPy, and thus most of the models have been built using the Python package. All the models are barebones ODE models, therefore only needing the MxlPy package to run. Look at the <a href="https://cpbl.rwth-aachen.de/MxlPy/latest/" target="_blank">MxlPy documentation</a> for more information on how to use the package and the models.
        </Text>
    </Section>
{:else if section === "contribute"}
    <Section variant="light" width="narrow">
        <Text>
            We welcome contributions from the community! If you have developed a mechanistic photosynthesis model that you would like to share, please follow our contribution guidelines. This section outlines the steps for submitting your model, including documentation requirements, validation procedures, and licensing considerations.
        </Text>
        <Text>
            By contributing to GreenSloth, you help expand the database and support the scientific community in advancing our understanding of photosynthesis through collaborative efforts.
        </Text>
    </Section>
{/if}

<style>
  :global(H1) {
    width: 100%;
  }
</style>
