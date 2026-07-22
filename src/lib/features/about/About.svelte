<script lang="ts">
  import greenslothLogo from "$lib/assets/greensloth-logo-inv.svg";
  import {
    H1,
    Section,
    SectionHeader,
    Text,
  } from "@computational-biology-aachen/design";
  import Contributors from "../contributors/Contributors.svelte";
</script>

<svelte:head>
  <title>About - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
  <div class="header-grid">
    <H1 color="light">About Us</H1>
    <img
      src={greenslothLogo}
      alt="GreenSloth"
      class="header-img"
    />
  </div>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <Text>
    GreenSloth is developed and maintained by the Computational Biology Group at
    RWTH Aachen University, led by Prof. Dr. Anna Matuszyńska. Our research
    combines mechanistic mathematical modelling, systems biology, machine
    learning, and plant physiology to understand photosynthesis across
    biological scales, from molecular regulation within the thylakoid membrane
    to whole-leaf carbon assimilation and plant responses to fluctuating
    environments.
  </Text>
  <Text>
    Our vision is to make mechanistic models reproducible, executable, and
    reusable. Rather than leaving published models as equations scattered across
    manuscripts and supplementary files, we reconstruct them as validated,
    documented software that can be explored, compared, and extended by the
    community. This philosophy underpins GreenSloth and our broader commitment
    to open, transparent, and reproducible computational biology.
  </Text>
  <Text>
    The first version of GreenSloth was conceived and developed by Elouen
    Corvest as part of his Master's thesis. Beyond implementing the initial
    platform, he established many of the curation and validation principles that
    define GreenSloth today. His work introduced systematic approaches for
    comparing mechanistic photosynthesis models in a scientifically meaningful
    way—allowing models to be evaluated not only by their implementation, but
    also by their biological scope, mathematical formulation, assumptions,
    parameterisation, supported experimental modalities, and reproducibility.
    These principles continue to guide the evolution of the database.
  </Text>
  <Text>
    Today, GreenSloth is a collaborative effort involving researchers, software
    developers, and students from our laboratory. Every model is independently
    reconstructed, validated against its original publication, and carefully
    documented before becoming part of the collection. We view GreenSloth not
    simply as a database, but as a living knowledge base for mechanistic
    photosynthesis modelling. We hope that the list of contributors will grow
    beyond the walls of our University and we will collectively preserve the
    tremendous computational work already done on the dynamics of
    photosynthesis.
  </Text>
</Section>
<Section
  variant="light"
  width="narrow"
>
  <Contributors />
</Section>

<style>
  .header-grid {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-8);

    img {
      width: 10rem;
      height: 10rem;
    }
  }

  @media (max-width: 600px) {
    .header-grid {
      img {
        display: none;
      }
    }
  }
</style>
