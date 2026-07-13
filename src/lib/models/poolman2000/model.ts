import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import names from "$lib/names";
import {
  Add,
  Divide,
  Minus,
  Mul,
  Name,
  Num,
} from "@computational-biology-aachen/mxlweb-core/mathml";

export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("CO2_dissolved", {
      value: 0.2,
      texName: "CO2 (dissolved)",
    })
    .addParameter("NADPH", {
      displayName: names.nadph,
      value: 0.21,
      texName: "NADPH",
    })
    .addParameter("protons", {
      displayName: names.protons,
      value: 1.2589254117941661e-5,
      texName: "protons",
    })
    .addParameter("A_star_P", {
      displayName: names.atp_tot,
      value: 0.5,
      texName: "A*P",
    })
    .addParameter("NADP_star", {
      displayName: names.nadp_tot,
      value: 0.5,
      texName: "NADP*",
    })
    .addParameter("Pi_tot", {
      displayName: names.pi_tot,
      value: 15.0,
      texName: "Pi\\_tot",
    })
    .addParameter("E0_rubisco_carboxylase", {
      value: 1.0,
      texName: "E0\\_rubisco\\_carboxylase",
      slider: {
        min: "0.1",
        max: "2.0",
        step: "0.1",
      },
    })
    .addParameter("kcat_rubisco_carboxylase", {
      displayName: names.kcat_rubisco_carboxylase,
      value: 2.72,
      texName: "kcat\\_rubisco\\_carboxylase",
    })
    .addParameter("km_rubisco_carboxylase_RUBP", {
      displayName: names.km_rubisco_carboxylase_rubp,
      value: 0.02,
      texName: "km\\_rubisco\\_carboxylase\\_RUBP",
    })
    .addParameter("km_rubisco_carboxylase_CO2_dissolved", {
      displayName: names.km_rubisco_carboxylase_co2,
      value: 0.0107,
      texName: "km\\_rubisco\\_carboxylase\\_CO2 (dissolved)",
    })
    .addParameter("ki_rubisco_carboxylase_3PGA", {
      displayName: names.ki_rubisco_carboxylase_pga,
      value: 0.04,
      texName: "ki\\_rubisco\\_carboxylase\\_3PGA",
    })
    .addParameter("ki_rubisco_carboxylase_FBP", {
      displayName: names.ki_rubisco_carboxylase_fbp,
      value: 0.04,
      texName: "ki\\_rubisco\\_carboxylase\\_FBP",
    })
    .addParameter("ki_rubisco_carboxylase_SBP", {
      displayName: names.ki_rubisco_carboxylase_sbp,
      value: 0.075,
      texName: "ki\\_rubisco\\_carboxylase\\_SBP",
    })
    .addParameter("ki_rubisco_carboxylase_Orthophosphate", {
      displayName: names.ki_rubisco_carboxylase_pi,
      value: 0.9,
      texName: "ki\\_rubisco\\_carboxylase\\_Orthophosphate",
    })
    .addParameter("ki_rubisco_carboxylase_NADPH", {
      displayName: names.ki_rubisco_carboxylase_nadph,
      value: 0.07,
      texName: "ki\\_rubisco\\_carboxylase\\_NADPH",
    })
    .addParameter("kre_phosphoglycerate_kinase", {
      displayName: names.kre_phosphoglycerate_kinase,
      value: 800000000.0,
      texName: "kre\\_phosphoglycerate\\_kinase",
    })
    .addParameter("keq_phosphoglycerate_kinase", {
      displayName: names.keq_phosphoglycerate_kinase,
      value: 0.00031,
      texName: "keq\\_phosphoglycerate\\_kinase",
    })
    .addParameter("kre_gadph", {
      displayName: names.kre_gadph,
      value: 800000000.0,
      texName: "kre\\_gadph",
    })
    .addParameter("keq_gadph", {
      displayName: names.keq_gadph,
      value: 16000000.0,
      texName: "keq\\_gadph",
    })
    .addParameter("kre_triose_phosphate_isomerase", {
      displayName: names.kre_triose_phosphate_isomerase,
      value: 800000000.0,
      texName: "kre\\_triose\\_phosphate\\_isomerase",
    })
    .addParameter("keq_triose_phosphate_isomerase", {
      displayName: names.keq_triose_phosphate_isomerase,
      value: 22.0,
      texName: "keq\\_triose\\_phosphate\\_isomerase",
    })
    .addParameter("kre_aldolase_dhap_gap", {
      displayName: names.kre_aldolase_dhap_gap,
      value: 800000000.0,
      texName: "kre\\_aldolase\\_dhap\\_gap",
    })
    .addParameter("keq_aldolase_dhap_gap", {
      displayName: names.keq_aldolase_dhap_gap,
      value: 7.1,
      texName: "keq\\_aldolase\\_dhap\\_gap",
    })
    .addParameter("kre_aldolase_dhap_e4p", {
      displayName: names.kre_aldolase_dhap_e4p,
      value: 800000000.0,
      texName: "kre\\_aldolase\\_dhap\\_e4p",
    })
    .addParameter("keq_aldolase_dhap_e4p", {
      displayName: names.keq_aldolase_dhap_e4p,
      value: 13.0,
      texName: "keq\\_aldolase\\_dhap\\_e4p",
    })
    .addParameter("E0_fbpase", {
      displayName: names.e0_fbpase,
      value: 1.0,
      texName: "E0\\_fbpase",
    })
    .addParameter("kcat_fbpase", {
      displayName: names.kcat_fbpase,
      value: 1.6,
      texName: "kcat\\_fbpase",
    })
    .addParameter("km_fbpase_s", {
      displayName: names.km_fbpase_s,
      value: 0.03,
      texName: "km\\_fbpase\\_s",
    })
    .addParameter("ki_fbpase_F6P", {
      displayName: names.ki_fbpase_f6p,
      value: 0.7,
      texName: "ki\\_fbpase\\_F6P",
    })
    .addParameter("ki_fbpase_Orthophosphate", {
      displayName: names.ki_fbpase_pi,
      value: 12.0,
      texName: "ki\\_fbpase\\_Orthophosphate",
    })
    .addParameter("kre_transketolase_gap_f6p", {
      displayName: names.kre_transketolase_gap_f6p,
      value: 800000000.0,
      texName: "kre\\_transketolase\\_gap\\_f6p",
    })
    .addParameter("keq_transketolase_gap_f6p", {
      displayName: names.keq_transketolase_gap_f6p,
      value: 0.084,
      texName: "keq\\_transketolase\\_gap\\_f6p",
    })
    .addParameter("kre_transketolase_gap_s7p", {
      displayName: names.kre_transketolase_gap_s7p,
      value: 800000000.0,
      texName: "kre\\_transketolase\\_gap\\_s7p",
    })
    .addParameter("keq_transketolase_gap_s7p", {
      displayName: names.keq_transketolase_gap_s7p,
      value: 0.85,
      texName: "keq\\_transketolase\\_gap\\_s7p",
    })
    .addParameter("E0_SBPase", {
      displayName: names.e0_sbpase,
      value: 1.0,
      texName: "E0\\_SBPase",
    })
    .addParameter("kcat_SBPase", {
      displayName: names.kcat_sbpase,
      value: 0.32,
      texName: "kcat\\_SBPase",
    })
    .addParameter("km_SBPase_s", {
      displayName: names.km_sbpase_s,
      value: 0.013,
      texName: "km\\_SBPase\\_s",
    })
    .addParameter("ki_SBPase_Orthophosphate", {
      displayName: names.ki_sbpase_pi,
      value: 12.0,
      texName: "ki\\_SBPase\\_Orthophosphate",
    })
    .addParameter("kre_ribose_phosphate_isomerase", {
      displayName: names.kre_ribose_phosphate_isomerase,
      value: 800000000.0,
      texName: "kre\\_ribose\\_phosphate\\_isomerase",
    })
    .addParameter("keq_ribose_phosphate_isomerase", {
      displayName: names.keq_ribose_phosphate_isomerase,
      value: 0.4,
      texName: "keq\\_ribose\\_phosphate\\_isomerase",
    })
    .addParameter("kre_ribulose_phosphate_epimerase", {
      displayName: names.kre_ribulose_phosphate_epimerase,
      value: 800000000.0,
      texName: "kre\\_ribulose\\_phosphate\\_epimerase",
    })
    .addParameter("keq_ribulose_phosphate_epimerase", {
      displayName: names.keq_ribulose_phosphate_epimerase,
      value: 0.67,
      texName: "keq\\_ribulose\\_phosphate\\_epimerase",
    })
    .addParameter("E0_phosphoribulokinase", {
      displayName: names.e0_phosphoribulokinase,
      value: 1.0,
      texName: "E0\\_phosphoribulokinase",
    })
    .addParameter("kcat_phosphoribulokinase", {
      displayName: names.kcat_phosphoribulokinase,
      value: 7.9992,
      texName: "kcat\\_phosphoribulokinase",
    })
    .addParameter("km_phosphoribulokinase_RU5P", {
      displayName: names.km_phosphoribulokinase_ru5p,
      value: 0.05,
      texName: "km\\_phosphoribulokinase\\_RU5P",
    })
    .addParameter("km_phosphoribulokinase_ATP", {
      displayName: names.km_phosphoribulokinase_atp,
      value: 0.05,
      texName: "km\\_phosphoribulokinase\\_ATP",
    })
    .addParameter("ki_phosphoribulokinase_3PGA", {
      displayName: names.ki_phosphoribulokinase_pga,
      value: 2.0,
      texName: "ki\\_phosphoribulokinase\\_3PGA",
    })
    .addParameter("ki_phosphoribulokinase_RUBP", {
      displayName: names.ki_phosphoribulokinase_rubp,
      value: 0.7,
      texName: "ki\\_phosphoribulokinase\\_RUBP",
    })
    .addParameter("ki_phosphoribulokinase_Orthophosphate", {
      displayName: names.ki_phosphoribulokinase_pi,
      value: 4.0,
      texName: "ki\\_phosphoribulokinase\\_Orthophosphate",
    })
    .addParameter("ki_phosphoribulokinase_4", {
      value: 2.5,
      texName: "ki\\_phosphoribulokinase\\_4",
    })
    .addParameter("ki_phosphoribulokinase_5", {
      value: 0.4,
      texName: "ki\\_phosphoribulokinase\\_5",
    })
    .addParameter("kre_g6pi", {
      displayName: names.kre_g6pi,
      value: 800000000.0,
      texName: "kre\\_g6pi",
    })
    .addParameter("keq_g6pi", {
      displayName: names.keq_g6pi,
      value: 2.3,
      texName: "keq\\_g6pi",
    })
    .addParameter("kre_phosphoglucomutase", {
      displayName: names.kre_phosphoglucomutase,
      value: 800000000.0,
      texName: "kre\\_phosphoglucomutase",
    })
    .addParameter("keq_phosphoglucomutase", {
      displayName: names.keq_phosphoglucomutase,
      value: 0.058,
      texName: "keq\\_phosphoglucomutase",
    })
    .addParameter("Orthophosphate_external", {
      value: 0.5,
      texName: "Orthophosphate (external)",
    })
    .addParameter("km_ex_pga", {
      value: 0.25,
      texName: "km\\_ex\\_pga",
    })
    .addParameter("km_ex_gap", {
      value: 0.075,
      texName: "km\\_ex\\_gap",
    })
    .addParameter("km_ex_dhap", {
      value: 0.077,
      texName: "km\\_ex\\_dhap",
    })
    .addParameter("km_N_translocator_Orthophosphate_external", {
      value: 0.74,
      texName: "km\\_N\\_translocator\\_Orthophosphate (external)",
    })
    .addParameter("km_N_translocator_Orthophosphate", {
      value: 0.63,
      texName: "km\\_N\\_translocator\\_Orthophosphate",
    })
    .addParameter("kcat_N_translocator", {
      value: 2.0,
      texName: "kcat\\_N\\_translocator",
    })
    .addParameter("E0_N_translocator", {
      value: 1.0,
      texName: "E0\\_N\\_translocator",
    })
    .addParameter("km_ex_g1p_G1P", {
      displayName: names.km_ex_g1p_g1p,
      value: 0.08,
      texName: "km\\_ex\\_g1p\\_G1P",
    })
    .addParameter("km_ex_g1p_ATP", {
      displayName: names.km_ex_g1p_atp,
      value: 0.08,
      texName: "km\\_ex\\_g1p\\_ATP",
    })
    .addParameter("ki_ex_g1p", {
      displayName: names.ki_ex_g1p,
      value: 10.0,
      texName: "ki\\_ex\\_g1p",
    })
    .addParameter("ki_ex_g1p_3PGA", {
      displayName: names.ki_ex_g1p_pga,
      value: 0.1,
      texName: "ki\\_ex\\_g1p\\_3PGA",
    })
    .addParameter("ki_ex_g1p_F6P", {
      displayName: names.ki_ex_g1p_f6p,
      value: 0.02,
      texName: "ki\\_ex\\_g1p\\_F6P",
    })
    .addParameter("ki_ex_g1p_FBP", {
      displayName: names.ki_ex_g1p_fbp,
      value: 0.02,
      texName: "ki\\_ex\\_g1p\\_FBP",
    })
    .addParameter("E0_ex_g1p", {
      displayName: names.e0_ex_g1p,
      value: 1.0,
      texName: "E0\\_ex\\_g1p",
    })
    .addParameter("kcat_ex_g1p", {
      displayName: names.kcat_ex_g1p,
      value: 0.32,
      texName: "kcat\\_ex\\_g1p",
    })
    .addParameter("km_atp_synthase_ADP", {
      value: 0.014,
      texName: "km\\_atp\\_synthase\\_ADP",
    })
    .addParameter("km_atp_synthase_Orthophosphate", {
      value: 0.3,
      texName: "km\\_atp\\_synthase\\_Orthophosphate",
    })
    .addParameter("kcat_atp_synthase", {
      value: 2.8,
      texName: "kcat\\_atp\\_synthase",
    })
    .addParameter("E0_atp_synthase", {
      value: 1.0,
      texName: "E0\\_atp\\_synthase",
    })
    .addVariable("_3PGA", {
      displayName: names.pga,
      value: 0.6387788347932627,
      texName: "3PGA",
    })
    .addVariable("BPGA", {
      displayName: names.bpga,
      value: 0.0013570885908749779,
      texName: "BPGA",
    })
    .addVariable("GAP", {
      displayName: names.gap,
      value: 0.011259431827358068,
      texName: "GAP",
    })
    .addVariable("DHAP", {
      displayName: names.dhap,
      value: 0.24770748227012374,
      texName: "DHAP",
    })
    .addVariable("FBP", {
      displayName: names.fbp,
      value: 0.01980222074817044,
      texName: "FBP",
    })
    .addVariable("F6P", {
      displayName: names.f6p,
      value: 1.093666906864421,
      texName: "F6P",
    })
    .addVariable("G6P", {
      displayName: names.g6p,
      value: 2.5154338857582377,
      texName: "G6P",
    })
    .addVariable("G1P", {
      displayName: names.g1p,
      value: 0.14589516537322303,
      texName: "G1P",
    })
    .addVariable("SBP", {
      displayName: names.sbp,
      value: 0.09132688566151095,
      texName: "SBP",
    })
    .addVariable("S7P", {
      displayName: names.s7p,
      value: 0.23281380022778891,
      texName: "S7P",
    })
    .addVariable("E4P", {
      displayName: names.e4p,
      value: 0.02836065066520614,
      texName: "E4P",
    })
    .addVariable("X5P", {
      displayName: names.x5p,
      value: 0.03647242425941113,
      texName: "X5P",
    })
    .addVariable("R5P", {
      displayName: names.r5p,
      value: 0.06109130988031577,
      texName: "R5P",
    })
    .addVariable("RUBP", {
      displayName: names.rubp,
      value: 0.2672164362349537,
      texName: "RUBP",
    })
    .addVariable("RU5P", {
      displayName: names.ru5p,
      value: 0.0244365238237522,
      texName: "RU5P",
    })
    .addVariable("ATP", {
      displayName: names.atp,
      value: 0.43633201706180874,
      texName: "ATP",
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
    .addAssignment("Orthophosphate", {
      fn: new Add([
        new Name("Pi_tot"),
        new Minus([new Name("ATP")]),
        new Minus([new Name("DHAP")]),
        new Minus([new Name("E4P")]),
        new Minus([new Name("F6P")]),
        new Minus([new Name("G1P")]),
        new Minus([new Name("G6P")]),
        new Minus([new Name("GAP")]),
        new Minus([new Name("R5P")]),
        new Minus([new Name("RU5P")]),
        new Minus([new Name("S7P")]),
        new Minus([new Name("X5P")]),
        new Minus([new Name("_3PGA")]),
        new Minus([new Mul([new Num(2.0), new Name("BPGA")])]),
        new Minus([new Mul([new Num(2.0), new Name("FBP")])]),
        new Minus([new Mul([new Num(2.0), new Name("RUBP")])]),
        new Minus([new Mul([new Num(2.0), new Name("SBP")])]),
      ]),
      texName: "Orthophosphate",
    })
    .addAssignment("vmax_rubisco_carboxylase", {
      displayName: names.vmax_rubisco_carboxylase,
      fn: new Mul([
        new Name("E0_rubisco_carboxylase"),
        new Name("kcat_rubisco_carboxylase"),
      ]),
      texName: "vmax\\_rubisco\\_carboxylase",
    })
    .addAssignment("vmax_fbpase", {
      displayName: names.vmax_fbpase,
      fn: new Mul([new Name("E0_fbpase"), new Name("kcat_fbpase")]),
      texName: "vmax\\_fbpase",
    })
    .addAssignment("vmax_SBPase", {
      displayName: names.vmax_sbpase,
      fn: new Mul([new Name("E0_SBPase"), new Name("kcat_SBPase")]),
      texName: "vmax\\_SBPase",
    })
    .addAssignment("vmax_phosphoribulokinase", {
      displayName: names.vmax_phosphoribulokinase,
      fn: new Mul([
        new Name("E0_phosphoribulokinase"),
        new Name("kcat_phosphoribulokinase"),
      ]),
      texName: "vmax\\_phosphoribulokinase",
    })
    .addAssignment("vmax_ex_pga", {
      fn: new Mul([
        new Name("E0_N_translocator"),
        new Name("kcat_N_translocator"),
      ]),
      texName: "vmax\\_ex\\_pga",
    })
    .addAssignment("N_translocator", {
      fn: new Add([
        new Num(1.0),
        new Mul([
          new Add([
            new Num(1.0),
            new Divide([
              new Name("km_N_translocator_Orthophosphate_external"),
              new Name("Orthophosphate_external"),
            ]),
          ]),
          new Add([
            new Divide([new Name("DHAP"), new Name("km_ex_dhap")]),
            new Divide([new Name("GAP"), new Name("km_ex_gap")]),
            new Divide([
              new Name("Orthophosphate"),
              new Name("km_N_translocator_Orthophosphate"),
            ]),
            new Divide([new Name("_3PGA"), new Name("km_ex_pga")]),
          ]),
        ]),
      ]),
      texName: "N\\_translocator",
    })
    .addAssignment("vmax_ex_g1p", {
      displayName: names.vmax_ex_g1p,
      fn: new Mul([new Name("E0_ex_g1p"), new Name("kcat_ex_g1p")]),
      texName: "vmax\\_ex\\_g1p",
    })
    .addAssignment("vmax_atp_synthase", {
      fn: new Mul([new Name("E0_atp_synthase"), new Name("kcat_atp_synthase")]),
      texName: "vmax\\_atp\\_synthase",
    })
    .addReaction("rubisco_carboxylase", {
      displayName: names.r_rubisco_carboxylase,
      fn: new Divide([
        new Mul([
          new Name("CO2_dissolved"),
          new Name("RUBP"),
          new Name("vmax_rubisco_carboxylase"),
        ]),
        new Mul([
          new Add([
            new Name("CO2_dissolved"),
            new Name("km_rubisco_carboxylase_CO2_dissolved"),
          ]),
          new Add([
            new Name("RUBP"),
            new Mul([
              new Name("km_rubisco_carboxylase_RUBP"),
              new Add([
                new Num(1.0),
                new Divide([
                  new Name("FBP"),
                  new Name("ki_rubisco_carboxylase_FBP"),
                ]),
                new Divide([
                  new Name("NADPH"),
                  new Name("ki_rubisco_carboxylase_NADPH"),
                ]),
                new Divide([
                  new Name("Orthophosphate"),
                  new Name("ki_rubisco_carboxylase_Orthophosphate"),
                ]),
                new Divide([
                  new Name("SBP"),
                  new Name("ki_rubisco_carboxylase_SBP"),
                ]),
                new Divide([
                  new Name("_3PGA"),
                  new Name("ki_rubisco_carboxylase_3PGA"),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "RUBP", value: new Num(-1.0) },
        { name: "_3PGA", value: new Num(2.0) },
      ],
      texName: "rubisco\\_carboxylase",
    })
    .addReaction("phosphoglycerate_kinase", {
      displayName: names.r_phosphoglycerate_kinase,
      fn: new Mul([
        new Name("kre_phosphoglycerate_kinase"),
        new Add([
          new Mul([new Name("ATP"), new Name("_3PGA")]),
          new Minus([
            new Divide([
              new Mul([new Name("ADP"), new Name("BPGA")]),
              new Name("keq_phosphoglycerate_kinase"),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "_3PGA", value: new Num(-1.0) },
        { name: "ATP", value: new Num(-1.0) },
        { name: "BPGA", value: new Num(1.0) },
      ],
      texName: "phosphoglycerate\\_kinase",
    })
    .addReaction("gadph", {
      displayName: names.r_gadph,
      fn: new Mul([
        new Name("kre_gadph"),
        new Add([
          new Mul([new Name("BPGA"), new Name("NADPH"), new Name("protons")]),
          new Minus([
            new Divide([
              new Mul([
                new Name("GAP"),
                new Name("NADP"),
                new Name("Orthophosphate"),
              ]),
              new Name("keq_gadph"),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "BPGA", value: new Num(-1.0) },
        { name: "GAP", value: new Num(1.0) },
      ],
      texName: "gadph",
    })
    .addReaction("triose_phosphate_isomerase", {
      displayName: names.r_triose_phosphate_isomerase,
      fn: new Mul([
        new Name("kre_triose_phosphate_isomerase"),
        new Add([
          new Name("GAP"),
          new Minus([
            new Divide([
              new Name("DHAP"),
              new Name("keq_triose_phosphate_isomerase"),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "GAP", value: new Num(-1.0) },
        { name: "DHAP", value: new Num(1.0) },
      ],
      texName: "triose\\_phosphate\\_isomerase",
    })
    .addReaction("aldolase_dhap_gap", {
      displayName: names.r_aldolase_dhap_gap,
      fn: new Mul([
        new Name("kre_aldolase_dhap_gap"),
        new Add([
          new Mul([new Name("DHAP"), new Name("GAP")]),
          new Minus([
            new Divide([new Name("FBP"), new Name("keq_aldolase_dhap_gap")]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "GAP", value: new Num(-1.0) },
        { name: "DHAP", value: new Num(-1.0) },
        { name: "FBP", value: new Num(1.0) },
      ],
      texName: "aldolase\\_dhap\\_gap",
    })
    .addReaction("aldolase_dhap_e4p", {
      displayName: names.r_aldolase_dhap_e4p,
      fn: new Mul([
        new Name("kre_aldolase_dhap_e4p"),
        new Add([
          new Mul([new Name("DHAP"), new Name("E4P")]),
          new Minus([
            new Divide([new Name("SBP"), new Name("keq_aldolase_dhap_e4p")]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "DHAP", value: new Num(-1.0) },
        { name: "E4P", value: new Num(-1.0) },
        { name: "SBP", value: new Num(1.0) },
      ],
      texName: "aldolase\\_dhap\\_e4p",
    })
    .addReaction("fbpase", {
      displayName: names.r_fbpase,
      fn: new Divide([
        new Mul([new Name("FBP"), new Name("vmax_fbpase")]),
        new Add([
          new Name("FBP"),
          new Mul([
            new Name("km_fbpase_s"),
            new Add([
              new Num(1.0),
              new Divide([new Name("F6P"), new Name("ki_fbpase_F6P")]),
              new Divide([
                new Name("Orthophosphate"),
                new Name("ki_fbpase_Orthophosphate"),
              ]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "FBP", value: new Num(-1.0) },
        { name: "F6P", value: new Num(1.0) },
      ],
      texName: "fbpase",
    })
    .addReaction("transketolase_gap_f6p", {
      displayName: names.r_transketolase_gap_f6p,
      fn: new Mul([
        new Name("kre_transketolase_gap_f6p"),
        new Add([
          new Mul([new Name("F6P"), new Name("GAP")]),
          new Minus([
            new Divide([
              new Mul([new Name("E4P"), new Name("X5P")]),
              new Name("keq_transketolase_gap_f6p"),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "GAP", value: new Num(-1.0) },
        { name: "F6P", value: new Num(-1.0) },
        { name: "E4P", value: new Num(1.0) },
        { name: "X5P", value: new Num(1.0) },
      ],
      texName: "transketolase\\_gap\\_f6p",
    })
    .addReaction("transketolase_gap_s7p", {
      displayName: names.r_transketolase_gap_s7p,
      fn: new Mul([
        new Name("kre_transketolase_gap_s7p"),
        new Add([
          new Mul([new Name("GAP"), new Name("S7P")]),
          new Minus([
            new Divide([
              new Mul([new Name("R5P"), new Name("X5P")]),
              new Name("keq_transketolase_gap_s7p"),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "GAP", value: new Num(-1.0) },
        { name: "S7P", value: new Num(-1.0) },
        { name: "R5P", value: new Num(1.0) },
        { name: "X5P", value: new Num(1.0) },
      ],
      texName: "transketolase\\_gap\\_s7p",
    })
    .addReaction("SBPase", {
      displayName: names.r_sbpase,
      fn: new Divide([
        new Mul([new Name("SBP"), new Name("vmax_SBPase")]),
        new Add([
          new Name("SBP"),
          new Mul([
            new Name("km_SBPase_s"),
            new Add([
              new Num(1.0),
              new Divide([
                new Name("Orthophosphate"),
                new Name("ki_SBPase_Orthophosphate"),
              ]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "SBP", value: new Num(-1.0) },
        { name: "S7P", value: new Num(1.0) },
      ],
      texName: "SBPase",
    })
    .addReaction("ribose_phosphate_isomerase", {
      displayName: names.r_ribose_phosphate_isomerase,
      fn: new Mul([
        new Name("kre_ribose_phosphate_isomerase"),
        new Add([
          new Name("R5P"),
          new Minus([
            new Divide([
              new Name("RU5P"),
              new Name("keq_ribose_phosphate_isomerase"),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "R5P", value: new Num(-1.0) },
        { name: "RU5P", value: new Num(1.0) },
      ],
      texName: "ribose\\_phosphate\\_isomerase",
    })
    .addReaction("ribulose_phosphate_epimerase", {
      displayName: names.r_ribulose_phosphate_epimerase,
      fn: new Mul([
        new Name("kre_ribulose_phosphate_epimerase"),
        new Add([
          new Name("X5P"),
          new Minus([
            new Divide([
              new Name("RU5P"),
              new Name("keq_ribulose_phosphate_epimerase"),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "X5P", value: new Num(-1.0) },
        { name: "RU5P", value: new Num(1.0) },
      ],
      texName: "ribulose\\_phosphate\\_epimerase",
    })
    .addReaction("phosphoribulokinase", {
      displayName: names.r_phosphoribulokinase,
      fn: new Divide([
        new Mul([
          new Name("ATP"),
          new Name("RU5P"),
          new Name("vmax_phosphoribulokinase"),
        ]),
        new Mul([
          new Add([
            new Name("RU5P"),
            new Mul([
              new Name("km_phosphoribulokinase_RU5P"),
              new Add([
                new Num(1.0),
                new Divide([
                  new Name("Orthophosphate"),
                  new Name("ki_phosphoribulokinase_Orthophosphate"),
                ]),
                new Divide([
                  new Name("RUBP"),
                  new Name("ki_phosphoribulokinase_RUBP"),
                ]),
                new Divide([
                  new Name("_3PGA"),
                  new Name("ki_phosphoribulokinase_3PGA"),
                ]),
              ]),
            ]),
          ]),
          new Add([
            new Mul([
              new Name("ATP"),
              new Add([
                new Num(1.0),
                new Divide([
                  new Name("ADP"),
                  new Name("ki_phosphoribulokinase_4"),
                ]),
              ]),
            ]),
            new Mul([
              new Name("km_phosphoribulokinase_ATP"),
              new Add([
                new Num(1.0),
                new Divide([
                  new Name("ADP"),
                  new Name("ki_phosphoribulokinase_5"),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "RU5P", value: new Num(-1.0) },
        { name: "ATP", value: new Num(-1.0) },
        { name: "RUBP", value: new Num(1.0) },
      ],
      texName: "phosphoribulokinase",
    })
    .addReaction("g6pi", {
      displayName: names.r_g6pi,
      fn: new Mul([
        new Name("kre_g6pi"),
        new Add([
          new Name("F6P"),
          new Minus([new Divide([new Name("G6P"), new Name("keq_g6pi")])]),
        ]),
      ]),
      stoichiometry: [
        { name: "F6P", value: new Num(-1.0) },
        { name: "G6P", value: new Num(1.0) },
      ],
      texName: "g6pi",
    })
    .addReaction("phosphoglucomutase", {
      displayName: names.r_phosphoglucomutase,
      fn: new Mul([
        new Name("kre_phosphoglucomutase"),
        new Add([
          new Name("G6P"),
          new Minus([
            new Divide([new Name("G1P"), new Name("keq_phosphoglucomutase")]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "G6P", value: new Num(-1.0) },
        { name: "G1P", value: new Num(1.0) },
      ],
      texName: "phosphoglucomutase",
    })
    .addReaction("ex_pga", {
      fn: new Divide([
        new Mul([new Name("_3PGA"), new Name("vmax_ex_pga")]),
        new Mul([new Name("N_translocator"), new Name("km_ex_pga")]),
      ]),
      stoichiometry: [{ name: "_3PGA", value: new Num(-1.0) }],
      texName: "ex\\_pga",
    })
    .addReaction("ex_gap", {
      fn: new Divide([
        new Mul([new Name("GAP"), new Name("vmax_ex_pga")]),
        new Mul([new Name("N_translocator"), new Name("km_ex_gap")]),
      ]),
      stoichiometry: [{ name: "GAP", value: new Num(-1.0) }],
      texName: "ex\\_gap",
    })
    .addReaction("ex_dhap", {
      fn: new Divide([
        new Mul([new Name("DHAP"), new Name("vmax_ex_pga")]),
        new Mul([new Name("N_translocator"), new Name("km_ex_dhap")]),
      ]),
      stoichiometry: [{ name: "DHAP", value: new Num(-1.0) }],
      texName: "ex\\_dhap",
    })
    .addReaction("ex_g1p", {
      displayName: names.r_ex_g1p,
      fn: new Divide([
        new Mul([new Name("ATP"), new Name("G1P"), new Name("vmax_ex_g1p")]),
        new Mul([
          new Add([new Name("G1P"), new Name("km_ex_g1p_G1P")]),
          new Add([
            new Mul([
              new Add([
                new Num(1.0),
                new Divide([new Name("ADP"), new Name("ki_ex_g1p")]),
              ]),
              new Add([new Name("ATP"), new Name("km_ex_g1p_ATP")]),
            ]),
            new Divide([
              new Mul([new Name("Orthophosphate"), new Name("km_ex_g1p_ATP")]),
              new Add([
                new Mul([new Name("F6P"), new Name("ki_ex_g1p_F6P")]),
                new Mul([new Name("FBP"), new Name("ki_ex_g1p_FBP")]),
                new Mul([new Name("_3PGA"), new Name("ki_ex_g1p_3PGA")]),
              ]),
            ]),
          ]),
        ]),
      ]),
      stoichiometry: [
        { name: "G1P", value: new Num(-1.0) },
        { name: "ATP", value: new Num(-1.0) },
      ],
      texName: "ex\\_g1p",
    })
    .addReaction("atp_synthase", {
      displayName: names.r_atp_synthase,
      fn: new Divide([
        new Mul([
          new Name("ADP"),
          new Name("Orthophosphate"),
          new Name("vmax_atp_synthase"),
        ]),
        new Mul([
          new Add([new Name("ADP"), new Name("km_atp_synthase_ADP")]),
          new Add([
            new Name("Orthophosphate"),
            new Name("km_atp_synthase_Orthophosphate"),
          ]),
        ]),
      ]),
      stoichiometry: [{ name: "ATP", value: new Num(1.0) }],
      texName: "atp\\_synthase",
    });
}
