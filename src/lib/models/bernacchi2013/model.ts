import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  Exp,
  Max,
  Min,
  Minus,
  Mul,
  Name,
  Num,
  Pow,
  Sqrt,
} from "@computational-biology-aachen/mxlweb-core/mathml";

const T25 = new Num(298.15);

/** `p25 · exp(dHa (Tk − T25) / (R Tk T25))`, Eqn 10. */
function arrhenius(p25: string, dHa: string) {
  return new Mul([
    new Name(p25),
    new Exp(
      new Divide([
        new Mul([new Name(dHa), new Minus([new Name("Tk"), T25])]),
        new Mul([new Name("R"), new Name("Tk"), T25]),
      ]),
    ),
  ]);
}

/** `((T − Topt) / Ω)²` of Eqn 14, with `T` in °C. */
function juneExponent(T: Name | Num) {
  return new Pow(
    new Divide([new Minus([T, new Name("Jmax_Topt")]), new Name("Jmax_omega")]),
    new Num(2),
  );
}

export function initModel(): SteadyStateModelBuilder {
  return (
    new SteadyStateModelBuilder()
      .addCustomUnit("mol_e", {
        symbol: "mol e⁻",
        tex: "\\mathrm{mol\\,e^{-}}",
        description: "mole of electrons",
      })
      .addParameter("Ci", {
        value: 270,
        displayName: "Ci",
        unit: "umol mol^-1",
        texName: "C_i",
        slider: { min: "0", max: "1500", step: "5" },
      })
      .addParameter("PPFD", {
        value: 1500,
        displayName: "PPFD",
        unit: "umol m^-2 s^-1",
        texName: "\\mathrm{PPFD}",
        slider: { min: "0", max: "2500", step: "10" },
      })
      .addParameter("T_leaf", {
        value: 25,
        displayName: "T_leaf",
        unit: "celsius",
        texName: "T_{leaf}",
        slider: { min: "5", max: "40", step: "0.5" },
      })
      // Values at 25 °C. Vcmax and Rd are those of the Fig 2 caption; Jmax, TPU
      // (without deactivation), phi and theta are fitted to Figs 2–4, which
      // need J = 168 at PPFD 1500 (above the caption's Jmax of 160) and a
      // TPU-limited rate of 29.55 (below the caption's TPU of 10.5).
      .addParameter("Vcmax25", {
        value: 98,
        unit: "umol m^-2 s^-1",
        texName: "V_{cmax,25}",
      })
      .addParameter("Jmax25", {
        value: 180,
        unit: "umol m^-2 s^-1",
        texName: "J_{max,25}",
      })
      .addParameter("TPU25", {
        value: 10.62,
        unit: "umol m^-2 s^-1",
        texName: "T_{PU,25}",
      })
      .addParameter("Rd25", {
        value: 1.1,
        unit: "umol m^-2 s^-1",
        texName: "R_{d,25}",
      })
      .addParameter("Gamma_star25", {
        value: 42.75,
        unit: "umol mol^-1",
        texName: "\\Gamma^*_{25}",
      })
      .addParameter("Kc25", {
        value: 404.9,
        unit: "umol mol^-1",
        texName: "K_{c,25}",
      })
      .addParameter("Ko25", {
        value: 278.4,
        unit: "mmol mol^-1",
        texName: "K_{o,25}",
      })
      .addParameter("O", {
        value: 210,
        displayName: "O",
        unit: "mmol mol^-1",
        texName: "O",
      })
      .addParameter("alpha", {
        value: 0.85,
        unit: "dimensionless",
        texName: "\\alpha",
      })
      .addParameter("beta", {
        value: 0.5,
        unit: "dimensionless",
        texName: "\\beta",
      })
      .addParameter("phi", {
        value: 0.82,
        unit: "mol_e E^-1",
        texName: "\\Phi",
      })
      .addParameter("theta", {
        value: 0.85,
        unit: "dimensionless",
        texName: "\\Theta",
      })
      // Temperature responses: Bernacchi et al. (2001) activation energies;
      // June et al. (2004) Jmax and Harley et al. (1992) TPU constants fitted
      // to Figs 2–4, as the paper gives no values for them.
      .addParameter("R", {
        value: 8.314,
        unit: "J K^-1 mol^-1",
        texName: "R",
      })
      .addParameter("Vcmax_dHa", {
        value: 65330,
        unit: "J mol^-1",
        texName: "\\Delta H_{a,V_{cmax}}",
      })
      .addParameter("Rd_dHa", {
        value: 46390,
        unit: "J mol^-1",
        texName: "\\Delta H_{a,R_d}",
      })
      .addParameter("Gamma_star_dHa", {
        value: 37830,
        unit: "J mol^-1",
        texName: "\\Delta H_{a,\\Gamma^*}",
      })
      .addParameter("Kc_dHa", {
        value: 79430,
        unit: "J mol^-1",
        texName: "\\Delta H_{a,K_c}",
      })
      .addParameter("Ko_dHa", {
        value: 36380,
        unit: "J mol^-1",
        texName: "\\Delta H_{a,K_o}",
      })
      .addParameter("Jmax_Topt", {
        value: 56.4,
        unit: "celsius",
        texName: "T_{opt,J}",
      })
      .addParameter("Jmax_omega", {
        value: 30.6,
        unit: "celsius",
        texName: "\\Omega_J",
      })
      .addParameter("TPU_dHa", {
        value: 50630,
        unit: "J mol^-1",
        texName: "\\Delta H_{a,TPU}",
      })
      .addParameter("TPU_dS", {
        value: 840.7,
        unit: "J K^-1 mol^-1",
        texName: "\\Delta S_{TPU}",
      })
      .addParameter("TPU_dHd", {
        value: 258480,
        unit: "J mol^-1",
        texName: "\\Delta H_{d,TPU}",
      })
      .addAssignment("Tk", {
        fn: new Add([new Name("T_leaf"), new Num(273.15)]),
        unit: "K",
        texName: "T_k",
      })
      .addAssignment("Vcmax", {
        fn: arrhenius("Vcmax25", "Vcmax_dHa"),
        displayName: "Vcmax",
        unit: "umol m^-2 s^-1",
        texName: "V_{cmax}",
      })
      .addAssignment("Rd", {
        fn: arrhenius("Rd25", "Rd_dHa"),
        displayName: "Rd",
        unit: "umol m^-2 s^-1",
        texName: "R_d",
      })
      .addAssignment("Gamma_star", {
        fn: arrhenius("Gamma_star25", "Gamma_star_dHa"),
        displayName: "Gamma_star",
        unit: "umol mol^-1",
        texName: "\\Gamma^*",
      })
      .addAssignment("Kc", {
        fn: arrhenius("Kc25", "Kc_dHa"),
        displayName: "Kc",
        unit: "umol mol^-1",
        texName: "K_c",
      })
      .addAssignment("Ko", {
        fn: arrhenius("Ko25", "Ko_dHa"),
        displayName: "Ko",
        unit: "mmol mol^-1",
        texName: "K_o",
      })
      .addAssignment("Jmax", {
        fn: new Mul([
          new Name("Jmax25"),
          new Exp(
            new Minus([
              juneExponent(new Num(25)),
              juneExponent(new Name("T_leaf")),
            ]),
          ),
        ]),
        displayName: "Jmax",
        unit: "umol m^-2 s^-1",
        texName: "J_{max}",
      })
      // Eqn 11, its scaling constant set by TPU25
      .addAssignment("TPU", {
        fn: new Divide([
          arrhenius("TPU25", "TPU_dHa"),
          new Add([
            new Num(1),
            new Exp(
              new Divide([
                new Minus([
                  new Mul([new Name("TPU_dS"), new Name("Tk")]),
                  new Name("TPU_dHd"),
                ]),
                new Mul([new Name("R"), new Name("Tk")]),
              ]),
            ),
          ]),
        ]),
        displayName: "TPU",
        unit: "umol m^-2 s^-1",
        texName: "T_{PU}",
      })
      .addAssignment("absorbed", {
        fn: new Mul([
          new Name("PPFD"),
          new Name("alpha"),
          new Name("phi"),
          new Name("beta"),
        ]),
        displayName: "absorbed",
        unit: "umol m^-2 s^-1",
        texName: "\\text{abs}",
      })
      .addAssignment("Ci_safe", {
        fn: new Max([new Name("Ci"), new Num(1)]),
        displayName: "Ci_safe",
        unit: "umol mol^-1",
        texName: "C_{i, safe}",
      })
      .addAssignment("J", {
        fn: new Divide([
          new Minus([
            new Add([new Name("absorbed"), new Name("Jmax")]),
            new Sqrt(
              new Max([
                new Minus([
                  new Pow(
                    new Add([new Name("absorbed"), new Name("Jmax")]),
                    new Num(2),
                  ),
                  new Mul([
                    new Num(4),
                    new Name("theta"),
                    new Name("absorbed"),
                    new Name("Jmax"),
                  ]),
                ]),
                new Num(0),
              ]),
              new Num(2),
            ),
          ]),
          new Mul([new Num(2), new Name("theta")]),
        ]),
        displayName: "J",
        unit: "umol m^-2 s^-1",
        texName: "J",
      })
      .addAssignment("Wc", {
        fn: new Divide([
          new Mul([new Name("Vcmax"), new Name("Ci_safe")]),
          new Add([
            new Name("Ci_safe"),
            new Mul([
              new Name("Kc"),
              new Add([
                new Num(1),
                new Divide([new Name("O"), new Name("Ko")]),
              ]),
            ]),
          ]),
        ]),
        displayName: "Wc",
        unit: "umol m^-2 s^-1",
        texName: "W_c",
      })
      .addAssignment("Wj", {
        fn: new Divide([
          new Mul([new Name("J"), new Name("Ci_safe")]),
          new Add([
            new Mul([new Num(4.5), new Name("Ci_safe")]),
            new Mul([new Num(10.5), new Name("Gamma_star")]),
          ]),
        ]),
        displayName: "Wj",
        unit: "umol m^-2 s^-1",
        texName: "W_j",
      })
      .addAssignment("co2_factor", {
        fn: new Minus([
          new Num(1),
          new Divide([new Name("Gamma_star"), new Name("Ci_safe")]),
        ]),
        displayName: "co2_factor",
        unit: "dimensionless",
        texName: "1 - \\Gamma^*/C_i",
      })
      // Eqn 7; TPU cannot limit at or below Gamma*
      .addAssignment("Wp", {
        fn: new Divide([
          new Mul([new Num(3), new Name("TPU")]),
          new Max([new Name("co2_factor"), new Num(1e-12)]),
        ]),
        displayName: "Wp",
        unit: "umol m^-2 s^-1",
        texName: "W_p",
      })
      .addAssignment("rubisco", {
        fn: new Minus([
          new Mul([new Name("co2_factor"), new Name("Wc")]),
          new Name("Rd"),
        ]),
        displayName: "Ac",
        unit: "umol m^-2 s^-1",
        texName: "A_c",
      })
      .addAssignment("rubp", {
        fn: new Minus([
          new Mul([new Name("co2_factor"), new Name("Wj")]),
          new Name("Rd"),
        ]),
        displayName: "Aj",
        unit: "umol m^-2 s^-1",
        texName: "A_j",
      })
      .addAssignment("tpu", {
        fn: new Minus([new Mul([new Num(3), new Name("TPU")]), new Name("Rd")]),
        displayName: "Ap",
        unit: "umol m^-2 s^-1",
        texName: "A_p",
      })
      // Eqn 2: below Gamma* this follows Rubisco, not the lowest rate
      .addAssignment("an", {
        fn: new Minus([
          new Mul([
            new Name("co2_factor"),
            new Min([new Name("Wc"), new Name("Wj"), new Name("Wp")]),
          ]),
          new Name("Rd"),
        ]),
        displayName: "An",
        unit: "umol m^-2 s^-1",
        texName: "A_n",
      })
  );
}
