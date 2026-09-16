<script lang="ts">
  import { browser } from "$app/environment";
  import { replaceState } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import { buildModel } from "$lib/loadModel";
  import { modelNames, models } from "$lib/models";
  import {
    Bold,
    H1,
    H2,
    Link,
    Row,
    Section,
    SectionHeader,
  } from "@computational-biology-aachen/design";
  import {
    KineticModelBuilder,
    type ModelBuilderBase,
  } from "@computational-biology-aachen/mxlweb-core";
  import { onMount } from "svelte";

  function validSlug(slug: string | null, fallback: string): string {
    return slug && modelNames.includes(slug) ? slug : fallback;
  }

  let slugA = $state(modelNames[0]);
  let slugB = $state(modelNames[1] ?? modelNames[0]);

  // The client router finishes initializing slightly after the component
  // tree's own onMount hooks fire on the very first load (its readiness
  // isn't tied to Svelte's own mount/effect flush), so replaceState() below
  // still throws if called synchronously from onMount. A macrotask delay
  // guarantees we're scheduled after that startup sequence has resolved.
  let routerReady = $state(false);

  // searchParams is off-limits during prerender, so adopt any ?a/?b selection
  // once we're in the browser.
  onMount(() => {
    slugA = validSlug(page.url.searchParams.get("a"), slugA);
    slugB = validSlug(page.url.searchParams.get("b"), slugB);
    const timer = setTimeout(() => {
      routerReady = true;
    }, 0);
    return () => clearTimeout(timer);
  });

  // Keep the URL in sync so a comparison is shareable, without spamming history.
  $effect(() => {
    if (!browser || !routerReady) return;
    const url = new URL(page.url);
    url.searchParams.set("a", slugA);
    url.searchParams.set("b", slugB);
    if (url.href !== page.url.href) replaceState(url, {});
  });

  // Loaded asynchronously (each model is its own code-split chunk) rather than
  // via $derived, so switching slugA/slugB doesn't have to wait for every
  // model in the catalog to already be in the bundle. null while loading;
  // every downstream read already treats a model as possibly absent.
  let modelA = $state<ModelBuilderBase | null>(null);
  let modelB = $state<ModelBuilderBase | null>(null);

  $effect(() => {
    const slug = slugA;
    buildModel(slug).then((m) => {
      if (slug === slugA) modelA = m;
    });
  });

  $effect(() => {
    const slug = slugB;
    buildModel(slug).then((m) => {
      if (slug === slugB) modelB = m;
    });
  });

  // A "shared" pair may have differently-spelled raw ids (e.g. "ATP" vs
  // "atp") that resolve to the same names.ts displayName; both are kept so
  // the UI can show which spellings matched.
  type SharedEntry = { label: string; aId: string; bId: string };
  type Bucket = { aOnly: string[]; shared: SharedEntry[]; bOnly: string[] };

  type Entry = { displayName?: string };

  // Two entries count as the same concept if they share a displayName
  // (from names.ts); otherwise identity falls back to the raw id, matching
  // the old by-id behavior.
  function groupKey(id: string, entry: Entry | undefined): string {
    return entry?.displayName ?? id;
  }

  function diff(
    a: Map<string, Entry> | undefined,
    b: Map<string, Entry> | undefined,
  ): Bucket {
    const aByKey = new Map(
      [...(a ?? [])].map(([id, e]) => [groupKey(id, e), id]),
    );
    const bByKey = new Map(
      [...(b ?? [])].map(([id, e]) => [groupKey(id, e), id]),
    );
    const sortBy = <T,>(xs: T[], label: (x: T) => string) =>
      xs.sort((x, y) => label(x).localeCompare(label(y)));

    return {
      aOnly: sortBy(
        [...aByKey].filter(([k]) => !bByKey.has(k)).map(([, id]) => id),
        (id) => id,
      ),
      bOnly: sortBy(
        [...bByKey].filter(([k]) => !aByKey.has(k)).map(([, id]) => id),
        (id) => id,
      ),
      shared: sortBy(
        [...aByKey]
          .filter(([k]) => bByKey.has(k))
          .map(([label, aId]) => ({ label, aId, bId: bByKey.get(label)! })),
        (entry) => entry.label,
      ),
    };
  }

  type CategoryKey = "variables" | "parameters" | "reactions" | "assignments";

  // Reactions only exist on KineticModelBuilder; SteadyStateModelBuilder has
  // no such field, so it's read through this guard instead of plain indexing.
  function categoryMap(
    model: ModelBuilderBase | null,
    key: CategoryKey,
  ): Map<string, Entry> | undefined {
    if (key === "reactions") {
      return model instanceof KineticModelBuilder ? model.reactions : undefined;
    }
    return model?.[key];
  }

  const hasReactions = $derived(
    modelA instanceof KineticModelBuilder ||
      modelB instanceof KineticModelBuilder,
  );

  const categories = $derived(
    (
      [
        { key: "variables", label: "Variables" },
        { key: "parameters", label: "Parameters" },
        { key: "reactions", label: "Reactions" },
        { key: "assignments", label: "Derived" },
      ] as const satisfies { key: CategoryKey; label: string }[]
    ).filter(({ key }) => key !== "reactions" || hasReactions),
  );

  const overview = $derived(
    categories.map(({ key, label }) => ({
      label,
      a: categoryMap(modelA, key)?.size ?? 0,
      b: categoryMap(modelB, key)?.size ?? 0,
      shared: diff(categoryMap(modelA, key), categoryMap(modelB, key)).shared
        .length,
    })),
  );

  // Categories shown with a full shared/unique breakdown.
  const detailCategories = $derived(
    (
      [
        { key: "variables", label: "Variables" },
        { key: "reactions", label: "Reactions" },
        { key: "parameters", label: "Parameters" },
      ] as const satisfies { key: CategoryKey; label: string }[]
    ).filter(({ key }) => key !== "reactions" || hasReactions),
  );

  const details = $derived(
    detailCategories.map(({ key, label }) => ({
      key,
      label,
      bucket: diff(categoryMap(modelA, key), categoryMap(modelB, key)),
    })),
  );

  // Transient per-category filter text; not synced to the URL.
  let queries = $state<Record<string, string>>({
    variables: "",
    reactions: "",
    parameters: "",
  });

  // Case-insensitive subsequence match: query chars appear in order in the id.
  function fuzzyMatch(id: string, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (q === "") return true;
    let i = 0;
    for (const ch of id.toLowerCase()) {
      if (ch === q[i]) i++;
      if (i === q.length) return true;
    }
    return false;
  }

  function filtered<T>(
    items: T[],
    query: string,
    text: (item: T) => string,
  ): T[] {
    return items.filter((item) => fuzzyMatch(text(item), query));
  }

  const titleA = $derived(models[slugA]?.title ?? slugA);
  const titleB = $derived(models[slugB]?.title ?? slugB);
