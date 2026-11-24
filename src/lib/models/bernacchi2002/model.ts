import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  Exp,
  Minus,
  Mul,
  Name,
  Num,
  Pow,
  Sqrt,
} from "@computational-biology-aachen/mxlweb-core/mathml";

const n = (name: string) => new Name(name);

/** `c − ΔHa / (R Tk)`, the exponent of Table I's functions. */
function arrhenius(c: string, dHa: string) {
  return new Minus([n(c), new Divide([n(dHa), new Mul([n("R"), n("Tk")])])]);
}

/** Table I: `exp(c − ΔHa / (R Tk))`, optionally times a value at 25 °C. */
function tableI(name: string, scale?: string) {
  const value = new Exp(arrhenius(`c_${name}`, `dHa_${name}`));
  return scale === undefined ? value : new Mul([n(scale), value]);
}

/**
 * Table I (gm, Γ*, Kc, Ko on a Cc basis) and, for comparison and for the
 * Eqn 8 rates, Table 1 of Bernacchi et al. (2001): name, TeX, c, ΔHa (kJ mol⁻¹).
 */
const CONSTANTS: Array<[string, string, number, number]> = [
  // Table I of this paper, on a Cc basis
  ["Gamma_star", "\\Gamma^*", 13.49, 24.46],
  ["Kc", "K_c", 38.28, 80.99],
  ["Ko", "K_o", 14.68, 23.72],
  // Bernacchi et al. (2001) Table 1: the apparent (Ci-based) Kc and Ko of
  // Fig 2b,c's solid lines, and Vc,max and Rd relative to 25 °C. These are
  // fitted on a Ci basis; the paper's Cc-based Vc,max(T) is not printed.
  ["Kc_app", "K_{c,app}", 38.05, 79.43],
  ["Ko_app", "K_{o,app}", 20.3, 36.38],
  ["Vcmax", "V_{c,max}", 26.35, 65.33],
  ["Rd", "R_d", 18.72, 46.39],
];

