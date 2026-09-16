<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { base } from "$app/paths";
  import { updated } from "$app/state";
  import favicon from "$lib/assets/cpbl-favicon.svg";
  import greenslothLogo from "$lib/assets/greensloth-logo.svg";
  import {
    CollapseToBurger,
    Imprint,
    Navbar,
    NavGH,
    NavItem,
  } from "@computational-biology-aachen/design";
  import "../app.css";

  let { children } = $props();

  // A new deploy was detected while this tab was open: force a full reload on
  // the next navigation instead of client-side routing into a stale bundle.
  beforeNavigate(({ willUnload, to }) => {
    if (updated.current && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });
</script>

<svelte:head>
  <title>GreenSloth</title>
  <meta
    name="description"
    content="Photosynthesis models at your pace - browse, compare, and explore curated ODE models of photosynthesis."
  />
  <link
    rel="icon"
    href={favicon}
  />
</svelte:head>

<a
  href="#main-content"
  class="skip-link"
>
  Skip to content
</a>

<Navbar>
  {#snippet brand()}
    <a
      href="{base}/"
      class="brand"
    >
      <img
        src={greenslothLogo}
        alt="GreenSloth"
        class="brand-logo"
      />
      <span>GreenSloth</span>
    </a>
  {/snippet}
  <CollapseToBurger collapseAt="768px">
    <NavItem href="{base}/">Home</NavItem>
    <NavItem href="{base}/models">Models</NavItem>
    <NavItem href="{base}/data">Data</NavItem>
    <NavItem href="{base}/compare">Compare</NavItem>
    <NavItem href="{base}/contributing">Contribute</NavItem>
    <NavItem href="{base}/about">About Us</NavItem>
  </CollapseToBurger>
  <NavGH href="https://github.com/Computational-Biology-Aachen/green-sloth" />
</Navbar>

<main id="main-content">
  {@render children()}
</main>

<Imprint
  github="https://github.com/Computational-Biology-Aachen/green-sloth"
  width="narrow"
/>

<style>
  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-primary);
    font-weight: 600;
    text-decoration: none;
  }

  .brand-logo {
    width: auto;
    height: 1.8rem;
  }

  .skip-link {
    position: absolute;
    top: 0;
    left: var(--space-4);
    transform: translateY(-100%);
    z-index: 100;
    transition: transform 150ms ease-out;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    background: var(--color-primary);
    padding: var(--space-2) var(--space-4);
    color: var(--color-text-inverse);
    font-weight: 600;
    text-decoration: none;
  }

  .skip-link:focus-visible {
    transform: translateY(0);
  }
</style>
