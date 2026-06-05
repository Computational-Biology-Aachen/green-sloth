<script lang="ts">
  import { browser } from "$app/environment";
  import { replaceState } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/state";
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
  import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
  import { onMount } from "svelte";

  // Eager glob so both models can be built on the client when selected.
  const modelModules = import.meta.glob("../../lib/models/*/model.ts", {
    eager: true,
  }) as Record<string, { initModel: () => KineticModelBuilder }>;

  function initFor(slug: string): KineticModelBuilder | null {
    const key = Object.keys(modelModules).find(
      (p) => p.match(/\/models\/([^/]+)\//)?.[1] === slug,
    );
    return key ? modelModules[key].initModel() : null;
  }

  function validSlug(slug: string | null, fallback: string): string {
    return slug && modelNames.includes(slug) ? slug : fallback;
  }

  let slugA = $state(modelNames[0]);
  let slugB = $state(modelNames[1] ?? modelNames[0]);

  // searchParams is off-limits during prerender, so adopt any ?a/?b selection
  // once we're in the browser.
  onMount(() => {
    slugA = validSlug(page.url.searchParams.get("a"), slugA);
    slugB = validSlug(page.url.searchParams.get("b"), slugB);
  });

  // Keep the URL in sync so a comparison is shareable, without spamming history.
  $effect(() => {
    if (!browser) return;
    const url = new URL(page.url);
    url.searchParams.set("a", slugA);
    url.searchParams.set("b", slugB);
    if (url.href !== page.url.href) replaceState(url, {});
  });

  const modelA = $derived(initFor(slugA));
  const modelB = $derived(initFor(slugB));

  type Bucket = { aOnly: string[]; shared: string[]; bOnly: string[] };

  function diff(
    a: Map<string, unknown> | undefined,
    b: Map<string, unknown> | undefined,
  ): Bucket {
    const aKeys = new Set(a?.keys() ?? []);
    const bKeys = new Set(b?.keys() ?? []);
    const sort = (xs: Iterable<string>) => [...xs].sort();
    return {
      aOnly: sort([...aKeys].filter((k) => !bKeys.has(k))),
      shared: sort([...aKeys].filter((k) => bKeys.has(k))),
      bOnly: sort([...bKeys].filter((k) => !aKeys.has(k))),
    };
  }

  const categories = [
    { key: "variables", label: "Variables" },
    { key: "parameters", label: "Parameters" },
    { key: "reactions", label: "Reactions" },
    { key: "assignments", label: "Derived" },
  ] as const;

  const overview = $derived(
    categories.map(({ key, label }) => ({
      label,
      a: modelA?.[key].size ?? 0,
      b: modelB?.[key].size ?? 0,
      shared: diff(modelA?.[key], modelB?.[key]).shared.length,
    })),
  );

  // Categories shown with a full shared/unique breakdown.
  const detailCategories = [
    { key: "variables", label: "Variables" },
    { key: "reactions", label: "Reactions" },
    { key: "parameters", label: "Parameters" },
  ] as const;

  const details = $derived(
    detailCategories.map(({ key, label }) => ({
      key,
      label,
      bucket: diff(modelA?.[key], modelB?.[key]),
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

  function filtered(ids: string[], query: string): string[] {
    return ids.filter((id) => fuzzyMatch(id, query));
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
    Note: overlap is computed by id; naming differences across models show up as
    unique.
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
          {#each filtered(detail.bucket.aOnly, queries[detail.key]) as id (id)}
            <li>{id}</li>
          {:else}
            <li class="empty">—</li>
          {/each}
        </ul>
      </div>
      <div class="bucket">
        <p class="bucket-head">Shared ({detail.bucket.shared.length})</p>
        <ul>
          {#each filtered(detail.bucket.shared, queries[detail.key]) as id (id)}
            <li>{id}</li>
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
          {#each filtered(detail.bucket.bOnly, queries[detail.key]) as id (id)}
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
    font-size: 0.85rem;
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
    font-size: 0.85rem;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.9rem;
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
    font-size: 0.85rem;
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
    font-size: 0.8rem;
    font-family: var(--font-mono);
    word-break: break-all;
  }

  .bucket li.empty {
    color: var(--color-text-muted);
    font-family: inherit;
  }

  .note {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }
</style>
