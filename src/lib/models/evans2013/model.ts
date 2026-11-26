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

const n = (name: string) => new Name(name);

/** `273 + T`, the absolute temperature as Eqns 15–17 print it. */
const tk = () => new Add([new Num(273), n("T_leaf")]);

export function initModel(): SteadyStateModelBuilder {
  return (
    new SteadyStateModelBuilder()
      .addParameter("T_leaf", {
        value: 25,
        displayName: "T_leaf",
        unit: "celsius",
        texName: "T",
        slider: { min: "5", max: "45", step: "0.5" },
      })
      // Eqn 15: ρH at 25 °C and the temperature coefficient of the solubility
      .addParameter("rhoH25", {
        value: 33.06,
        displayName: "rhoH25",
        unit: "mol m^-3 bar^-1",
        texName: "\\rho H_{25}",
      })
      .addParameter("T_H", {
        value: 2400,
        displayName: "T_H",
        unit: "K",
        texName: "T_H",
      })
      // Eqn 16: diffusivity of CO₂ in water, pre-exponential factor and
      // activation energy
      .addParameter("D0", {
        value: 1.81e-6,
        displayName: "D0",
        unit: "m^2 s^-1",
        texName: "D_0",
      })
      .addParameter("E_D", {
        value: 16900,
        displayName: "E_D",
        unit: "J mol^-1",
        texName: "E_D",
      })
      // Eqn 16: R = 8.314 J K⁻¹ mol⁻¹
      .addParameter("R", {
        value: 8.314,
        displayName: "R",
        unit: "J K^-1 mol^-1",
        texName: "\\mathcal{R}",
      })
      // Results, after Eqn 16: effective liquid path length 1.5 µm and
      // chloroplast surface area appressed to the airspace, Sc = 22 m² m⁻²
      .addParameter("l", {
        value: 1.5,
        displayName: "l",
        unit: "um",
        texName: "l",
        slider: { min: "0.5", max: "5", step: "0.05" },
      })
      .addParameter("Sc", {
        value: 22,
        displayName: "Sc",
        unit: "m^2 m^-2",
        texName: "S_c",
        slider: { min: "5", max: "40", step: "0.5" },
      })
      // Eqn 17 and the text after it: gmem = 1.03 mol m⁻² s⁻¹ bar⁻¹ at 25 °C,
      // E = 50 kJ mol⁻¹ (osmotic water permeability of wheat root membranes)
      .addParameter("gmem25", {
        value: 1.03,
        displayName: "gmem25",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g_{mem,25}",
        slider: { min: "0.1", max: "5", step: "0.01" },
      })
      .addParameter("E_mem", {
        value: 50000,
        displayName: "E_mem",
        unit: "J mol^-1",
        texName: "E",
        slider: { min: "0", max: "100000", step: "1000" },
      })
      // Fig 5: regression of gm (normalised to 25 °C) on leaf temperature for
      // all leaves measured in 2 % O₂, y = −0.26 + 0.051 T; gm at 25 °C was
      // 0.57 mol m⁻² s⁻¹ bar⁻¹ in 2 % O₂ (0.48, with y = −0.44 + 0.058 T, in
      // 21 % O₂)
      .addParameter("gm25_lin", {
        value: 0.57,
        displayName: "gm25_lin",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g_{m,25}",
        slider: { min: "0.05", max: "2", step: "0.01" },
      })
      .addParameter("a_lin", {
        value: -0.26,
        displayName: "a_lin",
        unit: "dimensionless",
        texName: "a",
      })
      .addParameter("b_lin", {
        value: 0.051,
        displayName: "b_lin",
        unit: "celsius^-1",
        texName: "b",
      })
      // Eqn 15: ρH = 33.06 exp{2400 [1/(273 + T) − 1/298]}, the solubility of
      // CO₂ in water
      .addAssignment("rhoH", {
        fn: new Mul([
          n("rhoH25"),
          new Exp(
            new Mul([
              n("T_H"),
              new Minus([
                new Divide([new Num(1), tk()]),
                new Divide([new Num(1), new Num(298)]),
              ]),
            ]),
          ),
        ]),
        displayName: "rhoH",
        unit: "mol m^-3 bar^-1",
        texName: "\\rho H",
      })
      // Eqn 16: D = 1.81 × 10⁻⁶ exp[−16900 / (R (273 + T))]
      .addAssignment("D", {
        fn: new Mul([
          n("D0"),
          new Exp(new Divide([new Minus([n("E_D")]), new Mul([n("R"), tk()])])),
        ]),
        displayName: "D",
        unit: "m^2 s^-1",
        texName: "D",
      })
      // Eqn 14: gliq = ρHD/l per chloroplast area, times Sc for a leaf-area
      // basis (0.96 mol m⁻² s⁻¹ bar⁻¹ at 25 °C, Results); l is in µm
      .addAssignment("g_liq", {
        fn: new Divide([
          new Mul([n("rhoH"), n("D"), n("Sc")]),
          new Mul([n("l"), new Num(1e-6)]),
        ]),
        displayName: "g_liq",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g_{liq}",
      })
      // Eqn 17: gmem = gmem(25 °C) exp{(T − 25) E / [R 298 (273 + T)]}
      .addAssignment("g_mem", {
        fn: new Mul([
          n("gmem25"),
          new Exp(
            new Divide([
              new Mul([new Minus([n("T_leaf"), new Num(25)]), n("E_mem")]),
              new Mul([n("R"), new Num(298), tk()]),
            ]),
          ),
        ]),
        displayName: "g_mem",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g_{mem}",
      })
      // Eqn 13: 1/gm = 1/gliq + 1/gmem, liquid phase and membranes in series
      .addAssignment("gm", {
        fn: new Divide([
          new Mul([n("g_liq"), n("g_mem")]),
          new Add([n("g_liq"), n("g_mem")]),
        ]),
        displayName: "gm",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g_m",
      })
      // Fig 5: the measured, linear temperature response of gm
      .addAssignment("gm_lin", {
        fn: new Mul([
          n("gm25_lin"),
          new Add([n("a_lin"), new Mul([n("b_lin"), n("T_leaf")])]),
        ]),
        displayName: "gm_lin",
        unit: "mol m^-2 s^-1 bar^-1",
        texName: "g_{m,lin}",
      })
  );
}
