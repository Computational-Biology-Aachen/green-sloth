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
import type { Base } from "@computational-biology-aachen/mxlweb-core/mathml";

const n = (name: string) => new Name(name);

/**
 * Eqns A6–A9: the smaller root of `A² + bA + c = 0`, the solution of Eqn 14
 * (A from Cc) with Eqn 15 (Cc = C − A/g). Here in mole fractions (C and Γ* in
 * µmol mol⁻¹, g in mol m⁻² s⁻¹), so `AP/g` is `A/g`. The paper's Ca and gt for
 * the A–I responses; Ci and gm (Eqn 15 with rb + rs + rm replaced by rm) for the
 * Laisk approach. This root is the one with Cc ≥ 0.
 */
function quadratic(C: string, g: string): Base {
  // Eqn A7, as −b
  const minusB = new Add([
    new Minus([n("I_prime"), n("Rd")]),
    new Mul([n(g), new Add([n(C), new Mul([new Num(2), n("Gamma_star")])])]),
  ]);
  // Eqn A8
  const c = new Minus([
    new Mul([n("I_prime"), n(g), new Minus([n(C), n("Gamma_star")])]),
    new Mul([
      n("Rd"),
      n(g),
      new Add([n(C), new Mul([new Num(2), n("Gamma_star")])]),
    ]),
  ]);
  return new Divide([
    new Minus([
      minusB,
      new Sqrt(
        new Minus([new Pow(minusB, new Num(2)), new Mul([new Num(4), c])]),
        new Num(2),
      ),
    ]),
    new Num(2),
  ]);
}

// Γ* over C, the ratio the paper writes its equations in
const ratio = (C: Base) => new Divide([n("Gamma_star"), C]);

