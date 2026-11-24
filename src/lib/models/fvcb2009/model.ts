import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
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
import type { Base } from "@computational-biology-aachen/mxlweb-core/mathml";

const n = (name: string) => new Name(name);
// The chapter's constants: R = 8.31 J K⁻¹ mol⁻¹, 25 °C = 298 K, 0 °C = 273 K
const R = () => new Num(8.31);
const T25 = () => new Num(298);

/**
 * Eqn 9.22: `p25 · exp[(t − 25) E / (298 R (273 + t))]`, t in °C, E in
 * kJ mol⁻¹.
 */
function arrhenius(p25: string, E: string): Base {
  return new Mul([
    n(p25),
    new Exp(
      new Divide([
        new Mul([new Minus([n("t_leaf"), new Num(25)]), n(E), new Num(1000)]),
        new Mul([T25(), R(), n("T_K")]),
      ]),
    ),
  ]);
}

/** `1 + exp[(S T − H) / (R T)]`, the deactivation term of Eqn 9.23, H in kJ mol⁻¹. */
function deactivation(T: Base): Base {
  return new Add([
    new Num(1),
    new Exp(
      new Divide([
        new Minus([new Mul([n("S_J"), T]), new Mul([n("H_J"), new Num(1000)])]),
        new Mul([R(), T]),
      ]),
    ),
  ]);
}

/**
 * The smaller root of `A² − A{gi(Ci + km) + vmax − Rd} + gi{vmax(Ci − Γ*) −
 * Rd(Ci + km)} = 0`: Eqn 9.28 (vmax = Vcmax, km = Kc(1 + O/Ko)) and Eqn 9.29
 * (vmax = J/4, km = 2Γ*). The chapter prints `+ Rd` in the linear coefficient;
 * substituting Eqn 9.27 into Eqns 9.9 and 9.14 gives `− Rd`, the form that
 * tends to Eqns 9.9 and 9.14 as gi → ∞.
 */
function quadraticInCi(vmax: Base, km: Base): Base {
  const b = new Add([
    new Mul([n("gi"), new Add([n("Ci"), km])]),
    new Minus([vmax, n("Rd")]),
  ]);
  const c = new Mul([
    n("gi"),
    new Minus([
      new Mul([vmax, new Minus([n("Ci"), n("Gamma_star")])]),
      new Mul([n("Rd"), new Add([n("Ci"), km])]),
    ]),
  ]);
  return new Divide([
    new Minus([
      b,
      new Sqrt(
        new Minus([new Pow(b, new Num(2)), new Mul([new Num(4), c])]),
        new Num(2),
      ),
    ]),
    new Num(2),
  ]);
}

