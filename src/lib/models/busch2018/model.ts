import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  type Base,
  Divide,
  GreaterThan,
  LessEqual,
  Max,
  Min,
  Minus,
  Mul,
  Name,
  Num,
  Piecewise,
} from "@computational-biology-aachen/mxlweb-core/mathml";

const n = (x: string) => new Name(x);
const RATE = "umol m^-2 s^-1";

/** The three limitations, each with its own effective αG and αS. */
const LIMITS = ["c", "j", "p"] as const;
type Limit = (typeof LIMITS)[number];

/** `min{αmax, x}`, Eqns 16–21. */
function capped(max: string, x: Base): Base {
  return new Min([n(max), x]);
}

/** Γ*_αG = 0.5 (1 − αG) O / S_c/o (Eqn 12), with O converted from kPa to Pa. */
function gammaStar(aG: string): Base {
  return new Divide([
    new Mul([new Num(500), new Minus([new Num(1), n(aG)]), n("O")]),
    n("S_co"),
  ]);
}

/** W (1 − Γ*_αG / C) − Rd, Eqn 11 for one limiting rate. */
function netRate(w: string, gamma: string): Base {
  return new Minus([
    new Mul([n(w), new Minus([new Num(1), new Divide([n(gamma), n("C")])])]),
    n("Rd"),
  ]);
}

/** The value of `x_<limit>` of the limitation that sets A (the minimum). */
function effective(x: string): Base {
  return new Piecewise([
    n(`${x}_c`),
    new LessEqual([n("Ac"), n("A")]),
    n(`${x}_j`),
    new LessEqual([n("Aj"), n("A")]),
    n(`${x}_p`),
  ]);
}

