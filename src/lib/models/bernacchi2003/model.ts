import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  type Base,
  Add,
  Divide,
  Exp,
  Min,
  Minus,
  Mul,
  Name,
  Num,
  Pow,
  Sqrt,
} from "@computational-biology-aachen/mxlweb-core/mathml";

const n = (name: string) => new Name(name);
const out = (fn: Base, unit: string, texName: string, displayName: string) => ({
  fn,
  unit,
  texName,
  displayName,
});
const sq = (x: Base) => new Pow(x, new Num(2));

/**
 * Eqn 9: `exp(c − ΔHa / (R Tk))`, optionally times a value at 25 °C. Appendix
 * 2A's functions take Tk = Tl + 273.15, Table 1's fits (Eqns 9 and 10 as
 * printed) Tl + 273.
 */
function eqn9(name: string, scale?: string, tk = "Tk") {
  const value = new Exp(
    new Minus([
      n(`c_${name}`),
      new Divide([n(`dHa_${name}`), new Mul([n("R"), n(tk)])]),
    ]),
  );
  return scale === undefined ? value : new Mul([n(scale), value]);
}

/** Table 2's quadratics in leaf temperature (°C): `a + b T − c T²`. */
function quadratic(name: string) {
  return new Minus([
    new Add([n(`${name}_a`), new Mul([n(`${name}_b`), n("T_leaf")])]),
    new Mul([n(`${name}_c`), sq(n("T_leaf"))]),
  ]);
}

/**
 * Eqns 12 and 13, the "Gaussian 3-D" functions of growth and leaf temperature:
 * `k exp(−0.5 (((Tg − mg)/sg)² + ((Tl − ml)/sl)²))`.
 */
function gaussian(name: string) {
  const term = (t: string, m: string, s: string) =>
    sq(new Divide([new Minus([n(t), n(`${m}_${name}`)]), n(`${s}_${name}`)]));
  return new Mul([
    n(`k_${name}`),
    new Exp(
      new Mul([
        new Num(-0.5),
        new Add([term("Tg", "mg", "sg"), term("T_leaf", "ml", "sl")]),
      ]),
    ),
  ]);
}

/** Eqn 2: the non-rectangular hyperbola of J in Q2, with Jmax and Θ named. */
function eqn2(jmax: string, theta: string) {
  const s = new Add([n("Q2"), n(jmax)]);
  return new Divide([
    new Minus([
      s,
      new Sqrt(
        new Minus([
          new Pow(s, new Num(2)),
          new Mul([new Num(4), n(theta), n("Q2"), n(jmax)]),
        ]),
        new Num(2),
      ),
    ]),
    new Mul([new Num(2), n(theta)]),
  ]);
}

/** Appendix 2A: `(1 − Γ* / Ci) min{Wc, Wj} − Rd`. */
function assimilation(wj: string) {
  return new Minus([
    new Mul([
      new Minus([new Num(1), new Divide([n("Gamma_star"), n("Ci")])]),
      new Min([n("Wc"), n(wj)]),
    ]),
    n("Rd"),
  ]);
}

/** Appendix 2A: `J Ci / (4.5 Ci + 10.5 Γ*)`. */
function wj(j: string) {
  return new Divide([
    new Mul([n(j), n("Ci")]),
    new Add([
      new Mul([new Num(4.5), n("Ci")]),
      new Mul([new Num(10.5), n("Gamma_star")]),
    ]),
  ]);
}

/** Eqn 9 constants, name, TeX, c, ΔHa (kJ mol⁻¹). */
const ARRHENIUS: Array<[string, string, number, number]> = [
  // Appendix 2A, after Bernacchi et al. (2001) (Ci basis)
  ["Gamma_star", "\\Gamma^*", 19.02, 37.83],
  ["Kc", "K_c", 38.05, 79.43],
  ["Ko", "K_o", 20.3, 36.38],
  ["Vcmax", "V_{c,max}", 26.35, 65.33],
  ["Rd", "R_d", 18.72, 46.39],
  // Appendix 2A: Jmax relative to 25 °C, the 25 °C-grown Jmax,f of Table 1
  ["Jmax", "J_{max}", 17.57, 43.54],
  // Table 1, Jmax,f normalised to 25 °C for plants grown at 25 and 35 °C
  ["Jf25", "J_{max,f,25}", 17.57, 43.5],
  ["Jf35", "J_{max,f,35}", 13.22, 32.8],
];

