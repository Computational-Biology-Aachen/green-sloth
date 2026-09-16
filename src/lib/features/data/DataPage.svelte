<script lang="ts">
  import { base } from "$app/paths";
  import type { ExperimentalData } from "$lib/types";
  import {
    Button,
    H1,
    H2,
    Section,
    SectionHeader,
    Text,
  } from "@computational-biology-aachen/design";

  type Experiment = {
    tag: ExperimentalData;
    /** Short experimental name shown as the section heading. */
    heading: string;
    blurb: string;
    xLabel: string;
    yLabel: string;
  };

  // One entry per ExperimentalData tag; the illustration for each is drawn by
  // the `curve` snippet below, keyed on the tag.
  const experiments: Experiment[] = [
    {
      tag: "PAM fluorescence",
      heading: "PAM chlorophyll fluorescence",
      blurb:
        "Pulse-amplitude-modulation fluorometry tracks chlorophyll a " +
        "fluorescence while firing saturating pulses. The decline of the peak " +
        "(Fm → Fm′) reports non-photochemical quenching (NPQ); the steady level " +
        "gives PSII operating efficiency. Classic readouts are induction/" +
        "relaxation kinetics and rapid light curves.",
      xLabel: "time",
      yLabel: "fluorescence",
    },
    {
      tag: "OJIP transient",
      heading: "OJIP fast fluorescence rise",
      blurb:
        "A dark-adapted leaf hit with strong light shows a polyphasic " +
        "fluorescence rise through the O, J, I and P steps over microseconds to " +
        "a second. The shape probes the state and connectivity of PSII and the " +
        "electron-acceptor pool size — a fast, sensitive stress phenotype.",
      xLabel: "log time",
      yLabel: "fluorescence",
    },
    {
      tag: "Gas exchange",
      heading: "Gas exchange (CO₂ assimilation)",
      blurb:
        "Infrared gas analysis measures net CO₂ uptake against light (A/Q) or " +
        "intercellular CO₂ (A/Ci). The saturating response separates Rubisco-, " +
        "electron-transport- and TPU-limited regimes — the domain of " +
        "Farquhar–von Caemmerer–Berry steady-state models.",
      xLabel: "light / CO₂",
      yLabel: "assimilation",
    },
    {
      tag: "P700 absorbance",
      heading: "P700 absorbance (PSI redox)",
      blurb:
        "Absorbance changes near 820–870 nm follow the redox state of the PSI " +
        "reaction-centre donor P700. Under a saturating pulse P700 is oxidised " +
        "and re-reduces in the dark, reporting PSI photochemistry, donor-side " +
        "limitation and cyclic electron flow.",
      xLabel: "time",
      yLabel: "P700⁺",
    },
    {
      tag: "ECS (P515)",
      heading: "Electrochromic shift (ECS / P515)",
      blurb:
        "The ~515 nm electrochromic band shift is linear in the trans-thylakoid " +
        "electric field. Its light-on rise and dark-interval relaxation (DIRK) " +
        "quantify the proton-motive force and its partitioning into ΔΨ and ΔpH.",
      xLabel: "time",
      yLabel: "ECS (ΔA₅₁₅)",
    },
  ];

  const modelsHref = (tag: ExperimentalData): string =>
    `${base}/models?data=${encodeURIComponent(tag)}`;
</script>

<svelte:head>
  <title>Experimental data - GreenSloth</title>
</svelte:head>

<SectionHeader>
  <H1 color="light">Experimental data</H1>
</SectionHeader>

<Section
  variant="light"
  width="narrow"
>
  <Text>
    Photosynthesis research leans on a handful of characteristic measurements,
    each capturing a different slice of the light reactions or carbon fixation.
    Below is what the raw data typically looks like for each technique, and
    which of the curated models can reproduce and explain it. Jump straight to
    the matching models from any section.
  </Text>
</Section>

