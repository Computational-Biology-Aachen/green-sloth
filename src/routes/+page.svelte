<script lang="ts">
  import { base } from "$app/paths";
  import greenslothLogo from "$lib/assets/greensloth-logo.svg";
  import {
    Button,
    H1,
    H2,
    Section,
    Tabs,
    Text,
  } from "@computational-biology-aachen/design";
  import "../app.css";
</script>

<svelte:head>
  <title>GreenSloth</title>
</svelte:head>

<!-- Slide 1: Hero -->
<Section>
  <div class="hero-inner">
    <img
      src={greenslothLogo}
      alt="GreenSloth"
      class="hero-logo"
    />
    <H1 color="light">Photosynthesis Models at your Pace</H1>
    <div class="hero-actions">
      <Button href="{base}/models">Browse Models</Button>
    </div>
  </div>
</Section>

<!-- Slide 2: Motivation -->
<Section
  variant="light"
  width="narrow"
>
  <H2>Motivation</H2>
  <Text>
    Photosynthesis is arguably the most crucial process of life on Earth. It
    feeds us, clothes us, heals us, and calms us. Therefore, it has long been a
    significant target for research, and while we now know a great deal about
    how, why, and who photosynthesis is, there are still aspects of it that we
    cannot quite grasp. However, with the rise of computational prowess, we have
    developed new ways to examine and understand photosynthesis. Through digital
    models of photosynthesis!
  </Text>
  <Text>
    While this field has existed for decades, it has recently gained significant
    importance. To such an extent that there are many different models of
    photosynthesis, each attempting to depict various aspects, some even the
    entirety, of the process. This boom enables a researcher interested in this
    field to have the power of choice of models. However, this power also comes
    with a curse.
  </Text>
  <Text>
    The different models all have their strengths and aim to cater to people who
    are not proficient in creating a model on their own. However, since the
    publication of models is not as heavily regulated as lab work and most model
    builders are experts in their field, a disconnect exists between the model
    and the target user. It can be challenging to find a model that fits your
    needs. This is where <strong>GreenSloth</strong> comes in.
  </Text>
  <Text>
    <strong>GreenSloth</strong> will help you, the researcher interested in
    modelling photosynthesis, decide which model is best suited for your needs.
    Led by the
    <a
      href="https://www.cpbl.rwth-aachen.de/go/id/sazuq/?lidx=1"
      target="_blank">Computational Life Science</a
    >
    group at RWTH Aachen.
    <a href="mailto:elouen.corvest@rwth-aachen.de">Contact us</a> with ideas or models
    to include.
  </Text>
</Section>

<!-- Slide 3: How To Use -->
<Section
  variant="light"
  width="narrow"
  ><Tabs
    tabs={[
      { key: "search", label: "Search" },
      { key: "summary", label: "Summary" },
      { key: "comparison", label: "Comparison" },
    ]}
  >
    {#snippet children(activeKey)}
      {#if activeKey === "search"}
        <Text>
          The first aspect of finding models is searching for them. Most
          commonly, new models are found by reading scientific literature, which
          has many positive aspects. However, it takes time and is tiring.
          Additionally, with the mass of new publications over time, some models
          will drown under the waves of new information. This is where
          GreenSloth comes into play, as it highlights already curated and
          popular models.
        </Text>
        <Text>
          GreenSloth shows its curated models in a <a href="{base}/models"
            >list</a
          > with the model's name and scheme. Furthermore, GreenSloth introduces manually
          curated categories to see where the chosen models overlap. These categories
          are separated into a tag system to facilitate selecting the right model.
        </Text>
      {:else if activeKey === "summary"}
        <Text>
          Each of the models presented on GreenSloth comes with a curated
          summary from the publication and a completed version, which is
          available for download using the modelbase package. Additionally, some
          vital model information, like the ODE system, the parameters, etc.,
          are tabularized for ease of access. Every model on GreenSloth will
          also include tests to give further insight into the completeness of
          each model.
        </Text>
      {:else}
        <Text>
          To help choose between models, GreenSloth lets you compare vital
          information between two models directly. This enables a quicker and
          more efficient way to choose which model is best tailored to your
          specific needs. While most comparisons are done using the information
          from each model summary, GreenSloth also uses more advanced, newly
          developed techniques.
        </Text>
      {/if}
    {/snippet}
  </Tabs>
</Section>

<style>
  .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    color: white;
    text-align: center;
  }

  .hero-logo {
    width: 60%;
    max-width: 350px;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
  }
</style>