export function initModel(): SteadyStateModelBuilder {
  let model = new SteadyStateModelBuilder()
    .addParameter("Ci", {
      value: 250,
      displayName: "Ci",
      unit: "umol mol^-1",
      texName: "C_i",
      slider: { min: "10", max: "1600", step: "5" },
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
      texName: "T_{leaf}",
      slider: { min: "5", max: "45", step: "0.5" },
    })
    // Fig 1 caption: gm at 25 °C by the variable J method, 0.095 mol m⁻² s⁻¹
    // bar⁻¹, to which Fig 1 is normalised (Eqn 6 itself gives 0.990 there)
    .addParameter("gm25", {
      value: 0.095,
      displayName: "gm25",
      unit: "mol m^-2 s^-1 bar^-1",
      texName: "g_{m,25}",
      slider: { min: "0.01", max: "1", step: "0.005" },
    })
    // Not given for these leaves; gm = 0.0045 Vc,max at 25 °C (Materials and
    // Methods, from carbon isotope discrimination) gives 0.095 / 0.0045
    .addParameter("Vcmax25", {
      value: 21.1,
      displayName: "Vcmax25",
      unit: "umol m^-2 s^-1",
      texName: "V_{c,max,25}",
      slider: { min: "0", max: "200", step: "0.5" },
    })
    // Not given; 0 makes l_gm (Eqn 13) the effect of gm alone
    .addParameter("Rd25", {
      value: 0,
      displayName: "Rd25",
      unit: "umol m^-2 s^-1",
      texName: "R_{d,25}",
      slider: { min: "0", max: "5", step: "0.01" },
    })
    // Eqn 6: R = 0.008314 kJ K⁻¹ mol⁻¹
    .addParameter("R", {
      value: 0.008314,
      unit: "kJ K^-1 mol^-1",
      texName: "R",
    })
    // Table I, gm: scaling constant, activation and deactivation energies and
    // the entropy term of Eqn 6
    .addParameter("c_gm", {
      value: 20.0,
      unit: "dimensionless",
      texName: "c_{g_m}",
    })
    .addParameter("dHa_gm", {
      value: 49.6,
      unit: "kJ mol^-1",
      texName: "\\Delta H_{a,g_m}",
    })
    .addParameter("dHd_gm", {
      value: 437.4,
      unit: "kJ mol^-1",
      texName: "\\Delta H_{d,g_m}",
    })
    .addParameter("dS_gm", {
      value: 1.4,
      unit: "kJ K^-1 mol^-1",
      texName: "\\Delta S_{g_m}",
    });
  for (const [name, tex, c, dHa] of CONSTANTS) {
    model = model
      .addParameter(`c_${name}`, {
        value: c,
        unit: "dimensionless",
        texName: `c_{${tex}}`,
      })
      .addParameter(`dHa_${name}`, {
        value: dHa,
        unit: "kJ mol^-1",
        texName: `\\Delta H_{a,${tex}}`,
      });
  }

  // Eqn 8 with Cc for Ci and Eqn 9, Cc = Ci − A/gm, give the quadratic
  // a A² + b A + c = 0 with a = −1/gm, b = (Vc,max − Rd)/gm + Ci + Km and
  // c = Rd (Ci + Km) − Vc,max (Ci − Γ*). a < 0, so (−b + √(b² − 4ac)) / 2a is
  // the smaller root, the one with Cc between Γ* and Ci.
  const a = new Divide([new Num(-1), n("gm")]);
  const b = new Add([
    new Divide([new Minus([n("Vcmax"), n("Rd")]), n("gm")]),
    n("Ci"),
    n("Km"),
  ]);
  const c = new Minus([
    new Mul([n("Rd"), new Add([n("Ci"), n("Km")])]),
    new Mul([n("Vcmax"), new Minus([n("Ci"), n("Gamma_star")])]),
  ]);

  return (
    model
      .addAssignment("Tk", {
        fn: new Add([n("T_leaf"), new Num(273.15)]),
        unit: "K",
        texName: "T_k",
      })
      // Eqn 6, times gm at 25 °C
      .addAssignment("gm", {
        fn: new Mul([
          n("gm25"),
          new Divide([
            new Exp(arrhenius("c_gm", "dHa_gm")),
            new Add([
              new Num(1),
              new Exp(
                new Divide([
                  new Minus([new Mul([n("dS_gm"), n("Tk")]), n("dHd_gm")]),
                  new Mul([n("R"), n("Tk")]),
                ]),
              ),
            ]),
          ]),
        ]),
        displayName: "gm",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g_m",
      })
      // Table I: Γ*, Kc and Ko on a Cc basis
      .addAssignment("Gamma_star", {
        fn: tableI("Gamma_star"),
        displayName: "Gamma_star",
        unit: "umol mol^-1",
        texName: "\\Gamma^*",
      })
      .addAssignment("Kc", {
        fn: tableI("Kc"),
        displayName: "Kc",
        unit: "umol mol^-1",
        texName: "K_c",
      })
      .addAssignment("Ko", {
        fn: tableI("Ko"),
        displayName: "Ko",
        unit: "mmol mol^-1",
        texName: "K_o",
      })
      // Bernacchi et al. (2001): the apparent, Ci-based Kc and Ko
      .addAssignment("Kc_app", {
        fn: tableI("Kc_app"),
        displayName: "Kc_app",
        unit: "umol mol^-1",
        texName: "K_{c,app}",
      })
      .addAssignment("Ko_app", {
        fn: tableI("Ko_app"),
        displayName: "Ko_app",
        unit: "mmol mol^-1",
        texName: "K_{o,app}",
      })
      .addAssignment("Vcmax", {
        fn: tableI("Vcmax", "Vcmax25"),
        displayName: "Vcmax",
        unit: "umol m^-2 s^-1",
        texName: "V_{c,max}",
      })
      .addAssignment("Rd", {
        fn: tableI("Rd", "Rd25"),
        displayName: "Rd",
        unit: "umol m^-2 s^-1",
        texName: "R_d",
      })
      // Kc (1 + O/Ko), the denominator term of Eqn 8
      .addAssignment("Km", {
        fn: new Mul([
          n("Kc"),
          new Add([new Num(1), new Divide([n("O"), n("Ko")])]),
        ]),
        displayName: "Km",
        unit: "umol mol^-1",
        texName: "K_m",
      })
      // Eqns 8 and 9: Rubisco-limited A at the measured gm. A/gm is in µbar,
      // taken equal to µmol mol⁻¹ at 1 bar total pressure.
      .addAssignment("A", {
        fn: new Divide([
          new Add([
            new Minus([b]),
            new Sqrt(
              new Minus([new Pow(b, new Num(2)), new Mul([new Num(4), a, c])]),
              new Num(2),
            ),
          ]),
          new Mul([new Num(2), a]),
        ]),
        displayName: "A",
        unit: "umol m^-2 s^-1",
        texName: "A",
      })
      // Eqn 9
      .addAssignment("Cc", {
        fn: new Minus([n("Ci"), new Divide([n("A"), n("gm")])]),
        displayName: "Cc",
        unit: "umol mol^-1",
        texName: "C_c",
      })
      // Eqn 8 with Cc = Ci: A at infinite gm
      .addAssignment("A_inf", {
        fn: new Minus([
          new Divide([
            new Mul([n("Vcmax"), new Minus([n("Ci"), n("Gamma_star")])]),
            new Add([n("Ci"), n("Km")]),
          ]),
          n("Rd"),
        ]),
        displayName: "A_inf",
        unit: "umol m^-2 s^-1",
        texName: "A_{\\infty}",
      })
      // Eqn 13: lgm = (Acc − Aci)/Acc, the limitation imposed by gm. Read
      // literally the caption's "actual gm and infinite gm, respectively" makes
      // lgm < 0; Acc is A on the A/Cc curve at Cc = Ci (infinite gm), Aci the
      // A reached at Ci through the actual gm.
      .addAssignment("l_gm", {
        fn: new Divide([new Minus([n("A_inf"), n("A")]), n("A_inf")]),
        displayName: "l_gm",
        unit: "dimensionless",
        texName: "l_{g_m}",
      })
  );
}
