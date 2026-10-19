import names from "#lib/names.js";
import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  Exp,
  GreaterThan,
  Ln,
  Minus,
  Mul,
  Name,
  Num,
  Piecewise,
  Pow,
} from "@computational-biology-aachen/mxlweb-core/mathml";

export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("PPFD", {
      value: 50.0,
      unit: "\\mu mol\\,m^{-2}\\,s^{-1}",
      texName: "PPFD",
      displayName: names.ppfd,
    })
    .addParameter("k_recomb", {
      displayName: names.k_recomb,
      value: 0.33,
      unit: "s^{-1}",
      texName: "k\\_recomb",
    })
    .addParameter("phi_triplet", {
      displayName: names.phi_triplet,
      value: 0.45,
      unit: "–",
      texName: "phi\\_triplet",
    })
    .addParameter("phi_1O2", {
      displayName: names.phi_1o2,
      value: 1.0,
      unit: "–",
      texName: "phi\\_1O2",
    })
    .addParameter("sigma0_II", {
      displayName: names.sigma0_ii,
      value: 0.5,
      unit: "–",
      texName: "sigma0\\_II",
    })
    .addParameter("c_b6f", {
      displayName: names.c_b6f,
      value: 0.433,
      unit: "–",
      texName: "c\\_b6f",
    })
    .addParameter("pKa_reg", {
      displayName: names.pka_reg,
      value: 6.2,
      unit: "–",
      texName: "pKa\\_reg",
    })
    .addParameter("Em_PC_pH7", {
      displayName: names.em_pc_ph7,
      value: 0.37,
      unit: "V",
      texName: "Em\\_PC\\_pH7",
    })
    .addParameter("Em_PQH2_pH7", {
      displayName: names.em_pqh2_ph7,
      value: 0.11,
      unit: "V",
      texName: "Em\\_PQH2\\_pH7",
    })
    .addParameter("Vmax_b6f", {
      displayName: names.vmax_b6f,
      value: 300.0,
      unit: "s^{-1}",
      texName: "Vmax\\_b6f",
    })
    .addParameter("pKa_PsbS", {
      displayName: names.pka_psbs,
      value: 6.2,
      unit: "–",
      texName: "pKa\\_PsbS",
    })
    .addParameter("NPQ_max", {
      displayName: names.npq_max,
      value: 3.0,
      unit: "–",
      texName: "NPQ\\_max",
    })
    .addParameter("pH_st", {
      displayName: names.ph,
      value: 7.8,
      unit: "–",
      texName: "pH\\_st",
    })
    .addParameter("Em_Fd", {
      value: -0.42,
      unit: "V",
      texName: "Em\\_Fd",
    })
    .addParameter("k_NDH1", {
      value: 1000.0,
      unit: "s^{-1}",
      texName: "k\\_NDH1",
    })
    .addParameter("Vmax_PGR", {
      value: 0.0,
      unit: "s^{-1}",
      texName: "Vmax\\_PGR",
    })
    .addParameter("sigma0_I", {
      value: 0.5,
      unit: "–",
      texName: "sigma0\\_I",
    })
    .addParameter("k_QA", {
      displayName: names.k_qa,
      value: 1000.0,
      unit: "s^{-1}",
      texName: "k\\_QA",
    })
    .addParameter("Keq_QA", {
      displayName: names.keq_qa,
      value: 200.0,
      unit: "–",
      texName: "Keq\\_QA",
    })
    .addParameter("k_PCtoP700", {
      displayName: names.k_pctop700,
      value: 5000.0,
      unit: "s^{-1}",
      texName: "k\\_PCtoP700",
    })
    .addParameter("k_FdtoNADP", {
      displayName: names.k_fdtonadp,
      value: 1000.0,
      unit: "s^{-1}",
      texName: "k\\_FdtoNADP",
    })
    .addParameter("K_st", {
      displayName: names.k_st,
      value: 0.1,
      unit: "M",
      texName: "K\\_st",
    })
    .addParameter("k_KEA3", {
      displayName: names.k_kea3,
      value: 2500000.0,
      unit: "M^{-2}\\,s^{-1}",
      texName: "k\\_KEA3",
    })
    .addParameter("P_K", {
      displayName: names.p_k,
      value: 150.0,
      unit: "M^{-1}\\,V^{-1}\\,s^{-1}",
      texName: "P\\_K",
    })
    .addParameter("ipt_lu", {
      value: 0.000587,
      unit: "M",
      texName: "ipt\\_lu",
    })
    .addParameter("k_VCCN1", {
      value: 12.0,
      unit: "M^{-1}\\,s^{-1}",
      texName: "k\\_VCCN1",
    })
    .addParameter("k_ClCe", {
      value: 800000.0,
      unit: "M^{-2}\\,V^{-1}\\,s^{-1}",
      texName: "k\\_ClCe",
    })
    .addParameter("HPR", {
      displayName: names.hpr,
      value: 4.666666666666667,
      unit: "–",
      texName: "HPR",
    })
    .addParameter("Vmax_ATPsynth", {
      displayName: names.vmax_atpsynth,
      value: 200.0,
      unit: "s^{-1}",
      texName: "Vmax\\_ATPsynth",
    })
    .addParameter("b_H", {
      displayName: names.b_h,
      value: 0.014,
      unit: "M",
      texName: "b\\_H",
    })
    .addParameter("vpc", {
      value: 0.047,
      unit: "V",
      texName: "vpc",
    })
    .addParameter("k_EZ", {
      displayName: names.k_ez,
      value: 0.004,
      unit: "s^{-1}",
      texName: "k\\_EZ",
    })
    .addParameter("nh_VDE", {
      displayName: names.nh_vde,
      value: 4.0,
      unit: "–",
      texName: "nh\\_VDE",
    })
    .addParameter("pKa_VDE", {
      displayName: names.pka_vde,
      value: 5.65,
      unit: "–",
      texName: "pKa\\_VDE",
    })
    .addParameter("Vmax_VDE", {
      displayName: names.vmax_vde,
      value: 0.08,
      unit: "s^{-1}",
      texName: "Vmax\\_VDE",
    })
    .addParameter("k_leak", {
      value: 30000000.0,
      unit: "M^{-1}\\,V^{-1}\\,s^{-1}",
      texName: "k\\_leak",
    })
    .addParameter("QA_total", {
      displayName: names.qa_tot,
      value: 1.0,
      unit: "–",
      texName: "QA\\_total",
    })
    .addParameter("PQ_tot", {
      displayName: names.pq_tot,
      value: 7.0,
      unit: "–",
      texName: "PQ\\_tot",
    })
    .addParameter("P700_total", {
      displayName: names.p700_tot,
      value: 0.667,
      unit: "–",
      texName: "P700\\_total",
    })
    .addParameter("PC_tot", {
      displayName: names.pc_tot,
      value: 2.0,
      unit: "–",
      texName: "PC\\_tot",
    })
    .addParameter("Fd_tot", {
      displayName: names.fd_tot,
      value: 1.0,
      unit: "–",
      texName: "Fd\\_tot",
    })
    .addParameter("NADP_tot", {
      displayName: names.nadp_tot,
      value: 5.0,
      unit: "–",
      texName: "NADP\\_tot",
    })
    .addParameter("Carotenoids_tot", {
      displayName: names.carotenoids_tot,
      value: 1.0,
      unit: "–",
      texName: "Carotenoids\\_tot",
    })
    .addVariable("QA_red", {
      displayName: names.qa_red,
      value: 0.0,
      unit: "–",
      texName: "QA\\_red",
    })
    .addVariable("PQH_2", {
      displayName: names.pqh2,
      value: 0.0,
      unit: "–",
      texName: "PQH\\_2",
    })
    .addVariable("pH_lumen", {
      displayName: names.ph_lumen,
      value: 7.8,
      unit: "–",
      texName: "pH\\_lumen",
    })
    .addVariable("Dpsi", {
      displayName: names.dpsi,
      value: 0.0,
      unit: "V",
      texName: "Dpsi",
    })
    .addVariable("K_lu", {
      displayName: names.k_lu,
      value: 0.1,
      unit: "M",
      texName: "K\\_lu",
    })
    .addVariable("PC_ox", {
      displayName: names.pc_ox,
      value: 0.0,
      unit: "–",
      texName: "PC\\_ox",
    })
    .addVariable("Y2", {
      value: 0.0,
      unit: "–",
      texName: "Y2",
    })
    .addVariable("Zx", {
      displayName: names.zeaxanthin_fraction,
      value: 0.0,
      unit: "–",
      texName: "Zx",
    })
    .addVariable("singO2", {
      displayName: names.single_oxygen,
      value: 0.0,
      unit: "–",
      texName: "singO2",
    })
    .addVariable("Fd_red", {
      displayName: names.fd_red,
      value: 0.0,
      unit: "–",
      texName: "Fd\\_red",
    })
    .addVariable("NADPH_st", {
      displayName: names.nadph,
      value: 1.5,
      unit: "–",
      texName: "NADPH\\_st",
    })
    .addVariable("Cl_lu", {
      value: 0.04,
      unit: "M",
      texName: "Cl\\_lu",
    })
    .addVariable("Cl_st", {
      value: 0.04,
      unit: "M",
      texName: "Cl\\_st",
    })
    .addAssignment("QA", {
      displayName: names.qa,
      fn: new Add([new Name("QA_total"), new Minus([new Name("QA_red")])]),
      texName: "QA",
    })
    .addAssignment("Y0", {
      fn: new Add([new Name("P700_total"), new Minus([new Name("Y2")])]),
      texName: "Y0",
    })
    .addAssignment("PQ", {
      displayName: names.pq,
      fn: new Add([new Name("PQ_tot"), new Minus([new Name("PQH_2")])]),
      texName: "PQ",
    })
    .addAssignment("PC_red", {
      displayName: names.pc_red,
      fn: new Add([new Name("PC_tot"), new Minus([new Name("PC_ox")])]),
      texName: "PC\\_red",
    })
    .addAssignment("Fd_ox", {
      displayName: names.fd_ox,
      fn: new Add([new Name("Fd_tot"), new Minus([new Name("Fd_red")])]),
      texName: "Fd\\_ox",
    })
    .addAssignment("NADP_st", {
      displayName: names.nadp,
      fn: new Add([new Name("NADP_tot"), new Minus([new Name("NADPH_st")])]),
      texName: "NADP\\_st",
    })
    .addAssignment("Vx", {
      displayName: names.violaxanthin_fraction,
      fn: new Add([new Name("Carotenoids_tot"), new Minus([new Name("Zx")])]),
      texName: "Vx",
    })
    .addAssignment("light_per_L", {
      fn: new Mul([new Num(1.2), new Name("PPFD")]),
      unit: "s^{-1}",
      texName: "light\\_per\\_L",
    })
    .addAssignment("driving_force_Cl", {
      fn: new Add([
        new Name("Dpsi"),
        new Divide([
          new Mul([
            new Num(0.06),
            new Ln(new Divide([new Name("Cl_st"), new Name("Cl_lu")])),
          ]),
          new Ln(new Num(10.0)),
        ]),
      ]),
      unit: "V",
      texName: "driving\\_force\\_Cl",
    })
    .addAssignment("PsbSP", {
      displayName: names.psbsp,
      fn: new Divide([
        new Num(1.0),
        new Add([
          new Num(1.0),
          new Pow(
            new Num(10.0),
            new Add([
              new Mul([new Num(3.0), new Name("pH_lumen")]),
              new Minus([new Mul([new Num(3.0), new Name("pKa_PsbS")])]),
            ]),
          ),
        ]),
      ]),
      texName: "PsbSP",
    })
    .addAssignment("NPQ", {
      displayName: names.npq,
      fn: new Add([
        new Mul([new Num(0.5), new Name("NPQ_max"), new Name("PsbSP")]),
        new Mul([new Num(0.1), new Name("NPQ_max"), new Name("Zx")]),
        new Mul([
          new Num(0.4),
          new Name("NPQ_max"),
          new Name("PsbSP"),
          new Name("Zx"),
        ]),
      ]),
      texName: "NPQ",
    })
    .addAssignment("PhiPSII", {
      displayName: names.phipsii,
      fn: new Divide([
        new Num(1.0),
        new Add([
          new Num(1.0),
          new Divide([
            new Add([
              new Num(0.20491803278688525),
              new Mul([new Num(0.20491803278688525), new Name("NPQ")]),
            ]),
            new Name("QA"),
          ]),
        ]),
      ]),
      texName: "PhiPSII",
    })
    .addAssignment("H_lumen", {
      displayName: names.protons_lumen,
      fn: new Pow(
        new Num(10.0),
        new Minus([new Mul([new Num(1.0), new Name("pH_lumen")])]),
      ),
      unit: "M",
      texName: "H\\_lumen",
    })
    .addAssignment("H_st", {
      displayName: names.h_stroma,
      fn: new Pow(
        new Num(10.0),
        new Minus([new Mul([new Num(1.0), new Name("pH_st")])]),
      ),
      unit: "M",
      texName: "H\\_st",
    })
    .addAssignment("pmf", {
      displayName: names.pmf,
      fn: new Add([
        new Name("Dpsi"),
        new Mul([new Num(0.06), new Name("pH_st")]),
        new Minus([new Mul([new Num(0.06), new Name("pH_lumen")])]),
      ]),
      unit: "V",
      texName: "pmf",
    })
    .addAssignment("kCBB", {
      displayName: names.k_cbb,
      fn: new Divide([
        new Mul([new Num(60.0), new Name("PPFD")]),
        new Add([new Num(250.0), new Name("PPFD")]),
      ]),
      unit: "s^{-1}",
      texName: "kCBB",
    })
    .addAssignment("delta_pH", {
      displayName: names.delta_ph,
      fn: new Add([new Name("pH_st"), new Minus([new Name("pH_lumen")])]),
      texName: "delta\\_pH",
    })
    .addAssignment("delta_pH_inVolts", {
      displayName: names.delta_ph_involts,
      fn: new Mul([new Num(0.06), new Name("delta_pH")]),
      unit: "V",
      texName: "delta\\_pH\\_inVolts",
    })
    .addAssignment("qL_act", {
      fn: new Divide([
        new Pow(new Name("QA"), new Num(3.0)),
        new Add([
          new Num(0.0033749999999999995),
          new Pow(new Name("QA"), new Num(3.0)),
        ]),
      ]),
      texName: "qL\\_act",
    })
    .addAssignment("pH_act", {
      fn: new Divide([
        new Num(1.0),
        new Add([
          new Num(1.0),
          new Pow(
            new Num(10.0),
            new Add([
              new Num(-6.0),
              new Mul([new Num(1.0), new Name("pH_lumen")]),
            ]),
          ),
        ]),
      ]),
      texName: "pH\\_act",
    })
    .addReaction("vPSII_recomb", {
      displayName: names.r_psii_recomb,
      fn: new Mul([
        new Name("QA_red"),
        new Name("k_recomb"),
        new Pow(
          new Num(10.0),
          new Add([
            new Num(7.0),
            new Mul([new Num(16.666666666666668), new Name("Dpsi")]),
            new Minus([new Mul([new Num(1.0), new Name("pH_lumen")])]),
          ]),
        ),
      ]),
      stoichiometry: [
        {
          name: "singO2",
          value: new Mul([new Name("phi_1O2"), new Name("phi_triplet")]),
        },
        { name: "QA_red", value: new Num(-1.0) },
        {
          name: "pH_lumen",
          value: new Divide([new Name("ipt_lu"), new Name("b_H")]),
        },
        { name: "Dpsi", value: new Minus([new Name("vpc")]) },
      ],
      texName: "vPSII\\_recomb",
    })
    .addReaction("vPSII_ChSep", {
      displayName: names.r_psii_charge_separation,
      fn: new Mul([
        new Name("PhiPSII"),
        new Name("light_per_L"),
        new Name("sigma0_II"),
      ]),
      stoichiometry: [
        { name: "QA_red", value: new Num(1.0) },
        {
          name: "pH_lumen",
          value: new Minus([new Divide([new Name("ipt_lu"), new Name("b_H")])]),
        },
        { name: "Dpsi", value: new Name("vpc") },
      ],
      texName: "vPSII\\_ChSep",
    })
    .addReaction("v_PSII", {
      displayName: names.r_psii,
      fn: new Mul([new Name("PQ"), new Name("QA_red"), new Name("k_QA")]),
      stoichiometry: [
        { name: "QA_red", value: new Num(-1.0) },
        { name: "PQH_2", value: new Num(0.5) },
      ],
      texName: "v\\_PSII",
    })
    .addReaction("v_PQ", {
      displayName: names.r_pq_reduction,
      fn: new Divide([
        new Mul([new Name("PQH_2"), new Name("QA"), new Name("k_QA")]),
        new Name("Keq_QA"),
      ]),
      stoichiometry: [
        { name: "QA_red", value: new Num(1.0) },
        { name: "PQH_2", value: new Num(-0.5) },
      ],
      texName: "v\\_PQ",
    })
    .addReaction("v_b6f", {
      displayName: names.r_b6f,
      fn: new Add([
        new Divide([
          new Mul([
            new Name("PC_ox"),
            new Name("PQH_2"),
            new Name("Vmax_b6f"),
            new Name("c_b6f"),
            new Add([
              new Num(1.0),
              new Minus([
                new Divide([
                  new Num(1.0),
                  new Add([
                    new Num(1.0),
                    new Pow(
                      new Num(10.0),
                      new Add([
                        new Name("pH_lumen"),
                        new Minus([new Name("pKa_reg")]),
                      ]),
                    ),
                  ]),
                ]),
              ]),
            ]),
          ]),
          new Add([new Name("PQ"), new Name("PQH_2")]),
        ]),
        new Minus([
          new Mul([
            new Name("PC_red"),
            new Name("Vmax_b6f"),
            new Name("c_b6f"),
            new Pow(
              new Num(10.0),
              new Add([
                new Num(7.0),
                new Mul([new Num(16.666666666666668), new Name("Em_PQH2_pH7")]),
                new Mul([new Num(16.666666666666668), new Name("pmf")]),
                new Minus([new Mul([new Num(1.0), new Name("pH_lumen")])]),
                new Minus([
                  new Mul([new Num(16.666666666666668), new Name("Em_PC_pH7")]),
                ]),
              ]),
            ),
            new Add([
              new Num(1.0),
              new Minus([
                new Divide([
                  new Num(1.0),
                  new Add([
                    new Num(1.0),
                    new Pow(
                      new Num(10.0),
                      new Add([
                        new Name("pH_lumen"),
                        new Minus([new Name("pKa_reg")]),
                      ]),
                    ),
                  ]),
                ]),
              ]),
            ]),
            new Add([
              new Num(1.0),
              new Minus([
                new Divide([
                  new Name("PQH_2"),
                  new Add([new Name("PQ"), new Name("PQH_2")]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "PQH_2", value: new Num(-0.5) },
        { name: "PC_ox", value: new Num(-1.0) },
        {
          name: "pH_lumen",
          value: new Minus([
            new Divide([
              new Mul([new Num(2.0), new Name("ipt_lu")]),
              new Name("b_H"),
            ]),
          ]),
        },
        { name: "Dpsi", value: new Name("vpc") },
      ],
      texName: "v\\_b6f",
    })
    .addReaction("v_NDH", {
      fn: new Add([
        new Mul([new Name("Fd_red"), new Name("PQ"), new Name("k_NDH1")]),
        new Minus([
          new Mul([
            new Name("Fd_ox"),
            new Name("PQH_2"),
            new Name("k_NDH1"),
            new Pow(
              new Num(10.0),
              new Add([
                new Num(-7.0),
                new Mul([new Num(1.0), new Name("pH_st")]),
                new Mul([new Num(16.666666666666668), new Name("Em_Fd")]),
                new Mul([new Num(33.333333333333336), new Name("pmf")]),
                new Minus([
                  new Mul([
                    new Num(16.666666666666668),
                    new Name("Em_PQH2_pH7"),
                  ]),
                ]),
              ]),
            ),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "PQH_2", value: new Num(0.5) },
        { name: "Fd_red", value: new Num(-1.0) },
        {
          name: "pH_lumen",
          value: new Minus([
            new Divide([
              new Mul([new Num(2.0), new Name("ipt_lu")]),
              new Name("b_H"),
            ]),
          ]),
        },
        { name: "Dpsi", value: new Mul([new Num(2.0), new Name("vpc")]) },
      ],
      texName: "v\\_NDH",
    })
    .addReaction("v_PGR", {
      fn: new Divide([
        new Mul([
          new Name("PQ"),
          new Name("Vmax_PGR"),
          new Pow(new Name("Fd_red"), new Num(4.0)),
        ]),
        new Mul([
          new Add([
            new Num(0.00010000000000000002),
            new Pow(new Name("Fd_red"), new Num(4.0)),
          ]),
          new Add([new Name("PQ"), new Name("PQH_2")]),
        ]),
      ]),
      stoichiometry: [
        { name: "PQH_2", value: new Num(0.5) },
        { name: "Fd_red", value: new Num(-1.0) },
      ],
      texName: "v\\_PGR",
    })
    .addReaction("PSI_ChSep", {
      displayName: names.r_psi_charge_separation,
      fn: new Mul([
        new Name("Fd_ox"),
        new Name("Y0"),
        new Name("light_per_L"),
        new Name("sigma0_I"),
      ]),
      stoichiometry: [
        { name: "Y2", value: new Num(1.0) },
        { name: "Fd_red", value: new Num(1.0) },
        { name: "Dpsi", value: new Name("vpc") },
      ],
      texName: "PSI\\_ChSep",
    })
    .addReaction("v_PSI_PCoxid", {
      displayName: names.r_psi_pc_oxidation,
      fn: new Mul([new Name("PC_red"), new Name("Y2"), new Name("k_PCtoP700")]),
      stoichiometry: [
        { name: "Y2", value: new Num(-1.0) },
        { name: "PC_ox", value: new Num(1.0) },
      ],
      texName: "v\\_PSI\\_PCoxid",
    })
    .addReaction("v_FNR", {
      displayName: names.r_fnr,
      fn: new Mul([
        new Name("Fd_red"),
        new Name("NADP_st"),
        new Name("k_FdtoNADP"),
      ]),
      stoichiometry: [
        { name: "Fd_red", value: new Num(-1.0) },
        { name: "NADPH_st", value: new Num(0.5) },
      ],
      texName: "v\\_FNR",
    })
    .addReaction("v_Mehler", {
      fn: new Divide([
        new Mul([new Num(0.00106), new Name("Fd_red")]),
        new Add([new Name("Fd_ox"), new Name("Fd_red")]),
      ]),
      stoichiometry: [{ name: "Fd_red", value: new Num(-1.0) }],
      texName: "v\\_Mehler",
    })
    .addReaction("v_CBB", {
      displayName: names.r_cbb,
      fn: new Mul([
        new Num(0.9712326548170112),
        new Name("kCBB"),
        new Add([
          new Num(1.0),
          new Minus([
            new Exp(
              new Minus([
                new Mul([new Num(0.0016666666666666668), new Name("time")]),
              ]),
            ),
          ]),
        ]),
        new Add([
          new Num(-0.22314355131420976),
          new Ln(new Divide([new Name("NADPH_st"), new Name("NADP_st")])),
        ]),
      ]),
      stoichiometry: [{ name: "NADPH_st", value: new Num(-1.0) }],
      texName: "v\\_CBB",
    })
    .addReaction("v_KEA3", {
      displayName: names.r_kea3,
      fn: new Mul([
        new Name("k_KEA3"),
        new Name("pH_act"),
        new Name("qL_act"),
        new Add([
          new Mul([new Name("H_lumen"), new Name("K_st")]),
          new Minus([new Mul([new Name("H_st"), new Name("K_lu")])]),
        ]),
      ]),
      stoichiometry: [
        { name: "K_lu", value: new Name("ipt_lu") },
        {
          name: "pH_lumen",
          value: new Divide([new Name("ipt_lu"), new Name("b_H")]),
        },
      ],
      texName: "v\\_KEA3",
    })
    .addReaction("v_VKC", {
      displayName: names.r_vkc,
      fn: new Mul([
        new Num(0.5),
        new Name("P_K"),
        new Add([
          new Name("Dpsi"),
          new Minus([
            new Divide([
              new Mul([
                new Num(0.06),
                new Ln(new Divide([new Name("K_st"), new Name("K_lu")])),
              ]),
              new Ln(new Num(10.0)),
            ]),
          ]),
        ]),
        new Add([new Name("K_lu"), new Name("K_st")]),
      ]),
      stoichiometry: [
        { name: "K_lu", value: new Minus([new Name("ipt_lu")]) },
        { name: "Dpsi", value: new Minus([new Name("vpc")]) },
      ],
      texName: "v\\_VKC",
    })
    .addReaction("v_VCCN1", {
      fn: new Mul([
        new Num(0.5),
        new Name("k_VCCN1"),
        new Add([new Name("Cl_lu"), new Name("Cl_st")]),
        new Add([
          new Mul([
            new Num(332.0),
            new Pow(new Name("driving_force_Cl"), new Num(3.0)),
          ]),
          new Mul([new Num(3.6), new Name("driving_force_Cl")]),
          new Mul([
            new Num(30.8),
            new Pow(new Name("driving_force_Cl"), new Num(2.0)),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "Cl_lu", value: new Name("ipt_lu") },
        {
          name: "Cl_st",
          value: new Minus([new Mul([new Num(0.1), new Name("ipt_lu")])]),
        },
        { name: "Dpsi", value: new Minus([new Name("vpc")]) },
      ],
      texName: "v\\_VCCN1",
    })
    .addReaction("v_ClCe", {
      fn: new Mul([
        new Num(0.25),
        new Name("k_ClCe"),
        new Add([new Name("Cl_lu"), new Name("Cl_st")]),
        new Add([new Name("H_lumen"), new Name("H_st")]),
        new Add([
          new Name("pmf"),
          new Mul([new Num(2.0), new Name("driving_force_Cl")]),
        ]),
      ]),
      stoichiometry: [
        { name: "Cl_lu", value: new Mul([new Num(2.0), new Name("ipt_lu")]) },
        {
          name: "Cl_st",
          value: new Minus([new Mul([new Num(0.2), new Name("ipt_lu")])]),
        },
        {
          name: "pH_lumen",
          value: new Divide([new Name("ipt_lu"), new Name("b_H")]),
        },
        {
          name: "Dpsi",
          value: new Minus([new Mul([new Num(3.0), new Name("vpc")])]),
        },
      ],
      texName: "v\\_ClCe",
    })
    .addReaction("v_Leak", {
      displayName: names.r_proton_leak,
      fn: new Mul([new Name("H_lumen"), new Name("k_leak"), new Name("pmf")]),
      stoichiometry: [
        {
          name: "pH_lumen",
          value: new Divide([new Name("ipt_lu"), new Name("b_H")]),
        },
        { name: "Dpsi", value: new Minus([new Name("vpc")]) },
      ],
      texName: "v\\_Leak",
    })
    .addReaction("v_pmf_protons_activity", {
      fn: new Piecewise([
        new Add([
          new Mul([
            new Name("HPR"),
            new Name("Vmax_ATPsynth"),
            new Add([
              new Num(1.0),
              new Minus([
                new Divide([
                  new Num(1.0),
                  new Add([
                    new Num(1.0),
                    new Pow(
                      new Num(10.0),
                      new Add([
                        new Num(-5.1000000000000005),
                        new Mul([new Num(25.0), new Name("pmf")]),
                      ]),
                    ),
                  ]),
                ]),
              ]),
            ]),
            new Add([
              new Num(0.8),
              new Minus([
                new Divide([
                  new Mul([
                    new Num(1.0793299047744327e-9),
                    new Pow(new Name("time"), new Num(4.0)),
                  ]),
                  new Add([
                    new Num(1.0),
                    new Mul([
                      new Num(1.349162380968041e-9),
                      new Pow(new Name("time"), new Num(4.0)),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
          new Mul([
            new Name("HPR"),
            new Name("Vmax_ATPsynth"),
            new Add([
              new Num(1.0),
              new Minus([
                new Divide([
                  new Num(1.0),
                  new Add([
                    new Num(1.0),
                    new Pow(
                      new Num(10.0),
                      new Add([
                        new Num(-3.3000000000000003),
                        new Mul([new Num(25.0), new Name("pmf")]),
                      ]),
                    ),
                  ]),
                ]),
              ]),
            ]),
            new Add([
              new Num(0.2),
              new Divide([
                new Mul([
                  new Num(1.0793299047744327e-9),
                  new Pow(new Name("time"), new Num(4.0)),
                ]),
                new Add([
                  new Num(1.0),
                  new Mul([
                    new Num(1.349162380968041e-9),
                    new Pow(new Name("time"), new Num(4.0)),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
        new GreaterThan([new Name("light_per_L"), new Num(0.0)]),
        new Num(0.0),
      ]),
      stoichiometry: [
        {
          name: "pH_lumen",
          value: new Divide([new Name("ipt_lu"), new Name("b_H")]),
        },
        { name: "Dpsi", value: new Minus([new Name("vpc")]) },
      ],
      texName: "v\\_pmf\\_protons\\_activity",
    })
    .addReaction("v_Epox", {
      displayName: names.r_epoxidation,
      fn: new Mul([new Name("Zx"), new Name("k_EZ")]),
      stoichiometry: [{ name: "Zx", value: new Num(-1.0) }],
      texName: "v\\_Epox",
    })
    .addReaction("v_Deepox", {
      displayName: names.r_deepoxidation,
      fn: new Divide([
        new Mul([new Num(1.0), new Name("Vmax_VDE"), new Name("Vx")]),
        new Add([
          new Num(1.0),
          new Pow(
            new Num(10.0),
            new Mul([
              new Name("nh_VDE"),
              new Add([new Name("pH_lumen"), new Minus([new Name("pKa_VDE")])]),
            ]),
          ),
        ]),
      ]),
      stoichiometry: [{ name: "Zx", value: new Num(1.0) }],
      texName: "v\\_Deepox",
    });
}
