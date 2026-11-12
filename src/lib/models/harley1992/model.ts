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

/** `exp(c − ΔHa / (R Tk))`: Eqn 8, and the numerator of Eqn 9. */
function arrhenius(name: string) {
  return new Exp(
    new Minus([
      new Name(`c_${name}`),
      new Divide([
        new Name(`dHa_${name}`),
        new Mul([new Name("R"), new Name("Tk")]),
      ]),
    ]),
  );
}

/** Eqn 9: Eqn 8 with high-temperature deactivation. */
function eqn9(name: string) {
  return new Divide([
    arrhenius(name),
    new Add([
      new Num(1),
      new Exp(
        new Divide([
          new Minus([
            new Mul([new Name("dS"), new Name("Tk")]),
            new Name(`dHd_${name}`),
          ]),
          new Mul([new Name("R"), new Name("Tk")]),
        ]),
      ),
    ]),
  ]);
}

/** Table 1, plants grown in 35 Pa CO₂: `[name, tex, c, ΔHa, ΔHd]` (kJ mol⁻¹). */
const KINETICS: Array<[string, string, number, number]> = [
  ["Kc", "K_c", 35.79, 80.47],
  ["Ko", "K_o", 9.59, 14.51],
  ["tau", "\\tau", -3.9489, -28.99],
];
const CAPACITIES: Array<[string, string, number, number, number]> = [
  ["Vcmax", "V_{c,max}", 51.07, 116.3, 202.9],
  ["Jmax", "J_{max}", 37.08, 79.5, 201.0],
  ["TPU", "T_{PU}", 23.59, 53.1, 201.8],
];

