import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  type Base,
  Add,
  Divide,
  Exp,
  Ln,
  Min,
  Minus,
  Mul,
  Name,
  Num,
  Pow,
  Sqrt,
} from "@computational-biology-aachen/mxlweb-core/mathml";

const n = (name: string) => new Name(name);
const num = (x: number) => new Num(x);
const out = (fn: Base, unit: string, texName: string, displayName: string) => ({
  fn,
  unit,
  texName,
  displayName,
});
const constant = (value: number, unit: string, texName: string) => ({
  value,
  unit,
  texName,
});

/** Standard Arrhenius term of Eqns 7 and 9: `exp(Ea (Tk − 298.15) / (298.15 R Tk))`, Ea in J mol⁻¹. */
function arrhenius(ea: Base) {
  return new Exp(
    new Divide([
      new Mul([ea, new Minus([n("Tk"), num(298.15)])]),
      new Mul([num(298.15), n("R"), n("Tk")]),
    ]),
  );
}

/**
 * Eqn 7, the peaked Arrhenius function, with Ea and ΔS named (kJ mol⁻¹ and
 * J mol⁻¹ K⁻¹, Table 2) and Hd fixed at 200 kJ mol⁻¹:
 * `k25 exp(Ea (Tk − 298.15)/(298.15 R Tk)) (1 + exp((298.15 ΔS − Hd)/(298.15 R)))
 *  / (1 + exp((Tk ΔS − Hd)/(Tk R)))`.
 */
function eqn7(k25: string, ea: string, dS: string) {
  const deactivation = (t: Base) =>
    new Add([
      num(1),
      new Exp(
        new Divide([
          new Minus([new Mul([t, n(dS)]), n("Hd")]),
          new Mul([t, n("R")]),
        ]),
      ),
    ]);
  return new Divide([
    new Mul([
      n(k25),
      arrhenius(new Mul([num(1000), n(ea)])),
      deactivation(num(298.15)),
    ]),
    deactivation(n("Tk")),
  ]);
}

/** Eqn 8: `Topt = Hd / (ΔS − R ln(Ea / (Hd − Ea)))`, in °C here. */
function eqn8(ea: string, dS: string) {
  const eaJ = new Mul([num(1000), n(ea)]);
  return new Minus([
    new Divide([
      n("Hd"),
      new Minus([
        n(dS),
        new Mul([n("R"), new Ln(new Divide([eaJ, new Minus([n("Hd"), eaJ])]))]),
      ]),
    ]),
    num(273.15),
  ]);
}

/** Eqn 13: `A_ad + α_ad T_home + δ_ac (T_growth − T_home)`, as Table 2 writes it (`a − b T_home − c (…)`). */
function eqn13(name: string) {
  return new Minus([
    new Minus([n(`${name}_a`), new Mul([n(`${name}_b`), n("T_home")])]),
    new Mul([n(`${name}_c`), new Minus([n("T_growth"), n("T_home")])]),
  ]);
}

/** Eqn 11: `A_ac + α_ac T_growth`, as Table 2 writes it (`a + b T_growth` or `a − b T_growth`). */
function eqn11(name: string, sign: 1 | -1) {
  const slope = new Mul([n(`${name}_b`), n("T_growth")]);
  return sign === 1
    ? new Add([n(`${name}_a`), slope])
    : new Minus([n(`${name}_a`), slope]);
}

/** Table 2 coefficients: name, TeX, unit of a, unit of the slopes, a, b, c. */
const TABLE2: Array<[string, string, string, string, number, number, number?]> =
  [
    // JVr = 2.56 − 0.0375 T_home − 0.0202 (T_growth − T_home)  (acclimation + adaptation)
    ["JVr", "JV_r", "dimensionless", "celsius^-1", 2.56, 0.0375, 0.0202],
    // EaV = 42.6 + 1.14 T_growth  (acclimation)
    ["EaV", "E_{aV}", "kJ mol^-1", "kJ mol^-1 celsius^-1", 42.6, 1.14],
    // ΔSV = 645.13 − 0.38 T_growth  (acclimation)
    [
      "dSV",
      "\\Delta S_V",
      "J mol^-1 K^-1",
      "J mol^-1 K^-1 celsius^-1",
      645.13,
      0.38,
    ],
    // ΔSJ = 658.77 − 0.84 T_home − 0.52 (T_growth − T_home)  (acclimation + adaptation)
    [
      "dSJ",
      "\\Delta S_J",
      "J mol^-1 K^-1",
      "J mol^-1 K^-1 celsius^-1",
      658.77,
      0.84,
      0.52,
    ],
  ];

