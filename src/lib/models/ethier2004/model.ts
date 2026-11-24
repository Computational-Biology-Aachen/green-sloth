import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  Min,
  Minus,
  Mul,
  Name,
  Num,
  Pow,
  Sqrt,
} from "@computational-biology-aachen/mxlweb-core/mathml";
import type { Base } from "@computational-biology-aachen/mxlweb-core/mathml";

const n = (name: string) => new Name(name);

/**
 * Eqn 10: the positive root of `a A² + b A + c = 0` that Eqns 7/8 and 9 give
 * for A at Ci, with `vmax` the ordinate asymptote (Vcmax, or J/4 for Eqn 11)
 * and `km` the effective Michaelis–Menten constant (Kc(1 + O/Ko), or 2Γ*).
 */
function eqn10(vmax: Base, km: Base): Base {
  const a = new Divide([new Num(-1), n("gi")]);
  const b = new Add([
    new Divide([new Minus([vmax, n("Rd")]), n("gi")]),
    n("Ci"),
    km,
  ]);
  // The Eqn 8 form of c
  const c = new Minus([
    new Mul([n("Rd"), new Add([n("Ci"), km])]),
    new Mul([vmax, new Minus([n("Ci"), n("Gamma_star")])]),
  ]);
  return new Divide([
    new Add([
      new Minus([b]),
      new Sqrt(
        new Minus([new Pow(b, new Num(2)), new Mul([new Num(4), a, c])]),
        new Num(2),
      ),
    ]),
    new Mul([new Num(2), a]),
  ]);
}

/** `(Ci − Γ*) vmax / (Ci + km) − Rd`: Eqns 14 and 15, at Ci with gi = ∞. */
function atCi(vmax: Base, km: Base): Base {
  return new Minus([
    new Divide([
      new Mul([new Minus([n("Ci"), n("Gamma_star")]), vmax]),
      new Add([n("Ci"), km]),
    ]),
    n("Rd"),
  ]);
}

const twoGammaStar = () => new Mul([new Num(2), n("Gamma_star")]);
const quarterJ = () => new Divide([n("J"), new Num(4)]);

