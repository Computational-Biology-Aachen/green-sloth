import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  Exp,
  Minus,
  Mul,
  Name,
  Num,
} from "@computational-biology-aachen/mxlweb-core/mathml";

/** Eqn 8: `scale · exp(c − ΔHa / (R Tk))`, with Table 1's `c` and `ΔHa`. */
function eqn8(name: string, scale?: string) {
  const value = new Exp(
    new Minus([
      new Name(`c_${name}`),
      new Divide([
        new Name(`dHa_${name}`),
        new Mul([new Name("R"), new Name("Tk")]),
      ]),
    ]),
  );
  return scale === undefined ? value : new Mul([new Name(scale), value]);
}

/** Table 1: scaling constant `c` and activation energy `ΔHa` (kJ mol⁻¹). */
const TABLE1: Array<[string, string, number, number]> = [
  ["Rd", "R_d", 18.72, 46.39],
  ["Vcmax", "V_{c,max}", 26.35, 65.33],
  ["Vomax", "V_{o,max}", 22.98, 60.11],
  ["Gamma_star", "\\Gamma^*", 19.02, 37.83],
  ["Kc", "K_c", 38.05, 79.43],
  ["Ko", "K_o", 20.3, 36.38],
];

export function initModel(): SteadyStateModelBuilder {
  let model = new SteadyStateModelBuilder()
    .addParameter("Ci", {
      value: 100,
      displayName: "Ci",
      unit: "umol mol^-1",
      texName: "C_i",
      slider: { min: "10", max: "1000", step: "5" },
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
      slider: { min: "10", max: "40", step: "0.5" },
    })
    // Rates at 25 °C of the lemon leaves of Fig 3, fitted to its modelled
    // values (the paper does not give them)
    .addParameter("Vcmax25", {
      value: 44.1,
      displayName: "Vcmax25",
      unit: "umol m^-2 s^-1",
      texName: "V_{c,max,25}",
      slider: { min: "0", max: "200", step: "0.5" },
    })
    .addParameter("Rd25", {
      value: 1.09,
      displayName: "Rd25",
      unit: "umol m^-2 s^-1",
      texName: "R_{d,25}",
      slider: { min: "0", max: "5", step: "0.01" },
    })
    .addParameter("R", {
      value: 0.008314,
      unit: "kJ K^-1 mol^-1",
      texName: "R",
    });
  for (const [name, tex, c, dHa] of TABLE1) {
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
      .addAssignment("Gamma_star", {
        fn: eqn8("Gamma_star"),
        displayName: "Gamma_star",
        unit: "umol mol^-1",
        texName: "\\Gamma^*",
      })
      .addAssignment("Kc", {
        fn: eqn8("Kc"),
        displayName: "Kc",
        unit: "umol mol^-1",
        texName: "K_c",
      })
      .addAssignment("Ko", {
        fn: eqn8("Ko"),
        displayName: "Ko",
        unit: "mmol mol^-1",
        texName: "K_o",
      })
      // Vc,max, Vo,max and Rd are relative to their value at 25 °C; Vo,max
      // relative to Vc,max at 25 °C (its function is 0.28 there)
      .addAssignment("Vcmax", {
        fn: eqn8("Vcmax", "Vcmax25"),
        displayName: "Vcmax",
        unit: "umol m^-2 s^-1",
        texName: "V_{c,max}",
      })
      .addAssignment("Vomax", {
        fn: eqn8("Vomax", "Vcmax25"),
        displayName: "Vomax",
        unit: "umol m^-2 s^-1",
        texName: "V_{o,max}",
      })
      .addAssignment("Rd", {
        fn: eqn8("Rd", "Rd25"),
        displayName: "Rd",
        unit: "umol m^-2 s^-1",
        texName: "R_d",
      })
      .addAssignment("Vomax_Vcmax", {
        fn: new Divide([new Name("Vomax"), new Name("Vcmax")]),
        displayName: "Vomax/Vcmax",
        unit: "dimensionless",
        texName: "V_{o,max}/V_{c,max}",
      })
      // Eqn 2
      .addAssignment("vc", {
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
        displayName: "vc",
        unit: "umol m^-2 s^-1",
        texName: "v_c",
      })
      // Eqn 3
      .addAssignment("vo", {
        fn: new Divide([
          new Mul([new Name("Vomax"), new Name("O")]),
          new Add([
            new Name("O"),
            new Mul([
              new Name("Ko"),
              new Add([
                new Num(1),
                new Divide([new Name("Ci"), new Name("Kc")]),
              ]),
            ]),
          ]),
        ]),
        displayName: "vo",
        unit: "umol m^-2 s^-1",
        texName: "v_o",
      })
      // Eqn 4: Rubisco-limited net assimilation
      .addAssignment("A", {
        fn: new Minus([
          new Mul([
            new Minus([
              new Num(1),
              new Divide([new Name("Gamma_star"), new Name("Ci")]),
            ]),
            new Name("vc"),
          ]),
          new Name("Rd"),
        ]),
        displayName: "A",
        unit: "umol m^-2 s^-1",
        texName: "A",
      })
  );
}