export function initModel(): SteadyStateModelBuilder {
  let model = new SteadyStateModelBuilder()
    .addParameter("T_leaf", {
      value: 25,
      displayName: "T_leaf",
      unit: "celsius",
      texName: "T",
      slider: { min: "5", max: "45", step: "0.5" },
    })
    // Fig 7: photosynthesis is simulated at a fixed Ci of 275 µmol mol⁻¹,
    // about 70 % of ambient CO2
    .addParameter("Ci", {
      value: 275,
      displayName: "Ci",
      unit: "umol mol^-1",
      texName: "C_i",
      slider: { min: "100", max: "1500", step: "5" },
    })
    // Fig 7 runs Photosyn (plantecophys; Duursma 2015) at its default PPFD
    .addParameter("Q", {
      value: 1500,
      displayName: "Q",
      unit: "umol m^-2 s^-1",
      texName: "Q",
      slider: { min: "0", max: "2000", step: "10" },
    })
    .addParameter("O_i", {
      value: 210,
      displayName: "O_i",
      unit: "mmol mol^-1",
      texName: "O_i",
      slider: { min: "0", max: "400", step: "5" },
    })
    // Mean air temperature of the 30 days before measurement. Default: the
    // DA-Te dataset of Fig 7a (Mongolian oak, Japan)
    .addParameter("T_growth", {
      value: 12.9,
      displayName: "T_growth",
      unit: "celsius",
      texName: "T_{growth}",
      slider: { min: "0", max: "35", step: "0.5" },
    })
    // Long-term (1960–1990) mean maximum temperature of the warmest month at
    // the seed source. Default: Mongolian oak, Japan (Fig 7a)
    .addParameter("T_home", {
      value: 23.8,
      displayName: "T_home",
      unit: "celsius",
      texName: "T_{home}",
      slider: { min: "5", max: "40", step: "0.5" },
    })
    // Table 2: PFT-specific Vcmax25; default DA-Te (temperate deciduous
    // angiosperms). EA-Te 82.9, EG-Te 42.8, EG-Br 80.4, EA-Tr 39.4, Arctic 78.3
    .addParameter("Vcmax25", {
      value: 39.0,
      displayName: "Vcmax25",
      unit: "umol m^-2 s^-1",
      texName: "V_{cmax25}",
      slider: { min: "10", max: "150", step: "0.5" },
    })
    // Eqn 6: quantum yield and curvature, constant for all datasets
    .addParameter("alpha", constant(0.24, "dimensionless", "\\alpha"))
    .addParameter("theta", constant(0.85, "dimensionless", "\\theta"))
    .addParameter("R", constant(8.314, "J mol^-1 K^-1", "R"))
    // Eqn 7: Hd fixed for all species
    .addParameter("Hd", constant(200000, "J mol^-1", "H_d"))
    // Table 2: EaJ, the global mean
    .addParameter("EaJ", constant(40.71, "kJ mol^-1", "E_{aJ}"))
    // Kc, Ko and Γ*: Bernacchi et al. (2001) as given in Medlyn et al.
    // (2002a), the constants Photosyn uses
    .addParameter("Kc25", constant(404.9, "umol mol^-1", "K_{c,25}"))
    .addParameter("Ec", constant(79430, "J mol^-1", "E_c"))
    .addParameter("Ko25", constant(278.4, "mmol mol^-1", "K_{o,25}"))
    .addParameter("Eo", constant(36380, "J mol^-1", "E_o"))
    .addParameter(
      "Gamma_star25",
      constant(42.75, "umol mol^-1", "\\Gamma^\\ast_{25}"),
    )
    .addParameter("E_gamma", constant(37830, "J mol^-1", "E_{\\Gamma^\\ast}"))
    // RL is not in Table 2. Fig 7 (the authors' code) sets RL25 = Vcmax25
    // (0.0326 − 0.0006 T_growth), the seasonal RL25:Vcmax25 fit of Table 1
    // (printed rounded as 0.03 − 0.001 T_growth), with Q10 = 1.2515
    .addParameter("rV_a", constant(0.0326, "dimensionless", "r_{V,a}"))
    .addParameter("rV_b", constant(0.0006, "celsius^-1", "r_{V,b}"))
    .addParameter("Q10_RL", constant(1.2515, "dimensionless", "Q_{10,R_L}"))
    // Photosyn's co-limitation: a hyperbolic minimum of Ac and Aj with this
    // curvature, where Eqn 2 takes the plain minimum (only A_net_h uses it)
    .addParameter("theta_h", constant(0.9999, "dimensionless", "\\theta_h"));
  for (const [name, tex, unitA, unitB, a, b, c] of TABLE2) {
    model = model
      .addParameter(`${name}_a`, constant(a, unitA, `a_{${tex}}`))
      .addParameter(`${name}_b`, constant(b, unitB, `b_{${tex}}`));
    if (c !== undefined) {
      model = model.addParameter(`${name}_c`, constant(c, unitB, `c_{${tex}}`));
    }
  }

  // Eqn 6: the smaller root of θ J² − (αQ + Jmax) J + αQ Jmax = 0
  const s = new Add([new Mul([n("alpha"), n("Q")]), n("Jmax")]);
  const J = new Divide([
    new Minus([
      s,
      new Sqrt(
        new Minus([
          new Pow(s, num(2)),
          new Mul([num(4), n("theta"), n("alpha"), n("Q"), n("Jmax")]),
        ]),
        num(2),
      ),
    ]),
    new Mul([num(2), n("theta")]),
  ]);

  // Photosyn: Am = (Ac + Aj − sqrt((Ac + Aj)² − 4 θh Ac Aj)) / (2 θh)
  const hsum = new Add([n("Ac"), n("Aj")]);
  const hypMin = new Divide([
    new Minus([
      hsum,
      new Sqrt(
        new Minus([
          new Pow(hsum, num(2)),
          new Mul([num(4), n("theta_h"), n("Ac"), n("Aj")]),
        ]),
        num(2),
      ),
    ]),
    new Mul([num(2), n("theta_h")]),
  ]);

  const factor = new Minus([num(1), new Divide([n("Gamma_star"), n("Ci")])]);

  return (
    model
      .addAssignment("Tk", {
        fn: new Add([n("T_leaf"), num(273.15)]),
        unit: "K",
        texName: "T_k",
      })
      // Table 2: acclimation (Eqn 11) and acclimation + adaptation (Eqn 13)
      .addAssignment("JVr", out(eqn13("JVr"), "dimensionless", "JV_r", "JVr"))
      .addAssignment("EaV", out(eqn11("EaV", 1), "kJ mol^-1", "E_{aV}", "EaV"))
      .addAssignment(
        "dSV",
        out(eqn11("dSV", -1), "J mol^-1 K^-1", "\\Delta S_V", "dSV"),
      )
      .addAssignment(
        "dSJ",
        out(eqn13("dSJ"), "J mol^-1 K^-1", "\\Delta S_J", "dSJ"),
      )
      // Table 2: Jmax25 = Vcmax25 × JVr
      .addAssignment(
        "Jmax25",
        out(
          new Mul([n("Vcmax25"), n("JVr")]),
          "umol m^-2 s^-1",
          "J_{max25}",
          "Jmax25",
        ),
      )
      // Eqn 7
      .addAssignment(
        "Vcmax",
        out(
          eqn7("Vcmax25", "EaV", "dSV"),
          "umol m^-2 s^-1",
          "V_{cmax}",
          "Vcmax",
        ),
      )
      .addAssignment(
        "Jmax",
        out(eqn7("Jmax25", "EaJ", "dSJ"), "umol m^-2 s^-1", "J_{max}", "Jmax"),
      )
      // Eqn 8: optimum temperatures of Vcmax and Jmax
      .addAssignment(
        "ToptV",
        out(eqn8("EaV", "dSV"), "celsius", "T_{optV}", "ToptV"),
      )
      .addAssignment(
        "ToptJ",
        out(eqn8("EaJ", "dSJ"), "celsius", "T_{optJ}", "ToptJ"),
      )
      .addAssignment("J", out(J, "umol m^-2 s^-1", "J", "J"))
      // Bernacchi et al. (2001): standard Arrhenius scaling from 25 °C
      .addAssignment(
        "Gamma_star",
        out(
          new Mul([n("Gamma_star25"), arrhenius(n("E_gamma"))]),
          "umol mol^-1",
          "\\Gamma^\\ast",
          "Gamma_star",
        ),
      )
      .addAssignment(
        "Kc",
        out(
          new Mul([n("Kc25"), arrhenius(n("Ec"))]),
          "umol mol^-1",
          "K_c",
          "Kc",
        ),
      )
      .addAssignment(
        "Ko",
        out(
          new Mul([n("Ko25"), arrhenius(n("Eo"))]),
          "mmol mol^-1",
          "K_o",
          "Ko",
        ),
      )
      // Eqn 3: Wc = Vcmax Ci / (Ci + Kc (1 + Oi/Ko))
      .addAssignment(
        "Wc",
        out(
          new Divide([
            new Mul([n("Vcmax"), n("Ci")]),
            new Add([
              n("Ci"),
              new Mul([
                n("Kc"),
                new Add([num(1), new Divide([n("O_i"), n("Ko")])]),
              ]),
            ]),
          ]),
          "umol m^-2 s^-1",
          "W_c",
          "Wc",
        ),
      )
      // Eqn 4: Wj = J Ci / (4 (Ci + 2Γ*))
      .addAssignment(
        "Wj",
        out(
          new Divide([
            new Mul([n("J"), n("Ci")]),
            new Mul([
              num(4),
              new Add([n("Ci"), new Mul([num(2), n("Gamma_star")])]),
            ]),
          ]),
          "umol m^-2 s^-1",
          "W_j",
          "Wj",
        ),
      )
      // RL (Eqn 9's role, here as Fig 7's Q10 form): RL25 Q10^((T − 25)/10)
      .addAssignment(
        "RL",
        out(
          new Mul([
            n("Vcmax25"),
            new Minus([n("rV_a"), new Mul([n("rV_b"), n("T_growth")])]),
            new Pow(
              n("Q10_RL"),
              new Divide([new Minus([n("T_leaf"), num(25)]), num(10)]),
            ),
          ]),
          "umol m^-2 s^-1",
          "R_L",
          "RL",
        ),
      )
      // Gross Rubisco- and RuBP-limited rates: W (1 − Γ*/Ci)
      .addAssignment(
        "Ac",
        out(new Mul([n("Wc"), factor]), "umol m^-2 s^-1", "A_c", "Ac"),
      )
      .addAssignment(
        "Aj",
        out(new Mul([n("Wj"), factor]), "umol m^-2 s^-1", "A_j", "Aj"),
      )
      // Eqn 2 (TPU limitation, Eqn 5, left out; see curatornotes.md):
      // Anet = min(Wc, Wj) (1 − Γ*/Ci) − RL
      .addAssignment(
        "A_net",
        out(
          new Minus([new Mul([new Min([n("Wc"), n("Wj")]), factor]), n("RL")]),
          "umol m^-2 s^-1",
          "A_{net}",
          "A_net",
        ),
      )
      // As Photosyn computes Anet for Fig 7: hyperbolic minimum of Ac and Aj
      .addAssignment(
        "A_net_h",
        out(
          new Minus([hypMin, n("RL")]),
          "umol m^-2 s^-1",
          "A_{net,h}",
          "A_net_h",
        ),
      )
  );
}