export function initModel(): SteadyStateModelBuilder {
  let model = new SteadyStateModelBuilder()
    .addParameter("Ci", {
      value: 25.9,
      displayName: "Ci",
      unit: "Pa",
      texName: "C_i",
      slider: { min: "1", max: "100", step: "0.5" },
    })
    // The O₂ of the measurements (Fig 1, Table 2), which reproduces Fig 8
    .addParameter("O", {
      value: 20,
      displayName: "O",
      unit: "kPa",
      texName: "O",
      slider: { min: "1", max: "40", step: "0.5" },
    })
    .addParameter("T_leaf", {
      value: 29,
      displayName: "T_leaf",
      unit: "celsius",
      texName: "T_{leaf}",
      slider: { min: "10", max: "40", step: "0.5" },
    })
    .addParameter("PPFD", {
      value: 1000,
      displayName: "PPFD",
      unit: "umol m^-2 s^-1",
      texName: "I",
      slider: { min: "0", max: "2000", step: "10" },
    })
    .addParameter("RH", {
      value: 50,
      displayName: "RH",
      unit: "dimensionless",
      texName: "RH",
      slider: { min: "10", max: "100", step: "1" },
    })
    .addParameter("Rd", {
      value: 0.82,
      displayName: "Rd",
      unit: "umol m^-2 s^-1",
      texName: "R_d",
    })
    .addParameter("alpha", {
      value: 0.24,
      unit: "dimensionless",
      texName: "\\alpha",
    })
    // Ball et al. (1987) stomatal conductance, Eqn 11
    .addParameter("g0", {
      value: 81.1,
      unit: "mmol m^-2 s^-1",
      texName: "g_0",
    })
    .addParameter("g1", {
      value: 9.58,
      unit: "dimensionless",
      texName: "g_1",
    })
    .addParameter("R", {
      value: 0.00831,
      unit: "kJ K^-1 mol^-1",
      texName: "R",
    })
    .addParameter("dS", {
      value: 0.65,
      unit: "kJ K^-1 mol^-1",
      texName: "\\Delta S",
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
  for (const [name, tex, c, dHa, dHd] of CAPACITIES) {
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
      })
      .addParameter(`dHd_${name}`, {
        value: dHd,
        unit: "kJ mol^-1",
        texName: `\\Delta H_{d,${tex}}`,
      });
  }
  model = model
    .addParameter("c_Rdark", {
      value: 34.13,
      unit: "dimensionless",
      texName: "c_{R_{dark}}",
    })
    .addParameter("dHa_Rdark", {
      value: 84.45,
      unit: "kJ mol^-1",
      texName: "\\Delta H_{a,R_{dark}}",
    })
    .addAssignment("Tk", {
      fn: new Add([new Name("T_leaf"), new Num(273.15)]),
      unit: "K",
      texName: "T_k",
    });
  for (const [name, tex] of KINETICS) {
    model = model.addAssignment(name, {
      fn: arrhenius(name),
      displayName: name,
      unit: name === "Kc" ? "Pa" : name === "Ko" ? "kPa" : "dimensionless",
      texName: tex,
    });
  }
  for (const [name, tex] of CAPACITIES) {
    model = model.addAssignment(name, {
      fn: eqn9(name),
      displayName: name,
      unit: "umol m^-2 s^-1",
      texName: tex,
    });
  }
  return (
    model
      // 0.5 O / tau, with O converted from kPa to Pa
      .addAssignment("Gamma_star", {
        fn: new Divide([
          new Mul([new Num(500), new Name("O")]),
          new Name("tau"),
        ]),
        displayName: "Gamma_star",
        unit: "Pa",
        texName: "\\Gamma^*",
      })
      // Eqn 7
      .addAssignment("J", {
        fn: new Divide([
          new Mul([new Name("alpha"), new Name("PPFD")]),
          new Sqrt(
            new Add([
              new Num(1),
              new Pow(
                new Divide([
                  new Mul([new Name("alpha"), new Name("PPFD")]),
                  new Name("Jmax"),
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
      // Eqn 4
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
      // Eqn 5, with O / tau = 2 Gamma*
      .addAssignment("Wj", {
        fn: new Divide([
          new Mul([new Name("J"), new Name("Ci")]),
          new Mul([
            new Num(4),
            new Add([
              new Name("Ci"),
              new Mul([new Num(2), new Name("Gamma_star")]),
            ]),
          ]),
        ]),
        displayName: "Wj",
        unit: "umol m^-2 s^-1",
        texName: "W_j",
      })
      .addAssignment("co2_factor", {
        fn: new Minus([
          new Num(1),
          new Divide([new Name("Gamma_star"), new Name("Ci")]),
        ]),
        displayName: "co2_factor",
        unit: "dimensionless",
        texName: "1 - \\Gamma^*/C_i",
      })
      // Eqn 6 solved for Wp (Vc = Wp); TPU cannot limit at or below Gamma*
      .addAssignment("Wp", {
        fn: new Divide([
          new Mul([new Num(3), new Name("TPU")]),
          new Max([new Name("co2_factor"), new Num(1e-12)]),
        ]),
        displayName: "Wp",
        unit: "umol m^-2 s^-1",
        texName: "W_p",
      })
      .addAssignment("rubisco", {
        fn: new Minus([
          new Mul([new Name("co2_factor"), new Name("Wc")]),
          new Name("Rd"),
        ]),
        displayName: "Ac",
        unit: "umol m^-2 s^-1",
        texName: "A_c",
      })
      .addAssignment("rubp", {
        fn: new Minus([
          new Mul([new Name("co2_factor"), new Name("Wj")]),
          new Name("Rd"),
        ]),
        displayName: "Aj",
        unit: "umol m^-2 s^-1",
        texName: "A_j",
      })
      .addAssignment("tpu", {
        fn: new Minus([new Mul([new Num(3), new Name("TPU")]), new Name("Rd")]),
        displayName: "Ap",
        unit: "umol m^-2 s^-1",
        texName: "A_p",
      })
      // Eqn 3
      .addAssignment("A", {
        fn: new Minus([
          new Mul([
            new Name("co2_factor"),
            new Min([new Name("Wc"), new Name("Wj"), new Name("Wp")]),
          ]),
          new Name("Rd"),
        ]),
        displayName: "A",
        unit: "umol m^-2 s^-1",
        texName: "A",
      })
      // Eqns 10 and 11 solved for the ambient CO₂ that gives this Ci:
      // g0 Ca² + (g1 A RH − g0 Ci − 160 A) Ca − g1 A RH Ci = 0
      .addAssignment("bb_b", {
        fn: new Minus([
          new Mul([new Name("g1"), new Name("A"), new Name("RH")]),
          new Add([
            new Mul([new Name("g0"), new Name("Ci")]),
            new Mul([new Num(160), new Name("A")]),
          ]),
        ]),
        unit: "mmol Pa m^-2 s^-1",
        texName: "b",
      })
      .addAssignment("Ca", {
        fn: new Divide([
          new Add([
            new Minus([new Name("bb_b")]),
            new Sqrt(
              new Max([
                new Add([
                  new Pow(new Name("bb_b"), new Num(2)),
                  new Mul([
                    new Num(4),
                    new Name("g0"),
                    new Name("g1"),
                    new Name("A"),
                    new Name("RH"),
                    new Name("Ci"),
                  ]),
                ]),
                new Num(0),
              ]),
              new Num(2),
            ),
          ]),
          new Mul([new Num(2), new Name("g0")]),
        ]),
        displayName: "Ca",
        unit: "Pa",
        texName: "C_a",
      })
      // Eqn 11
      .addAssignment("gs", {
        fn: new Add([
          new Name("g0"),
          new Divide([
            new Mul([new Name("g1"), new Name("A"), new Name("RH")]),
            new Name("Ca"),
          ]),
        ]),
        displayName: "gs",
        unit: "mmol m^-2 s^-1",
        texName: "g_s",
      })
      // Fig 2: dark respiration, fitted to Eqn 8 (not used by the model)
      .addAssignment("R_dark", {
        fn: arrhenius("Rdark"),
        displayName: "Dark respiration",
        unit: "umol m^-2 s^-1",
        texName: "R_{dark}",
      })
  );
}