export function initModel(): SteadyStateModelBuilder {
  return (
    new SteadyStateModelBuilder()
      .addParameter("Ci", {
        value: 300,
        displayName: "Ci",
        unit: "ubar",
        texName: "C_i",
        slider: { min: "0", max: "1600", step: "5" },
      })
      .addParameter("O", {
        value: 210,
        displayName: "O",
        unit: "mbar",
        texName: "O",
        slider: { min: "0", max: "500", step: "5" },
      })
      .addParameter("gi", {
        value: 0.2,
        displayName: "gi",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g_i",
        slider: { min: "0.01", max: "1", step: "0.01" },
      })
      // The 'true' leaf of Figs 4–6: Vcmax, Rd, Jmax, I, α (φ there) and θ from the
      // Fig 4 legend, Rubisco kinetics of Jordan & Ogren (1984) at 25 °C
      // (Table 2)
      .addParameter("Vcmax", {
        value: 56,
        displayName: "Vcmax",
        unit: "umol m^-2 s^-1",
        texName: "V_{c,max}",
        slider: { min: "5", max: "150", step: "0.5" },
      })
      .addParameter("Rd", {
        value: 0.6,
        displayName: "Rd",
        unit: "umol m^-2 s^-1",
        texName: "R_d",
        slider: { min: "0", max: "5", step: "0.05" },
      })
      .addParameter("Jmax", {
        value: 112,
        displayName: "Jmax",
        unit: "umol m^-2 s^-1",
        texName: "J_{max}",
        slider: { min: "10", max: "300", step: "1" },
      })
      .addParameter("I", {
        value: 1500,
        displayName: "I",
        unit: "umol m^-2 s^-1",
        texName: "I",
        slider: { min: "0", max: "2000", step: "10" },
      })
      .addParameter("alpha", {
        value: 0.18,
        displayName: "alpha",
        unit: "mol mol^-1",
        texName: "\\alpha",
      })
      .addParameter("theta", {
        value: 0.9,
        displayName: "theta",
        unit: "dimensionless",
        texName: "\\theta",
      })
      .addParameter("Kc", {
        value: 274.22,
        displayName: "Kc",
        unit: "ubar",
        texName: "K_c",
      })
      .addParameter("Ko", {
        value: 418.29,
        displayName: "Ko",
        unit: "mbar",
        texName: "K_o",
      })
      // Jordan & Ogren's Γ* = 45.146 µbar at 210 mbar O₂, through Eqn 5
      .addParameter("S_co", {
        value: 2325.8,
        displayName: "S_co",
        unit: "dimensionless",
        texName: "S_{c/o}",
      })
      // Eqn 16's apparent constant for gi = 0.2 (Fig 6 legend)
      .addParameter("Km_i", {
        value: 635.3,
        displayName: "Km_i",
        unit: "ubar",
        texName: "K_m(CO_2)_i",
      })
      // Eqn 5, with O in mbar and Γ* in µbar
      .addAssignment("Gamma_star", {
        fn: new Divide([new Mul([new Num(500), n("O")]), n("S_co")]),
        displayName: "Gamma_star",
        unit: "ubar",
        texName: "\\Gamma^*",
      })
      .addAssignment("Km", {
        fn: new Mul([
          n("Kc"),
          new Add([new Num(1), new Divide([n("O"), n("Ko")])]),
        ]),
        displayName: "Km",
        unit: "ubar",
        texName: "K_c(1 + O/K_o)",
      })
      // Eqn 17: the CO₂ compensation point
      .addAssignment("Gamma", {
        fn: new Divide([
          new Add([
            new Mul([n("Gamma_star"), n("Vcmax")]),
            new Mul([n("Km"), n("Rd")]),
          ]),
          new Minus([n("Vcmax"), n("Rd")]),
        ]),
        displayName: "Gamma",
        unit: "ubar",
        texName: "\\Gamma",
      })
      .addAssignment("Vcmax_minus_Rd", {
        fn: new Minus([n("Vcmax"), n("Rd")]),
        displayName: "Vcmax_minus_Rd",
        unit: "umol m^-2 s^-1",
        texName: "V_{c,max} - R_d",
      })
      // Eqn 12, the smaller root
      .addAssignment("J", {
        fn: new Divide([
          new Minus([
            new Add([new Mul([n("alpha"), n("I")]), n("Jmax")]),
            new Sqrt(
              new Minus([
                new Pow(
                  new Add([new Mul([n("alpha"), n("I")]), n("Jmax")]),
                  new Num(2),
                ),
                new Mul([
                  new Num(4),
                  n("theta"),
                  n("alpha"),
                  n("I"),
                  n("Jmax"),
                ]),
              ]),
              new Num(2),
            ),
          ]),
          new Mul([new Num(2), n("theta")]),
        ]),
        displayName: "J",
        unit: "umol m^-2 s^-1",
        texName: "J",
      })
      // Eqn 10: Rubisco-limited, finite gi
      .addAssignment("Ac", {
        fn: eqn10(n("Vcmax"), n("Km")),
        displayName: "Ac",
        unit: "umol m^-2 s^-1",
        texName: "A_c",
      })
      // Eqn 11 through Eqns 6–10, with Vcmax → J/4 and Kc(1 + O/Ko) → 2Γ*
      .addAssignment("Aj", {
        fn: eqn10(quarterJ(), twoGammaStar()),
        displayName: "Aj",
        unit: "umol m^-2 s^-1",
        texName: "A_j",
      })
      // Eqn 13
      .addAssignment("An", {
        fn: new Min([n("Ac"), n("Aj")]),
        displayName: "An",
        unit: "umol m^-2 s^-1",
        texName: "A_n",
      })
      // Eqn 9
      .addAssignment("Cc", {
        fn: new Minus([n("Ci"), new Divide([n("An"), n("gi")])]),
        displayName: "Cc",
        unit: "ubar",
        texName: "C_c",
      })
      // Eqns 14 and 15: the conventional fit, gi = ∞
      .addAssignment("Ac_inf", {
        fn: atCi(n("Vcmax"), n("Km")),
        displayName: "Ac_inf",
        unit: "umol m^-2 s^-1",
        texName: "A_{c,\\infty}",
      })
      .addAssignment("Aj_inf", {
        fn: atCi(quarterJ(), twoGammaStar()),
        displayName: "Aj_inf",
        unit: "umol m^-2 s^-1",
        texName: "A_{j,\\infty}",
      })
      .addAssignment("An_inf", {
        fn: new Min([n("Ac_inf"), n("Aj_inf")]),
        displayName: "An_inf",
        unit: "umol m^-2 s^-1",
        texName: "A_{n,\\infty}",
      })
      // Eqn 9 at A = −Rd: the intercellular photocompensation point
      .addAssignment("Ci_star", {
        fn: new Minus([n("Gamma_star"), new Divide([n("Rd"), n("gi")])]),
        displayName: "Ci_star",
        unit: "ubar",
        texName: "C_i^*",
      })
      // Eqn 16: the rectangular hyperbola corrected for gi
      .addAssignment("Ac_app", {
        fn: new Minus([
          new Divide([
            new Mul([new Minus([n("Ci"), n("Ci_star")]), n("Vcmax")]),
            new Add([n("Ci"), n("Km_i")]),
          ]),
          n("Rd"),
        ]),
        displayName: "Ac_app",
        unit: "umol m^-2 s^-1",
        texName: "A_{c,16}",
      })
  );
}
