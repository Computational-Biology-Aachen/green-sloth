<script lang="ts">
  import { base } from "$app/paths";
  import greenslothLogo from "$lib/assets/greensloth-logo.svg";
  import {
    Button,
    H1,
    H2,
    Imprint,
    Section,
    Tabs,
    Text,
  } from "@computational-biology-aachen/design";
  import "../app.css";

  // Apparatus → query param mapping (mirrors the tag keys in models.ts)
  const apparatus: Array<{ id: string; label: string; param: string }> = [
    { id: "scheme-oec", label: "OEC", param: "OEC" },
    { id: "scheme-psii", label: "PSII", param: "PSII" },
    { id: "scheme-cytb6f", label: "Cytb6f", param: "Cytochrome b6f" },
    { id: "scheme-psi", label: "PSI", param: "PSI" },
    { id: "scheme-atpsynth", label: "ATP Synth", param: "ATP Synthase" },
    { id: "scheme-cbb", label: "CBB", param: "CBB Cycle" },
    { id: "scheme-fnr", label: "FNR", param: "FNR" },
    { id: "scheme-pq", label: "PQ", param: "PQ Cycle" },
    { id: "scheme-pc", label: "PC", param: "PC" },
  ];

  function apparatusHref(param: string) {
    return `${base}/models?apparatus=${encodeURIComponent(param)}`;
  }
</script>

<svelte:head>
  <title>GreenSloth</title>
</svelte:head>

<!-- Slide 1: Hero -->
<Section>
  <div class="hero-inner">
    <img
      src={greenslothLogo}
      alt="GreenSloth"
      class="hero-logo"
    />
    <H1 color="light">Photosynthesis Models at your Pace</H1>
    <div class="hero-actions">
      <Button
        href="{base}/models"
        variant="secondary">Browse Models</Button
      >
      <Button href="{base}/compare">Compare Models</Button>
    </div>
  </div>
</Section>

<!-- Slide 2: Motivation -->
<Section
  variant="light"
  width="narrow"
>
  <H2>Motivation</H2>
  <Text>
    Photosynthesis is arguably the most crucial process of life on Earth. It
    feeds us, clothes us, heals us, and calms us. Therefore, it has long been a
    significant target for research, and while we now know a great deal about
    how, why, and who photosynthesis is, there are still aspects of it that we
    cannot quite grasp. However, with the rise of computational prowess, we have
    developed new ways to examine and understand photosynthesis. Through digital
    models of photosynthesis!
  </Text>
  <Text>
    While this field has existed for decades, it has recently gained significant
    importance. To such an extent that there are many different models of
    photosynthesis, each attempting to depict various aspects, some even the
    entirety, of the process. This boom enables a researcher interested in this
    field to have the power of choice of models. However, this power also comes
    with a curse.
  </Text>
  <Text>
    The different models all have their strengths and aim to cater to people who
    are not proficient in creating a model on their own. However, since the
    publication of models is not as heavily regulated as lab work and most model
    builders are experts in their field, a disconnect exists between the model
    and the target user. It can be challenging to find a model that fits your
    needs. This is where <strong>GreenSloth</strong> comes in.
  </Text>
  <Text>
    <strong>GreenSloth</strong> will help you, the researcher interested in
    modelling photosynthesis, decide which model is best suited for your needs.
    Led by the
    <a
      href="https://www.cpbl.rwth-aachen.de/go/id/sazuq/?lidx=1"
      target="_blank">Computational Life Science</a
    >
    group at RWTH Aachen.
    <a href="mailto:elouen.corvest@rwth-aachen.de">Contact us</a> with ideas or models
    to include.
  </Text>
</Section>

