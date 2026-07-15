<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import { models } from "$lib/models";
  import { fuzzyMatch } from "$lib/utils";
  import {
    ButtonTab,
    CardModel,
    H1,
    Section,
    SectionHeader,
  } from "@computational-biology-aachen/design";
  import { onMount } from "svelte";

  // Optional per-model scheme image, co-located in src/lib/models/<slug>/.
  const schemeModules = import.meta.glob("$lib/models/*/scheme.{svg,png,jpg,jpeg,webp,gif,avif}", {
    query: "?url",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  const schemes: Record<string, string> = Object.fromEntries(
    Object.entries(schemeModules).flatMap(([path, url]) => {
      const slug = path.match(/\/models\/([^/]+)\//)?.[1];
      return slug ? [[slug, url]] : [];
    }),
  );

  // A model is "validated" once it has at least one paper-reproduction figure
  // co-located in src/lib/models/<slug>/figs/ — same rule as ModelPage.svelte.
  const modelFigs = import.meta.glob(
    "$lib/models/*/figs/*.{png,jpg,svg,jpeg}",
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

  // All tag categories → their distinct tags, across every model.
  const categories: Record<string, string[]> = {};
  for (const info of Object.values(models)) {
    for (const [cat, tags] of Object.entries(info.tags)) {
      const set = (categories[cat] ??= []);
      for (const t of tags) if (!set.includes(t)) set.push(t);
    }
  }

  // The apparatus scheme below selects tags in this category.
  const APP_CAT = "Part of Photosynthesis";

  // The `/data` page deep-links here with a preselected tag in this category.
  const DATA_CAT = "Explains data";

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

  function isActive(cat: string, tag: string): boolean {
    return active[cat]?.has(tag) ?? false;
  }

  // Keyboard activation for the SVG apparatus toggles.
  function onApparatusKey(e: KeyboardEvent, tag: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(APP_CAT, tag);
    }
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
    <svg
      id="photosynthesis-scheme"
      width="100%"
      viewBox="0 0 216.05 125.18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        id="g26"
        transform="translate(0.52825439,-33.1908)"
      >
        <rect
          id="rect1"
          x="-0.52825439"
          y="108.2"
          width="223.64552"
          height="2"
          rx=".5"
          fill="#4d683d"
          style="stroke-width:1.01742;paint-order:markers stroke fill"
        />
        <rect
          id="rect43"
          x="-0.52825439"
          y="127.53"
          width="223.64551"
          height="2"
          rx=".5"
          fill="#4d683d"
          style="stroke-width:1.01743;paint-order:markers stroke fill"
        />
        <g
          id="g43"
          transform="translate(10.133 25.589)"
          fill="#000000"
          font-family="Arial"
          font-size="8.2931px"
          stroke-width=".20733"
        >
          <text
            id="text1-2"
            x="-8.3510342"
            y="81.641235"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="-8.3510342"
              y="81.641235"
              fill="#000000"
              font-weight="bold"
              stroke-width=".20733">Stroma</tspan
            ></text
          >
          <text
            id="text1-2-3"
            x="-8.6871319"
            y="111.034"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="-8.6871319"
              y="111.034"
              fill="#000000"
              font-weight="bold"
              stroke-width=".20733">Lumen</tspan
            ></text
          >
        </g>
      </g>
      <g transform="translate(10.661354,15.9242)">
        <g
          class="apparatus"
          class:selected={isActive(APP_CAT, "OEC")}
          role="button"
          tabindex="0"
          aria-pressed={isActive(APP_CAT, "OEC")}
          aria-label="OEC"
          onclick={() => toggle(APP_CAT, "OEC")}
          onkeydown={(e) => onApparatusKey(e, "OEC")}
        >
          <ellipse
            cx="34.445"
            cy="90.412"
            rx="11.573"
            ry="9.3954"
            fill="#bbdef0"
            stroke="#fff"
            stroke-dashoffset="3.2519"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            style="paint-order:markers stroke fill"
          />
          <text
            x="27.536812"
            y="96.907669"
            font-family="Arial"
            font-size="6.3989px"
            stroke-width=".15997"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="27.536812"
              y="96.907669"
              font-weight="bold"
              stroke-width=".15997">OEC</tspan
            ></text
          >
        </g>
      </g>
      <g transform="translate(10.661454,-7.6023302)">
        <g
          class="apparatus"
          class:selected={isActive(APP_CAT, "PSII")}
          role="button"
          tabindex="0"
          aria-pressed={isActive(APP_CAT, "PSII")}
          aria-label="PSII"
          onclick={() => toggle(APP_CAT, "PSII")}
          onkeydown={(e) => onApparatusKey(e, "PSII")}
        >
          <ellipse
            cx="34.445"
            cy="93.275"
            rx="14.445"
            ry="19.33"
            fill="#5fad56"
            stroke="#fff"
            stroke-dashoffset="3.2519"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            style="paint-order:markers stroke fill"
          />
          <text
            x="24.404585"
            y="96.725319"
            font-family="Arial"
            font-size="10.583px"
            stroke-width=".26458"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="24.404585"
              y="96.725319"
              font-weight="bold"
              stroke-width=".26458">PSII</tspan
            ></text
          >
        </g>
        <g
          class="apparatus"
          class:selected={isActive(APP_CAT, "Cytochrome b6f")}
          role="button"
          tabindex="0"
          aria-pressed={isActive(APP_CAT, "Cytochrome b6f")}
          aria-label="Cytochrome b6f"
          onclick={() => toggle(APP_CAT, "Cytochrome b6f")}
          onkeydown={(e) => onApparatusKey(e, "Cytochrome b6f")}
        >
          <ellipse
            cx="83.335"
            cy="93.275"
            rx="14.445"
            ry="19.33"
            fill="#63c7b2"
            stroke="#fff"
            stroke-dashoffset="3.2519"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            style="paint-order:markers stroke fill"
          />
          <text
            x="70.920174"
            y="95.290581"
            font-family="Arial"
            font-size="7.7885px"
            stroke-width=".19471"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="70.920174"
              y="95.290581"
              font-weight="bold"
              stroke-width=".19471">Cytb6f</tspan
            ></text
          >
        </g>
        <g
          class="apparatus"
          class:selected={isActive(APP_CAT, "PSI")}
          role="button"
          tabindex="0"
          aria-pressed={isActive(APP_CAT, "PSI")}
          aria-label="PSI"
          onclick={() => toggle(APP_CAT, "PSI")}
          onkeydown={(e) => onApparatusKey(e, "PSI")}
        >
          <ellipse
            cx="132.23"
            cy="93.275"
            rx="14.445"
            ry="19.33"
            fill="#4d9078"
            stroke="#fff"
            stroke-dashoffset="3.2519"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            style="paint-order:markers stroke fill"
          />
          <text
            x="132.18866"
            y="96.725327"
            font-family="Arial"
            font-size="10.583px"
            stroke-width=".26458"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="132.18866"
              y="96.725327"
              font-weight="bold"
              stroke-width=".26458"
              text-anchor="middle">PSI</tspan
            ></text
          >
        </g>
        <g
          class="apparatus"
          class:selected={isActive(APP_CAT, "ATP Synthase")}
          role="button"
          tabindex="0"
          aria-pressed={isActive(APP_CAT, "ATP Synthase")}
          aria-label="ATP Synthase"
          onclick={() => toggle(APP_CAT, "ATP Synthase")}
          onkeydown={(e) => onApparatusKey(e, "ATP Synthase")}
        >
          <rect
            x="168.08"
            y="73.945"
            width="19.692"
            height="38.661"
            rx="1.3495"
            fill="#f78154"
            stroke="#fff"
            stroke-dashoffset="3.2519"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            style="paint-order:markers stroke fill"
          />
          <g transform="matrix(1.4098 0 0 1.4098 -175.97 -39.243)">
            <ellipse
              cx="256.94"
              cy="73.424"
              rx="2.7751"
              ry="7.8286"
              fill="#c86a8c"
            />
            <ellipse
              cx="254.17"
              cy="73.424"
              rx="3.0834"
              ry="8.6985"
              fill="#f99b76"
            />
            <ellipse
              transform="scale(-1,1)"
              cx="-244.88"
              cy="73.424"
              rx="2.7751"
              ry="7.8286"
              fill="#c86a8c"
            />
            <ellipse
              transform="scale(-1,1)"
              cx="-247.66"
              cy="73.424"
              rx="3.0834"
              ry="8.6985"
              fill="#f99b76"
            />
            <ellipse
              cx="251.08"
              cy="73.424"
              rx="3.426"
              ry="9.665"
              fill="#c86a8c"
            />
          </g>
          <g
            transform="matrix(0.83789924,0,0,0.83789924,25.126425,-3.392121)"
            font-family="Arial"
          >
            <text
              x="182.6032"
              y="114.88722"
              font-size="10.583px"
              stroke-width=".26458"
              style="line-height:1.05"
              xml:space="preserve"
              ><tspan
                x="182.6032"
                y="114.88722"
                font-weight="bold"
                stroke-width=".26458"
                text-anchor="middle">ATP</tspan
              ></text
            >
            <text
              x="182.46231"
              y="121.32639"
              font-size="6.7817px"
              stroke-width=".16954"
              style="line-height:1.05"
              xml:space="preserve"
              ><tspan
                x="182.46231"
                y="121.32639"
                font-weight="bold"
                stroke-width=".16954"
                text-anchor="middle">Synth</tspan
              ></text
            >
          </g>
        </g>
      </g>
      <g transform="translate(4.4602144,0.35049983)">
        <g
          class="apparatus"
          class:selected={isActive(APP_CAT, "CBB Cycle")}
          role="button"
          tabindex="0"
          aria-pressed={isActive(APP_CAT, "CBB Cycle")}
          aria-label="CBB Cycle"
          onclick={() => toggle(APP_CAT, "CBB Cycle")}
          onkeydown={(e) => onApparatusKey(e, "CBB Cycle")}
        >
          <g stroke-linecap="round">
            <path
              d="m129.18 26.72a21.82 21.82 0 0 1-21.82 21.82 21.82 21.82 0 0 1-21.82-21.82 21.82 21.82 0 0 1 21.82-21.82 21.82 21.82 0 0 1 21.82 21.82z"
              fill-opacity="0"
              stroke-linejoin="bevel"
            />
            <path
              d="m107.36 4.1504c-12.456 0-22.57 10.112-22.57 22.568s10.114 22.57 22.57 22.57c12.456 0 22.568-10.114 22.568-22.57s-10.112-22.568-22.568-22.568zm0 1.5c11.645 0 21.068 9.4231 21.068 21.068s-9.4231 21.07-21.068 21.07c-11.645 0-21.07-9.4251-21.07-21.07s9.4251-21.068 21.07-21.068z"
              fill="#d81159"
              stroke-linejoin="bevel"
            />
            <g fill="#d81159">
              <path
                d="m124.68 21.844a0.75 0.75 0 0 0-0.5293 0.2207 0.75 0.75 0 0 0 0 1.0605l5.0293 5.0293 5.0312-5.0293a0.75 0.75 0 0 0 0-1.0605 0.75 0.75 0 0 0-1.0606 0l-3.9707 3.9707-3.9688-3.9707a0.75 0.75 0 0 0-0.53125-0.2207z"
              />
              <path
                d="m102.71-0.13086a0.75 0.75 0 0 0 0 1.0605l3.9707 3.9688-3.9707 3.9707a0.75 0.75 0 0 0 0 1.0605 0.75 0.75 0 0 0 1.0606 0l5.0312-5.0293-5.0312-5.0312a0.75 0.75 0 0 0-1.0606 0z"
              />
              <path
                d="m85.541 25.283-5.0293 5.0312a0.75 0.75 0 0 0 0 1.0605 0.75 0.75 0 0 0 1.0605 0l3.9707-3.9688 3.9688 3.9688a0.75 0.75 0 0 0 1.0605 0 0.75 0.75 0 0 0 0-1.0605z"
              />
              <path
                d="m111.49 43.289a0.75 0.75 0 0 0-0.53125 0.21875l-5.0293 5.0312 5.0293 5.0312a0.75 0.75 0 0 0 1.0606 0 0.75 0.75 0 0 0 0-1.0625l-3.9688-3.9688 3.9688-3.9688a0.75 0.75 0 0 0 0-1.0625 0.75 0.75 0 0 0-0.5293-0.21875z"
              />
            </g>
          </g>
          <text
            x="95.90773"
            y="30.169697"
            font-family="Arial"
            font-size="10.583px"
            stroke-width="1.5"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="95.90773"
              y="30.169697"
              font-weight="bold"
              stroke-width="1.5">CBB</tspan
            ></text
          >
        </g>
      </g>
      <g transform="translate(5.0175544,0.93899983)">
        <g
          class="apparatus"
          class:selected={isActive(APP_CAT, "FNR")}
          role="button"
          tabindex="0"
          aria-pressed={isActive(APP_CAT, "FNR")}
          aria-label="FNR"
          onclick={() => toggle(APP_CAT, "FNR")}
          onkeydown={(e) => onApparatusKey(e, "FNR")}
        >
          <ellipse
            cx="146.73"
            cy="67.026"
            rx="8.4889"
            ry="5.2234"
            fill="#f2c14e"
          />
          <text
            x="146.53954"
            y="69.122124"
            font-family="Arial"
            font-size="6.4286px"
            stroke-width=".16071"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="146.53954"
              y="69.122124"
              font-weight="bold"
              stroke-width=".16071"
              text-anchor="middle">FNR</tspan
            ></text
          >
        </g>
      </g>
      <g transform="translate(23.885754,-62.1728)">
        <g
          class="apparatus"
          class:selected={isActive(APP_CAT, "PQ Cycle")}
          role="button"
          tabindex="0"
          aria-pressed={isActive(APP_CAT, "PQ Cycle")}
          aria-label="PQ Cycle"
          onclick={() => toggle(APP_CAT, "PQ Cycle")}
          onkeydown={(e) => onApparatusKey(e, "PQ Cycle")}
        >
          <rect
            x="37.12"
            y="140.06"
            width="17.091"
            height="15.576"
            rx="5.5295"
            fill="#bf93c0"
            stroke="#fff"
            stroke-linejoin="round"
            stroke-width="1.7544"
          />
          <text
            x="45.413319"
            y="150.62613"
            font-family="Arial"
            font-size="8.4667px"
            stroke-width=".26458"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="45.413319"
              y="150.62613"
              font-size="8.4667px"
              font-weight="bold"
              stroke-width=".26458"
              text-anchor="middle">PQ</tspan
            ></text
          >
        </g>
      </g>
      <g transform="matrix(1.0437 0 0 1 70.781754 -42.8428)">
        <g
          class="apparatus"
          class:selected={isActive(APP_CAT, "PC")}
          role="button"
          tabindex="0"
          aria-pressed={isActive(APP_CAT, "PC")}
          aria-label="PC"
          onclick={() => toggle(APP_CAT, "PC")}
          onkeydown={(e) => onApparatusKey(e, "PC")}
        >
          <rect
            x="33.235"
            y="140.26"
            width="24.861"
            height="16.281"
            rx="6.5393"
            fill="#8684cf"
            stroke="#fff"
            stroke-linejoin="round"
            stroke-width="2.1634"
          />
          <text
            x="45.390369"
            y="151.43082"
            font-family="Arial"
            font-size="8.4667px"
            stroke-width=".26458"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="45.390369"
              y="151.43082"
              font-size="8.4667px"
              font-weight="bold"
              stroke-width=".26458"
              text-anchor="middle">PC</tspan
            ></text
          >
        </g>
      </g>
    </svg>
  </div>

  {#each Object.entries(categories) as [cat, tags] (cat)}
    <div class="facet">
      <p class="facet-label">{cat}</p>
      <div class="pills">
        {#each tags as tag (tag)}
          <ButtonTab
            selected={isActive(cat, tag)}
            onclick={() => toggle(cat, tag)}
          >
            {tag}
          </ButtonTab>
        {/each}
      </div>
    </div>
  {/each}
</Section>

<Section variant="surface">
  <div class="filter-row">
    <input
      bind:this={filterInput}
      type="search"
      class="filter"
      placeholder="Filter models…"
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
            onclick={() => (validation = value)}
          >
            {label}
          </ButtonTab>
        {/each}
      </div>
    {/if}
  </div>
  <div class="grid">
    {#each filtered as [slug, info] (slug)}
      <CardModel
        name={info.title}
        href="{base}/models/{slug}"
        image={schemes[slug]}
      />
    {/each}
    {#if filtered.length === 0}
      <p class="empty">No models match the current filters.</p>
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
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .empty {
    grid-column: 1 / -1;
    color: var(--color-text-muted);
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

  /* Apparatuses are greyed out by default; selecting the matching tag
     restores their colour. */
  .apparatus {
    filter: grayscale(1) opacity(0.5);
    transition: filter 150ms ease;
    cursor: pointer;
  }

  .apparatus.selected {
    filter: none;
  }

  .apparatus:hover {
    filter: grayscale(0.5) opacity(0.85);
  }

  .apparatus.selected:hover {
    filter: brightness(0.95);
  }

  .apparatus:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
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
