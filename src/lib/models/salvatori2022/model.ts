import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  LessThan,
  Minus,
  Mul,
  Name,
  Num,
  Piecewise,
} from "@computational-biology-aachen/mxlweb-core/mathml";

/**
 * Salvatori et al. (2022).
 *
 * DOI: 10.3389/fpls.2021.787877
 *
 * The Salvatori 2022 model is a soybean leaf C3 photosynthesis model, developed to investigate the effect of
 * fluctuating light on two soybean varients: Eiko (WT) and MinnGold (chlorophyll deficient mutant). The goal
 * was to investigate the role of the chlorophyll content to adjust to light fluctuations. It is a simple,
 * small model, only including the important processes for the goal of the study. As RuBisCO activation is
 * known to be the main limitation in dark-light transition, and stomal conductance is the same in both varients,
 * RuBisCO is included but stomatal conductance not. CBB is also not included as the focus lies on fluctuations, which
 * makes CBB irrelevant. Only light harvesting around PSII is included for simplicity, but represented as ETR,
 * that produces NADPH. The NADP+ to NADPH ratio determines the delta pH in the model, which activates RuBisCO.
 * In case of excess energy, energy can be dissipated through NPQ, here only qE, as it is the fastest responding
 * NPQ mechanism and the rest are irrelevant for the study. CEF is inlcuded only as a regulator of qE, as it is
 * described to be only relevant in stress conditions when delta pH generation, without NADPH production is necessary.
 */
export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("PAR", {
      value: 0.0,
      texName: "PAR",
    })
    .addParameter("alpha", {
      value: 0.78,
      texName: "alpha",
    })
    .addParameter("c_in", {
      value: 0.23,
      texName: "c\\_in",
    })
    .addParameter("Ec_PSII", {
      value: 157.56,
      texName: "Ec\\_PSII",
    })
    .addParameter("v_ETR", {
      value: 0.78,
      texName: "v\\_ETR",
    })
    .addParameter("v_d", {
      value: 0.08,
      texName: "v\\_d",
    })
    .addParameter("Qc", {
      value: 0.07,
      texName: "Qc",
    })
    .addParameter("v_NPQ", {
      value: 70.58,
      texName: "v\\_NPQ",
    })
    .addParameter("v_p", {
      value: 0.07,
      texName: "v\\_p",
    })
    .addParameter("v_C", {
      value: 11.75,
      texName: "v\\_C",
    })
    .addParameter("eta_NADPH", {
      value: 5.07,
      texName: "eta\\_NADPH",
    })
    .addParameter("eta_NADP", {
      value: 0.89,
      texName: "eta\\_NADP",
    })
    .addParameter("v_R", {
      value: 0.00089,
      texName: "v\\_R",
    })
    .addParameter("d", {
      value: 8.4,
      texName: "d",
    })
    .addParameter("c_y", {
      value: -4.0,
      texName: "c\\_y",
    })
    .addVariable("E_PSII", {
      value: 0.0,
      texName: "E\\_PSII",
    })
    .addVariable("Q", {
      value: 0.0,
      texName: "Q",
    })
    .addVariable("P_NPQ", {
      value: 0.0,
      texName: "P\\_NPQ",
    })
    .addVariable("NADP", {
      value: 5.0,
      texName: "NADP",
    })
    .addVariable("NADPH", {
      value: 5.0,
      texName: "NADPH",
    })
    .addVariable("R", {
      value: 0.001,
      texName: "R",
    })
    .addAssignment("pH", {
      fn: new Divide([new Name("NADPH"), new Name("NADP")]),
      texName: "pH",
    })
    .addAssignment("ETR", {
      fn: new Mul([new Name("E_PSII"), new Name("NADP"), new Name("v_ETR")]),
      texName: "ETR",
    })
    .addAssignment("A", {
      fn: new Mul([new Name("NADPH"), new Name("R"), new Name("v_C")]),
      texName: "A",
    })
    .addReaction("Energy_input", {
      fn: new Mul([
        new Name("PAR"),
        new Name("alpha"),
        new Name("c_in"),
        new Add([
          new Num(1.0),
          new Minus([new Divide([new Name("E_PSII"), new Name("Ec_PSII")])]),
        ]),
      ]),
      stoichiometry: [{ name: "E_PSII", value: new Num(1.0) }],
      texName: "Energy\\_input",
    })
    .addReaction("ETR_out", {
      fn: new Mul([new Name("E_PSII"), new Name("NADP"), new Name("v_ETR")]),
      stoichiometry: [{ name: "E_PSII", value: new Num(-1.0) }],
      texName: "ETR\\_out",
    })
    .addReaction("ETR_in", {
      fn: new Mul([
        new Name("E_PSII"),
        new Name("NADP"),
        new Name("eta_NADP"),
        new Name("v_ETR"),
      ]),
      stoichiometry: [
        { name: "NADP", value: new Num(-1.0) },
        { name: "NADPH", value: new Num(1.0) },
      ],
      texName: "ETR\\_in",
    })
    .addReaction("energy_dissipation", {
      fn: new Mul([
        new Name("E_PSII"),
        new Name("P_NPQ"),
        new Name("v_d"),
        new Add([
          new Num(1.0),
          new Minus([new Divide([new Name("Q"), new Name("Qc")])]),
        ]),
      ]),
      stoichiometry: [
        { name: "E_PSII", value: new Num(-1.0) },
        { name: "Q", value: new Num(1.0) },
      ],
      texName: "energy\\_dissipation",
    })
    .addReaction("NPQ", {
      fn: new Mul([new Name("Q"), new Name("v_NPQ")]),
      stoichiometry: [{ name: "Q", value: new Num(-1.0) }],
      texName: "NPQ",
    })
    .addReaction("NPQ_activation", {
      fn: new Piecewise([
        new Mul([
          new Name("v_p"),
          new Add([new Num(1.0), new Minus([new Name("P_NPQ")])]),
        ]),
        new LessThan([
          new Name("c_y"),
          new Add([
            new Minus([
              new Mul([
                new Name("E_PSII"),
                new Name("NADP"),
                new Name("v_ETR"),
              ]),
            ]),
            new Mul([
              new Name("PAR"),
              new Name("alpha"),
              new Name("c_in"),
              new Add([
                new Num(1.0),
                new Minus([
                  new Divide([new Name("E_PSII"), new Name("Ec_PSII")]),
                ]),
              ]),
            ]),
          ]),
        ]),
        new Num(0.0),
      ]),
      stoichiometry: [{ name: "P_NPQ", value: new Num(1.0) }],
      texName: "NPQ\\_activation",
    })
    .addReaction("Carbon_assimilation", {
      fn: new Mul([
        new Name("NADPH"),
        new Name("R"),
        new Name("eta_NADPH"),
        new Name("v_C"),
      ]),
      stoichiometry: [
        { name: "NADPH", value: new Num(-1.0) },
        { name: "NADP", value: new Num(1.0) },
      ],
      texName: "Carbon\\_assimilation",
    })
    .addReaction("RuBisCO_activation", {
      fn: new Mul([
        new Name("d"),
        new Name("v_R"),
        new Add([new Num(1.0), new Minus([new Name("R")])]),
      ]),
      stoichiometry: [{ name: "R", value: new Num(1.0) }],
      texName: "RuBisCO\\_activation",
    });
}
