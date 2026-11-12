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
} from "@computational-biology-aachen/mxlweb-core/mathml";

/** `((T − To) / Ω)²` of Eqn 2, with `T` in °C. */
function exponent(T: Name | Num) {
  return new Pow(
    new Divide([new Minus([T, new Name("To")]), new Name("Omega")]),
    new Num(2),
  );
}

export function initModel(): SteadyStateModelBuilder {
  return (
    new SteadyStateModelBuilder()
      .addParameter("T_leaf", {
        value: 25,
        displayName: "T_leaf",
        unit: "celsius",
        texName: "T_L",
        slider: { min: "0", max: "50", step: "0.5" },
      })
      // The leaf of Fig 1 (grown at 700 µmol mol⁻¹ CO₂, 20/15 °C, 16 mM NO₃⁻)
      .addParameter("J_To", {
        value: 257,
        displayName: "J(To)",
        unit: "umol m^-2 s^-1",
        texName: "J(T_o)",
        slider: { min: "0", max: "450", step: "1" },
      })
      .addParameter("To", {
        value: 33,
        displayName: "To",
        unit: "celsius",
        texName: "T_o",
        slider: { min: "15", max: "60", step: "0.1" },
      })
      .addParameter("Omega", {
        value: 23.8,
        displayName: "Omega",
        unit: "celsius",
        texName: "\\Omega",
        slider: { min: "5", max: "40", step: "0.1" },
      })
      // Eqn 1: irradiance on the leaf, leaf absorptance (high-N leaves) and the
      // spectral-imbalance correction
      .addParameter("I", {
        value: 1200,
        displayName: "I",
        unit: "umol m^-2 s^-1",
        texName: "I",
      })
      .addParameter("a", {
        value: 0.9,
        unit: "dimensionless",
        texName: "a",
      })
      .addParameter("f", {
        value: 0.15,
        unit: "dimensionless",
        texName: "f",
      })
      // Eqn 2
      .addAssignment("J", {
        fn: new Mul([
          new Name("J_To"),
          new Exp(new Minus([exponent(new Name("T_leaf"))])),
        ]),
        displayName: "J",
        unit: "umol m^-2 s^-1",
        texName: "J",
      })
      // Eqn 2 normalised to 1 at 25 °C (Fig 5)
      .addAssignment("J_rel25", {
        fn: new Exp(
          new Minus([exponent(new Num(25)), exponent(new Name("T_leaf"))]),
        ),
        displayName: "J/J(25)",
        unit: "dimensionless",
        texName: "J/J_{25}",
      })
      // Eqn 1 solved for the photochemical efficiency of PSII
      .addAssignment("phi_PSII", {
        fn: new Divide([
          new Mul([new Num(2), new Name("J")]),
          new Mul([
            new Name("I"),
            new Name("a"),
            new Minus([new Num(1), new Name("f")]),
          ]),
        ]),
        displayName: "phi_PSII",
        unit: "dimensionless",
        texName: "\\phi_{PSII}",
      })
      // Fig 4: the regression of Ω on To across species
      .addAssignment("Omega_regression", {
        fn: new Add([new Num(11.6), new Mul([new Num(0.18), new Name("To")])]),
        displayName: "Omega (regression)",
        unit: "celsius",
        texName: "\\Omega_{reg}",
      })
  );
}
