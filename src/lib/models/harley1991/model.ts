import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  Exp,
  Max,
  Min,
  Minus,
  Mul,
  Name,
  Num,
  Pow,
  Sqrt,
} from "@computational-biology-aachen/mxlweb-core/mathml";

/**
 * `exp(c − ΔHa / (R Tk))`. The paper doesn't print Kc, Ko or τ; these are the
 * temperature functions of Harley et al. (1992, PCE 15: 271, Table 1), fitted
 * on the same cotton at the same Duke phytotron (assumed, see curatornotes.md).
 */
function arrhenius(name: string) {
  return new Exp(
    new Minus([
      new Name(`c_${name}`),
      new Divide([
        new Name(`dHa_${name}`),
        new Mul([new Name("R_gas"), new Name("Tk")]),
      ]),
    ]),
  );
}

/** `[name, tex, c, ΔHa (kJ mol⁻¹)]`; Kc in Pa and Ko in kPa as fitted. */
const KINETICS: Array<[string, string, number, number]> = [
  ["Kc", "K_c", 35.79, 80.47],
  ["Ko", "K_o", 9.59, 14.51],
  ["tau", "\\tau", -3.9489, -28.99],
];

/** (1 − 0.5 Φ) W − Rd: Eqn 1 for one limiting rate `w`. */
function netRate(w: string) {
  return new Minus([
    new Mul([
      new Minus([new Num(1), new Mul([new Num(0.5), new Name("Phi")])]),
      new Name(w),
    ]),
    new Name("Rd"),
  ]);
}