/** Table 2 (and Appendix 2A): name, TeX, a, b, c of `a + b T − c T²`. */
const QUADRATICS: Array<[string, string, number, number, number]> = [
  // Appendix 2A's Φ (the light-adapted ΦPSII,max,l, Table 2 at Tg 25 and 35 °C)
  ["Phi", "\\Phi_{PSII,max,l}", 0.352, 0.022, 3.4e-4],
  // Appendix 2A's Θ, Table 2 at Tg 25 °C
  ["Theta", "\\Theta_{PSII}", 0.76, 0.018, 3.7e-4],
  // Table 2, Θ at Tg 14 and 35 °C
  ["Theta14", "\\Theta_{PSII,14}", 0.66, 0.021, 4.5e-4],
  ["Theta35", "\\Theta_{PSII,35}", 0.54, 0.023, 3.3e-4],
];

/** Eqns 12 and 13: name, TeX, k, mg, sg, ml, sl (°C). */
const GAUSSIANS: Array<
  [string, string, number, number, number, number, number]
> = [
  ["Jacc", "J", 1.92, 26.42, 17.97, 47.04, 19.38],
  ["Thacc", "\\Theta", 0.85, 25.8, 14.84, 29.2, 17.99],
];

const constant = (value: number, unit: string, texName: string) => ({
  value,
  unit,
  texName,
});

