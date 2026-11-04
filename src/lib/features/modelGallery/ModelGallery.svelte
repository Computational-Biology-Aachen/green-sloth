<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { models } from "#lib/models.js";
  import { fuzzyMatch } from "#lib/utils.js";
  import {
    Accordion,
    ButtonTab,
    H1,
    Section,
    SectionHeader,
  } from "@computational-biology-aachen/design";

  import CardModel from "#lib/components/CardModel.svelte";
  import PhotosynthesisScheme from "#lib/components/PhotosynthesisScheme.svelte";
  import { onMount } from "svelte";
  import { ORGANISM_GROUPS, PARTS } from "#lib/tags.js";

  // Optional per-model scheme image, co-located in src/lib/models/<slug>/.
  const schemeModules = import.meta.glob(
    "/src/lib/models/*/scheme.{svg,png,jpg,jpeg,webp,gif,avif}",
    {
      query: "?url",
      import: "default",
      eager: true,
    },
  ) as Record<string, string>;

  const schemes: Record<string, string> = Object.fromEntries(
    Object.entries(schemeModules).flatMap(([path, url]) => {
      const slug = path.match(/\/models\/([^/]+)\//)?.[1];
      return slug ? [[slug, url]] : [];
    }),
  );

  // A model is "validated" once it has at least one paper-reproduction figure
  // co-located in src/lib/models/<slug>/figs/ — same rule as ModelPage.svelte.
  const modelFigs = import.meta.glob(
    "/src/lib/models/*/figs/*.{png,jpg,svg,jpeg}",
    {
      eager: true,
    },
  ) as Record<string, unknown>;

  const validatedSlugs = new Set(
    Object.keys(modelFigs).flatMap((path) => {
      const slug = path.match(/\/models\/([^/]+)\/figs\//)?.[1];
      return slug ? [slug] : [];
    }),
  );

  // The apparatus scheme below selects tags in this category.
  const APP_CAT = "Part of Photosynthesis";

  // The `/data` page deep-links here with a preselected tag in this category.
  const DATA_CAT = "Explains data";

  // Every Part is drawn as a labeled region on the apparatus scheme —
  // anything else in APP_CAT has no physical location on it and surfaces
  // instead as the small "Also part of photosynthesis" chip row next to it,
  // so the category has exactly one filter UI.
  const APPARATUS_TAGS: ReadonlySet<string> = new Set(PARTS);

  // All tag categories → their distinct tags, across every model.
  const categories: Record<string, string[]> = {};
  for (const info of Object.values(models)) {
    for (const [cat, tags] of Object.entries(info.tags)) {
      const set = (categories[cat] ??= []);
      for (const t of tags) if (!set.includes(t)) set.push(t);
    }
  }
  for (const tags of Object.values(categories)) {
    tags.sort((a, b) => {
      return a.localeCompare(b);
    });
  }

  const organismGroups = Object.entries(ORGANISM_GROUPS)
    .map(([name, groupTags]) => ({
      name,
      tags: groupTags
        .filter((tag) => categories.Organism?.includes(tag))
        .sort((a, b) => a.localeCompare(b)),
    }))
    .filter(({ tags }) => tags.length > 0);
  const groupedOrganisms = new Set(organismGroups.flatMap(({ tags }) => tags));
  const ungroupedOrganisms =
    categories.Organism?.filter((tag) => !groupedOrganisms.has(tag)) ?? [];

  // category → set of active tags
  let active = $state<Record<string, Set<string>>>({});

  // searchParams is off-limits during prerender, so adopt any ?data=<tag>
  // selection once we're in the browser (used by the /data page buttons).
  onMount(() => {
    const tag = page.url.searchParams.get("data");
    if (tag && categories[DATA_CAT]?.includes(tag)) toggle(DATA_CAT, tag);
  });

  let query = $state("");
  let filterInput = $state<HTMLInputElement>();

  type Validation = "all" | "validated" | "unvalidated";
  let validation = $state<Validation>("all");
  const validationOptions: Array<{ value: Validation; label: string }> = [
    { value: "all", label: "All" },
    { value: "validated", label: "Validated" },
    { value: "unvalidated", label: "Unvalidated" },
  ];

  // Intercept the usual search shortcuts so they focus the model filter
  // instead of the browser's find bar: Ctrl/Cmd+F always, and "/" when the
  // user isn't already typing into a field.
  function onWindowKey(e: KeyboardEvent) {
    const isFind = (e.ctrlKey || e.metaKey) && e.key === "f";
    const target = e.target as HTMLElement | null;
    const typing =
      target?.tagName === "INPUT" ||
      target?.tagName === "TEXTAREA" ||
      target?.isContentEditable;
    const isSlash = e.key === "/" && !typing;
    if (isFind || isSlash) {
      e.preventDefault();
      filterInput?.focus();
      filterInput?.select();
    }
  }

  function toggle(cat: string, tag: string) {
    // plain Set updated immutably below (active is reassigned), so reactivity
    // comes from the reassignment, not from mutating the Set
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const next = new Set(active[cat] ?? []);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    active = { ...active, [cat]: next };
  }

  function clearTags() {
    active = {};
  }

  // Resets every filter axis, used by the empty-state recovery link where the
  // blocking filter could be a tag, the text query, or the validation toggle.
  function clearFilters() {
    active = {};
    query = "";
    validation = "all";
  }

  const activeChips = $derived(
    Object.entries(active).flatMap(([cat, tags]) =>
      [...tags].map((tag) => ({ cat, tag })),
    ),
  );

  // Tags in APP_CAT the apparatus diagram can't draw (no physical location),
  // surfaced next to it instead of duplicating the whole category as pills.
  const extraApparatusTags = $derived(
    categories[APP_CAT]?.filter((t) => !APPARATUS_TAGS.has(t)) ?? [],
  );

  function shortenTo(str: string, maxLen: number): string {
    if (str.length > maxLen) {
      return str.substring(0, maxLen - 3) + "...";
    }
    return str;
  }

  function isActive(cat: string, tag: string): boolean {
    return active[cat]?.has(tag) ?? false;
  }

  // AND everywhere: a model must match the name query (when present) and carry
  // every selected tag (within and across categories).
  const filtered = $derived(
    Object.entries(models).filter(([slug, info]) => {
      if (!fuzzyMatch(info.title, query)) return false;
      if (validation === "validated" && !validatedSlugs.has(slug)) return false;
      if (validation === "unvalidated" && validatedSlugs.has(slug))
        return false;
      for (const [cat, sel] of Object.entries(active)) {
        if (sel.size === 0) continue;
        // `cat` is a dynamic facet category built from Tags at runtime, not
        // a literal key, so it can't be checked against Tags statically.
        const modelTags = (info.tags as Record<string, string[]>)[cat] ?? [];
        if (![...sel].every((t) => modelTags.includes(t))) return false;
      }
      return true;
    }),
  );
</script>

<svelte:window onkeydown={onWindowKey} />

<svelte:head>
  <title>Models - GreenSloth</title>
</svelte:head>

<SectionHeader>
  <H1 color="light">Models</H1>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <div class="scheme-wrapper">
    <PhotosynthesisScheme
      highlighted={(part) => isActive(APP_CAT, part)}
      onToggle={(part) => toggle(APP_CAT, part)}
    />

    {#if extraApparatusTags.length > 0}
      <div class="scheme-extra">
        <p class="facet-label">Also part of photosynthesis</p>
        <div class="pills">
          {#each extraApparatusTags as tag (tag)}
            <ButtonTab
              selected={isActive(APP_CAT, tag)}
              aria-pressed={isActive(APP_CAT, tag)}
              onclick={() => toggle(APP_CAT, tag)}
            >
              {tag}
            </ButtonTab>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#each Object.entries(categories) as [cat, tags] (cat)}
    {#if cat !== APP_CAT}
      <div class="facet">
        <p class="facet-label">{cat}</p>
        {#if cat === "Organism"}
          {#each organismGroups as { name, tags: groupTags } (name)}
            <div class="organism-group">
              <Accordion title={name}>
                <div class="pills">
                  {#each groupTags as tag (tag)}
                    <ButtonTab
                      selected={isActive(cat, tag)}
                      aria-pressed={isActive(cat, tag)}
                      onclick={() => toggle(cat, tag)}
                    >
                      {tag}
                    </ButtonTab>
                  {/each}
                </div>
              </Accordion>
            </div>
          {/each}
          {#if ungroupedOrganisms.length > 0}
            <div class="organism-group">
              <Accordion title="Other">
                <div class="pills">
                  {#each ungroupedOrganisms as tag (tag)}
                    <ButtonTab
                      selected={isActive(cat, tag)}
                      aria-pressed={isActive(cat, tag)}
                      onclick={() => toggle(cat, tag)}
                    >
                      {tag}
                    </ButtonTab>
                  {/each}
                </div>
              </Accordion>
            </div>
          {/if}
        {:else}
          <div class="pills">
            {#each tags as tag (tag)}
              <ButtonTab
                selected={isActive(cat, tag)}
                aria-pressed={isActive(cat, tag)}
                onclick={() => toggle(cat, tag)}
              >
                {tag}
              </ButtonTab>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/each}
</Section>

<Section variant="surface">
  <div class="filter-row">
    <input
      bind:this={filterInput}
      type="search"
      class="filter"
      placeholder="Filter models…"
      aria-label="Filter models"
      bind:value={query}
    />
    {#if import.meta.env.DEV}
      <div
        class="validation-toggle"
        role="group"
        aria-label="Filter by validation status"
      >
        {#each validationOptions as { value, label } (value)}
          <ButtonTab
            selected={validation === value}
            aria-pressed={validation === value}
            onclick={() => (validation = value)}
          >
            {label}
          </ButtonTab>
        {/each}
      </div>
    {/if}
  </div>
  {#if activeChips.length > 0}
    <div
      class="active-filters"
      aria-label="Active filters"
    >
      {#each activeChips as { cat, tag } (`${cat}:${tag}`)}
        <button
          type="button"
          class="chip"
          aria-label="Remove {tag} filter"
          onclick={() => toggle(cat, tag)}
        >
          {tag}
          <span aria-hidden="true">×</span>
        </button>
      {/each}
      <button
        type="button"
        class="clear-all"
        onclick={clearTags}
      >
        Clear all
      </button>
    </div>
  {/if}
  <div class="grid">
    {#each filtered as [slug, info] (slug)}
      <CardModel
        name="{info.title}{info.journal ? `, ${info.journal}` : ''}"
        href={resolve("/models/[slug]", { slug })}
        image={schemes[slug]}
        parts={info.tags["Part of Photosynthesis"]}
        license={info.license
          ? shortenTo(`${info.license} - ${info.journal}`, 35)
          : undefined}
      />
    {/each}
    {#if filtered.length === 0}
      <p class="empty">
        No models match the current filters.
        <button
          type="button"
          class="clear-all-inline"
          onclick={clearFilters}
        >
          Clear filters
        </button>
      </p>
    {/if}
  </div>
</Section>

<style>
  .facet {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .facet-label {
    margin: 0;
    color: var(--color-text-muted);
    font-weight: var(--weight-semibold);
    font-size: var(--text-sm);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .organism-group {
    display: inline-block;
    margin-right: var(--space-2);
  }

  .empty {
    display: flex;
    grid-column: 1 / -1;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2);
    color: var(--color-text-muted);
  }

  .clear-all-inline {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    color: var(--color-primary);
    font: inherit;
    font-weight: var(--weight-semibold);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4);
  }

  .validation-toggle {
    display: flex;
    flex-shrink: 0;
    gap: var(--space-4);
  }

  .filter {
    flex: 1 1 240px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    padding: var(--space-2) var(--space-3);
    width: 100%;
    color: inherit;
    font: inherit;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .scheme-wrapper {
    margin: 0 auto;
    width: 100%;
    max-width: 800px;
  }

  .scheme-extra {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }

  .active-filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    margin: var(--space-4) auto 0;
    width: 100%;
    max-width: var(--max-width);
  }

  .chip {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    cursor: pointer;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    padding: var(--space-1) var(--space-3);
    color: var(--color-text);
    font-size: var(--text-sm);
  }

  .chip:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .clear-all {
    cursor: pointer;
    border: none;
    background: none;
    padding: var(--space-1) var(--space-2);
    color: var(--color-text-muted);
    font-weight: var(--weight-semibold);
    font-size: var(--text-sm);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .clear-all:hover {
    color: var(--color-primary);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-6);
    margin: 0 auto;
    width: 100%;
    max-width: var(--max-width);
  }
</style>
