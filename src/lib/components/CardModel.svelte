<!--
  @component

  A linked card representing a model, showing its scheme image (or a gradient
  "biotech" placeholder) above a name label.

  ### Props

  - `name: string`
    Model name shown in the label and image `alt` text.
  - `href: string`
    Destination the whole card links to.
  - `image?: string`
    Optional scheme image URL; omitted shows the placeholder.
  - `styleVars?: { mediaHeight?: string; fallbackIconSize?: string }`
    Optional overrides for CSS custom properties.

  ### Example

  ```svelte
  <CardModel name="Poolman 2000" href="/models/poolman2000" image="/p2000.svg" />
  ```
-->
<script lang="ts">
  let {
    name,
    href,
    image,
    license,
    styleVars = {},
  }: {
    name: string;
    href: string;
    image?: string;
    license?: string;
    styleVars?: {
      mediaHeight?: string;
      fallbackIconSize?: string;
    };
  } = $props();

  let cardCssVars = $derived({
    ...(styleVars.mediaHeight
      ? { "--card-model-media-height": styleVars.mediaHeight }
      : {}),
    ...(styleVars.fallbackIconSize
      ? { "--card-model-fallback-icon-size": styleVars.fallbackIconSize }
      : {}),
  });
</script>

<a
  href={href}
  class="card"
  style={Object.entries(cardCssVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}
>
  <div class="media">
    {#if image}
      <img
        src={image}
        alt="{name} scheme"
      />
    {:else}
      <div class="fallback">
        <span class="material-symbols-outlined">biotech</span>
      </div>
    {/if}
    {#if license}
      <span class="copyright">
        © {license}
      </span>
    {/if}
  </div>
  <div class="label">
    <span>{name}</span>
  </div>
</a>

<style>
  .card {
    --card-model-media-height: 160px;
    --card-model-fallback-icon-size: 3rem;
    display: flex;
    flex-direction: column;
    transition:
      transform 150ms cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    overflow: hidden;
    color: var(--slate);
    text-decoration: none;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow:
      2px 5px 12px 0 rgba(0, 0, 0, 0.15),
      var(--shadow-primary);
    color: var(--color-primary);

    .fallback {
      background: linear-gradient(
        135deg,
        rgba(from var(--slate-500) r g b / 1) 0%,
        rgba(from var(--slate) r g b / 1) 100%
      );
    }
  }

  .media {
    position: relative;
    flex-shrink: 0;
    height: var(--card-model-media-height);
    overflow: hidden;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .fallback {
    --alpha: 0.8;
    display: flex;
    justify-content: center;
    align-items: center;
    transition:
      transform 150ms cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(
      135deg,
      rgba(from var(--slate-500) r g b / var(--alpha)) 0%,
      rgba(from var(--slate) r g b / var(--alpha)) 100%
    );
    width: 100%;
    height: 100%;
  }

  .fallback span {
    color: rgba(255, 255, 255, 0.85);
    font-size: var(--card-model-fallback-icon-size);
  }

  .label {
    padding: 0.75rem 1rem;
    font-weight: var(--weight-medium);
    font-size: var(--text-sm);
  }

  .copyright {
    position: absolute;
    bottom: 0;
    left: 0;
    border-top-right-radius: 12px;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 2px 8px;
    width: auto;
    max-width: 85%;
    pointer-events: none;
    color: white;
    font-size: 0.75rem;
    white-space: nowrap;
  }
</style>