<!-- Slide 3: How To Use -->
<Section
  variant="light"
  width="narrow"
  ><Tabs
    tabs={[
      { key: "search", label: "Search" },
      { key: "summary", label: "Summary" },
      { key: "comparison", label: "Comparison" },
    ]}
  >
    {#snippet children(activeKey)}
      {#if activeKey === "search"}
        <Text>
          The first aspect of finding models is searching for them. Most
          commonly, new models are found by reading scientific literature, which
          has many positive aspects. However, it takes time and is tiring.
          Additionally, with the mass of new publications over time, some models
          will drown under the waves of new information. This is where
          GreenSloth comes into play, as it highlights already curated and
          popular models.
        </Text>
        <Text>
          GreenSloth shows its curated models in a <a href="{base}/models"
            >list</a
          > with the model's name and scheme. Furthermore, GreenSloth introduces manually
          curated categories to see where the chosen models overlap. These categories
          are separated into a tag system to facilitate selecting the right model.
        </Text>
      {:else if activeKey === "summary"}
        <Text>
          Each of the models presented on GreenSloth comes with a curated
          summary from the publication and a completed version, which is
          available for download using the modelbase package. Additionally, some
          vital model information, like the ODE system, the parameters, etc.,
          are tabularized for ease of access. Every model on GreenSloth will
          also include tests to give further insight into the completeness of
          each model.
        </Text>
      {:else}
        <Text>
          To help choose between models, GreenSloth lets you compare vital
          information between two models directly. This enables a quicker and
          more efficient way to choose which model is best tailored to your
          specific needs. While most comparisons are done using the information
          from each model summary, GreenSloth also uses more advanced, newly
          developed techniques.
        </Text>
      {/if}
    {/snippet}
  </Tabs>
</Section>

<!-- Slide 4: Photosynthesis Scheme -->
<Section
  variant="light"
  width="narrow"
>
  <H2>Explore by Apparatus</H2>
  <Text
    >Press a part of the photosynthesis diagram to see which models include it.</Text
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
        transform="translate(-3.2695 -25.238)"
      >
        <rect
          id="rect1"
          x="3.2695"
          y="108.2"
          width="216.05"
          height="2"
          rx=".5"
          fill="#4d683d"
          style="paint-order:markers stroke fill"
        />
        <rect
          id="rect43"
          x="3.2695"
          y="127.53"
          width="216.05"
          height="2"
          rx=".5"
          fill="#4d683d"
          style="paint-order:markers stroke fill"
        />
        <g
          id="g43"
          transform="translate(10.133 25.589)"
          fill="#000000"
          font-family="'Space Grotesk'"
          font-size="8.2931px"
          stroke-width=".20733"
        >
          <text
            id="text1-2"
            x="-6.3343873"
            y="81.641235"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="-6.3343873"
              y="81.641235"
              fill="#000000"
              font-weight="bold"
              stroke-width=".20733">Stroma</tspan
            ></text
          >
          <text
            id="text1-2-3"
            x="-6.6826963"
            y="109.97566"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="-6.6826963"
              y="109.97566"
              fill="#000000"
              font-weight="bold"
              stroke-width=".20733">Lumen</tspan
            ></text
          >
        </g>
      </g>
      <g transform="translate(6.8636 23.877)">
        <a href={apparatusHref("OEC")}>
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
            x="28.570921"
            y="96.907669"
            font-family="'Space Grotesk'"
            font-size="6.3989px"
            stroke-width=".15997"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="28.570921"
              y="96.907669"
              font-weight="bold"
              stroke-width=".15997">OEC</tspan
            ></text
          >
        </a>
      </g>
      <g transform="translate(6.8637 .35047)">
        <a href={apparatusHref("PSII")}>
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
            x="25.216417"
            y="96.725319"
            font-family="'Space Grotesk'"
            font-size="10.583px"
            stroke-width=".26458"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="25.216417"
              y="96.725319"
              font-weight="bold"
              stroke-width=".26458">PSII</tspan
            ></text
          >
        </a>
        <a href={apparatusHref("Cytochrome b6f")}>
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
            x="71.703972"
            y="95.296288"
            font-family="'Space Grotesk'"
            font-size="7.7885px"
            stroke-width=".19471"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="71.703972"
              y="95.296288"
              font-weight="bold"
              stroke-width=".19471">Cytb6f</tspan
            ></text
          >
        </a>
        <a href={apparatusHref("PSI")}>
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
            x="132.22528"
            y="96.725327"
            font-family="'Space Grotesk'"
            font-size="10.583px"
            stroke-width=".26458"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="132.22528"
              y="96.725327"
              font-weight="bold"
              stroke-width=".26458"
              text-anchor="middle">PSI</tspan
            ></text
          >
        </a>
        <a href={apparatusHref("ATP Synthase")}>
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
            transform="translate(-4.4538 -22.039)"
            font-family="'Space Grotesk'"
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
        </a>
      </g>
      <g transform="translate(.66246 8.3033)">
        <a href={apparatusHref("CBB Cycle")}>
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
            x="97.809265"
            y="30.169697"
            font-family="'Space Grotesk'"
            font-size="10.583px"
            stroke-width="1.5"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="97.809265"
              y="30.169697"
              font-weight="bold"
              stroke-width="1.5">CBB</tspan
            ></text
          >
        </a>
      </g>
      <g transform="translate(1.2198 8.8918)">
        <a href={apparatusHref("FNR")}>
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
            font-family="'Space Grotesk'"
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
        </a>
      </g>
      <g transform="translate(20.088 -54.22)">
        <a href={apparatusHref("PQ Cycle")}>
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
            x="45.390369"
            y="149.88583"
            font-family="'Space Grotesk'"
            font-size="8.4667px"
            stroke-width=".26458"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="45.390369"
              y="149.88583"
              font-size="8.4667px"
              font-weight="bold"
              stroke-width=".26458"
              text-anchor="middle">PQ</tspan
            ></text
          >
        </a>
      </g>
      <g transform="matrix(1.0437 0 0 1 66.984 -34.89)">
        <a href={apparatusHref("PC")}>
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
            y="149.88583"
            font-family="'Space Grotesk'"
            font-size="8.4667px"
            stroke-width=".26458"
            style="line-height:1.05"
            xml:space="preserve"
            ><tspan
              x="45.390369"
              y="149.88583"
              font-size="8.4667px"
              font-weight="bold"
              stroke-width=".26458"
              text-anchor="middle">PC</tspan
            ></text
          >
        </a>
      </g>
    </svg>
  </div>
</Section>

<Imprint github="https://github.com/Computational-Biology-Aachen/greensloth" />

<style>
  .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    color: white;
    text-align: center;
  }

  .hero-logo {
    width: 60%;
    max-width: 350px;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
  }

  .scheme-wrapper {
    margin: 0 auto;
    width: 100%;
    max-width: 800px;
  }

  svg a {
    cursor: pointer;
  }

  svg a:hover ellipse,
  svg a:hover rect,
  svg a:hover path {
    opacity: 0.75;
  }
</style>