/** `(C − Γ*) vmax / (C + km) − Rd` at C = Ci: Eqns 9.9 and 9.14 with gi = ∞. */
function atC(vmax: Base, km: Base): Base {
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
      // Environment. Fig 9.5: 25 °C and pO₂ = 200 mbar
      .addParameter("Ci", {
        value: 300,
        displayName: "Ci",
        unit: "ubar",
        texName: "C_i",
        slider: { min: "0", max: "1600", step: "5" },
      })
      .addParameter("O", {
        value: 200,
        displayName: "O",
        unit: "mbar",
        texName: "O",
        slider: { min: "0", max: "500", step: "5" },
      })
      .addParameter("I", {
        value: 1000,
        displayName: "I",
        unit: "umol m^-2 s^-1",
        texName: "I",
        slider: { min: "0", max: "2000", step: "10" },
      })
      .addParameter("t_leaf", {
        value: 25,
        displayName: "t_leaf",
        unit: "celsius",
        texName: "t",
        slider: { min: "0", max: "50", step: "0.5" },
      })
      // The internal conductance of Fig 9.8 (tobacco); no other figure gives one
      .addParameter("gi", {
        value: 0.3,
        displayName: "gi",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g_i",
        slider: { min: "0.01", max: "1", step: "0.01" },
      })
      // Table 9.1 at 25 °C: Rubisco kinetics of von Caemmerer et al. (1994)
      .addParameter("Kc_25", {
        value: 260,
        displayName: "Kc_25",
        unit: "ubar",
        texName: "K_{c,25}",
      })
      .addParameter("Ko_25", {
        value: 179,
        displayName: "Ko_25",
        unit: "mbar",
        texName: "K_{o,25}",
      })
      // γ* = 0.5/Sc/o (Eqn 9.4). Table 9.1's Γ* in brackets, 36.9 µbar at
      // 200 mbar O₂ (Bernacchi et al. 2002): the value Figs 9.5 and 9.7 are drawn
      // with. Table 9.1's own γ* = 0.0001935 (38.6 µbar) puts them 0.2–0.6 lower.
      .addParameter("gamma_star_25", {
        value: 0.0001845,
        displayName: "gamma_star_25",
        unit: "dimensionless",
        texName: "\\gamma^*_{25}",
      })
      // Table 9.1: varies with the photosynthetic capacity of the leaf
      .addParameter("Vcmax_25", {
        value: 80,
        displayName: "Vcmax_25",
        unit: "umol m^-2 s^-1",
        texName: "V_{c,max,25}",
        slider: { min: "5", max: "200", step: "0.5" },
      })
      .addParameter("Rd_25", {
        value: 1,
        displayName: "Rd_25",
        unit: "umol m^-2 s^-1",
        texName: "R_{d,25}",
        slider: { min: "0", max: "6", step: "0.05" },
      })
      .addParameter("Jmax_25", {
        value: 160,
        displayName: "Jmax_25",
        unit: "umol m^-2 s^-1",
        texName: "J_{max,25}",
        slider: { min: "10", max: "400", step: "1" },
      })
      // Not printed, and no figure draws Ap: high enough never to limit
      .addParameter("Tp", {
        value: 100,
        displayName: "Tp",
        unit: "umol m^-2 s^-1",
        texName: "T_p",
        slider: { min: "1", max: "100", step: "0.5" },
      })
      // Table 9.1: activation energies (Kc, Ko of Farquhar et al. 1980)
      .addParameter("E_Kc", {
        value: 59.36,
        displayName: "E_Kc",
        unit: "kJ mol^-1",
        texName: "E_{K_c}",
      })
      .addParameter("E_Ko", {
        value: 35.94,
        displayName: "E_Ko",
        unit: "kJ mol^-1",
        texName: "E_{K_o}",
      })
      // Table 9.1's bracketed value, which goes with the bracketed Γ* above
      .addParameter("E_gamma_star", {
        value: 24.6,
        displayName: "E_gamma_star",
        unit: "kJ mol^-1",
        texName: "E_{\\gamma^*}",
      })
      .addParameter("E_Vcmax", {
        value: 58.52,
        displayName: "E_Vcmax",
        unit: "kJ mol^-1",
        texName: "E_{V_{c,max}}",
      })
      .addParameter("E_Rd", {
        value: 66.4,
        displayName: "E_Rd",
        unit: "kJ mol^-1",
        texName: "E_{R_d}",
      })
      // Table 9.1: Eqn 9.23 for Jmax, as used by Farquhar et al. (1980)
      .addParameter("E_J", {
        value: 37,
        displayName: "E_J",
        unit: "kJ mol^-1",
        texName: "E_J",
      })
      .addParameter("H_J", {
        value: 220,
        displayName: "H_J",
        unit: "kJ mol^-1",
        texName: "H",
      })
      .addParameter("S_J", {
        value: 710,
        displayName: "S_J",
        unit: "J K^-1 mol^-1",
        texName: "S",
      })
      // Eqns 9.15 and 9.16: θ, absorptance and spectral correction f
      .addParameter("theta", {
        value: 0.7,
        displayName: "theta",
        unit: "dimensionless",
        texName: "\\theta",
      })
      .addParameter("abs", {
        value: 0.85,
        displayName: "abs",
        unit: "dimensionless",
        texName: "abs",
      })
      .addParameter("f", {
        value: 0.15,
        displayName: "f",
        unit: "dimensionless",
        texName: "f",
      })
      // Fig 9.7's supply function A = g(Ca − Ci); both fitted to the figure
      .addParameter("g", {
        value: 0.2,
        displayName: "g",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g",
        slider: { min: "0.01", max: "1", step: "0.01" },
      })
      .addParameter("Ca", {
        value: 383,
        displayName: "Ca",
        unit: "ubar",
        texName: "C_a",
        slider: { min: "0", max: "1600", step: "5" },
      })
      .addAssignment("T_K", {
        fn: new Add([n("t_leaf"), new Num(273)]),
        displayName: "T_K",
        unit: "K",
        texName: "T",
      })
      // Eqn 9.22
      .addAssignment("Kc", {
        fn: arrhenius("Kc_25", "E_Kc"),
        displayName: "Kc",
        unit: "ubar",
        texName: "K_c",
      })
      .addAssignment("Ko", {
        fn: arrhenius("Ko_25", "E_Ko"),
        displayName: "Ko",
        unit: "mbar",
        texName: "K_o",
      })
      .addAssignment("gamma_star", {
        fn: arrhenius("gamma_star_25", "E_gamma_star"),
        displayName: "gamma_star",
        unit: "dimensionless",
        texName: "\\gamma^*",
      })
      .addAssignment("Vcmax", {
        fn: arrhenius("Vcmax_25", "E_Vcmax"),
        displayName: "Vcmax",
        unit: "umol m^-2 s^-1",
        texName: "V_{c,max}",
      })
      .addAssignment("Rd", {
        fn: arrhenius("Rd_25", "E_Rd"),
        displayName: "Rd",
        unit: "umol m^-2 s^-1",
        texName: "R_d",
      })
      // Eqn 9.4: Γ* = γ* O, with O in mbar and Γ* in µbar
      .addAssignment("Gamma_star", {
        fn: new Mul([new Num(1000), n("gamma_star"), n("O")]),
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
      // Eqn 9.23, T in K
      .addAssignment("Jmax", {
        fn: new Divide([
          new Mul([
            n("Jmax_25"),
            new Exp(
              new Divide([
                new Mul([
                  new Minus([n("T_K"), T25()]),
                  n("E_J"),
                  new Num(1000),
                ]),
                new Mul([T25(), R(), n("T_K")]),
              ]),
            ),
            deactivation(T25()),
          ]),
          deactivation(n("T_K")),
        ]),
        displayName: "Jmax",
        unit: "umol m^-2 s^-1",
        texName: "J_{max}",
      })
      // Eqn 9.24, printed `H[S + R ln(H/E − 1)]`: a division, the optimum of
      // Eqn 9.23
      .addAssignment("Topt", {
        fn: new Minus([
          new Divide([
            new Mul([n("H_J"), new Num(1000)]),
            new Add([
              n("S_J"),
              new Mul([
                R(),
                new Ln(
                  new Minus([new Divide([n("H_J"), n("E_J")]), new Num(1)]),
                ),
              ]),
            ]),
          ]),
          new Num(273),
        ]),
        displayName: "Topt",
        unit: "celsius",
        texName: "T_{opt}",
      })
      // Eqn 9.16
      .addAssignment("I2", {
        fn: new Divide([
          new Mul([n("I"), n("abs"), new Minus([new Num(1), n("f")])]),
          new Num(2),
        ]),
        displayName: "I2",
        unit: "umol m^-2 s^-1",
        texName: "I_2",
      })
      // Eqn 9.17, the smaller root of Eqn 9.15
      .addAssignment("J", {
        fn: new Divide([
          new Minus([
            new Add([n("I2"), n("Jmax")]),
            new Sqrt(
              new Minus([
                new Pow(new Add([n("I2"), n("Jmax")]), new Num(2)),
                new Mul([new Num(4), n("theta"), n("I2"), n("Jmax")]),
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
      // Eqns 9.9, 9.14 and 9.21 at C = Ci (gi = ∞): the chapter's curves at the
      // chloroplast (Fig 9.5) or, with Ci for C, at the intercellular spaces
      .addAssignment("Ac_inf", {
        fn: atC(n("Vcmax"), n("Km")),
        displayName: "Ac_inf",
        unit: "umol m^-2 s^-1",
        texName: "A_{c,\\infty}",
      })
      .addAssignment("Aj_inf", {
        fn: atC(quarterJ(), twoGammaStar()),
        displayName: "Aj_inf",
        unit: "umol m^-2 s^-1",
        texName: "A_{j,\\infty}",
      })
      // Eqn 9.19, independent of C
      .addAssignment("Ap", {
        fn: new Minus([new Mul([new Num(3), n("Tp")]), n("Rd")]),
        displayName: "Ap",
        unit: "umol m^-2 s^-1",
        texName: "A_p",
      })
      .addAssignment("A_inf", {
        fn: new Min([n("Ac_inf"), n("Aj_inf"), n("Ap")]),
        displayName: "A_inf",
        unit: "umol m^-2 s^-1",
        texName: "A_{\\infty}",
      })
      // Eqns 9.28 and 9.29: finite gi
      .addAssignment("Ac", {
        fn: quadraticInCi(n("Vcmax"), n("Km")),
        displayName: "Ac",
        unit: "umol m^-2 s^-1",
        texName: "A_c",
      })
      .addAssignment("Aj", {
        fn: quadraticInCi(quarterJ(), twoGammaStar()),
        displayName: "Aj",
        unit: "umol m^-2 s^-1",
        texName: "A_j",
      })
      // Eqn 9.21
      .addAssignment("A", {
        fn: new Min([n("Ac"), n("Aj"), n("Ap")]),
        displayName: "A",
        unit: "umol m^-2 s^-1",
        texName: "A",
      })
      // Eqn 9.27
      .addAssignment("Cc", {
        fn: new Minus([n("Ci"), new Divide([n("A"), n("gi")])]),
        displayName: "Cc",
        unit: "ubar",
        texName: "C_c",
      })
      // Fig 9.7: the supply function, Fick's law across the stomata
      .addAssignment("A_supply", {
        fn: new Mul([n("g"), new Minus([n("Ca"), n("Ci")])]),
        displayName: "A_supply",
        unit: "umol m^-2 s^-1",
        texName: "A_{supply}",
      })
  );
}