export function initModel(): SteadyStateModelBuilder {
  // Defaults: the soybean fit of Fig 2C (25 °C, 180 mbar O₂, PFD 1500,
  // half of the glycolate C returning as glycerate).
  let model = new SteadyStateModelBuilder()
    .addParameter("Ci", {
      value: 400,
      displayName: "Ci",
      unit: "ubar",
      texName: "C",
      slider: { min: "20", max: "1000", step: "5" },
    })
    .addParameter("O", {
      value: 180,
      displayName: "O",
      unit: "mbar",
      texName: "O",
      slider: { min: "10", max: "500", step: "5" },
    })
    .addParameter("T_leaf", {
      value: 25,
      displayName: "T_leaf",
      unit: "celsius",
      texName: "T_{leaf}",
      slider: { min: "15", max: "40", step: "0.5" },
    })
    .addParameter("PPFD", {
      value: 1500,
      displayName: "PPFD",
      unit: "umol m^-2 s^-1",
      texName: "I",
      slider: { min: "0", max: "2000", step: "10" },
    })
    .addParameter("Vcmax", {
      value: 120.9,
      displayName: "Vcmax",
      unit: "umol m^-2 s^-1",
      texName: "V_{c,max}",
      slider: { min: "20", max: "200", step: "0.5" },
    })
    // The light-saturated RuBP regeneration rate (Fig 1B labels it "Pml")
    .addParameter("R", {
      value: 49.6,
      displayName: "R",
      unit: "umol m^-2 s^-1",
      texName: "R",
      slider: { min: "10", max: "100", step: "0.5" },
    })
    // The rate of triose phosphate utilisation, Eqns 5 and 6
    .addParameter("T", {
      value: 9.62,
      displayName: "T",
      unit: "umol m^-2 s^-1",
      texName: "T",
      slider: { min: "2", max: "20", step: "0.1" },
    })
    // Not printed for soybean; 0 reproduces Fig 2 (see curatornotes.md)
    .addParameter("Rd", {
      value: 0,
      displayName: "Rd",
      unit: "umol m^-2 s^-1",
      texName: "R_d",
      slider: { min: "0", max: "5", step: "0.05" },
    })
    // Fraction of the C lost as glycolate that returns to the chloroplast as
    // glycerate: 3/4 in Fig 2A (Eqn 5), 0 in 2B (Eqn 6), 1/2 in 2C (Eqn 6b)
    .addParameter("f_gly", {
      value: 0.5,
      displayName: "f_gly",
      unit: "dimensionless",
      texName: "f_{gly}",
      slider: { min: "0", max: "0.75", step: "0.05" },
    })
    // Quantum yield of electron transport of Harley et al. (1992), assumed
    .addParameter("alpha", {
      value: 0.24,
      unit: "dimensionless",
      texName: "\\alpha",
    })
    .addParameter("R_gas", {
      value: 0.00831,
      unit: "kJ K^-1 mol^-1",
      texName: "R_{gas}",
    });
  for (const [name, tex, c, dHa] of KINETICS) {
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
  return (
    model
      .addAssignment("Tk", {
        fn: new Add([new Name("T_leaf"), new Num(273.15)]),
        unit: "K",
        texName: "T_k",
      })
      // Pa → µbar
      .addAssignment("Kc", {
        fn: new Mul([new Num(10), arrhenius("Kc")]),
        displayName: "Kc",
        unit: "ubar",
        texName: "K_c",
      })
      // kPa → mbar
      .addAssignment("Ko", {
        fn: new Mul([new Num(10), arrhenius("Ko")]),
        displayName: "Ko",
        unit: "mbar",
        texName: "K_o",
      })
      // Rubisco specificity, with C and O in the same units
      .addAssignment("tau", {
        fn: arrhenius("tau"),
        displayName: "tau",
        unit: "dimensionless",
        texName: "\\tau",
      })
      // Φ = vo/vc = O/(τ C), with O converted from mbar to µbar
      .addAssignment("Phi", {
        fn: new Divide([
          new Mul([new Num(1000), new Name("O")]),
          new Mul([new Name("tau"), new Name("Ci")]),
        ]),
        displayName: "Phi",
        unit: "dimensionless",
        texName: "\\Phi",
      })
      // The CO₂ compensation point in the absence of Rd, where Φ = 2
      .addAssignment("Gamma_star", {
        fn: new Divide([
          new Mul([new Num(500), new Name("O")]),
          new Name("tau"),
        ]),
        displayName: "Gamma_star",
        unit: "ubar",
        texName: "\\Gamma^*",
      })
      // Electron transport at PPFD, J = αI / √(1 + (αI / 4R)²) (Harley et al.
      // 1992, Eqn 7, with Jmax = 4R); the paper doesn't print it, see notes
      .addAssignment("J", {
        fn: new Divide([
          new Mul([new Name("alpha"), new Name("PPFD")]),
          new Sqrt(
            new Add([
              new Num(1),
              new Pow(
                new Divide([
                  new Mul([new Name("alpha"), new Name("PPFD")]),
                  new Mul([new Num(4), new Name("R")]),
                ]),
                new Num(2),
              ),
            ]),
            new Num(2),
          ),
        ]),
        displayName: "J",
        unit: "umol m^-2 s^-1",
        texName: "J",
      })
      // Eqn 2
      .addAssignment("Wc", {
        fn: new Divide([
          new Mul([new Name("Vcmax"), new Name("Ci")]),
          new Add([
            new Name("Ci"),
            new Mul([
              new Name("Kc"),
              new Add([
                new Num(1),
                new Divide([new Name("O"), new Name("Ko")]),
              ]),
            ]),
          ]),
        ]),
        displayName: "Wc",
        unit: "umol m^-2 s^-1",
        texName: "W_c",
      })
      // Eqn 4, with the RuBP regeneration rate at PPFD J/4
      .addAssignment("Wj", {
        fn: new Divide([
          new Name("J"),
          new Mul([new Num(4), new Add([new Num(1), new Name("Phi")])]),
        ]),
        displayName: "Wj",
        unit: "umol m^-2 s^-1",
        texName: "W_j",
      })
      // Eqns 5, 6 and 6b: vc = 3T + 2(1 − f_gly) vo with vo = Φ vc, solved
      // for vc. Pi can't limit where the denominator is ≤ 0 (vc unbounded).
      .addAssignment("Wp", {
        fn: new Divide([
          new Mul([new Num(3), new Name("T")]),
          new Max([
            new Minus([
              new Num(1),
              new Mul([
                new Num(2),
                new Minus([new Num(1), new Name("f_gly")]),
                new Name("Phi"),
              ]),
            ]),
            new Num(1e-12),
          ]),
        ]),
        displayName: "Wp",
        unit: "umol m^-2 s^-1",
        texName: "W_p",
      })
      .addAssignment("Ac", {
        fn: netRate("Wc"),
        displayName: "Ac",
        unit: "umol m^-2 s^-1",
        texName: "A_c",
      })
      .addAssignment("Aj", {
        fn: netRate("Wj"),
        displayName: "Aj",
        unit: "umol m^-2 s^-1",
        texName: "A_j",
      })
      .addAssignment("Ap", {
        fn: netRate("Wp"),
        displayName: "Ap",
        unit: "umol m^-2 s^-1",
        texName: "A_p",
      })
      // Eqn 1
      .addAssignment("A", {
        fn: new Minus([
          new Mul([
            new Minus([new Num(1), new Mul([new Num(0.5), new Name("Phi")])]),
            new Min([new Name("Wc"), new Name("Wj"), new Name("Wp")]),
          ]),
          new Name("Rd"),
        ]),
        displayName: "A",
        unit: "umol m^-2 s^-1",
        texName: "A",
      })
  );
}
