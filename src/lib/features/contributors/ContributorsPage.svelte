<script lang="ts">
  import {
    H1,
    Section,
    SectionHeader,
  } from "@computational-biology-aachen/design";
  import Contributors from "./Contributors.svelte";
</script>

<svelte:head>
  <title>Contributors - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
  <H1 color="light">Contributors</H1>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <Contributors />
</Section>