</script>

<svelte:head>
  <title>Compare models - GreenSloth</title>
</svelte:head>

<SectionHeader width="narrow">
  <H1 color="light">Compare</H1>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <div class="pickers">
    <label class="picker">
      <span>Model A</span>
      <select bind:value={slugA}>
        {#each modelNames as slug (slug)}
          <option value={slug}>{models[slug].title}</option>
        {/each}
      </select>
    </label>
    <label class="picker">
      <span>Model B</span>
      <select bind:value={slugB}>
        {#each modelNames as slug (slug)}
          <option value={slug}>{models[slug].title}</option>
        {/each}
      </select>
    </label>
  </div>

  <H2>Overview</H2>
  <p class="note">
    Note: overlap is computed by id, or by shared display name (from
    <code>names.ts</code>) when both models tag an entry with one; identifiers
    with no shared display name still show up as unique even if they mean the
    same thing.
  </p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th><Bold>Category</Bold></th>
          <th class="num"><Link href="{base}/models/{slugA}">{titleA}</Link></th
          >
          <th class="num"><Link href="{base}/models/{slugB}">{titleB}</Link></th
          >
          <th class="num">Shared</th>
        </tr>
      </thead>
      <tbody>
        {#each overview as row (row.label)}
          <tr>
            <td>{row.label}</td>
            <td class="num">{row.a}</td>
            <td class="num">{row.b}</td>
            <td class="num">{row.shared}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Section>

<Section
  variant="surface"
  width="narrow"
>
  {#each details as detail (detail.label)}
    <Row justify="between">
      <H2>{detail.label}</H2>
      <input
        type="search"
        class="filter"
        placeholder="Filter {detail.label.toLowerCase()}…"
        aria-label="Filter {detail.label.toLowerCase()}"
        bind:value={queries[detail.key]}
      />
    </Row>

    <div class="buckets">
      <div class="bucket">
        <p class="bucket-head">
          Only in <Link href="{base}/models/{slugA}">{titleA}</Link> ({detail
            .bucket.aOnly.length})
        </p>
        <ul>
          {#each filtered(detail.bucket.aOnly, queries[detail.key], (id) => id) as id (id)}
            <li>{id}</li>
          {:else}
            <li class="empty">—</li>
          {/each}
        </ul>
      </div>
      <div class="bucket">
        <p class="bucket-head">Shared ({detail.bucket.shared.length})</p>
        <ul>
          {#each filtered(detail.bucket.shared, queries[detail.key], (e) => `${e.label} ${e.aId} ${e.bId}`) as entry (entry.label)}
            <li>
              {entry.label}
              {#if entry.aId !== entry.bId}
                <span class="aka">({entry.aId} / {entry.bId})</span>
              {/if}
            </li>
          {:else}
            <li class="empty">—</li>
          {/each}
        </ul>
      </div>
      <div class="bucket">
        <p class="bucket-head">
          Only in <Link href="{base}/models/{slugB}">{titleB}</Link> ({detail
            .bucket.bOnly.length})
        </p>
        <ul>
          {#each filtered(detail.bucket.bOnly, queries[detail.key], (id) => id) as id (id)}
            <li>{id}</li>
          {:else}
            <li class="empty">—</li>
          {/each}
        </ul>
      </div>
    </div>
  {/each}
</Section>

<style>
  .pickers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .picker span {
    color: var(--color-text-muted);
    font-weight: var(--weight-semibold);
    font-size: var(--text-sm);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  select {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    padding: var(--space-2) var(--space-3);
    color: inherit;
    font: inherit;
  }

  .filter {
    margin-bottom: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    padding: var(--space-2) var(--space-3);
    width: 100%;
    max-width: 320px;
    color: inherit;
    font: inherit;
    font-size: var(--text-sm);
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: var(--text-sm);
  }

  th,
  td {
    border-bottom: 1px solid var(--color-border);
    padding: 0.4rem 0.75rem;
    text-align: left;
  }

  th {
    font-weight: var(--weight-semibold);
  }

  .num {
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .buckets {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  @media (max-width: 640px) {
    .buckets {
      grid-template-columns: 1fr;
    }
  }

  .bucket-head {
    margin: 0 0 var(--space-2);
    font-weight: var(--weight-semibold);
    font-size: var(--text-sm);
  }

  .bucket ul {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .bucket li {
    font-size: var(--text-callout);
    font-family: var(--font-mono);
    word-break: break-all;
  }

  .aka {
    color: var(--color-text-muted);
  }

  .bucket li.empty {
    color: var(--color-text-muted);
    font-family: inherit;
  }

  .note {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }
</style>