<Section variant="surface">
  <div class="stack">
    {#each experiments as exp (exp.tag)}
      <article class="exp">
        <div class="figure">
          <svg
            viewBox="0 0 320 200"
            role="img"
            aria-label="Illustrative {exp.heading} trace"
          >
            <!-- axes -->
            <line
              class="axis"
              x1="40"
              y1="20"
              x2="40"
              y2="170"
            />
            <line
              class="axis"
              x1="40"
              y1="170"
              x2="300"
              y2="170"
            />
            <text
              class="axis-label"
              x="170"
              y="194"
              text-anchor="middle">{exp.xLabel}</text
            >
            <text
              class="axis-label"
              x="12"
              y="95"
              text-anchor="middle"
              transform="rotate(-90 12 95)">{exp.yLabel}</text
            >
            {@render curve(exp.tag)}
          </svg>
        </div>
        <div class="body">
          <H2>{exp.heading}</H2>
          <Text>{exp.blurb}</Text>
          <div class="actions">
            <Button href={modelsHref(exp.tag)}>Show matching models</Button>
          </div>
        </div>
      </article>
    {/each}
  </div>
</Section>

{#snippet curve(tag: ExperimentalData)}
  {#if tag === "PAM fluorescence"}
    <!-- baseline with saturating pulses that decline as NPQ builds -->
    <polyline
      class="trace"
      points="40,150 66,150 68,45 70,150 108,150 110,62 112,150 150,150
              152,74 154,150 192,150 194,84 196,150 234,150 236,92 238,150
              300,150"
    />
  {:else if tag === "OJIP transient"}
    <!-- polyphasic O-J-I-P rise -->
    <path
      class="trace"
      d="M40,152 C72,152 84,100 120,94 C150,89 156,89 176,80 C202,69 208,69
         232,61 C272,49 286,46 300,46"
    />
  {:else if tag === "Gas exchange"}
    <!-- saturating assimilation curve with negative (respiration) intercept -->
    <line
      class="zero"
      x1="40"
      y1="150"
      x2="300"
      y2="150"
    />
    <path
      class="trace"
      d="M40,160 C70,120 112,70 162,56 C220,46 262,45 300,44"
    />
  {:else if tag === "P700 absorbance"}
    <!-- oxidation on illumination, re-reduction in the dark -->
    <rect
      class="light-band"
      x="82"
      y="20"
      width="160"
      height="150"
    />
    <path
      class="trace"
      d="M40,150 L82,150 C98,150 100,52 116,50 L212,50 C232,50 236,150 258,150
         L300,150"
    />
  {:else if tag === "ECS (P515)"}
    <!-- fast light-on rise, dark-interval relaxation kinetics (DIRK) -->
    <rect
      class="light-band"
      x="80"
      y="20"
      width="120"
      height="150"
    />
    <path
      class="trace"
      d="M40,150 L80,150 L84,52 L198,52 C210,52 232,150 252,150 L300,150"
    />
  {/if}
{/snippet}

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    margin: 0 auto;
    width: 100%;
    max-width: var(--max-width);
  }

  .exp {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    align-items: center;
    gap: var(--space-6);
  }

  /* Alternate the illustration to the right for visual rhythm. */
  .exp:nth-child(even) .figure {
    order: 2;
  }

  .figure {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    padding: var(--space-4);
  }

  .figure svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .actions {
    margin-top: var(--space-2);
  }

  .axis {
    stroke: var(--color-border);
    stroke-width: 1.5;
  }

  .zero {
    stroke: var(--color-border);
    stroke-dasharray: 4 4;
    stroke-width: 1;
  }

  .axis-label {
    fill: var(--color-text-muted);
    font-size: var(--text-callout);
    font-family: var(--font-sans);
  }

  .trace {
    fill: none;
    stroke: var(--color-primary);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.5;
  }

  .light-band {
    opacity: 0.14;
    fill: var(--color-accent);
  }

  @media (max-width: 640px) {
    .exp {
      grid-template-columns: 1fr;
    }

    /* Keep the illustration above the text on narrow screens. */
    .exp:nth-child(even) .figure {
      order: 0;
    }
  }
</style>