export function initModel(): SteadyStateModelBuilder {
  return (
    new SteadyStateModelBuilder()
      // Environment. Table 1: 25 °C, Ca/P = 400 µmol mol⁻¹, O/P = 210 mmol mol⁻¹
      .addParameter("I", {
        value: 100,
        displayName: "I",
        unit: "umol m^-2 s^-1",
        texName: "I",
        slider: { min: "0", max: "400", step: "1" },
      })
      .addParameter("Ca", {
        value: 400,
        displayName: "Ca",
        unit: "umol mol^-1",
        texName: "C_a/P",
        slider: { min: "0", max: "2000", step: "10" },
      })
      // The Laisk approach (Fig 7): Ci/P held constant
      .addParameter("Ci", {
        value: 40.2,
        displayName: "Ci",
        unit: "umol mol^-1",
        texName: "C_i/P",
        slider: { min: "0", max: "400", step: "0.1" },
      })
      .addParameter("O", {
        value: 210,
        displayName: "O",
        unit: "mmol mol^-1",
        texName: "O/P",
        slider: { min: "0", max: "400", step: "5" },
      })
      .addParameter("T_leaf", {
        value: 25,
        displayName: "T_leaf",
        unit: "celsius",
        texName: "T",
        slider: { min: "5", max: "45", step: "0.5" },
      })
      // Table 1: atmospheric pressure
      .addParameter("P", {
        value: 100000,
        displayName: "P",
        unit: "Pa",
        texName: "P",
      })
      // Table 1 and Eqn 13: absorbed light not used effectively for A
      .addParameter("f", {
        value: 0.3,
        displayName: "f",
        unit: "dimensionless",
        texName: "f",
        slider: { min: "0", max: "0.9", step: "0.01" },
      })
      // Table 1: Rd = 1 µmol m⁻² s⁻¹ at 25 °C, independent of irradiance
      .addParameter("Rd_25", {
        value: 1,
        displayName: "Rd_25",
        unit: "umol m^-2 s^-1",
        texName: "R_{d,25}",
        slider: { min: "0", max: "4", step: "0.05" },
      })
      // Temperature response of Rd (Heskel et al. 2016):
      // ln Rd = a + 0.1012 T − 0.0005 T², with a set by Rd at 25 °C. T is in
      // °C, so the units are per °C (written as K, the same step)
      .addParameter("b_Rd", {
        value: 0.1012,
        displayName: "b_Rd",
        unit: "K^-1",
        texName: "b_{R_d}",
      })
      .addParameter("c_Rd", {
        value: 0.0005,
        displayName: "c_Rd",
        unit: "K^-2",
        texName: "c_{R_d}",
      })
      // Γ* = exp(c − ΔHa/(R Tk)) in Pa (Walker et al. 2013), at O/P = 210
      // mmol mol⁻¹: 40.2 µmol mol⁻¹ at 25 °C (Table 1)
      .addParameter("c_G", {
        value: 20.07,
        displayName: "c_G",
        unit: "dimensionless",
        texName: "c",
      })
      .addParameter("dHa_G", {
        value: 46.3,
        displayName: "dHa_G",
        unit: "kJ mol^-1",
        texName: "\\Delta H_a",
      })
      .addParameter("O_ref", {
        value: 210,
        displayName: "O_ref",
        unit: "mmol mol^-1",
        texName: "O_{ref}",
      })
      // Not printed: the gas constant
      .addParameter("R", {
        value: 8.314,
        displayName: "R",
        unit: "J K^-1 mol^-1",
        texName: "R",
      })
      // Eqn 19: gt = 0.001 + J/1840; a slope of 0 gives a constant gt
      .addParameter("gt_0", {
        value: 0.001,
        displayName: "gt_0",
        unit: "mol m^-2 s^-1",
        texName: "g_{t,0}",
        slider: { min: "0.0005", max: "0.05", step: "0.0005" },
      })
      .addParameter("gt_slope", {
        value: 1 / 1840,
        displayName: "gt_slope",
        unit: "mol umol^-1",
        texName: "s_{g_t}",
      })
      // Fig 2a: gm = 1.5 gs and gsw = 1.6 gs, boundary layer ignored
      .addParameter("gm_gs", {
        value: 1.5,
        displayName: "gm_gs",
        unit: "dimensionless",
        texName: "g_m/g_s",
      })
      // Eqn 17: n = I0.5/Ic, 6.6 in the detailed version (Results)
      .addParameter("n_half", {
        value: 6.6,
        displayName: "n_half",
        unit: "dimensionless",
        texName: "n",
        slider: { min: "1.1", max: "20", step: "0.1" },
      })
      .addAssignment("T_K", {
        fn: new Add([n("T_leaf"), new Num(273.15)]),
        displayName: "T_K",
        unit: "K",
        texName: "T_k",
      })
      .addAssignment("Rd", {
        fn: new Mul([
          n("Rd_25"),
          new Exp(
            new Minus([
              new Mul([n("b_Rd"), new Minus([n("T_leaf"), new Num(25)])]),
              new Mul([
                n("c_Rd"),
                new Minus([new Pow(n("T_leaf"), new Num(2)), new Num(625)]),
              ]),
            ]),
          ),
        ]),
        displayName: "Rd",
        unit: "umol m^-2 s^-1",
        texName: "R_d",
      })
      .addAssignment("Gamma_star_Pa", {
        fn: new Mul([
          new Exp(
            new Minus([
              n("c_G"),
              new Divide([
                new Mul([n("dHa_G"), new Num(1000)]),
                new Mul([n("R"), n("T_K")]),
              ]),
            ]),
          ),
          new Divide([n("O"), n("O_ref")]),
        ]),
        displayName: "Gamma_star_Pa",
        unit: "Pa",
        texName: "\\Gamma^*",
      })
      // Γ*/P in µmol mol⁻¹; Γ* ∝ O (Eqn 5)
      .addAssignment("Gamma_star", {
        fn: new Mul([
          new Divide([n("Gamma_star_Pa"), n("P")]),
          new Num(1000000),
        ]),
        displayName: "Gamma_star",
        unit: "umol mol^-1",
        texName: "\\Gamma^*/P",
      })
      // Eqn 13
      .addAssignment("J", {
        fn: new Divide([
          new Mul([n("I"), new Minus([new Num(1), n("f")])]),
          new Num(2),
        ]),
        displayName: "J",
        unit: "umol m^-2 s^-1",
        texName: "J",
      })
      // Eqn A12: I' = I(1 − f)/8 = J/4
      .addAssignment("I_prime", {
        fn: new Divide([n("J"), new Num(4)]),
        displayName: "I_prime",
        unit: "umol m^-2 s^-1",
        texName: "I'",
      })
      // Eqn 19
      .addAssignment("gt", {
        fn: new Add([n("gt_0"), new Mul([n("gt_slope"), n("J")])]),
        displayName: "gt",
        unit: "mol m^-2 s^-1",
        texName: "g_t",
      })
      // Fig 2a: 1/gt = 1/gs + 1/gm with gm = 1.5 gs
      .addAssignment("gs", {
        fn: new Mul([
          n("gt"),
          new Divide([new Add([new Num(1), n("gm_gs")]), n("gm_gs")]),
        ]),
        displayName: "gs",
        unit: "mol m^-2 s^-1",
        texName: "g_s",
      })
      .addAssignment("gm", {
        fn: new Mul([n("gm_gs"), n("gs")]),
        displayName: "gm",
        unit: "mol m^-2 s^-1",
        texName: "g_m",
      })
      .addAssignment("gsw", {
        fn: new Mul([new Num(1.6), n("gs")]),
        displayName: "gsw",
        unit: "mol m^-2 s^-1",
        texName: "g_{sw}",
      })
      // Eqn A9
      .addAssignment("A", {
        fn: quadratic("Ca", "gt"),
        displayName: "A",
        unit: "umol m^-2 s^-1",
        texName: "A",
      })
      // Eqn 15
      .addAssignment("Cc", {
        fn: new Minus([n("Ca"), new Divide([n("A"), n("gt")])]),
        displayName: "Cc",
        unit: "umol mol^-1",
        texName: "C_c/P",
      })
      // The Laisk approach: Eqn A9 with Ci for Ca and gm for gt
      .addAssignment("A_i", {
        fn: quadratic("Ci", "gm"),
        displayName: "A_i",
        unit: "umol m^-2 s^-1",
        texName: "A_{C_i}",
      })
      .addAssignment("Cc_i", {
        fn: new Minus([n("Ci"), new Divide([n("A_i"), n("gm")])]),
        displayName: "Cc_i",
        unit: "umol mol^-1",
        texName: "C_c/P (C_i)",
      })
      // The simplest version (Cc = Ca at Ic, 0.5 Ca at I0.5). Eqn 16
      .addAssignment("Ic", {
        fn: new Mul([
          new Divide([
            new Mul([new Num(8), n("Rd")]),
            new Minus([new Num(1), n("f")]),
          ]),
          new Divide([
            new Add([new Num(1), new Mul([new Num(2), ratio(n("Ca"))])]),
            new Minus([new Num(1), ratio(n("Ca"))]),
          ]),
        ]),
        displayName: "Ic",
        unit: "umol m^-2 s^-1",
        texName: "I_c",
      })
      // Eqn A1: the mean slope of phase 1, Rd/Ic
      .addAssignment("m1", {
        fn: new Divide([n("Rd"), n("Ic")]),
        displayName: "m1",
        unit: "mol mol^-1",
        texName: "m_1",
      })
      .addAssignment("I_half", {
        fn: new Mul([n("n_half"), n("Ic")]),
        displayName: "I_half",
        unit: "umol m^-2 s^-1",
        texName: "I_{0.5}",
      })
      // Eqn A2: Eqn 14 at I0.5, where Cc = 0.5 Ca
      .addAssignment("A_half", {
        fn: new Minus([
          new Mul([
            new Divide([
              new Mul([n("I_half"), new Minus([new Num(1), n("f")])]),
              new Num(8),
            ]),
            new Divide([
              new Minus([new Num(1), ratio(new Mul([new Num(0.5), n("Ca")]))]),
              new Add([
                new Num(1),
                new Mul([new Num(2), ratio(new Mul([new Num(0.5), n("Ca")]))]),
              ]),
            ]),
          ]),
          n("Rd"),
        ]),
        displayName: "A_half",
        unit: "umol m^-2 s^-1",
        texName: "A_{0.5}",
      })
      // Eqn A3: the mean slope of phase 2
      .addAssignment("m2", {
        fn: new Divide([
          n("A_half"),
          new Mul([new Minus([n("n_half"), new Num(1)]), n("Ic")]),
        ]),
        displayName: "m2",
        unit: "mol mol^-1",
        texName: "m_2",
      })
      // Eqn 17: the apparent inhibition of Rd, (1 − m2/m1) · 100 %
      .addAssignment("inhibition", {
        fn: new Mul([
          new Divide([n("n_half"), new Minus([n("n_half"), new Num(1)])]),
          new Minus([
            new Num(1),
            new Mul([
              new Divide([
                new Minus([new Num(1), new Mul([new Num(2), ratio(n("Ca"))])]),
                new Add([new Num(1), new Mul([new Num(4), ratio(n("Ca"))])]),
              ]),
              new Divide([
                new Add([new Num(1), new Mul([new Num(2), ratio(n("Ca"))])]),
                new Minus([new Num(1), ratio(n("Ca"))]),
              ]),
            ]),
          ]),
          new Num(100),
        ]),
        displayName: "inhibition",
        unit: "%",
        texName: "1 - m_2/m_1",
      })
  );
}