export function initModel(): SteadyStateModelBuilder {
  // Defaults: the fit of Fig 3a (KNO₃-fertilised sunflower, 25 °C, gm assumed
  // infinite so C = Ci).
  let model = new SteadyStateModelBuilder()
    .addParameter("C", {
      value: 40,
      displayName: "C",
      unit: "Pa",
      texName: "C",
      slider: { min: "5", max: "200", step: "1" },
    })
    // 21 % of about 94 kPa (Canberra), fitted to Fig 3b's N-limit kink
    .addParameter("O", {
      value: 19.7,
      displayName: "O",
      unit: "kPa",
      texName: "O",
      slider: { min: "0.2", max: "40", step: "0.2" },
    })
    .addParameter("Vcmax", {
      value: 103.9,
      displayName: "Vcmax",
      unit: RATE,
      texName: "V_{c,max}",
      slider: { min: "20", max: "200", step: "0.5" },
    })
    .addParameter("J", {
      value: 185.2,
      displayName: "J",
      unit: RATE,
      texName: "J",
      slider: { min: "10", max: "400", step: "1" },
    })
    // Rate of triose phosphate export from the chloroplast, Eqn 14
    .addParameter("Tp", {
      value: 11.5,
      displayName: "Tp",
      unit: RATE,
      texName: "T_p",
      slider: { min: "2", max: "25", step: "0.1" },
    })
    .addParameter("Rd", {
      value: 1.29,
      displayName: "Rd",
      unit: RATE,
      texName: "R_d",
      slider: { min: "0", max: "5", step: "0.05" },
    })
    // Upper bounds of the fractions of photorespiratory carbon exported as
    // glycine and serine (0 ≤ αGmax + 4/3 αSmax ≤ 1), and the maximum rate of
    // de novo N supply to the chloroplast
    .addParameter("alpha_G_max", {
      value: 0.09,
      displayName: "alpha_G_max",
      unit: "dimensionless",
      texName: "\\alpha_G^{max}",
      slider: { min: "0", max: "1", step: "0.01" },
    })
    .addParameter("alpha_S_max", {
      value: 0.38,
      displayName: "alpha_S_max",
      unit: "dimensionless",
      texName: "\\alpha_S^{max}",
      slider: { min: "0", max: "0.75", step: "0.01" },
    })
    .addParameter("N_max", {
      value: 1.21,
      displayName: "N_max",
      unit: RATE,
      texName: "N^{max}",
      slider: { min: "0", max: "5", step: "0.01" },
    })
    // Not printed. The values of the fitting tool the paper uses (Sharkey et
    // al. 2007, 25 °C); see curatornotes.md
    .addParameter("Kc", {
      value: 27.238,
      displayName: "Kc",
      unit: "Pa",
      texName: "K_c",
    })
    .addParameter("Ko", {
      value: 16.582,
      displayName: "Ko",
      unit: "kPa",
      texName: "K_o",
    })
    // Relative specificity of Rubisco, from Sharkey et al.'s Γ* = 3.743 Pa at
    // 21 kPa O₂ via Eqn 3: S_c/o = 0.5 O / Γ*
    .addParameter("S_co", {
      value: 2805.236441357201,
      displayName: "S_co",
      unit: "dimensionless",
      texName: "S_{c/o}",
    });

  model = model
    // Eqn 2: Φ = Vo/Vc = O / (S_c/o C), O from kPa to Pa
    .addAssignment("Phi", {
      fn: new Divide([
        new Mul([new Num(1000), n("O")]),
        new Mul([n("S_co"), n("C")]),
      ]),
      displayName: "Phi",
      unit: "dimensionless",
      texName: "\\Phi",
    })
    // Eqn 3, without N assimilation
    .addAssignment("Gamma_star", {
      fn: new Divide([new Mul([new Num(500), n("O")]), n("S_co")]),
      displayName: "Gamma_star",
      unit: "Pa",
      texName: "\\Gamma^*",
    })
    // Eqn 15, the proportion of N assimilated as glycine (0 without export)
    .addAssignment("beta", {
      fn: new Divide([
        new Mul([new Num(3), n("alpha_G_max")]),
        new Max([
          new Add([
            new Mul([new Num(3), n("alpha_G_max")]),
            new Mul([new Num(2), n("alpha_S_max")]),
          ]),
          new Num(1e-12),
        ]),
      ]),
      displayName: "beta",
      unit: "dimensionless",
      texName: "\\beta",
    })
    // ---- Rubisco limitation
    // Eqn 6
    .addAssignment("Wc", {
      fn: new Divide([
        new Mul([n("Vcmax"), n("C")]),
        new Add([
          n("C"),
          new Mul([
            n("Kc"),
            new Add([new Num(1), new Divide([n("O"), n("Ko")])]),
          ]),
        ]),
      ]),
      displayName: "Wc",
      unit: RATE,
      texName: "W_c",
    })
    // Eqn S4: Vo^c = Wc Φ
    .addAssignment("Vo_c", {
      fn: new Mul([n("Wc"), n("Phi")]),
      displayName: "Vo_c",
      unit: RATE,
      texName: "V_o^c",
    })
    // Eqn 16
    .addAssignment("alpha_G_c", {
      fn: capped(
        "alpha_G_max",
        new Divide([new Mul([n("N_max"), n("beta")]), n("Vo_c")]),
      ),
      displayName: "alpha_G_c",
      unit: "dimensionless",
      texName: "\\alpha_G^c",
    })
    // Eqn 17
    .addAssignment("alpha_S_c", {
      fn: capped(
        "alpha_S_max",
        new Divide([
          new Mul([new Num(3), n("N_max"), new Minus([new Num(1), n("beta")])]),
          new Mul([new Num(2), n("Vo_c")]),
        ]),
      ),
      displayName: "alpha_S_c",
      unit: "dimensionless",
      texName: "\\alpha_S^c",
    });

  // ---- RuBP regeneration limitation
  // J − N^max (2β + 6): Eqns 18 and 19 apply the N-supply limit only above 0
  const jSurplus = new Minus([
    n("J"),
    new Mul([
      n("N_max"),
      new Add([new Mul([new Num(2), n("beta")]), new Num(6)]),
    ]),
  ]);
  const invPhiPlus1 = new Add([new Divide([new Num(1), n("Phi")]), new Num(1)]);
  model = model
    // Eqn 18
    .addAssignment("alpha_G_j", {
      fn: new Piecewise([
        capped(
          "alpha_G_max",
          new Divide([
            new Mul([new Num(4), n("N_max"), n("beta"), invPhiPlus1]),
            jSurplus,
          ]),
        ),
        new GreaterThan([jSurplus, new Num(0)]),
        n("alpha_G_max"),
      ]),
      displayName: "alpha_G_j",
      unit: "dimensionless",
      texName: "\\alpha_G^j",
    })
    // Eqn 19
    .addAssignment("alpha_S_j", {
      fn: new Piecewise([
        capped(
          "alpha_S_max",
          new Divide([
            new Mul([
              new Num(6),
              n("N_max"),
              new Minus([new Num(1), n("beta")]),
              invPhiPlus1,
            ]),
            jSurplus,
          ]),
        ),
        new GreaterThan([jSurplus, new Num(0)]),
        n("alpha_S_max"),
      ]),
      displayName: "alpha_S_j",
      unit: "dimensionless",
      texName: "\\alpha_S^j",
    })
    // Eqn 13, N supplied as NO₃⁻
    .addAssignment("Wj", {
      fn: new Divide([
        n("J"),
        new Add([
          new Num(4),
          new Mul([
            new Add([
              new Num(4),
              new Mul([new Num(8), n("alpha_G_j")]),
              new Mul([new Num(4), n("alpha_S_j")]),
            ]),
            n("Phi"),
          ]),
        ]),
      ]),
      displayName: "Wj",
      unit: RATE,
      texName: "W_j",
    })
    // Eqn S5: Vo^j = Wj Φ
    .addAssignment("Vo_j", {
      fn: new Mul([n("Wj"), n("Phi")]),
      displayName: "Vo_j",
      unit: RATE,
      texName: "V_o^j",
    });

  // ---- TPU limitation
  // N^max (2/Φ − 1) / (6 Tp + 3 N^max (2 − β)), shared by Eqns 20 and 21
  const tpuSupply = new Divide([
    new Mul([
      n("N_max"),
      new Minus([new Divide([new Num(2), n("Phi")]), new Num(1)]),
    ]),
    new Add([
      new Mul([new Num(6), n("Tp")]),
      new Mul([new Num(3), n("N_max"), new Minus([new Num(2), n("beta")])]),
    ]),
  ]);
  model = model
    // Eqn 20
    .addAssignment("alpha_G_p", {
      fn: capped("alpha_G_max", new Mul([n("beta"), tpuSupply])),
      displayName: "alpha_G_p",
      unit: "dimensionless",
      texName: "\\alpha_G^p",
    })
    // Eqn 21
    .addAssignment("alpha_S_p", {
      fn: capped(
        "alpha_S_max",
        new Mul([new Num(1.5), new Minus([new Num(1), n("beta")]), tpuSupply]),
      ),
      displayName: "alpha_S_p",
      unit: "dimensionless",
      texName: "\\alpha_S^p",
    })
    // Eqn 14. TPU can't limit where the denominator is ≤ 0 (Wp unbounded).
    .addAssignment("Wp", {
      fn: new Divide([
        new Mul([new Num(3), n("Tp")]),
        new Max([
          new Minus([
            new Num(1),
            new Mul([
              new Num(0.5),
              new Add([
                new Num(1),
                new Mul([new Num(3), n("alpha_G_p")]),
                new Mul([new Num(4), n("alpha_S_p")]),
              ]),
              n("Phi"),
            ]),
          ]),
          new Num(1e-12),
        ]),
      ]),
      displayName: "Wp",
      unit: RATE,
      texName: "W_p",
    })
    // Eqn S8: Vo^p = Wp Φ
    .addAssignment("Vo_p", {
      fn: new Mul([n("Wp"), n("Phi")]),
      displayName: "Vo_p",
      unit: RATE,
      texName: "V_o^p",
    });

  // ---- Net assimilation, Eqns 11 and 12, each limitation with its own αG
  const W: Record<Limit, string> = { c: "Wc", j: "Wj", p: "Wp" };
  for (const l of LIMITS) {
    model = model
      .addAssignment(`Gamma_star_${l}`, {
        fn: gammaStar(`alpha_G_${l}`),
        displayName: `Gamma_star_${l}`,
        unit: "Pa",
        texName: `\\Gamma^*_{\\alpha_G,${l}}`,
      })
      .addAssignment(`A${l}`, {
        fn: netRate(W[l], `Gamma_star_${l}`),
        displayName: `A${l}`,
        unit: RATE,
        texName: `A_${l}`,
      });
  }

  return (
    model
      .addAssignment("A", {
        fn: new Min([n("Ac"), n("Aj"), n("Ap")]),
        displayName: "A",
        unit: RATE,
        texName: "A",
      })
      // The effective values of the limitation that sets A (Fig 3b, Fig S4)
      .addAssignment("alpha_G", {
        fn: effective("alpha_G"),
        displayName: "alpha_G",
        unit: "dimensionless",
        texName: "\\alpha_G",
      })
      .addAssignment("alpha_S", {
        fn: effective("alpha_S"),
        displayName: "alpha_S",
        unit: "dimensionless",
        texName: "\\alpha_S",
      })
      .addAssignment("alpha_total", {
        fn: new Add([n("alpha_G"), n("alpha_S")]),
        displayName: "alpha_total",
        unit: "dimensionless",
        texName: "\\alpha_{total}",
      })
      .addAssignment("Vo", {
        fn: effective("Vo"),
        displayName: "Vo",
        unit: RATE,
        texName: "V_o",
      })
      // N_G = αG Vo and N_S = 2/3 αS Vo (Fig 1)
      .addAssignment("N_G", {
        fn: new Mul([n("alpha_G"), n("Vo")]),
        displayName: "N_G",
        unit: RATE,
        texName: "N_G",
      })
      .addAssignment("N_S", {
        fn: new Mul([
          new Divide([new Num(2), new Num(3)]),
          n("alpha_S"),
          n("Vo"),
        ]),
        displayName: "N_S",
        unit: RATE,
        texName: "N_S",
      })
      .addAssignment("N_total", {
        fn: new Add([n("N_G"), n("N_S")]),
        displayName: "N_total",
        unit: RATE,
        texName: "N_{total}",
      })
      // Eqn 9: the electron transport rate that supports Vc = Vo/Φ
      .addAssignment("Ja", {
        fn: new Mul([
          new Add([
            new Num(4),
            new Mul([
              new Add([
                new Num(4),
                new Mul([new Num(8), n("alpha_G")]),
                new Mul([new Num(4), n("alpha_S")]),
              ]),
              n("Phi"),
            ]),
          ]),
          new Divide([n("Vo"), n("Phi")]),
        ]),
        displayName: "Ja",
        unit: RATE,
        texName: "J_a",
      })
  );
}
