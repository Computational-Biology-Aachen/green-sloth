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

/**
 * Matuszyńska (2016 PhD) extended chloroplast model with PSI and lumenal pH.
 *
 * Extends the NPQ model to include PSI electron transport (P700, Fd, NADPH) and
 * explicit lumenal pH dynamics. Carotenoid pool and LHC antenna switching couple
 * photoprotection to the redox state of both photosystems. Supports PAM protocol.
 *
 * Variables: PSII states, PQ, PSI, Fd, NADPH, lumenal H⁺, PsbS_p, xanthophylls
 * Parameters: PPFD, pH, nadph, E°_PC/P700/FA/Fd/NADP, Carotenoids_tot, LHC_tot…
 * Ref: Matuszyńska PhD thesis (2016), RWTH Aachen University
 */
export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("pH", { displayName: names.ph, value: 7.9, texName: "pH" })
    .addParameter("PPFD", {
      value: 100.0,
      displayName: names.ppfd,
      texName: "PPFD",
      slider: {
        min: "50",
        max: "500",
        step: "10",
      },
    })
    .addParameter("nadph", {
      displayName: names.nadph,
      value: 0.6,
      texName: "nadph",
    })
    .addParameter("O2_lumen", { value: 8.0, texName: "O2\\_lumen" })
    .addParameter("bH", { displayName: names.b_h, value: 100.0, texName: "bH" })
    .addParameter("F", {
      displayName: names.faraday_constant,
      value: 96.485,
      texName: "F",
    })
    .addParameter("E_0_PC", {
      displayName: names.e0_pc,
      value: 0.38,
      texName: "E^0\\_PC",
    })
    .addParameter("E_0_P700", {
      displayName: names.e0_p700,
      value: 0.48,
      texName: "E^0\\_P700",
    })
    .addParameter("E_0_FA", {
      displayName: names.e0_fa,
      value: -0.55,
      texName: "E^0\\_FA",
    })
    .addParameter("E_0_Fd", {
      displayName: names.e0_fd,
      value: -0.43,
      texName: "E^0\\_Fd",
    })
    .addParameter("E_0_NADP", {
      displayName: names.e0_nadp,
      value: -0.113,
      texName: "E^0\\_NADP",
    })
    .addParameter("NADP_", {
      displayName: names.nadp_tot,
      value: 0.8,
      texName: "NADP*",
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
    .addParameter("A_P", {
      displayName: names.atp_tot,
      value: 2.55,
      texName: "A*P",
    })
    .addParameter("Carotenoids_tot", {
      displayName: names.carotenoids_tot,
      value: 1.0,
      texName: "Carotenoids\\_tot",
    })
    .addParameter("Fd_", {
      displayName: names.fd_tot,
      value: 5.0,
      texName: "Fd*",
    })
    .addParameter("PC_tot", {
      displayName: names.pc_tot,
      value: 4.0,
      texName: "PC\\_tot",
    })
    .addParameter("PSBS_tot", {
      displayName: names.psbs_tot,
      value: 1.0,
      texName: "PSBS\\_tot",
    })
    .addParameter("LHC_tot", {
      displayName: names.lhc_tot,
      value: 1.0,
      texName: "LHC\\_tot",
    })
    .addParameter("gamma0", {
      displayName: names.gamma0,
      value: 0.1,
      texName: "gamma0",
    })
    .addParameter("gamma1", {
      displayName: names.gamma1,
      value: 0.25,
      texName: "gamma1",
    })
    .addParameter("gamma2", {
      displayName: names.gamma2,
      value: 0.6,
      texName: "gamma2",
    })
    .addParameter("gamma3", {
      displayName: names.gamma3,
      value: 0.15,
      texName: "gamma3",
    })
    .addParameter("kZSat", {
      displayName: names.k_zsat,
      value: 0.12,
      texName: "kZSat",
    })
    .addParameter("E_0_QA", {
      displayName: names.e0_qa,
      value: -0.14,
      texName: "E^0\\_QA",
    })
    .addParameter("E_0_PQ", {
      displayName: names.e0_pq,
      value: 0.354,
      texName: "E^0\\_PQ",
    })
    .addParameter("PQ_tot", {
      displayName: names.pq_tot,
      value: 17.5,
      texName: "PQ\\_tot",
    })
    .addParameter("staticAntII", {
      displayName: names.static_antenna_ii,
      value: 0.1,
      texName: "staticAntII",
    })
    .addParameter("staticAntI", {
      displayName: names.static_antenna_i,
      value: 0.37,
      texName: "staticAntI",
    })
    .addParameter("kf_atp_synthase", {
      displayName: names.kf_atp_synthase,
      value: 20.0,
      texName: "kf\\_atp\\_synthase",
    })
    .addParameter("HPR", {
      displayName: names.hpr,
      value: 4.666666666666667,
      texName: "HPR",
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
    .addParameter("kcat_b6f", {
      displayName: names.kcat_b6f,
      value: 2.5,
      texName: "kcat\\_b6f",
    })
    .addParameter("kh_lhc_protonation", {
      value: 3.0,
      texName: "kh\\_lhc\\_protonation",
    })
    .addParameter("kf_lhc_protonation", {
      value: 0.0096,
      texName: "kf\\_lhc\\_protonation",
    })
    .addParameter("ksat_lhc_protonation", {
      value: 5.8,
      texName: "ksat\\_lhc\\_protonation",
    })
    .addParameter("kf_lhc_deprotonation", {
      value: 0.0096,
      texName: "kf\\_lhc\\_deprotonation",
    })
    .addParameter("kf_cyclic_electron_flow", {
      displayName: names.kf_cyclic_electron_flow,
      value: 1.0,
      texName: "kf\\_cyclic\\_electron\\_flow",
    })
    .addParameter("kf_violaxanthin_deepoxidase", {
      value: 0.0024,
      texName: "kf\\_violaxanthin\\_deepoxidase",
    })
    .addParameter("kh_violaxanthin_deepoxidase", {
      value: 5.0,
      texName: "kh\\_violaxanthin\\_deepoxidase",
    })
    .addParameter("ksat_violaxanthin_deepoxidase", {
      value: 5.8,
      texName: "ksat\\_violaxanthin\\_deepoxidase",
    })
    .addParameter("kf_zeaxanthin_epoxidase", {
      value: 0.00024,
      texName: "kf\\_zeaxanthin\\_epoxidase",
    })
    .addParameter("E0_fnr", {
      displayName: names.e0_fnr,
      value: 3.0,
      texName: "E0\\_fnr",
    })
    .addParameter("kcat_fnr", {
      displayName: names.kcat_fnr,
      value: 500.0,
      texName: "kcat\\_fnr",
    })
    .addParameter("km_fnr_fd_red", {
      value: 1.56,
      texName: "km\\_fnr\\_fd\\_red",
    })
    .addParameter("km_fnr_nadp", {
      displayName: names.km_fnr_nadp,
      value: 0.22,
      texName: "km\\_fnr\\_nadp",
    })
    .addParameter("kf_ndh", {
      displayName: names.kf_ndh,
      value: 0.002,
      texName: "kf\\_ndh",
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
    .addParameter("kH0", {
      displayName: names.base_heat_dissipation_rate,
      value: 500000000.0,
      texName: "kH0",
    })
    .addParameter("kPQred", {
      displayName: names.k_pq_red,
      value: 250.0,
      texName: "kPQred",
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
    .addParameter("k2", {
      displayName: names.psii_rate_constant,
      value: 5000000000.0,
      texName: "k2",
    })
    .addParameter("kH", {
      displayName: names.npq_heat_dissipation_rate,
      value: 5000000000.0,
      texName: "kH",
    })
    .addParameter("kF", {
      displayName: names.fluorescence_rate_constant,
      value: 625000000.0,
      texName: "kF",
    })
    .addParameter("convf", { value: 0.032, texName: "convf" })
    .addParameter("kf_proton_leak", {
      displayName: names.kf_proton_leak,
      value: 10.0,
      texName: "kf\\_proton\\_leak",
    })
    .addParameter("kPTOX", {
      displayName: names.k_ptox,
      value: 0.01,
      texName: "kPTOX",
    })
    .addParameter("kStt7", {
      displayName: names.k_stt7,
      value: 0.0035,
      texName: "kStt7",
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
    .addParameter("kPph1", {
      displayName: names.k_pph1,
      value: 0.0013,
      texName: "kPph1",
    })
    .addParameter("kf_ex_atp", { value: 10.0, texName: "kf\\_ex\\_atp" })
    .addVariable("atp", {
      displayName: names.atp,
      value: 1.6999999999999997,
      texName: "atp",
    })
    .addVariable("pq_ox", {
      displayName: names.pq,
      value: 4.706348349506148,
      texName: "pq\\_ox",
    })
    .addVariable("pc_ox", {
      displayName: names.pc_ox,
      value: 3.9414515288091567,
      texName: "pc\\_ox",
    })
    .addVariable("fd_ox", {
      displayName: names.fd_ox,
      value: 3.7761613271207324,
      texName: "fd\\_ox",
    })
    .addVariable("protons_lumen", {
      displayName: names.protons_lumen,
      value: 7.737821100836988,
      texName: "protons\\_lumen",
    })
    .addVariable("lhc", { value: 0.5105293511676007, texName: "lhc" })
    .addVariable("psbs_de", {
      value: 0.5000000001374878,
      texName: "psbs\\_de",
    })
    .addVariable("vx", {
      displayName: names.violaxanthin_fraction,
      value: 0.09090909090907397,
      texName: "vx",
    })
    .addAssignment("nadp", {
      displayName: names.nadp,
      fn: new Add([new Name("NADP_"), new Minus([new Name("nadph")])]),
      texName: "nadp",
    })
    .addAssignment("RT", {
      displayName: names.rt,
      fn: new Mul([new Name("R"), new Name("T")]),
      texName: "RT",
    })
    .addAssignment("adp", {
      displayName: names.adp,
      fn: new Add([new Name("A_P"), new Minus([new Name("atp")])]),
      texName: "adp",
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
          new Ln(new Mul([new Num(0.00025), new Name("protons_lumen")])),
          new Ln(new Num(10.0)),
        ]),
      ]),
      texName: "pH\\_lumen",
    })
    .addAssignment("zx", {
      displayName: names.zeaxanthin_fraction,
      fn: new Add([new Name("Carotenoids_tot"), new Minus([new Name("vx")])]),
      texName: "zx",
    })
    .addAssignment("fd_red", {
      displayName: names.fd_red,
      fn: new Add([new Name("Fd_"), new Minus([new Name("fd_ox")])]),
      texName: "fd\\_red",
    })
    .addAssignment("pc_red", {
      displayName: names.pc_red,
      fn: new Add([new Name("PC_tot"), new Minus([new Name("pc_ox")])]),
      texName: "pc\\_red",
    })
    .addAssignment("psbs_pr", {
      fn: new Add([new Name("PSBS_tot"), new Minus([new Name("psbs_de")])]),
      texName: "psbs\\_pr",
    })
    .addAssignment("lhc_prot", {
      fn: new Add([new Name("LHC_tot"), new Minus([new Name("lhc")])]),
      texName: "lhc\\_prot",
    })
    .addAssignment("Q", {
      displayName: names.npq_coefficient,
      fn: new Add([
        new Mul([new Name("gamma0"), new Name("psbs_de"), new Name("vx")]),
        new Mul([new Name("gamma1"), new Name("psbs_pr"), new Name("vx")]),
        new Divide([
          new Mul([new Name("gamma2"), new Name("psbs_pr"), new Name("zx")]),
          new Add([new Name("kZSat"), new Name("zx")]),
        ]),
        new Divide([
          new Mul([new Name("gamma3"), new Name("psbs_de"), new Name("zx")]),
          new Add([new Name("kZSat"), new Name("zx")]),
        ]),
      ]),
      texName: "Q",
    })
    .addAssignment("keq_pq_red", {
      fn: new Exp(
        new Divide([
          new Add([
            new Mul([new Num(2.0), new Name("E_0_PQ"), new Name("F")]),
            new Minus([
              new Mul([new Num(2.0), new Name("E_0_QA"), new Name("F")]),
            ]),
            new Minus([
              new Mul([new Num(2.0), new Name("dG_pH"), new Name("pH")]),
            ]),
          ]),
          new Name("RT"),
        ]),
      ),
      texName: "keq\\_pq\\_red",
    })
    .addAssignment("pq_red", {
      displayName: names.pqh2,
      fn: new Add([new Name("PQ_tot"), new Minus([new Name("pq_ox")])]),
      texName: "pq\\_red",
    })
    .addAssignment("PSII_cross_section", {
      displayName: names.psii_cross_section,
      fn: new Add([
        new Name("staticAntII"),
        new Mul([
          new Name("lhc"),
          new Add([
            new Num(1.0),
            new Minus([new Name("staticAntI")]),
            new Minus([new Name("staticAntII")]),
          ]),
        ]),
      ]),
      texName: "PSII\\_cross\\_section",
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
            new Mul([new Num(2.0), new Name("E_0_PC"), new Name("F")]),
            new Mul([new Num(2.0), new Name("dG_pH"), new Name("pH_lumen")]),
            new Minus([
              new Mul([new Num(2.0), new Name("E_0_PQ"), new Name("F")]),
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
            new Mul([new Num(2.0), new Name("E_0_NADP"), new Name("F")]),
            new Minus([
              new Mul([new Num(2.0), new Name("E_0_Fd"), new Name("F")]),
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
            new Mul([new Name("E_0_P700"), new Name("F")]),
            new Minus([new Mul([new Name("E_0_PC"), new Name("F")])]),
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
            new Mul([new Name("E_0_Fd"), new Name("F")]),
            new Minus([new Mul([new Name("E_0_FA"), new Name("F")])]),
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
                new Name("fd_red"),
                new Mul([
                  new Name("fd_ox"),
                  new Name("keq_ferredoxin_reductase"),
                ]),
              ]),
            ]),
            new Add([
              new Divide([
                new Name("pc_ox"),
                new Mul([new Name("keq_PCP700"), new Name("pc_red")]),
              ]),
              new Divide([
                new Mul([
                  new Name("PPFD"),
                  new Add([
                    new Num(1.0),
                    new Minus([new Name("PSII_cross_section")]),
                  ]),
                ]),
                new Mul([new Name("kPCox"), new Name("pc_red")]),
              ]),
            ]),
          ]),
          new Divide([
            new Mul([
              new Name("PPFD"),
              new Add([
                new Num(1.0),
                new Minus([new Name("PSII_cross_section")]),
              ]),
            ]),
            new Mul([new Name("fd_ox"), new Name("kFdred")]),
          ]),
        ]),
      ]),
      texName: "A1",
    })
    .addAssignment("B0", {
      displayName: names.b0,
      fn: new Divide([
        new Mul([
          new Name("PSII_total"),
          new Name("kPQred"),
          new Name("keq_pq_red"),
          new Name("pq_ox"),
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
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("keq_pq_red"),
            new Pow(new Name("PPFD"), new Num(2.0)),
            new Pow(new Name("PSII_cross_section"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Num(2.0),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kF"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kH0"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
        ]),
      ]),
      texName: "ps2states",
    })
    .addAssignment("B1", {
      displayName: names.b1,
      fn: new Divide([
        new Mul([
          new Name("PPFD"),
          new Name("PSII_cross_section"),
          new Name("PSII_total"),
          new Name("kPQred"),
          new Name("keq_pq_red"),
          new Name("pq_ox"),
          new Add([
            new Name("kF"),
            new Name("kH0"),
            new Mul([new Name("Q"), new Name("kH")]),
          ]),
        ]),
        new Add([
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("keq_pq_red"),
            new Pow(new Name("PPFD"), new Num(2.0)),
            new Pow(new Name("PSII_cross_section"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Num(2.0),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kF"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kH0"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
        ]),
      ]),
      texName: "ps2states",
    })
    .addAssignment("B2", {
      displayName: names.b2,
      fn: new Divide([
        new Mul([
          new Name("PSII_total"),
          new Add([
            new Mul([
              new Name("kPQred"),
              new Name("pq_red"),
              new Pow(new Name("kF"), new Num(2.0)),
            ]),
            new Mul([
              new Name("kPQred"),
              new Name("pq_red"),
              new Pow(new Name("kH0"), new Num(2.0)),
            ]),
            new Mul([
              new Name("k2"),
              new Name("kF"),
              new Name("kPQred"),
              new Name("pq_red"),
            ]),
            new Mul([
              new Name("k2"),
              new Name("kH0"),
              new Name("kPQred"),
              new Name("pq_red"),
            ]),
            new Mul([
              new Name("kPQred"),
              new Name("pq_red"),
              new Pow(new Name("Q"), new Num(2.0)),
              new Pow(new Name("kH"), new Num(2.0)),
            ]),
            new Mul([
              new Num(2.0),
              new Name("kF"),
              new Name("kH0"),
              new Name("kPQred"),
              new Name("pq_red"),
            ]),
            new Mul([
              new Name("PPFD"),
              new Name("PSII_cross_section"),
              new Name("k2"),
              new Name("kF"),
              new Name("keq_pq_red"),
            ]),
            new Mul([
              new Name("PPFD"),
              new Name("PSII_cross_section"),
              new Name("k2"),
              new Name("kH0"),
              new Name("keq_pq_red"),
            ]),
            new Mul([
              new Name("Q"),
              new Name("k2"),
              new Name("kH"),
              new Name("kPQred"),
              new Name("pq_red"),
            ]),
            new Mul([
              new Num(2.0),
              new Name("Q"),
              new Name("kF"),
              new Name("kH"),
              new Name("kPQred"),
              new Name("pq_red"),
            ]),
            new Mul([
              new Num(2.0),
              new Name("Q"),
              new Name("kH"),
              new Name("kH0"),
              new Name("kPQred"),
              new Name("pq_red"),
            ]),
            new Mul([
              new Name("PPFD"),
              new Name("PSII_cross_section"),
              new Name("Q"),
              new Name("k2"),
              new Name("kH"),
              new Name("keq_pq_red"),
            ]),
          ]),
        ]),
        new Add([
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("keq_pq_red"),
            new Pow(new Name("PPFD"), new Num(2.0)),
            new Pow(new Name("PSII_cross_section"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Num(2.0),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kF"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kH0"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
        ]),
      ]),
      texName: "ps2states",
    })
    .addAssignment("B3", {
      displayName: names.b3,
      fn: new Divide([
        new Mul([
          new Name("PPFD"),
          new Name("PSII_cross_section"),
          new Name("PSII_total"),
          new Add([
            new Mul([new Name("k2"), new Name("kPQred"), new Name("pq_red")]),
            new Mul([new Name("kF"), new Name("kPQred"), new Name("pq_red")]),
            new Mul([new Name("kH0"), new Name("kPQred"), new Name("pq_red")]),
            new Mul([
              new Name("PPFD"),
              new Name("PSII_cross_section"),
              new Name("k2"),
              new Name("keq_pq_red"),
            ]),
            new Mul([
              new Name("Q"),
              new Name("kH"),
              new Name("kPQred"),
              new Name("pq_red"),
            ]),
          ]),
        ]),
        new Add([
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("keq_pq_red"),
            new Pow(new Name("PPFD"), new Num(2.0)),
            new Pow(new Name("PSII_cross_section"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("kF"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("kH0"), new Num(2.0)),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("pq_red"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Num(2.0),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kF"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kH0"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("k2"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("k2"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
            new Pow(new Name("Q"), new Num(2.0)),
            new Pow(new Name("kH"), new Num(2.0)),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("kF"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("keq_pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("pq_red"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kF"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("Q"),
            new Name("k2"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kF"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Num(2.0),
            new Name("Q"),
            new Name("kH"),
            new Name("kH0"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
          new Mul([
            new Name("PPFD"),
            new Name("PSII_cross_section"),
            new Name("Q"),
            new Name("kH"),
            new Name("kPQred"),
            new Name("keq_pq_red"),
            new Name("pq_ox"),
          ]),
        ]),
      ]),
      texName: "ps2states",
    })
    .addReaction("atp_synthase", {
      displayName: names.r_atp_synthase,
      fn: new Mul([
        new Name("kf_atp_synthase"),
        new Add([
          new Name("adp"),
          new Minus([
            new Divide([new Name("atp"), new Name("keq_atp_synthase")]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "atp", value: new Num(1.0) },
        {
          name: "protons_lumen",
          value: new Minus([new Divide([new Name("HPR"), new Name("bH")])]),
        },
      ],
      texName: "atp\\_synthase",
    })
    .addReaction("b6f", {
      displayName: names.r_b6f,
      fn: new Max([
        new Minus([new Name("kcat_b6f")]),
        new Mul([
          new Name("kcat_b6f"),
          new Add([
            new Mul([
              new Name("pq_red"),
              new Pow(new Name("pc_ox"), new Num(2.0)),
            ]),
            new Minus([
              new Divide([
                new Mul([
                  new Name("pq_ox"),
                  new Pow(new Name("pc_red"), new Num(2.0)),
                ]),
                new Name("keq_b6f"),
              ]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "pc_ox", value: new Num(-2.0) },
        { name: "pq_ox", value: new Num(1.0) },
        {
          name: "protons_lumen",
          value: new Divide([new Num(4.0), new Name("bH")]),
        },
      ],
      texName: "b6f",
    })
    .addReaction("lhc_protonation", {
      fn: new Divide([
        new Mul([
          new Name("kf_lhc_protonation"),
          new Name("psbs_de"),
          new Pow(new Name("protons_lumen"), new Name("kh_lhc_protonation")),
        ]),
        new Add([
          new Pow(new Name("protons_lumen"), new Name("kh_lhc_protonation")),
          new Pow(
            new Mul([
              new Num(4000.0),
              new Pow(
                new Num(10.0),
                new Minus([new Name("ksat_lhc_protonation")]),
              ),
            ]),
            new Name("kh_lhc_protonation"),
          ),
        ]),
      ]),
      stoichiometry: [{ name: "psbs_de", value: new Num(-1.0) }],
      texName: "lhc\\_protonation",
    })
    .addReaction("lhc_deprotonation", {
      fn: new Mul([new Name("kf_lhc_deprotonation"), new Name("psbs_pr")]),
      stoichiometry: [{ name: "psbs_de", value: new Num(1.0) }],
      texName: "lhc\\_deprotonation",
    })
    .addReaction("cyclic_electron_flow", {
      displayName: names.r_cyclic_electron_flow,
      fn: new Mul([
        new Name("kf_cyclic_electron_flow"),
        new Name("pq_ox"),
        new Pow(new Name("fd_red"), new Num(2.0)),
      ]),
      stoichiometry: [
        { name: "pq_ox", value: new Num(-1.0) },
        { name: "fd_ox", value: new Num(2.0) },
      ],
      texName: "cyclic\\_electron\\_flow",
    })
    .addReaction("violaxanthin_deepoxidase", {
      fn: new Divide([
        new Mul([
          new Name("kf_violaxanthin_deepoxidase"),
          new Name("vx"),
          new Pow(
            new Name("protons_lumen"),
            new Name("kh_violaxanthin_deepoxidase"),
          ),
        ]),
        new Add([
          new Pow(
            new Name("protons_lumen"),
            new Name("kh_violaxanthin_deepoxidase"),
          ),
          new Pow(
            new Mul([
              new Num(4000.0),
              new Pow(
                new Num(10.0),
                new Minus([new Name("ksat_violaxanthin_deepoxidase")]),
              ),
            ]),
            new Name("kh_violaxanthin_deepoxidase"),
          ),
        ]),
      ]),
      stoichiometry: [{ name: "vx", value: new Num(-1.0) }],
      texName: "violaxanthin\\_deepoxidase",
    })
    .addReaction("zeaxanthin_epoxidase", {
      fn: new Mul([new Name("kf_zeaxanthin_epoxidase"), new Name("zx")]),
      stoichiometry: [{ name: "vx", value: new Num(1.0) }],
      texName: "zeaxanthin\\_epoxidase",
    })
    .addReaction("fnr", {
      displayName: names.r_fnr,
      fn: new Divide([
        new Mul([
          new Name("vmax_fnr"),
          new Add([
            new Divide([
              new Mul([
                new Name("nadp"),
                new Pow(
                  new Divide([new Name("fd_red"), new Name("km_fnr_fd_red")]),
                  new Num(2.0),
                ),
              ]),
              new Name("km_fnr_nadp"),
            ]),
            new Minus([
              new Divide([
                new Mul([
                  new Name("nadph"),
                  new Pow(
                    new Divide([new Name("fd_ox"), new Name("km_fnr_fd_red")]),
                    new Num(2.0),
                  ),
                ]),
                new Mul([new Name("keq_fnr"), new Name("km_fnr_nadp")]),
              ]),
            ]),
          ]),
        ]),
        new Add([
          new Num(-1.0),
          new Mul([
            new Add([
              new Num(1.0),
              new Divide([new Name("nadp"), new Name("km_fnr_nadp")]),
            ]),
            new Add([
              new Num(1.0),
              new Pow(
                new Divide([new Name("fd_red"), new Name("km_fnr_fd_red")]),
                new Num(2.0),
              ),
              new Divide([new Name("fd_red"), new Name("km_fnr_fd_red")]),
            ]),
          ]),
          new Mul([
            new Add([
              new Num(1.0),
              new Divide([new Name("nadph"), new Name("km_fnr_nadp")]),
            ]),
            new Add([
              new Num(1.0),
              new Pow(
                new Divide([new Name("fd_ox"), new Name("km_fnr_fd_red")]),
                new Num(2.0),
              ),
              new Divide([new Name("fd_ox"), new Name("km_fnr_fd_red")]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [{ name: "fd_ox", value: new Num(2.0) }],
      texName: "fnr",
    })
    .addReaction("ndh", {
      displayName: names.r_ndh,
      fn: new Mul([new Name("kf_ndh"), new Name("pq_ox")]),
      stoichiometry: [{ name: "pq_ox", value: new Num(-1.0) }],
      texName: "ndh",
    })
    .addReaction("PSII", {
      displayName: names.r_psii,
      fn: new Mul([new Num(0.5), new Name("B1"), new Name("k2")]),
      stoichiometry: [
        { name: "pq_ox", value: new Num(-1.0) },
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
        new Add([new Num(1.0), new Minus([new Name("PSII_cross_section")])]),
      ]),
      stoichiometry: [
        { name: "fd_ox", value: new Num(-1.0) },
        { name: "pc_ox", value: new Num(1.0) },
      ],
      texName: "PSI",
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
    .addReaction("PTOX", {
      displayName: names.r_ptox,
      fn: new Mul([
        new Name("O2_lumen"),
        new Name("kPTOX"),
        new Name("pq_red"),
      ]),
      stoichiometry: [{ name: "pq_ox", value: new Num(1.0) }],
      texName: "PTOX",
    })
    .addReaction("lhc_state_transition_12", {
      displayName: names.r_lhc_state_transition_12,
      fn: new Divide([
        new Mul([new Num(1.0), new Name("kStt7"), new Name("lhc")]),
        new Add([
          new Num(1.0),
          new Pow(
            new Divide([
              new Name("pq_ox"),
              new Mul([
                new Name("PQ_tot"),
                new Name("km_lhc_state_transition_12"),
              ]),
            ]),
            new Name("n_ST"),
          ),
        ]),
      ]),
      stoichiometry: [{ name: "lhc", value: new Num(-1.0) }],
      texName: "lhc\\_state\\_transition\\_12",
    })
    .addReaction("lhc_state_transition_21", {
      displayName: names.r_lhc_state_transition_21,
      fn: new Mul([new Name("kPph1"), new Name("lhc_prot")]),
      stoichiometry: [{ name: "lhc", value: new Num(1.0) }],
      texName: "lhc\\_state\\_transition\\_21",
    })
    .addReaction("ex_atp", {
      fn: new Mul([new Name("atp"), new Name("kf_ex_atp")]),
      stoichiometry: [{ name: "atp", value: new Num(-1.0) }],
      texName: "ex\\_atp",
    })
    .addParameter("k_H", {
      displayName: names.npq_heat_dissipation_rate,
      value: 5000000000.0,
      texName: "k\\_H",
    })
    .addParameter("k_F", {
      displayName: names.fluorescence_rate_constant,
      value: 625000000.0,
      texName: "k\\_F",
    })
    .addParameter("k_P", { value: 5000000000.0, texName: "k\\_P" })
    .addAssignment("Fluo", {
      displayName: names.fluorescence,
      fn: new Add([
        new Divide([
          new Mul([new Name("B0"), new Name("k_F")]),
          new Add([
            new Name("k_F"),
            new Name("k_P"),
            new Mul([new Name("Q"), new Name("k_H")]),
          ]),
        ]),
        new Divide([
          new Mul([new Name("B2"), new Name("k_F")]),
          new Add([new Name("k_F"), new Mul([new Name("Q"), new Name("k_H")])]),
        ]),
      ]),
      texName: "Fluo",
    });
}