export function initModel(): SteadyStateModelBuilder {
  let model = new SteadyStateModelBuilder()
    .addParameter("Ci", {
      value: 300,
      displayName: "Ci",
      unit: "umol mol^-1",
      texName: "C_i",
      slider: { min: "50", max: "2000", step: "5" },
    })
    .addParameter("Q", {
      value: 1000,
      displayName: "Q",
      unit: "umol m^-2 s^-1",
      texName: "Q",
      slider: { min: "0", max: "2000", step: "10" },
    })
    .addParameter("O", {
      value: 210,
      displayName: "O",
      unit: "mmol mol^-1",
      texName: "O",
      slider: { min: "0", max: "400", step: "5" },
    })
    .addParameter("T_leaf", {
      value: 25,
      displayName: "T_leaf",
      unit: "celsius",
      texName: "T_l",
      slider: { min: "10", max: "40", step: "0.5" },
    })
    // Appendix 2B: growth temperature, used only by the acclimated outputs
    .addParameter("Tg", {
      value: 25,
      displayName: "Tg",
      unit: "celsius",
      texName: "T_g",
      slider: { min: "14", max: "35", step: "0.5" },
    })
    // Not given for a reference leaf; an illustrative value
    .addParameter("Vcmax25", {
      value: 80,
      displayName: "Vcmax25",
      unit: "umol m^-2 s^-1",
      texName: "V_{c,max,25}",
      slider: { min: "0", max: "200", step: "1" },
    })
    // Fig 2: Jmax,f at 25 °C of the 25 °C-grown tobacco, fitted to the drawn
    // line with Table 1's shape (see curatornotes.md)
    .addParameter("Jmax25", {
      value: 136,
      displayName: "Jmax25",
      unit: "umol m^-2 s^-1",
      texName: "J_{max,25}",
      slider: { min: "0", max: "400", step: "1" },
    })
    // Not given; an illustrative value
    .addParameter("Rd25", {
      value: 1,
      displayName: "Rd25",
      unit: "umol m^-2 s^-1",
      texName: "R_{d,25}",
      slider: { min: "0", max: "5", step: "0.05" },
    })
    // Eqn 3: leaf absorptance; measured per leaf (Eqn 6) but not printed, the
    // conventional 0.85 is assumed
    .addParameter("alpha_l", {
      value: 0.85,
      displayName: "alpha_l",
      unit: "dimensionless",
      texName: "\\alpha_l",
      slider: { min: "0.5", max: "1", step: "0.01" },
    })
    // Eqn 5: fraction of absorbed quanta reaching PSII, 0.5 for C3 plants
    .addParameter("beta", {
      value: 0.5,
      displayName: "beta",
      unit: "dimensionless",
      texName: "\\beta",
      slider: { min: "0.3", max: "0.7", step: "0.01" },
    })
    .addParameter("R", constant(0.008314, "kJ K^-1 mol^-1", "R"));
  for (const [name, tex, c, dHa] of ARRHENIUS) {
    model = model
      .addParameter(`c_${name}`, constant(c, "dimensionless", `c_{${tex}}`))
      .addParameter(
        `dHa_${name}`,
        constant(dHa, "kJ mol^-1", `\\Delta H_{a,${tex}}`),
      );
  }
  // Table 1, Jmax,f of plants grown at 14 °C: Eqn 10, with de-activation
  model = model
    .addParameter("c_Jf14", constant(22.2, "dimensionless", "c_{J_{max,f,14}}"))
    .addParameter(
      "dHa_Jf14",
      constant(54.9, "kJ mol^-1", "\\Delta H_{a,J_{max,f,14}}"),
    )
    .addParameter(
      "dHd_Jf14",
      constant(437.7, "kJ mol^-1", "\\Delta H_{d,J_{max,f,14}}"),
    )
    .addParameter(
      "dS_Jf14",
      constant(1.4, "kJ K^-1 mol^-1", "\\Delta S_{J_{max,f,14}}"),
    );
  for (const [name, tex, a, b, c] of QUADRATICS) {
    model = model
      .addParameter(`${name}_a`, constant(a, "dimensionless", `a_{${tex}}`))
      .addParameter(`${name}_b`, constant(b, "celsius^-1", `b_{${tex}}`))
      .addParameter(`${name}_c`, constant(c, "celsius^-2", `c_{${tex}}`));
  }
  for (const [name, tex, k, mg, sg, ml, sl] of GAUSSIANS) {
    model = model
      .addParameter(`k_${name}`, constant(k, "dimensionless", `k_{${tex}}`))
      .addParameter(`mg_${name}`, constant(mg, "celsius", `m_{g,${tex}}`))
      .addParameter(`sg_${name}`, constant(sg, "celsius", `s_{g,${tex}}`))
      .addParameter(`ml_${name}`, constant(ml, "celsius", `m_{l,${tex}}`))
      .addParameter(`sl_${name}`, constant(sl, "celsius", `s_{l,${tex}}`));
  }

  return (
    model
      .addAssignment("Tk", {
        fn: new Add([n("T_leaf"), new Num(273.15)]),
        unit: "K",
        texName: "T_k",
      })
      // Eqns 9 and 10 print Tl + 273, the offset Table 1 was fitted with
      .addAssignment("Tk273", {
        fn: new Add([n("T_leaf"), new Num(273)]),
        unit: "K",
        texName: "T_{k,273}",
      })
      // Appendix 2A, Bernacchi et al. (2001): Γ*, Kc, Ko, Vc,max and Rd
      .addAssignment(
        "Gamma_star",
        out(eqn9("Gamma_star"), "umol mol^-1", "\\Gamma^*", "Gamma_star"),
      )
      .addAssignment("Kc", out(eqn9("Kc"), "umol mol^-1", "K_c", "Kc"))
      .addAssignment("Ko", out(eqn9("Ko"), "mmol mol^-1", "K_o", "Ko"))
      .addAssignment(
        "Vcmax",
        out(eqn9("Vcmax", "Vcmax25"), "umol m^-2 s^-1", "V_{c,max}", "Vcmax"),
      )
      .addAssignment(
        "Rd",
        out(eqn9("Rd", "Rd25"), "umol m^-2 s^-1", "R_d", "Rd"),
      )
      // Appendix 2A: Jmax,T, ΘPSII and ΦPSII,max (light-adapted)
      .addAssignment(
        "Jmax",
        out(eqn9("Jmax", "Jmax25"), "umol m^-2 s^-1", "J_{max}", "Jmax"),
      )
      .addAssignment(
        "Theta",
        out(quadratic("Theta"), "dimensionless", "\\Theta_{PSII}", "Theta"),
      )
      .addAssignment(
        "Phi",
        out(quadratic("Phi"), "dimensionless", "\\Phi_{PSII,max}", "Phi"),
      )
      // Eqn 3: Q2 = Q αl ΦPSII,max β
      .addAssignment(
        "Q2",
        out(
          new Mul([n("Q"), n("alpha_l"), n("Phi"), n("beta")]),
          "umol m^-2 s^-1",
          "Q_2",
          "Q2",
        ),
      )
      .addAssignment(
        "J",
        out(eqn2("Jmax", "Theta"), "umol m^-2 s^-1", "J", "J"),
      )
      // Appendix 2A: Wc = Vc,max Ci / (Ci + Kc (1 + O/Ko))
      .addAssignment(
        "Wc",
        out(
          new Divide([
            new Mul([n("Vcmax"), n("Ci")]),
            new Add([
              n("Ci"),
              new Mul([
                n("Kc"),
                new Add([new Num(1), new Divide([n("O"), n("Ko")])]),
              ]),
            ]),
          ]),
          "umol m^-2 s^-1",
          "W_c",
          "Wc",
        ),
      )
      .addAssignment("Wj", out(wj("J"), "umol m^-2 s^-1", "W_j", "Wj"))
      .addAssignment("A", out(assimilation("Wj"), "umol m^-2 s^-1", "A", "A"))
      // Appendix 2B: Jmax,T (Eqn 12) and ΘPSII (Eqn 13) acclimated to Tg
      .addAssignment(
        "Jmax_acc",
        out(
          new Mul([n("Jmax25"), gaussian("Jacc")]),
          "umol m^-2 s^-1",
          "J_{max,acc}",
          "Jmax_acc",
        ),
      )
      .addAssignment(
        "Theta_acc",
        out(
          gaussian("Thacc"),
          "dimensionless",
          "\\Theta_{PSII,acc}",
          "Theta_acc",
        ),
      )
      .addAssignment(
        "J_acc",
        out(
          eqn2("Jmax_acc", "Theta_acc"),
          "umol m^-2 s^-1",
          "J_{acc}",
          "J_acc",
        ),
      )
      .addAssignment(
        "Wj_acc",
        out(wj("J_acc"), "umol m^-2 s^-1", "W_{j,acc}", "Wj_acc"),
      )
      .addAssignment(
        "A_acc",
        out(assimilation("Wj_acc"), "umol m^-2 s^-1", "A_{acc}", "A_acc"),
      )
      // Table 1: Jmax,f normalised to 25 °C per growth temperature (Fig 3);
      // Tg 14 °C by Eqn 10, 25 and 35 °C by Eqn 9
      .addAssignment(
        "Jf14",
        out(
          new Divide([
            eqn9("Jf14", undefined, "Tk273"),
            new Add([
              new Num(1),
              new Exp(
                new Divide([
                  new Minus([
                    new Mul([n("dS_Jf14"), n("Tk273")]),
                    n("dHd_Jf14"),
                  ]),
                  new Mul([n("R"), n("Tk273")]),
                ]),
              ),
            ]),
          ]),
          "dimensionless",
          "J_{max,f,14}",
          "Jf14",
        ),
      )
      .addAssignment(
        "Jf25",
        out(
          eqn9("Jf25", undefined, "Tk273"),
          "dimensionless",
          "J_{max,f,25}",
          "Jf25",
        ),
      )
      .addAssignment(
        "Jf35",
        out(
          eqn9("Jf35", undefined, "Tk273"),
          "dimensionless",
          "J_{max,f,35}",
          "Jf35",
        ),
      )
      // Table 2: ΘPSII of plants grown at 14 and 35 °C (Fig 4c)
      .addAssignment(
        "Theta14",
        out(
          quadratic("Theta14"),
          "dimensionless",
          "\\Theta_{PSII,14}",
          "Theta14",
        ),
      )
      .addAssignment(
        "Theta35",
        out(
          quadratic("Theta35"),
          "dimensionless",
          "\\Theta_{PSII,35}",
          "Theta35",
        ),
      )
  );
}
