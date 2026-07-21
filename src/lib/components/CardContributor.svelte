<script lang="ts">
  import { base } from "$app/paths";
  import placeholder from "$lib/assets/contributor-placeholder.svg";
  import { models } from "$lib/models";
  import type { Contributor } from "$lib/types";
  import {
    Accordion,
    Li,
    Link,
    Text,
    Ul,
  } from "@computational-biology-aachen/design";
  import ImageRound from "@computational-biology-aachen/design/ImageRound.svelte";
  import {
    faGithub,
    faGitlab,
    faOrcid,
  } from "@fortawesome/free-brands-svg-icons";
  import { faHome } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";

  let { contributor }: { contributor: Contributor } = $props();

  // A model is credited once even if the contributor appears multiple times
  // in its `contributors` list (e.g. distinct desc/date entries).
  const contributedModels = $derived(
    Object.entries(models)
      .filter(([, meta]) =>
        meta.contributors.some((c) => c.contributor.key === contributor.key),
      )
      .map(([slug, meta]) => ({ slug, title: meta.title })),
  );

  const modelCountLabel = $derived(
    `Contributed to ${contributedModels.length} ${contributedModels.length === 1 ? "model" : "models"}`,
  );
</script>

<div
  id={contributor.key}
  class="card"
>
  <ImageRound
    path={contributor.photo ?? placeholder}
    alt={contributor.name}
    objectFit="cover"
    objectPosition="top"
    styleVars={{ size: "136px" }}
  />
  <div class="info">
    <Text><strong>{contributor.name}</strong></Text>
    <div class="links">
      {#if contributor.homepage}
        <Link href={contributor.homepage}><Fa icon={faHome} /></Link>
      {/if}
      {#if contributor.github}
        <Link href="https://github.com/{contributor.github}"
          ><Fa icon={faGithub} /></Link
        >
      {/if}
      {#if contributor.gitlab}
        <Link href="https://gitlab.com/{contributor.gitlab}"
          ><Fa icon={faGitlab} /></Link
        >
      {/if}
      {#if contributor.orcid}
        <Link href="https://orcid.org/{contributor.orcid}"
          ><Fa icon={faOrcid} /></Link
        >
      {/if}
    </div>
    <Accordion
      title={modelCountLabel}
      styleVars={{
        "--acc-summary-padding": "0",
        "--acc-content-padding": "0",
      }}
      --color-surface="white"
      --color-bg="white"
      --color-border="white"
      --border="none"
    >
      <Ul>
        {#each contributedModels as m (m.slug)}
          <Li><Link href="{base}/models/{m.slug}">{m.title}</Link></Li>
        {/each}
      </Ul>
    </Accordion>
  </div>
</div>

<style>
  .card {
    display: flex;
    align-items: start;
    gap: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    padding: var(--space-4);
    scroll-margin-top: var(--space-8);
  }

  .card :global(img),
  .card :global(.placeholder) {
    flex-shrink: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: 100%;
  }

  .links {
    display: flex;
    gap: var(--space-3);
  }
</style>
