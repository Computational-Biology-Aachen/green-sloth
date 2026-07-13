import names from "$lib/names";
import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  Exp,
  Ln,
  Max,
  Minus,
  Mul,
  Name,
  Num,
  Pow,
} from "@computational-biology-aachen/mxlweb-core/mathml";

export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("pH", { displayName: names.ph, value: 7.8, texName: "pH" })
    .addParameter("PPFD", {
      value: 100.0,
      displayName: names.ppfd,
      texName: "PPFD",
    })
    .addParameter("cPPFD", {
      value: 0.3333333333333333,
      texName: "cPPFD",
    })
    .addParameter("PSII_total", {
      displayName: names.psii_tot,
      value: 2.5,
      texName: "PSII\\_total",
    })
    .addParameter("PSI_total", {
      displayName: names.psi_tot,
      value: 2.5,
      texName: "PSI\\_total",
    })
    .addParameter("PQ_tot", {
      displayName: names.pq_tot,
      value: 17.5,
      texName: "PQ\\_tot",
    })
    .addParameter("PC_tot", {
      displayName: names.pc_tot,
      value: 4.0,
      texName: "PC\\_tot",
    })
    .addParameter("Fd_star", {
      displayName: names.fd_tot,
      value: 5.0,
      texName: "Fd*",
    })
    .addParameter("NADP_star", {
      displayName: names.nadp_tot,
      value: 25.0,
      texName: "NADP*",
    })
    .addParameter("A_star_P", {
      displayName: names.atp_tot,
      value: 60.0,
      texName: "A*P",
    })
    .addParameter("LHC_tot", {
      displayName: names.lhc_tot,
      value: 1.0,
      texName: "LHC\\_tot",
    })
    .addParameter("F", {
      displayName: names.faraday_constant,
      value: 96.485,
      texName: "F",
    })
    .addParameter("R", {
      displayName: names.gas_constant,
      value: 0.0083,
      texName: "R",
    })
    .addParameter("T", {
      displayName: names.temperature,
      value: 298.0,
      texName: "T",
    })
    .addParameter("bH", { displayName: names.b_h, value: 100.0, texName: "bH" })
    .addParameter("E0_QA", {
      displayName: names.e0_qa,
      value: -0.14,
      texName: "E^0\\_QA",
    })
    .addParameter("E0_PQ", {
      displayName: names.e0_pq,
      value: 0.354,
      texName: "E^0\\_PQ",
    })
    .addParameter("E0_PC", {
      displayName: names.e0_pc,
      value: 0.38,
      texName: "E^0\\_PC",
    })
    .addParameter("E0_P700", {
      displayName: names.e0_p700,
      value: 0.48,
      texName: "E^0\\_P700",
    })
    .addParameter("E0_FA", {
      displayName: names.e0_fa,
      value: -0.55,
      texName: "E^0\\_FA",
    })
    .addParameter("E0_Fd", {
      displayName: names.e0_fd,
      value: -0.43,
      texName: "E^0\\_Fd",
    })
    .addParameter("E0_NADP", {
      displayName: names.e0_nadp,
      value: -0.113,
      texName: "E^0\\_NADP",
    })
    .addParameter("kH0", {
      displayName: names.base_heat_dissipation_rate,
      value: 500000000.0,
      texName: "kH0",
    })
    .addParameter("kH", {
      displayName: names.npq_heat_dissipation_rate,
      value: 0.0,
      texName: "kH",
    })
    .addParameter("kF", {
      displayName: names.fluorescence_rate_constant,
      value: 62500000.0,
      texName: "kF",
    })
    .addParameter("k2", {
      displayName: names.psii_rate_constant,
      value: 1200000000.0,
      texName: "k2",
    })
    .addParameter("Q", {
      displayName: names.npq_coefficient,
      value: 0.0,
      texName: "Q",
    })
    .addParameter("staticAntI", {
      displayName: names.static_antenna_i,
      value: 0.2,
      texName: "staticAntI",
    })
    .addParameter("staticAntII", {
      displayName: names.static_antenna_ii,
      value: 0.0,
      texName: "staticAntII",
    })
    .addParameter("kf_atp_synthase", {
      displayName: names.kf_atp_synthase,
      value: 20.0,
      texName: "kf\\_atp\\_synthase",
    })
    .addParameter("kf_atp_consumption", {
      value: 10.0,
      texName: "kf\\_atp\\_consumption",
    })
    .addParameter("Pi_mol", {
      displayName: names.pi_mol,
      value: 0.01,
      texName: "Pi\\_mol",
    })
    .addParameter("DeltaG0_ATP", {
      displayName: names.delta_g0_atp,
      value: 30.6,
      texName: "DeltaG0\\_ATP",
    })
    .addParameter("HPR", {
      displayName: names.hpr,
      value: 4.666666666666667,
      texName: "HPR",
    })
    .addParameter("kf_nadph_consumption", {
      value: 15.0,
      texName: "kf\\_nadph\\_consumption",
    })
    .addParameter("kf_proton_leak", {
      displayName: names.kf_proton_leak,
      value: 0.01,
      texName: "kf\\_proton\\_leak",
    })
    .addParameter("kPQred", {
      displayName: names.k_pq_red,
      value: 250.0,
      texName: "kPQred",
    })
    .addParameter("kcat_b6f", {
      displayName: names.kcat_b6f,
      value: 2.5,
      texName: "kcat\\_b6f",
    })
    .addParameter("kPTOX", {
      displayName: names.k_ptox,
      value: 0.01,
      texName: "kPTOX",
    })
    .addParameter("kPCox", {
      displayName: names.k_pc_ox,
      value: 2500.0,
      texName: "kPCox",
    })
    .addParameter("kFdred", {
      displayName: names.k_fd_red,
      value: 250000.0,
      texName: "kFdred",
    })
    .addParameter("kcat_fnr", {
      displayName: names.kcat_fnr,
      value: 500.0,
      texName: "kcat\\_fnr",
    })
    .addParameter("E0_fnr", {
      displayName: names.e0_fnr,
      value: 3.0,
      texName: "E0\\_fnr",
    })
    .addParameter("km_fnr_Ferredoxine_reduced", {
      value: 1.56,
      texName: "km\\_fnr\\_Ferredoxine (reduced)",
    })
    .addParameter("km_fnr_NADP", {
      displayName: names.km_fnr_nadp,
      value: 0.22,
      texName: "km\\_fnr\\_NADP",
    })
    .addParameter("kf_cyclic_electron_flow", {
      displayName: names.kf_cyclic_electron_flow,
      value: 1.0,
      texName: "kf\\_cyclic\\_electron\\_flow",
    })
    .addParameter("O2_dissolved_lumen", {
      value: 8.0,
      texName: "O2 (dissolved)\\_lumen",
    })
    .addParameter("kf_ndh", {
      displayName: names.kf_ndh,
      value: 0.004,
      texName: "kf\\_ndh",
    })
    .addParameter("kStt7", {
      displayName: names.k_stt7,
      value: 0.0035,
      texName: "kStt7",
    })
    .addParameter("kPph1", {
      displayName: names.k_pph1,
      value: 0.0013,
      texName: "kPph1",
    })
    .addParameter("km_lhc_state_transition_12", {
      displayName: names.km_lhc_state_transition_12,
      value: 0.2,
      texName: "km\\_lhc\\_state\\_transition\\_12",
    })
    .addParameter("n_ST", {
      displayName: names.n_st,
      value: 2.0,
      texName: "n\\_ST",
    })
    .addVariable("Plastoquinone_oxidised", {
      displayName: names.pq,
      value: 17.5,
      texName: "Plastoquinone (oxidised)",
    })
    .addVariable("Plastocyanine_oxidised", {
      value: 0.0202,
      texName: "Plastocyanine (oxidised)",
    })
    .addVariable("Ferredoxine_oxidised", {
      displayName: names.fd_ox,
      value: 5.0,
      texName: "Ferredoxine (oxidised)",
    })
    .addVariable("ATP", { displayName: names.atp, value: 0.0, texName: "ATP" })
    .addVariable("NADPH", {
      displayName: names.nadph,
      value: 0.0,
      texName: "NADPH",
    })
    .addVariable("protons_lumen", {
      displayName: names.protons_lumen,
      value: 0.00025238293779207717,
      texName: "protons\\_lumen",
    })
    .addVariable("Light_minus_harvesting_complex", {
      value: 0.9,
      texName: "Light-harvesting complex",
    })
    .addAssignment("RT", {
      displayName: names.rt,
      fn: new Mul([new Name("R"), new Name("T")]),
      texName: "RT",
    })
    .addAssignment("dG_pH", {
      displayName: names.delta_g_ph,
      fn: new Mul([new Num(2.302585092994046), new Name("R"), new Name("T")]),
      texName: "dG\\_pH",
    })
    .addAssignment("pH_lumen", {
      displayName: names.ph_lumen,
      fn: new Minus([
        new Divide([
          new Ln(
            new Max([
              new Num(1e-14),
              new Mul([new Num(0.00025), new Name("protons_lumen")]),
            ]),
          ),
          new Ln(new Num(10.0)),
        ]),
      ]),
      texName: "pH\\_lumen",
    })
    .addAssignment("Plastoquinone_reduced", {
      displayName: names.pqh2,
      fn: new Add([
        new Name("PQ_tot"),
        new Minus([new Name("Plastoquinone_oxidised")]),
      ]),
      texName: "Plastoquinone (reduced)",
    })
    .addAssignment("Plastocyanine_reduced", {
      fn: new Add([
        new Name("PC_tot"),
        new Minus([new Name("Plastocyanine_oxidised")]),
      ]),
      texName: "Plastocyanine (reduced)",
    })
    .addAssignment("Ferredoxine_reduced", {
      displayName: names.fd_red,
      fn: new Add([
        new Name("Fd_star"),
        new Minus([new Name("Ferredoxine_oxidised")]),
      ]),
      texName: "Ferredoxine (reduced)",
    })
    .addAssignment("ADP", {
      displayName: names.adp,
      fn: new Add([new Name("A_star_P"), new Minus([new Name("ATP")])]),
      texName: "ADP",
    })
    .addAssignment("NADP", {
      displayName: names.nadp,
      fn: new Add([new Name("NADP_star"), new Minus([new Name("NADPH")])]),
      texName: "NADP",
    })
    .addAssignment("Light_minus_harvesting_complex_protonated", {
      fn: new Add([
        new Name("LHC_tot"),
        new Minus([new Name("Light_minus_harvesting_complex")]),
      ]),
      texName: "Light-harvesting complex (protonated)",
    })
    .addAssignment("PSII_cross_section", {
      displayName: names.psii_cross_section,
      fn: new Add([
        new Name("staticAntII"),
        new Mul([
          new Name("Light_minus_harvesting_complex"),
          new Add([
            new Num(1.0),
            new Minus([new Name("staticAntI")]),
            new Minus([new Name("staticAntII")]),
          ]),
        ]),
      ]),
      texName: "PSII\\_cross\\_section",
    })
    .addAssignment("keq_Plastoquinone_reduced", {
      fn: new Exp(
        new Divide([
          new Add([
            new Mul([new Num(2.0), new Name("E0_PQ"), new Name("F")]),
            new Minus([
              new Mul([new Num(2.0), new Name("E0_QA"), new Name("F")]),
            ]),
            new Minus([
              new Mul([new Num(2.0), new Name("dG_pH"), new Name("pH")]),
            ]),
          ]),
          new Name("RT"),
        ]),
      ),
      texName: "keq\\_Plastoquinone (reduced)",
    })
    .addAssignment("keq_atp_synthase", {
      displayName: names.keq_atp_synthase,
      fn: new Mul([
        new Name("Pi_mol"),
        new Exp(
          new Divide([
            new Add([
              new Minus([new Name("DeltaG0_ATP")]),
              new Mul([
                new Name("HPR"),
                new Name("dG_pH"),
                new Add([new Name("pH"), new Minus([new Name("pH_lumen")])]),
              ]),
            ]),
            new Name("RT"),
          ]),
        ),
      ]),
      texName: "keq\\_atp\\_synthase",
    })
    .addAssignment("keq_b6f", {
      displayName: names.keq_b6f,
      fn: new Exp(
        new Divide([
          new Add([
            new Mul([new Num(2.0), new Name("E0_PC"), new Name("F")]),
            new Mul([new Num(2.0), new Name("dG_pH"), new Name("pH_lumen")]),
            new Minus([
              new Mul([new Num(2.0), new Name("E0_PQ"), new Name("F")]),
            ]),
            new Minus([
              new Mul([
                new Num(2.0),
                new Name("dG_pH"),
                new Add([new Name("pH"), new Minus([new Name("pH_lumen")])]),
              ]),
            ]),
          ]),
          new Name("RT"),
        ]),
      ),
      texName: "keq\\_b6f",
    })
    .addAssignment("keq_fnr", {
      displayName: names.keq_fnr,
      fn: new Exp(
        new Divide([
          new Add([
            new Minus([new Mul([new Name("dG_pH"), new Name("pH")])]),
            new Mul([new Num(2.0), new Name("E0_NADP"), new Name("F")]),
            new Minus([
              new Mul([new Num(2.0), new Name("E0_Fd"), new Name("F")]),
            ]),
          ]),
          new Name("RT"),
        ]),
      ),
      texName: "keq\\_fnr",
    })
    .addAssignment("vmax_fnr", {
      displayName: names.vmax_fnr,
      fn: new Mul([new Name("E0_fnr"), new Name("kcat_fnr")]),
      texName: "vmax\\_fnr",
    })
    .addAssignment("keq_PCP700", {
      displayName: names.keq_pc_p700,
      fn: new Exp(
        new Divide([
          new Add([
            new Mul([new Name("E0_P700"), new Name("F")]),
            new Minus([new Mul([new Name("E0_PC"), new Name("F")])]),
          ]),
          new Name("RT"),
        ]),
      ),
      texName: "keq\\_PCP700",
    })
    .addAssignment("keq_ferredoxin_reductase", {
      displayName: names.keq_ferredoxin_reductase,
      fn: new Exp(
        new Divide([
          new Add([
            new Mul([new Name("E0_Fd"), new Name("F")]),
            new Minus([new Mul([new Name("E0_FA"), new Name("F")])]),
          ]),
          new Name("RT"),
        ]),
      ),
      texName: "keq\\_ferredoxin\\_reductase",
    })
    .addAssignment("A1", {
      displayName: names.a1,
      fn: new Divide([
        new Name("PSI_total"),
        new Add([
          new Num(1.0),
          new Mul([
            new Add([
              new Num(1.0),
              new Divide([
                new Name("Ferredoxine_reduced"),
                new Mul([
                  new Name("Ferredoxine_oxidised"),
                  new Name("keq_ferredoxin_reductase"),
                ]),
              ]),
            ]),
            new Add([
              new Divide([
                new Name("Plastocyanine_oxidised"),
                new Mul([
                  new Name("Plastocyanine_reduced"),
                  new Name("keq_PCP700"),
                ]),
              ]),
              new Divide([
                new Mul([
                  new Name("PPFD"),
                  new Name("cPPFD"),
                  new Add([
                    new Num(1.0),
                    new Minus([new Name("PSII_cross_section")]),
                  ]),
                ]),
                new Mul([new Name("Plastocyanine_reduced"), new Name("kPCox")]),
              ]),
            ]),
          ]),
          new Divide([
            new Mul([
              new Name("PPFD"),
              new Name("cPPFD"),
              new Add([
                new Num(1.0),
                new Minus([new Name("PSII_cross_section")]),
              ]),
            ]),
            new Mul([new Name("Ferredoxine_oxidised"), new Name("kFdred")]),
          ]),
        ]),
      ]),
      texName: "A1",
    })
    .addReaction("PSII", {
      displayName: names.r_psii,
      fn: new Mul([new Num(0.5), new Name("B1"), new Name("k2")]),
      stoichiometry: [
        { name: "Plastoquinone_oxidised", value: new Num(-1.0) },
        {
          name: "protons_lumen",
          value: new Divide([new Num(2.0), new Name("bH")]),
        },
      ],
      texName: "PSII",
    })
    .addReaction("PSI", {
      displayName: names.r_psi,
      fn: new Mul([
        new Name("A1"),
        new Name("PPFD"),
        new Name("cPPFD"),
        new Add([new Num(1.0), new Minus([new Name("PSII_cross_section")])]),
      ]),
      stoichiometry: [
        { name: "Ferredoxine_oxidised", value: new Num(-1.0) },
        { name: "Plastocyanine_oxidised", value: new Num(1.0) },
      ],
      texName: "PSI",
    })
    .addReaction("PTOX", {
      displayName: names.r_ptox,
      fn: new Mul([
        new Name("O2_dissolved_lumen"),
        new Name("Plastoquinone_reduced"),
        new Name("kPTOX"),
      ]),
      stoichiometry: [{ name: "Plastoquinone_oxidised", value: new Num(1.0) }],
      texName: "PTOX",
    })
    .addReaction("ndh", {
      displayName: names.r_ndh,
      fn: new Mul([new Name("Plastoquinone_oxidised"), new Name("kf_ndh")]),
      stoichiometry: [{ name: "Plastoquinone_oxidised", value: new Num(-1.0) }],
      texName: "ndh",
    })
    .addReaction("b6f", {
      displayName: names.r_b6f,
      fn: new Max([
        new Minus([new Name("kcat_b6f")]),
        new Mul([
          new Name("kcat_b6f"),
          new Add([
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Pow(new Name("Plastocyanine_oxidised"), new Num(2.0)),
            ]),
            new Minus([
              new Divide([
                new Mul([
                  new Name("Plastoquinone_oxidised"),
                  new Pow(new Name("Plastocyanine_reduced"), new Num(2.0)),
                ]),
                new Name("keq_b6f"),
              ]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "Plastocyanine_oxidised", value: new Num(-2.0) },
        { name: "Plastoquinone_oxidised", value: new Num(1.0) },
        {
          name: "protons_lumen",
          value: new Divide([new Num(4.0), new Name("bH")]),
        },
      ],
      texName: "b6f",
    })
    .addReaction("cyclic_electron_flow", {
      displayName: names.r_cyclic_electron_flow,
      fn: new Mul([
        new Name("Plastoquinone_oxidised"),
        new Name("kf_cyclic_electron_flow"),
        new Pow(new Name("Ferredoxine_reduced"), new Num(2.0)),
      ]),
      stoichiometry: [
        { name: "Plastoquinone_oxidised", value: new Num(-1.0) },
        { name: "Ferredoxine_oxidised", value: new Num(2.0) },
      ],
      texName: "cyclic\\_electron\\_flow",
    })
    .addReaction("fnr", {
      displayName: names.r_fnr,
      fn: new Divide([
        new Mul([
          new Name("vmax_fnr"),
          new Add([
            new Divide([
              new Mul([
                new Name("NADP"),
                new Pow(
                  new Divide([
                    new Name("Ferredoxine_reduced"),
                    new Name("km_fnr_Ferredoxine_reduced"),
                  ]),
                  new Num(2.0),
                ),
              ]),
              new Name("km_fnr_NADP"),
            ]),
            new Minus([
              new Divide([
                new Mul([
                  new Name("NADPH"),
                  new Pow(
                    new Divide([
                      new Name("Ferredoxine_oxidised"),
                      new Name("km_fnr_Ferredoxine_reduced"),
                    ]),
                    new Num(2.0),
                  ),
                ]),
                new Mul([new Name("keq_fnr"), new Name("km_fnr_NADP")]),
              ]),
            ]),
          ]),
        ]),
        new Add([
          new Num(-1.0),
          new Mul([
            new Add([
              new Num(1.0),
              new Divide([new Name("NADP"), new Name("km_fnr_NADP")]),
            ]),
            new Add([
              new Num(1.0),
              new Pow(
                new Divide([
                  new Name("Ferredoxine_reduced"),
                  new Name("km_fnr_Ferredoxine_reduced"),
                ]),
                new Num(2.0),
              ),
              new Divide([
                new Name("Ferredoxine_reduced"),
                new Name("km_fnr_Ferredoxine_reduced"),
              ]),
            ]),
          ]),
          new Mul([
            new Add([
              new Num(1.0),
              new Divide([new Name("NADPH"), new Name("km_fnr_NADP")]),
            ]),
            new Add([
              new Num(1.0),
              new Pow(
                new Divide([
                  new Name("Ferredoxine_oxidised"),
                  new Name("km_fnr_Ferredoxine_reduced"),
                ]),
                new Num(2.0),
              ),
              new Divide([
                new Name("Ferredoxine_oxidised"),
                new Name("km_fnr_Ferredoxine_reduced"),
              ]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "Ferredoxine_oxidised", value: new Num(2.0) },
        { name: "NADPH", value: new Num(1.0) },
      ],
      texName: "fnr",
    })
    .addReaction("proton_leak", {
      displayName: names.r_proton_leak,
      fn: new Mul([
        new Name("kf_proton_leak"),
        new Add([
          new Name("protons_lumen"),
          new Minus([
            new Mul([
              new Num(4000.0),
              new Pow(new Num(10.0), new Minus([new Name("pH")])),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        {
          name: "protons_lumen",
          value: new Minus([new Divide([new Num(1.0), new Name("bH")])]),
        },
      ],
      texName: "proton\\_leak",
    })
    .addReaction("lhc_state_transition_12", {
      displayName: names.r_lhc_state_transition_12,
      fn: new Divide([
        new Mul([
          new Num(1.0),
          new Name("Light_minus_harvesting_complex"),
          new Name("kStt7"),
        ]),
        new Add([
          new Num(1.0),
          new Pow(
            new Divide([
              new Name("Plastoquinone_oxidised"),
              new Mul([
                new Name("PQ_tot"),
                new Name("km_lhc_state_transition_12"),
              ]),
            ]),
            new Name("n_ST"),
          ),
        ]),
      ]),
      stoichiometry: [
        { name: "Light_minus_harvesting_complex", value: new Num(-1.0) },
      ],
      texName: "lhc\\_state\\_transition\\_12",
    })
    .addReaction("lhc_state_transition_21", {
      displayName: names.r_lhc_state_transition_21,
      fn: new Mul([
        new Name("Light_minus_harvesting_complex_protonated"),
        new Name("kPph1"),
      ]),
      stoichiometry: [
        { name: "Light_minus_harvesting_complex", value: new Num(1.0) },
      ],
      texName: "lhc\\_state\\_transition\\_21",
    })
    .addReaction("atp_synthase", {
      displayName: names.r_atp_synthase,
      fn: new Mul([
        new Name("kf_atp_synthase"),
        new Add([
          new Name("ADP"),
          new Minus([
            new Divide([new Name("ATP"), new Name("keq_atp_synthase")]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "ATP", value: new Num(1.0) },
        {
          name: "protons_lumen",
          value: new Minus([new Divide([new Name("HPR"), new Name("bH")])]),
        },
      ],
      texName: "atp\\_synthase",
    })
    .addReaction("atp_consumption", {
      fn: new Mul([new Name("ATP"), new Name("kf_atp_consumption")]),
      stoichiometry: [{ name: "ATP", value: new Num(-1.0) }],
      texName: "atp\\_consumption",
    })
    .addReaction("nadph_consumption", {
      fn: new Mul([new Name("NADPH"), new Name("kf_nadph_consumption")]),
      stoichiometry: [{ name: "NADPH", value: new Num(-1.0) }],
      texName: "nadph\\_consumption",
    })
    .addAssignment("B0", {
      displayName: names.b0,
      fn: new Divide([
        new Mul([
          new Name("PSII_total"),
          new Name("Plastoquinone_oxidised"),
          new Name("kPQred"),
          new Name("keq_Plastoquinone_reduced"),
          new Add([
            new Pow(new Name("kF"), new Num(2.0)),
            new Pow(new Name("kH0"), new Num(2.0)),
            new Mul([new Name("k2"), new Name("kF")]),
            new Mul([new Name("k2"), new Name("kH0")]),
            new Mul([
              new Pow(new Name("Q"), new Num(2.0)),
              new Pow(new Name("kH"), new Num(2.0)),
            ]),
            new Mul([new Num(2.0), new Name("kF"), new Name("kH0")]),
            new Mul([new Name("Q"), new Name("k2"), new Name("kH")]),
            new Mul([
              new Num(2.0),
              new Name("Q"),
              new Name("kF"),
              new Name("kH"),
            ]),
            new Mul([
              new Num(2.0),
              new Name("Q"),
              new Name("kH"),
              new Name("kH0"),
            ]),
          ]),
        ]),
        new Add([
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Name("k2"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("PSII_cross_section"), new Num(2.0)),
            new Pow(
              new Mul([new Name("PPFD"), new Name("cPPFD")]),
              new Num(2.0),
            ),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("kF"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kF"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kH0"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("cPPFD"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("cPPFD"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kH"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
        ]),
      ]),
      texName: "B0",
    })
    .addAssignment("B1", {
      displayName: names.b1,
      fn: new Divide([
        new Mul([
          new Name("PPFD"),
          new Name("PSII_cross_section"),
          new Name("PSII_total"),
          new Name("Plastoquinone_oxidised"),
          new Name("cPPFD"),
          new Name("kPQred"),
          new Name("keq_Plastoquinone_reduced"),
          new Add([
            new Name("kF"),
            new Name("kH0"),
            new Mul([new Name("Q"), new Name("kH")]),
          ]),
        ]),
        new Add([
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Name("k2"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("PSII_cross_section"), new Num(2.0)),
            new Pow(
              new Mul([new Name("PPFD"), new Name("cPPFD")]),
              new Num(2.0),
            ),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("kF"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kF"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kH0"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("cPPFD"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("cPPFD"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kH"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
        ]),
      ]),
      texName: "B1",
    })
    .addAssignment("B2", {
      displayName: names.b2,
      fn: new Divide([
        new Mul([
          new Name("PSII_total"),
          new Add([
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("kPQred"),
              new Pow(new Name("kF"), new Num(2.0)),
            ]),
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("kPQred"),
              new Pow(new Name("kH0"), new Num(2.0)),
            ]),
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("k2"),
              new Name("kF"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("k2"),
              new Name("kH0"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("kPQred"),
              new Pow(new Name("Q"), new Num(2.0)),
              new Pow(new Name("kH"), new Num(2.0)),
            ]),
            new Mul([
              new Num(2.0),
              new Name("Plastoquinone_reduced"),
              new Name("kF"),
              new Name("kH0"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("Q"),
              new Name("k2"),
              new Name("kH"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Num(2.0),
              new Name("Plastoquinone_reduced"),
              new Name("Q"),
              new Name("kF"),
              new Name("kH"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Num(2.0),
              new Name("Plastoquinone_reduced"),
              new Name("Q"),
              new Name("kH"),
              new Name("kH0"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Name("PPFD"),
              new Name("PSII_cross_section"),
              new Name("cPPFD"),
              new Name("k2"),
              new Name("kF"),
              new Name("keq_Plastoquinone_reduced"),
            ]),
            new Mul([
              new Name("PPFD"),
              new Name("PSII_cross_section"),
              new Name("cPPFD"),
              new Name("k2"),
              new Name("kH0"),
              new Name("keq_Plastoquinone_reduced"),
            ]),
            new Mul([
              new Name("PPFD"),
              new Name("PSII_cross_section"),
              new Name("Q"),
              new Name("cPPFD"),
              new Name("k2"),
              new Name("kH"),
              new Name("keq_Plastoquinone_reduced"),
            ]),
          ]),
        ]),
        new Add([
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Name("k2"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("PSII_cross_section"), new Num(2.0)),
            new Pow(
              new Mul([new Name("PPFD"), new Name("cPPFD")]),
              new Num(2.0),
            ),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("kF"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kF"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kH0"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("cPPFD"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("cPPFD"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kH"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
        ]),
      ]),
      texName: "B2",
    })
    .addAssignment("B3", {
      displayName: names.b3,
      fn: new Divide([
        new Mul([
          new Name("PPFD"),
          new Name("PSII_cross_section"),
          new Name("PSII_total"),
          new Name("cPPFD"),
          new Add([
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("k2"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("kF"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("kH0"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Name("Plastoquinone_reduced"),
              new Name("Q"),
              new Name("kH"),
              new Name("kPQred"),
            ]),
            new Mul([
              new Name("PPFD"),
              new Name("PSII_cross_section"),
              new Name("cPPFD"),
              new Name("k2"),
              new Name("keq_Plastoquinone_reduced"),
            ]),
          ]),
        ]),
        new Add([
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("kPQred"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Name("k2"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("PSII_cross_section"), new Num(2.0)),
            new Pow(
              new Mul([new Name("PPFD"), new Name("cPPFD")]),
              new Num(2.0),
            ),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("kF"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("cPPFD"),
            new Name("kH0"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kF"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kH0"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("cPPFD"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("cPPFD"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_reduced"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("kH"),
            new Name("kPQred"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("k2"),
            new Name("kH"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Plastoquinone_oxidised"),
            new Name("Q"),
            new Name("cPPFD"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_Plastoquinone_reduced"),
          ]),
        ]),
      ]),
      texName: "B3",
    })
    .addAssignment("PQ_red_div_tot", {
      fn: new Divide([new Name("Plastoquinone_reduced"), new Name("PQ_tot")]),
      texName: "PQ\\_red/tot",
    })
    .addAssignment("Fd_red_div_tot", {
      fn: new Divide([new Name("Ferredoxine_reduced"), new Name("Fd_star")]),
      texName: "Fd\\_red/tot",
    })
    .addAssignment("PC_red_div_tot", {
      fn: new Divide([new Name("Plastocyanine_reduced"), new Name("PC_tot")]),
      texName: "PC\\_red/tot",
    })
    .addAssignment("NADPH_div_tot", {
      fn: new Divide([new Name("NADPH"), new Name("NADP_star")]),
      texName: "NADPH/tot",
    })
    .addAssignment("ATP_div_tot", {
      fn: new Divide([new Name("ATP"), new Name("A_star_P")]),
      texName: "ATP/tot",
    })
    .addAssignment("Fluo", {
      displayName: names.fluorescence,
      fn: new Add([
        new Divide([
          new Mul([
            new Name("B0"),
            new Name("PSII_cross_section"),
            new Name("kF"),
          ]),
          new Add([
            new Name("k2"),
            new Name("kF"),
            new Name("kH"),
            new Name("kH0"),
          ]),
        ]),
        new Divide([
          new Mul([
            new Name("B2"),
            new Name("PSII_cross_section"),
            new Name("kF"),
          ]),
          new Add([new Name("kF"), new Name("kH"), new Name("kH0")]),
        ]),
      ]),
      texName: "Fluo",
    });
}
