<!--
  @component

  The photosynthetic apparatus (thylakoid membrane, stroma, CBB cycle,
  photorespiration). Parts for which `highlighted` returns true are drawn in
  colour, the rest greyed out. Passing `onToggle` makes every part a toggle
  button; without it the scheme is a static, decorative picture.
-->
<script lang="ts">
  import type { Part } from "../tags";

  let {
    highlighted,
    onToggle,
  }: {
    highlighted: (part: Part) => boolean;
    onToggle?: (part: Part) => void;
  } = $props();

  function interactive(part: Part) {
    if (!onToggle) return {};
    const toggle = onToggle;
    return {
      role: "button",
      tabindex: 0,
      "aria-pressed": highlighted(part),
      "aria-label": part,
      onclick: () => toggle(part),
      onkeydown: (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(part);
        }
      },
    };
  }
</script>

<svg
  class="scheme"
  aria-hidden={onToggle ? undefined : "true"}
  viewBox="0 0 223.64552 126.0437"
  xmlns="http://www.w3.org/2000/svg"
>
  <g transform="translate(0.52825439,-24.378699)">
    <rect
      x="-0.52825439"
      y="108.2"
      width="223.64552"
      height="2"
      rx=".5"
      fill="#4d683d"
      style="stroke-width:1.01742;paint-order:markers stroke fill"
    />
    <rect
      x="-0.52825439"
      y="127.53"
      width="223.64551"
      height="2"
      rx=".5"
      fill="#4d683d"
      style="stroke-width:1.01743;paint-order:markers stroke fill"
    />
    <g
      transform="translate(10.133 25.589)"
      fill="#000000"
      font-family="Arial"
      font-size="8.2931px"
      stroke-width=".20733"
    >
      <text
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
  <g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("OEC")}
      {...interactive("OEC")}
    >
      <!-- Invisible, oversized hit area: the visible shape below is
           smaller than a 44px touch target at mobile widths. -->
      <ellipse
        cx="45.106354"
        cy="115.1483"
        rx="13.3"
        ry="13.3"
        fill="transparent"
      />
      <ellipse
        cx="45.106354"
        cy="115.1483"
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
        x="38.198166"
        y="121.64397"
        font-family="Arial"
        font-size="6.3989px"
        stroke-width=".15997"
        style="line-height:1.05"
        xml:space="preserve"
        ><tspan
          x="38.198166"
          y="121.64397"
          font-weight="bold"
          stroke-width=".15997">OEC</tspan
        ></text
      >
    </g>
  </g>
  <g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("PSII")}
      {...interactive("PSII")}
    >
      <ellipse
        cx="45.106453"
        cy="94.484772"
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
        x="35.06604"
        y="97.935089"
        font-family="Arial"
        font-size="10.583px"
        stroke-width=".26458"
        style="line-height:1.05"
        xml:space="preserve"
        ><tspan
          x="35.06604"
          y="97.935089"
          font-weight="bold"
          stroke-width=".26458">PSII</tspan
        ></text
      >
    </g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("Cytochrome b6f")}
      {...interactive("Cytochrome b6f")}
    >
      <ellipse
        cx="93.996452"
        cy="94.484772"
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
        x="81.581627"
        y="96.500351"
        font-family="Arial"
        font-size="7.7885px"
        stroke-width=".19471"
        style="line-height:1.05"
        xml:space="preserve"
        ><tspan
          x="81.581627"
          y="96.500351"
          font-weight="bold"
          stroke-width=".19471">Cytb6f</tspan
        ></text
      >
    </g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("PSI")}
      {...interactive("PSI")}
    >
      <ellipse
        cx="142.89145"
        cy="94.484772"
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
        x="142.85011"
        y="97.935097"
        font-family="Arial"
        font-size="10.583px"
        stroke-width=".26458"
        style="line-height:1.05"
        xml:space="preserve"
        ><tspan
          x="142.85011"
          y="97.935097"
          font-weight="bold"
          stroke-width=".26458"
          text-anchor="middle">PSI</tspan
        ></text
      >
    </g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("ATP Synthase")}
      {...interactive("ATP Synthase")}
    >
      <rect
        x="178.74146"
        y="75.15477"
        width="27"
        height="38.661"
        fill="transparent"
      />
      <rect
        x="178.74146"
        y="75.15477"
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
      <g transform="matrix(1.4098,0,0,1.4098,-165.30855,-38.033229)">
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
        transform="matrix(0.83789924,0,0,0.83789924,35.787879,-2.1823503)"
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
  <g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("CBB Cycle")}
      {...interactive("CBB Cycle")}
    >
      <g
        stroke-linecap="round"
        transform="translate(-11.867485,5.6927831)"
      >
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
        x="84.040245"
        y="35.86248"
        font-family="Arial"
        font-size="10.583px"
        stroke-width="1.5"
        style="line-height:1.05"
        xml:space="preserve"
        ><tspan
          x="84.040245"
          y="35.86248"
          font-weight="bold"
          stroke-width="1.5">CBB</tspan
        ></text
      >
    </g>
  </g>
  <g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("FNR")}
      {...interactive("FNR")}
    >
      <ellipse
        cx="151.74754"
        cy="76.7771"
        rx="13.3"
        ry="13.3"
        fill="transparent"
      />
      <ellipse
        cx="151.74754"
        cy="76.7771"
        rx="8.4889"
        ry="5.2234"
        fill="#f2c14e"
      />
      <text
        x="151.55708"
        y="78.873222"
        font-family="Arial"
        font-size="6.4286px"
        stroke-width=".16071"
        style="line-height:1.05"
        xml:space="preserve"
        ><tspan
          x="151.55708"
          y="78.873222"
          font-weight="bold"
          stroke-width=".16071"
          text-anchor="middle">FNR</tspan
        ></text
      >
    </g>
  </g>
  <g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("PQ Cycle")}
      {...interactive("PQ Cycle")}
    >
      <rect
        x="61.005753"
        y="86.699295"
        width="27"
        height="27"
        fill="transparent"
      />
      <rect
        x="61.005753"
        y="86.699295"
        width="17.091"
        height="15.576"
        rx="5.5295"
        fill="#bf93c0"
        stroke="#fff"
        stroke-linejoin="round"
        stroke-width="1.7544"
      />
      <text
        x="69.299072"
        y="97.265427"
        font-family="Arial"
        font-size="8.4667px"
        stroke-width=".26458"
        style="line-height:1.05"
        xml:space="preserve"
        ><tspan
          x="69.299072"
          y="97.265427"
          font-size="8.4667px"
          font-weight="bold"
          stroke-width=".26458"
          text-anchor="middle">PQ</tspan
        ></text
      >
    </g>
  </g>
  <g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("PC")}
      {...interactive("PC")}
    >
      <rect
        x="105.46912"
        y="106.22929"
        width="27"
        height="27"
        fill="transparent"
      />
      <rect
        x="105.46912"
        y="106.22929"
        width="25.947426"
        height="16.281"
        rx="6.8250675"
        fill="#8684cf"
        stroke="#fff"
        stroke-linejoin="round"
        stroke-width="2.21016"
      />
      <text
        x="115.65562"
        y="119.93788"
        font-family="Arial"
        font-size="8.64972px"
        stroke-width="0.270299"
        style="line-height:1.05"
        xml:space="preserve"
        transform="scale(1.0216164,0.97884101)"
        ><tspan
          x="115.65562"
          y="119.93788"
          font-size="8.64972px"
          font-weight="bold"
          stroke-width="0.270299"
          text-anchor="middle">PC</tspan
        ></text
      >
    </g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("NPQ")}
      {...interactive("NPQ")}
    >
      <rect
        x="30.661455"
        y="39.894554"
        width="28.889999"
        height="16.18956"
        fill="transparent"
      />
      <rect
        x="30.661455"
        y="39.894554"
        width="28.889999"
        height="16.18956"
        rx="6.8250675"
        fill="#ea5555"
        stroke="#fff"
        stroke-linejoin="round"
        stroke-width="2.21016"
      />
      <text
        x="43.870968"
        y="52.169224"
        font-family="Arial"
        font-size="8.64972px"
        stroke-width="0.270299"
        style="line-height:1.05"
        xml:space="preserve"
        transform="scale(1.0216164,0.97884101)"
        ><tspan
          x="43.870968"
          y="52.169224"
          font-size="8.64972px"
          font-weight="bold"
          stroke-width="0.270299"
          text-anchor="middle">NPQ</tspan
        ></text
      >
      <path
        stroke="#ea5555"
        stroke-width="1.49"
        stroke-linecap="round"
        d="M 49.714448,72.511301 H 40.49846 m 4.607994,-14.202014 v 14.202014"
      />
    </g>
    <g
      class="apparatus"
      class:interactive={!!onToggle}
      class:selected={highlighted("Photorespiration")}
      {...interactive("Photorespiration")}
    >
      <g fill="#ea5555">
        <path
          d="m 168.23183,10.022448 a 0.75,0.75 0 0 1 0,1.0605 l -3.9707,3.9688 3.9707,3.9707 a 0.75,0.75 0 0 1 0,1.0605 0.75,0.75 0 0 1 -1.0606,0 l -5.0312,-5.0293 5.0312,-5.0312 a 0.75,0.75 0 0 1 1.0606,0 z"
        />
        <path
          d="m 195.58892,30.289528 5.0293,5.0312 a 0.75,0.75 0 0 1 0,1.0605 0.75,0.75 0 0 1 -1.0605,0 l -3.9707,-3.9688 -3.9688,3.9688 a 0.75,0.75 0 0 1 -1.0605,0 0.75,0.75 0 0 1 0,-1.0605 z"
        />
        <path
          d="m 160.82168,44.523257 a 0.75,0.75 0 0 1 0.53125,0.21875 l 5.0293,5.0312 -5.0293,5.0312 a 0.75,0.75 0 0 1 -1.0606,0 0.75,0.75 0 0 1 0,-1.0625 l 3.9688,-3.9688 -3.9688,-3.9688 a 0.75,0.75 0 0 1 0,-1.0625 0.75,0.75 0 0 1 0.5293,-0.21875 z"
        />
      </g>
      <text
        x="116.82587"
        y="30.725327"
        font-family="Arial"
        font-weight="bold"
        font-size="8.81944px"
        stroke-width="1.5"
        xml:space="preserve"
        transform="translate(47.441417,-0.656424)"
        style="line-height:1.05;text-align:center;text-anchor:middle;white-space:pre;inline-size:47.7034;display:inline"
      >
        <tspan
          x="116.82587"
          y="30.725327"
          font-size="8.81944px"
          stroke-width="0.270299"
          text-anchor="middle"
          >Photo-
        </tspan>
        <tspan
          x="116.82587"
          y="39.98574"
        >
          respiration
        </tspan>
      </text>
      <ellipse
        stroke="#ea5555"
        stroke-width="1.49"
        fill="transparent"
        cx="164.26112"
        cy="32.412426"
        ry="17.36068"
        rx="31.32589"
      />
    </g>
    <g>
      <rect
        x="111.49168"
        y="27.2202"
        width="28.273638"
        height="10.384457"
        rx="4.3532085"
        fill="#ffffff"
        stroke="#ffffff"
        stroke-linejoin="round"
        stroke-width="1.4097"
      />
      <text
        x="122.87874"
        y="35.087666"
        font-family="Arial"
        font-size="5.51702px"
        stroke-width="0.172404"
        font-weight="bold"
        text-anchor="middle"
        transform="scale(1.0216164,0.97884102)"
        style="text-align:center"
        ><tspan>RuBisCO</tspan>
      </text>
    </g>
  </g>
</svg>

<style>
  .scheme {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* Parts are greyed out by default; highlighting restores their colour. */
  .apparatus {
    filter: grayscale(1) opacity(0.5);
    transition: filter 150ms ease;
  }

  .apparatus.selected {
    filter: none;
  }

  .apparatus.interactive {
    cursor: pointer;
  }

  .apparatus.interactive:hover {
    filter: grayscale(0.5) opacity(0.85);
  }

  .apparatus.interactive.selected:hover {
    filter: brightness(0.95);
  }

  .apparatus:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
</style>
