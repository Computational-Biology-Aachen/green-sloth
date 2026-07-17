import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Abs,
  Add,
  Divide,
  Exp,
  GreaterThan,
  LessEqual,
  LessThan,
  Max,
  Min,
  Minus,
  Mul,
  Name,
  Num,
  Piecewise,
  Pow,
  Sqrt,
} from "@computational-biology-aachen/mxlweb-core/mathml";

export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("Ib", {
      value: 100.0,
      texName: "Ib",
      slider: {
        min: "50.0",
        max: "200.0",
        step: "0.1",
      },
    })
    .addParameter("Ig", {
      value: 0.0,
      texName: "Ig",
      slider: {
        min: "0.0",
        max: "0.0",
        step: "0.1",
      },
    })
    .addParameter("Ir", {
      value: 900.0,
      texName: "Ir",
      slider: {
        min: "450.0",
        max: "1800.0",
        step: "0.1",
      },
    })
    .addParameter("Ta", {
      value: 298.15,
      texName: "Ta",
    })
    .addParameter("Tl", {
      value: 298.15,
      texName: "Tl",
    })
    .addParameter("H2OR", {
      value: 0.015,
      texName: "H2OR",
    })
    .addParameter("CO2R", {
      value: 0.00038,
      texName: "CO2R",
    })
    .addParameter("sigma2", {
      value: 0.5,
      texName: "sigma2",
    })
    .addParameter("Jmax25", {
      value: 0.00013928,
      texName: "Jmax25",
    })
    .addParameter("DHaJmax", {
      value: 36210000.0,
      texName: "DHaJmax",
    })
    .addParameter("DHdJmax", {
      value: 215900000.0,
      texName: "DHdJmax",
    })
    .addParameter("DsJmax", {
      value: 690000.0,
      texName: "DsJmax",
    })
    .addParameter("kD0", {
      value: 455000000.0,
      texName: "kD0",
    })
    .addParameter("kDinh", {
      value: 5000000000.0,
      texName: "kDinh",
    })
    .addParameter("kf", {
      value: 56000000.0,
      texName: "kf",
    })
    .addParameter("kp", {
      value: 2654000000.0,
      texName: "kp",
    })
    .addParameter("fcyc", {
      value: 0.1,
      texName: "fcyc",
    })
    .addParameter("fpseudo", {
      value: 0.1,
      texName: "fpseudo",
    })
    .addParameter("theta", {
      value: 0.7,
      texName: "theta",
    })
    .addParameter("gamma1", {
      value: 0.2,
      texName: "gamma1",
    })
    .addParameter("gamma2", {
      value: 0.6,
      texName: "gamma2",
    })
    .addParameter("gamma3", {
      value: 0.2,
      texName: "gamma3",
    })
    .addParameter("PhiqEmax", {
      value: 0.2,
      texName: "PhiqEmax",
    })
    .addParameter("KiqEp", {
      value: 0.0187,
      texName: "KiqEp",
    })
    .addParameter("KdqEp", {
      value: 0.0239,
      texName: "KdqEp",
    })
    .addParameter("KiqEz", {
      value: 0.00187,
      texName: "KiqEz",
    })
    .addParameter("KdqEz", {
      value: 0.00239,
      texName: "KdqEz",
    })
    .addParameter("Kinh0", {
      value: 0.1,
      texName: "Kinh0",
    })
    .addParameter("fprot", {
      value: 0.1,
      texName: "fprot",
    })
    .addParameter("Krep25", {
      value: 0.000192,
      texName: "Krep25",
    })
    .addParameter("DHaKrep", {
      value: 160800000.0,
      texName: "DHaKrep",
    })
    .addParameter("DHdKrep", {
      value: 233230000.0,
      texName: "DHdKrep",
    })
    .addParameter("DsKrep", {
      value: 780000.0,
      texName: "DsKrep",
    })
    .addParameter("alphar_alpha25", {
      value: 6550.0,
      texName: "alphar\\_alpha25",
    })
    .addParameter("DHaAlphar", {
      value: 67320000.0,
      texName: "DHaAlphar",
    })
    .addParameter("DHaKalpha", {
      value: 90500000.0,
      texName: "DHaKalpha",
    })
    .addParameter("DsKalpha", {
      value: 1080000.0,
      texName: "DsKalpha",
    })
    .addParameter("DHdKalpha", {
      value: 328000000.0,
      texName: "DHdKalpha",
    })
    .addParameter("Iac", {
      value: 1.6e-6,
      texName: "Iac",
    })
    .addParameter("alpharac", {
      value: 0.05,
      texName: "alpharac",
    })
    .addParameter("alpharav", {
      value: 0.25,
      texName: "alpharav",
    })
    .addParameter("thetaalphar", {
      value: 0.36,
      texName: "thetaalphar",
    })
    .addParameter("Kialpha25", {
      value: 0.00149,
      texName: "Kialpha25",
    })
    .addParameter("Kdalpha25", {
      value: 0.00186,
      texName: "Kdalpha25",
    })
    .addParameter("fR0", {
      value: 0.04,
      texName: "fR0",
    })
    .addParameter("alphafR", {
      value: 2500.0,
      texName: "alphafR",
    })
    .addParameter("thetafR", {
      value: 0.96,
      texName: "thetafR",
    })
    .addParameter("KiR", {
      value: 0.00628,
      texName: "KiR",
    })
    .addParameter("KdR", {
      value: 0.0075,
      texName: "KdR",
    })
    .addParameter("Vrmax", {
      value: 0.00011865,
      texName: "Vrmax",
    })
    .addParameter("KmPGA", {
      value: 5e-6,
      texName: "KmPGA",
    })
    .addParameter("RB", {
      value: 1.59e-5,
      texName: "RB",
    })
    .addParameter("Kc25", {
      value: 4.16,
      texName: "Kc25",
    })
    .addParameter("DHaKc", {
      value: 41820000.0,
      texName: "DHaKc",
    })
    .addParameter("Ko25", {
      value: 1.26,
      texName: "Ko25",
    })
    .addParameter("DHaKo", {
      value: 55150000.0,
      texName: "DHaKo",
    })
    .addParameter("Kmc25", {
      value: 0.0002617,
      texName: "Kmc25",
    })
    .addParameter("DHaKmc", {
      value: 49430000.0,
      texName: "DHaKmc",
    })
    .addParameter("Kmo25", {
      value: 0.1985,
      texName: "Kmo25",
    })
    .addParameter("DHaKmo", {
      value: 29080000.0,
      texName: "DHaKmo",
    })
    .addParameter("KaRCA", {
      value: 0.0102,
      texName: "KaRCA",
    })
    .addParameter("ac", {
      value: 0.27,
      texName: "ac",
    })
    .addParameter("bc", {
      value: 14000.0,
      texName: "bc",
    })
    .addParameter("KdRB", {
      value: 0.00068,
      texName: "KdRB",
    })
    .addParameter("Krca", {
      value: 0.0863,
      texName: "Krca",
    })
    .addParameter("fRBmin", {
      value: 0.48,
      texName: "fRBmin",
    })
    .addParameter("O2", {
      value: 0.21,
      texName: "O2",
    })
    .addParameter("RCA", {
      value: 0.11737,
      texName: "RCA",
    })
    .addParameter("DHdRCA", {
      value: 290200000.0,
      texName: "DHdRCA",
    })
    .addParameter("ToRCA", {
      value: 300.4,
      texName: "ToRCA",
    })
    .addParameter("DHaRCA", {
      value: 30000000.0,
      texName: "DHaRCA",
    })
    .addParameter("KmRuBP", {
      value: 0.02,
      texName: "KmRuBP",
    })
    .addParameter("Vch", {
      value: 1e-5,
      texName: "Vch",
    })
    .addParameter("KiPGA", {
      value: 0.84,
      texName: "KiPGA",
    })
    .addParameter("TPU25", {
      value: 7.47e-6,
      texName: "TPU25",
    })
    .addParameter("DHaTPU", {
      value: 57500000.0,
      texName: "DHaTPU",
    })
    .addParameter("DHdTPU", {
      value: 246700000.0,
      texName: "DHdTPU",
    })
    .addParameter("DsTPU", {
      value: 790000.0,
      texName: "DsTPU",
    })
    .addParameter("DHaGc", {
      value: 70200000.0,
      texName: "DHaGc",
    })
    .addParameter("DHdGc", {
      value: 94000000.0,
      texName: "DHdGc",
    })
    .addParameter("DsGc", {
      value: 320000.0,
      texName: "DsGc",
    })
    .addParameter("DHaGw", {
      value: 70200000.0,
      texName: "DHaGw",
    })
    .addParameter("DHdGw", {
      value: 94000000.0,
      texName: "DHdGw",
    })
    .addParameter("DsGw", {
      value: 320000.0,
      texName: "DsGw",
    })
    .addParameter("Rm25", {
      value: 9.9e-7,
      texName: "Rm25",
    })
    .addParameter("DHaRm", {
      value: 56200000.0,
      texName: "DHaRm",
    })
    .addParameter("kPR", {
      value: 0.024,
      texName: "kPR",
    })
    .addParameter("Vref", {
      value: 0.000155,
      texName: "Vref",
    })
    .addParameter("Scm", {
      value: 7.1,
      texName: "Scm",
    })
    .addParameter("Sm", {
      value: 9.8,
      texName: "Sm",
    })
    .addParameter("falphaSc", {
      value: 0.93,
      texName: "falphaSc",
    })
    .addParameter("gcm25", {
      value: 0.39,
      texName: "gcm25",
    })
    .addParameter("gw25", {
      value: 0.75,
      texName: "gw25",
    })
    .addParameter("D0", {
      value: 740000.0,
      texName: "D0",
    })
    .addParameter("fI0", {
      value: 0.39,
      texName: "fI0",
    })
    .addParameter("gswm", {
      value: 0.48,
      texName: "gswm",
    })
    .addParameter("alphafI", {
      value: 767.0,
      texName: "alphafI",
    })
    .addParameter("thetafI", {
      value: 0.88,
      texName: "thetafI",
    })
    .addParameter("Kgsi", {
      value: 0.00114,
      texName: "Kgsi",
    })
    .addParameter("Kgsd", {
      value: 0.00114,
      texName: "Kgsd",
    })
    .addParameter("gbw", {
      value: 9.2,
      texName: "gbw",
    })
    .addParameter("volume_chamber", {
      value: 8e-5,
      texName: "volume\\_chamber",
    })
    .addParameter("leaf_surface", {
      value: 0.0002,
      texName: "leaf\\_surface",
    })
    .addParameter("Flow", {
      value: 0.0005,
      texName: "Flow",
    })
    .addParameter("alphab", {
      value: 0.92,
      texName: "alphab",
    })
    .addParameter("alphag", {
      value: 0.72,
      texName: "alphag",
    })
    .addParameter("alphared", {
      value: 0.83,
      texName: "alphared",
    })
    .addParameter("alphabp", {
      value: 0.66,
      texName: "alphabp",
    })
    .addParameter("alphagp", {
      value: 0.6,
      texName: "alphagp",
    })
    .addParameter("alpharp", {
      value: 0.8,
      texName: "alpharp",
    })
    .addVariable("PGA", {
      value: 5e-5,
      texName: "PGA",
    })
    .addVariable("RuBP", {
      value: 5e-5,
      texName: "RuBP",
    })
    .addVariable("fRB", {
      value: 0.25,
      texName: "fRB",
    })
    .addVariable("fP", {
      value: 0.0,
      texName: "fP",
    })
    .addVariable("fZ", {
      value: 0.0,
      texName: "fZ",
    })
    .addVariable("alphar", {
      value: 1.0,
      texName: "alphar",
    })
    .addVariable("PSIId", {
      value: 0.0,
      texName: "PSIId",
    })
    .addVariable("fR", {
      value: 0.0,
      texName: "fR",
    })
    .addVariable("PR", {
      value: 0.0,
      texName: "PR",
    })
    .addVariable("Cc", {
      value: 0.00038,
      texName: "Cc",
    })
    .addVariable("Ccyt", {
      value: 0.00038,
      texName: "Ccyt",
    })
    .addVariable("Ci", {
      value: 0.00038,
      texName: "Ci",
    })
    .addVariable("Ca", {
      value: 0.00038,
      texName: "Ca",
    })
    .addVariable("H2OS", {
      value: 0.02,
      texName: "H2OS",
    })
    .addVariable("gsw", {
      value: 0.09,
      texName: "gsw",
    })
    .addVariable("sumA", {
      value: 0.0,
      texName: "sumA",
    })
    .addAssignment("PAR", {
      fn: new Add([new Name("Ib"), new Name("Ig"), new Name("Ir")]),
      texName: "PAR",
    })
    .addAssignment("PARa", {
      fn: new Add([
        new Mul([new Name("Ib"), new Name("alphab")]),
        new Mul([new Name("Ig"), new Name("alphag")]),
        new Mul([new Name("Ir"), new Name("alphared")]),
      ]),
      texName: "PARa",
    })
    .addAssignment("PARaP", {
      fn: new Add([
        new Mul([new Name("Ib"), new Name("alphabp")]),
        new Mul([new Name("Ig"), new Name("alphagp")]),
        new Mul([new Name("Ir"), new Name("alpharp")]),
      ]),
      texName: "PARaP",
    })
    .addAssignment("Jmax", {
      fn: new Divide([
        new Mul([
          new Name("Jmax25"),
          new Add([
            new Num(1.0),
            new Exp(
              new Add([
                new Mul([new Num(0.00012027904738994468), new Name("DsJmax")]),
                new Minus([
                  new Mul([new Num(4.034179016935928e-7), new Name("DHdJmax")]),
                ]),
              ]),
            ),
          ]),
          new Exp(
            new Divide([
              new Mul([
                new Num(4.034179016935928e-7),
                new Name("DHaJmax"),
                new Add([new Num(-298.15), new Name("Tl")]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
        new Add([
          new Num(1.0),
          new Exp(
            new Divide([
              new Add([
                new Minus([
                  new Mul([
                    new Num(0.00012027904738994468),
                    new Name("DHdJmax"),
                  ]),
                ]),
                new Mul([
                  new Num(0.00012027904738994468),
                  new Name("DsJmax"),
                  new Name("Tl"),
                ]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
      ]),
      texName: "Jmax",
    })
    .addAssignment("Krep", {
      fn: new Divide([
        new Mul([
          new Name("Krep25"),
          new Add([
            new Num(1.0),
            new Exp(
              new Add([
                new Mul([new Num(0.00012027904738994468), new Name("DsKrep")]),
                new Minus([
                  new Mul([new Num(4.034179016935928e-7), new Name("DHdKrep")]),
                ]),
              ]),
            ),
          ]),
          new Exp(
            new Divide([
              new Mul([
                new Num(4.034179016935928e-7),
                new Name("DHaKrep"),
                new Add([new Num(-298.15), new Name("Tl")]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
        new Add([
          new Num(1.0),
          new Exp(
            new Divide([
              new Add([
                new Minus([
                  new Mul([
                    new Num(0.00012027904738994468),
                    new Name("DHdKrep"),
                  ]),
                ]),
                new Mul([
                  new Num(0.00012027904738994468),
                  new Name("DsKrep"),
                  new Name("Tl"),
                ]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
      ]),
      texName: "Krep",
    })
    .addAssignment("TPU", {
      fn: new Divide([
        new Mul([
          new Name("TPU25"),
          new Add([
            new Num(1.0),
            new Exp(
              new Add([
                new Mul([new Num(0.00012027904738994468), new Name("DsTPU")]),
                new Minus([
                  new Mul([new Num(4.034179016935928e-7), new Name("DHdTPU")]),
                ]),
              ]),
            ),
          ]),
          new Exp(
            new Divide([
              new Mul([
                new Num(4.034179016935928e-7),
                new Name("DHaTPU"),
                new Add([new Num(-298.15), new Name("Tl")]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
        new Add([
          new Num(1.0),
          new Exp(
            new Divide([
              new Add([
                new Minus([
                  new Mul([
                    new Num(0.00012027904738994468),
                    new Name("DHdTPU"),
                  ]),
                ]),
                new Mul([
                  new Num(0.00012027904738994468),
                  new Name("DsTPU"),
                  new Name("Tl"),
                ]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
      ]),
      texName: "TPU",
    })
    .addAssignment("Kc", {
      fn: new Mul([
        new Name("Kc25"),
        new Exp(
          new Divide([
            new Mul([
              new Num(4.034179016935928e-7),
              new Name("DHaKc"),
              new Add([new Num(-298.15), new Name("Tl")]),
            ]),
            new Name("Tl"),
          ]),
        ),
      ]),
      texName: "Kc",
    })
    .addAssignment("Ko", {
      fn: new Mul([
        new Name("Ko25"),
        new Exp(
          new Divide([
            new Mul([
              new Num(4.034179016935928e-7),
              new Name("DHaKo"),
              new Add([new Num(-298.15), new Name("Tl")]),
            ]),
            new Name("Tl"),
          ]),
        ),
      ]),
      texName: "Ko",
    })
    .addAssignment("Kmc", {
      fn: new Mul([
        new Name("Kmc25"),
        new Exp(
          new Divide([
            new Mul([
              new Num(4.034179016935928e-7),
              new Name("DHaKmc"),
              new Add([new Num(-298.15), new Name("Tl")]),
            ]),
            new Name("Tl"),
          ]),
        ),
      ]),
      texName: "Kmc",
    })
    .addAssignment("Kmo", {
      fn: new Mul([
        new Name("Kmo25"),
        new Exp(
          new Divide([
            new Mul([
              new Num(4.034179016935928e-7),
              new Name("DHaKmo"),
              new Add([new Num(-298.15), new Name("Tl")]),
            ]),
            new Name("Tl"),
          ]),
        ),
      ]),
      texName: "Kmo",
    })
    .addAssignment("Rm", {
      fn: new Mul([
        new Name("Rm25"),
        new Exp(
          new Divide([
            new Mul([
              new Num(4.034179016935928e-7),
              new Name("DHaRm"),
              new Add([new Num(-298.15), new Name("Tl")]),
            ]),
            new Name("Tl"),
          ]),
        ),
      ]),
      texName: "Rm",
    })
    .addAssignment("gcm", {
      fn: new Divide([
        new Mul([
          new Name("gcm25"),
          new Add([
            new Num(1.0),
            new Exp(
              new Add([
                new Mul([new Num(0.00012027904738994468), new Name("DsGc")]),
                new Minus([
                  new Mul([new Num(4.034179016935928e-7), new Name("DHdGc")]),
                ]),
              ]),
            ),
          ]),
          new Exp(
            new Divide([
              new Mul([
                new Num(4.034179016935928e-7),
                new Name("DHaGc"),
                new Add([new Num(-298.15), new Name("Tl")]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
        new Add([
          new Num(1.0),
          new Exp(
            new Divide([
              new Add([
                new Minus([
                  new Mul([new Num(0.00012027904738994468), new Name("DHdGc")]),
                ]),
                new Mul([
                  new Num(0.00012027904738994468),
                  new Name("DsGc"),
                  new Name("Tl"),
                ]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
      ]),
      texName: "gcm",
    })
    .addAssignment("gw", {
      fn: new Divide([
        new Mul([
          new Name("gw25"),
          new Add([
            new Num(1.0),
            new Exp(
              new Add([
                new Mul([new Num(0.00012027904738994468), new Name("DsGw")]),
                new Minus([
                  new Mul([new Num(4.034179016935928e-7), new Name("DHdGw")]),
                ]),
              ]),
            ),
          ]),
          new Exp(
            new Divide([
              new Mul([
                new Num(4.034179016935928e-7),
                new Name("DHaGw"),
                new Add([new Num(-298.15), new Name("Tl")]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
        new Add([
          new Num(1.0),
          new Exp(
            new Divide([
              new Add([
                new Minus([
                  new Mul([new Num(0.00012027904738994468), new Name("DHdGw")]),
                ]),
                new Mul([
                  new Num(0.00012027904738994468),
                  new Name("DsGw"),
                  new Name("Tl"),
                ]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
      ]),
      texName: "gw",
    })
    .addAssignment("alphar_alpha", {
      fn: new Mul([
        new Name("alphar_alpha25"),
        new Exp(
          new Divide([
            new Mul([
              new Num(4.034179016935928e-7),
              new Name("DHaAlphar"),
              new Add([new Num(298.15), new Minus([new Name("Tl")])]),
            ]),
            new Name("Tl"),
          ]),
        ),
      ]),
      texName: "alphar\\_alpha",
    })
    .addAssignment("Kialpha", {
      fn: new Divide([
        new Mul([
          new Name("Kialpha25"),
          new Add([
            new Num(1.0),
            new Exp(
              new Add([
                new Mul([
                  new Num(0.00012027904738994468),
                  new Name("DsKalpha"),
                ]),
                new Minus([
                  new Mul([
                    new Num(4.034179016935928e-7),
                    new Name("DHdKalpha"),
                  ]),
                ]),
              ]),
            ),
          ]),
          new Exp(
            new Divide([
              new Mul([
                new Num(4.034179016935928e-7),
                new Name("DHaKalpha"),
                new Add([new Num(-298.15), new Name("Tl")]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
        new Add([
          new Num(1.0),
          new Exp(
            new Divide([
              new Add([
                new Minus([
                  new Mul([
                    new Num(0.00012027904738994468),
                    new Name("DHdKalpha"),
                  ]),
                ]),
                new Mul([
                  new Num(0.00012027904738994468),
                  new Name("DsKalpha"),
                  new Name("Tl"),
                ]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
      ]),
      texName: "Kialpha",
    })
    .addAssignment("Kdalpha", {
      fn: new Divide([
        new Mul([
          new Name("Kdalpha25"),
          new Add([
            new Num(1.0),
            new Exp(
              new Add([
                new Mul([
                  new Num(0.00012027904738994468),
                  new Name("DsKalpha"),
                ]),
                new Minus([
                  new Mul([
                    new Num(4.034179016935928e-7),
                    new Name("DHdKalpha"),
                  ]),
                ]),
              ]),
            ),
          ]),
          new Exp(
            new Divide([
              new Mul([
                new Num(4.034179016935928e-7),
                new Name("DHaKalpha"),
                new Add([new Num(-298.15), new Name("Tl")]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
        new Add([
          new Num(1.0),
          new Exp(
            new Divide([
              new Add([
                new Minus([
                  new Mul([
                    new Num(0.00012027904738994468),
                    new Name("DHdKalpha"),
                  ]),
                ]),
                new Mul([
                  new Num(0.00012027904738994468),
                  new Name("DsKalpha"),
                  new Name("Tl"),
                ]),
              ]),
              new Name("Tl"),
            ]),
          ),
        ]),
      ]),
      texName: "Kdalpha",
    })
    .addAssignment("PhiqE", {
      fn: new Mul([
        new Name("PhiqEmax"),
        new Add([
          new Mul([new Name("fP"), new Name("gamma1")]),
          new Mul([new Name("fZ"), new Name("gamma3")]),
          new Mul([new Name("fP"), new Name("fZ"), new Name("gamma2")]),
        ]),
      ]),
      texName: "PhiqE",
    })
    .addAssignment("Rp", {
      fn: new Mul([new Num(0.5), new Name("PR"), new Name("kPR")]),
      texName: "Rp",
    })
    .addAssignment("Sc", {
      fn: new Mul([new Name("Scm"), new Name("alphar"), new Name("falphaSc")]),
      texName: "Sc",
    })
    .addAssignment("gc", {
      fn: new Divide([
        new Mul([new Name("Sc"), new Name("gcm")]),
        new Name("Sm"),
      ]),
      texName: "gc",
    })
    .addAssignment("Kmapp_RuBP", {
      fn: new Mul([
        new Name("KmRuBP"),
        new Add([
          new Num(1.0),
          new Divide([
            new Name("PGA"),
            new Mul([new Name("KiPGA"), new Name("Vch")]),
          ]),
        ]),
      ]),
      texName: "Kmapp\\_RuBP",
    })
    .addAssignment("fRCA", {
      fn: new Divide([
        new Mul([
          new Name("DHdRCA"),
          new Exp(
            new Divide([
              new Mul([
                new Num(0.00012027904738994468),
                new Name("DHaRCA"),
                new Add([new Name("Tl"), new Minus([new Name("ToRCA")])]),
              ]),
              new Mul([new Name("Tl"), new Name("ToRCA")]),
            ]),
          ),
        ]),
        new Add([
          new Name("DHdRCA"),
          new Minus([
            new Mul([
              new Name("DHaRCA"),
              new Add([
                new Num(1.0),
                new Minus([
                  new Exp(
                    new Divide([
                      new Mul([
                        new Num(0.00012027904738994468),
                        new Name("DHdRCA"),
                        new Add([
                          new Name("Tl"),
                          new Minus([new Name("ToRCA")]),
                        ]),
                      ]),
                      new Mul([new Name("Tl"), new Name("ToRCA")]),
                    ]),
                  ),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
      texName: "fRCA",
    })
    .addAssignment("fRBmax", {
      fn: new Divide([
        new Mul([new Name("RCA"), new Name("fRCA")]),
        new Add([
          new Name("KaRCA"),
          new Mul([new Name("RCA"), new Name("fRCA")]),
        ]),
      ]),
      texName: "fRBmax",
    })
    .addAssignment("PARaP2", {
      fn: new Mul([new Name("PARaP"), new Name("alphar"), new Name("sigma2")]),
      texName: "PARaP2",
    })
    .addAssignment("fRuBP", {
      fn: new Divide([
        new Mul([
          new Num(0.5),
          new Name("Vch"),
          new Add([
            new Name("Kmapp_RuBP"),
            new Minus([
              new Sqrt(
                new Max([
                  new Num(0.0),
                  new Add([
                    new Pow(
                      new Add([
                        new Name("Kmapp_RuBP"),
                        new Divide([new Name("RB"), new Name("Vch")]),
                        new Divide([new Name("RuBP"), new Name("Vch")]),
                      ]),
                      new Num(2.0),
                    ),
                    new Minus([
                      new Divide([
                        new Mul([
                          new Num(4.0),
                          new Name("RB"),
                          new Name("RuBP"),
                        ]),
                        new Pow(new Name("Vch"), new Num(2.0)),
                      ]),
                    ]),
                  ]),
                ]),
                new Num(2),
              ),
            ]),
            new Divide([new Name("RB"), new Name("Vch")]),
            new Divide([new Name("RuBP"), new Name("Vch")]),
          ]),
        ]),
        new Name("RB"),
      ]),
      texName: "fRuBP",
    })
    .addAssignment("phi", {
      fn: new Divide([
        new Mul([new Name("Kmc"), new Name("Ko"), new Name("O2")]),
        new Max([
          new Num(1e-30),
          new Mul([new Name("Cc"), new Name("Kc"), new Name("Kmo")]),
        ]),
      ]),
      texName: "phi",
    })
    .addAssignment("Vc", {
      fn: new Divide([
        new Mul([
          new Name("Cc"),
          new Name("Kc"),
          new Name("RB"),
          new Name("fRB"),
          new Name("fRuBP"),
        ]),
        new Max([
          new Num(1e-30),
          new Add([
            new Name("Cc"),
            new Mul([
              new Name("Kmc"),
              new Add([
                new Num(1.0),
                new Divide([new Name("O2"), new Name("Kmo")]),
              ]),
            ]),
          ]),
        ]),
      ]),
      texName: "Vc",
    })
    .addAssignment("VrTPU", {
      fn: new Divide([
        new Mul([
          new Num(3.0),
          new Name("TPU"),
          new Add([new Num(2.0), new Mul([new Num(1.5), new Name("phi")])]),
        ]),
        new Max([
          new Num(1e-30),
          new Add([
            new Num(1.0),
            new Minus([new Mul([new Num(0.5), new Name("phi")])]),
          ]),
        ]),
      ]),
      texName: "VrTPU",
    })
    .addAssignment("VrE", {
      fn: new Divide([
        new Mul([new Name("PGA"), new Name("Vrmax"), new Name("fR")]),
        new Max([
          new Num(1e-30),
          new Add([new Name("KmPGA"), new Name("PGA")]),
        ]),
      ]),
      texName: "VrE",
    })
    .addAssignment("A", {
      fn: new Mul([
        new Name("gw"),
        new Add([new Name("Ci"), new Minus([new Name("Ccyt")])]),
      ]),
      texName: "A",
    })
    .addAssignment("gm", {
      fn: new Divide([
        new Name("A"),
        new Max([
          new Num(1e-30),
          new Add([new Name("Ci"), new Minus([new Name("Cc")])]),
        ]),
      ]),
      texName: "gm",
    })
    .addAssignment("Fm_d", {
      fn: new Divide([
        new Name("kf"),
        new Add([new Name("kDinh"), new Name("kf")]),
      ]),
      texName: "Fm\\_d",
    })
    .addAssignment("Fm_a", {
      fn: new Divide([
        new Name("kf"),
        new Add([new Name("kD0"), new Name("kf")]),
      ]),
      texName: "Fm\\_a",
    })
    .addAssignment("Fmp_d", {
      fn: new Divide([
        new Mul([new Name("alphar"), new Name("kf")]),
        new Add([new Name("kDinh"), new Name("kf")]),
      ]),
      texName: "Fmp\\_d",
    })
    .addAssignment("Fo_d", {
      fn: new Divide([
        new Name("kf"),
        new Add([new Name("kDinh"), new Name("kf")]),
      ]),
      texName: "Fo\\_d",
    })
    .addAssignment("Fo_a", {
      fn: new Divide([
        new Name("kf"),
        new Add([new Name("kD0"), new Name("kf"), new Name("kp")]),
      ]),
      texName: "Fo\\_a",
    })
    .addAssignment("Fop_d", {
      fn: new Divide([
        new Mul([new Name("alphar"), new Name("kf")]),
        new Add([new Name("kDinh"), new Name("kf")]),
      ]),
      texName: "Fop\\_d",
    })
    .addAssignment("fRBss_nr", {
      fn: new Min([
        new Num(1.0),
        new Add([new Name("ac"), new Mul([new Name("Cc"), new Name("bc")])]),
      ]),
      texName: "fRBss\\_nr",
    })
    .addAssignment("qI", {
      fn: new Add([
        new Num(-1.0),
        new Divide([
          new Name("Fm_a"),
          new Max([
            new Num(1e-30),
            new Add([
              new Mul([
                new Name("Fm_a"),
                new Add([new Num(1.0), new Minus([new Name("PSIId")])]),
              ]),
              new Mul([new Name("Fmp_d"), new Name("PSIId")]),
            ]),
          ]),
        ]),
      ]),
      texName: "qI",
    })
    .addAssignment("alpharss", {
      fn: new Min([
        new Add([
          new Num(1.0),
          new Divide([
            new Mul([new Name("Ib"), new Name("alpharac")]),
            new Name("Iac"),
          ]),
        ]),
        new Add([
          new Num(1.0),
          new Name("alpharac"),
          new Minus([
            new Divide([
              new Add([
                new Mul([new Num(0.5), new Name("alpharav")]),
                new Minus([
                  new Mul([
                    new Num(0.5),
                    new Sqrt(
                      new Max([
                        new Num(0.0),
                        new Add([
                          new Pow(
                            new Add([
                              new Name("alpharav"),
                              new Mul([
                                new Name("alphar_alpha"),
                                new Add([
                                  new Name("Ib"),
                                  new Minus([new Name("Iac")]),
                                ]),
                              ]),
                            ]),
                            new Num(2.0),
                          ),
                          new Minus([
                            new Mul([
                              new Num(4.0),
                              new Name("alphar_alpha"),
                              new Name("alpharav"),
                              new Name("thetaalphar"),
                              new Add([
                                new Name("Ib"),
                                new Minus([new Name("Iac")]),
                              ]),
                            ]),
                          ]),
                        ]),
                      ]),
                      new Num(2),
                    ),
                  ]),
                ]),
                new Mul([
                  new Num(0.5),
                  new Name("alphar_alpha"),
                  new Add([new Name("Ib"), new Minus([new Name("Iac")])]),
                ]),
              ]),
              new Name("thetaalphar"),
            ]),
          ]),
        ]),
      ]),
      texName: "alpharss",
    })
    .addAssignment("Kinh", {
      fn: new Max([
        new Num(0.0),
        new Add([
          new Name("Kinh0"),
          new Minus([new Mul([new Name("PhiqE"), new Name("fprot")])]),
        ]),
      ]),
      texName: "Kinh",
    })
    .addAssignment("PhiIId", {
      fn: new Divide([
        new Add([new Name("Fm_a"), new Minus([new Name("Fo_a")])]),
        new Name("Fm_a"),
      ]),
      texName: "PhiIId",
    })
    .addAssignment("Fo", {
      fn: new Add([
        new Mul([
          new Name("Fo_a"),
          new Add([new Num(1.0), new Minus([new Name("PSIId")])]),
        ]),
        new Mul([new Name("Fo_d"), new Name("PSIId")]),
      ]),
      texName: "Fo",
    })
    .addAssignment("fRss", {
      fn: new Add([
        new Name("fR0"),
        new Divide([
          new Add([
            new Num(0.5),
            new Minus([new Mul([new Num(0.5), new Name("fR0")])]),
            new Minus([
              new Mul([
                new Num(0.5),
                new Sqrt(
                  new Max([
                    new Num(0.0),
                    new Add([
                      new Pow(
                        new Add([
                          new Num(1.0),
                          new Minus([new Name("fR0")]),
                          new Mul([new Name("PARa"), new Name("alphafR")]),
                        ]),
                        new Num(2.0),
                      ),
                      new Minus([
                        new Mul([
                          new Num(4.0),
                          new Name("PARa"),
                          new Name("alphafR"),
                          new Name("thetafR"),
                          new Add([new Num(1.0), new Minus([new Name("fR0")])]),
                        ]),
                      ]),
                    ]),
                  ]),
                  new Num(2),
                ),
              ]),
            ]),
            new Mul([new Num(0.5), new Name("PARa"), new Name("alphafR")]),
          ]),
          new Name("thetafR"),
        ]),
      ]),
      texName: "fRss",
    })
    .addAssignment("Fm", {
      fn: new Add([
        new Mul([
          new Name("Fm_a"),
          new Add([new Num(1.0), new Minus([new Name("PSIId")])]),
        ]),
        new Mul([new Name("Fm_d"), new Name("PSIId")]),
      ]),
      texName: "Fm",
    })
    .addAssignment("kD", {
      fn: new Add([
        new Minus([new Name("kf")]),
        new Minus([new Name("kp")]),
        new Divide([
          new Name("kp"),
          new Add([new Name("PhiIId"), new Minus([new Name("PhiqE")])]),
        ]),
      ]),
      texName: "kD",
    })
    .addAssignment("Fmp_a", {
      fn: new Divide([
        new Mul([new Name("alphar"), new Name("kf")]),
        new Add([new Name("kD"), new Name("kf")]),
      ]),
      texName: "Fmp\\_a",
    })
    .addAssignment("PhiIIop", {
      fn: new Divide([
        new Add([new Name("Fm"), new Minus([new Name("Fo")])]),
        new Name("Fm"),
      ]),
      texName: "PhiIIop",
    })
    .addAssignment("Fmp", {
      fn: new Add([
        new Mul([
          new Name("Fmp_a"),
          new Add([new Num(1.0), new Minus([new Name("PSIId")])]),
        ]),
        new Mul([new Name("Fmp_d"), new Name("PSIId")]),
      ]),
      texName: "Fmp",
    })
    .addAssignment("PhiIIo", {
      fn: new Add([new Name("PhiIIop"), new Minus([new Name("PhiqE")])]),
      texName: "PhiIIo",
    })
    .addAssignment("J2pp", {
      fn: new Divide([
        new Add([
          new Mul([new Num(0.5), new Name("Jmax")]),
          new Minus([
            new Mul([
              new Num(0.5),
              new Sqrt(
                new Max([
                  new Num(0.0),
                  new Add([
                    new Pow(
                      new Add([
                        new Name("Jmax"),
                        new Mul([new Name("PARaP2"), new Name("PhiIIop")]),
                      ]),
                      new Num(2.0),
                    ),
                    new Minus([
                      new Mul([
                        new Num(4.0),
                        new Name("Jmax"),
                        new Name("PARaP2"),
                        new Name("PhiIIop"),
                        new Name("theta"),
                      ]),
                    ]),
                  ]),
                ]),
                new Num(2),
              ),
            ]),
          ]),
          new Mul([new Num(0.5), new Name("PARaP2"), new Name("PhiIIop")]),
        ]),
        new Name("theta"),
      ]),
      texName: "J2pp",
    })
    .addAssignment("J2pm", {
      fn: new Divide([
        new Mul([
          new Num(2.0),
          new Add([new Num(2.0), new Mul([new Num(2.0), new Name("phi")])]),
          new Min([new Name("VrE"), new Name("VrTPU")]),
        ]),
        new Mul([
          new Add([
            new Num(1.0),
            new Minus([
              new Divide([
                new Name("fpseudo"),
                new Add([new Num(1.0), new Minus([new Name("fcyc")])]),
              ]),
            ]),
          ]),
          new Add([new Num(2.0), new Mul([new Num(1.5), new Name("phi")])]),
        ]),
      ]),
      texName: "J2pm",
    })
    .addAssignment("Fop_a", {
      fn: new Divide([
        new Mul([new Name("alphar"), new Name("kf")]),
        new Add([new Name("kD"), new Name("kf"), new Name("kp")]),
      ]),
      texName: "Fop\\_a",
    })
    .addAssignment("qPp", {
      fn: new Piecewise([
        new Divide([
          new Name("J2pp"),
          new Mul([new Name("PARaP2"), new Name("PhiIIop")]),
        ]),
        new GreaterThan([new Name("PARaP2"), new Num(1e-22)]),
        new Num(1.0),
      ]),
      texName: "qPp",
    })
    .addAssignment("NPQ", {
      fn: new Add([
        new Num(-1.0),
        new Divide([new Name("Fm_a"), new Name("Fmp")]),
      ]),
      texName: "NPQ",
    })
    .addAssignment("qPm", {
      fn: new Divide([
        new Mul([new Name("J2pm"), new Name("qPp")]),
        new Max([new Num(1e-30), new Name("J2pp")]),
      ]),
      texName: "qPm",
    })
    .addAssignment("qM", {
      fn: new Add([
        new Num(1.0),
        new Name("NPQ"),
        new Minus([
          new Divide([
            new Mul([new Name("Fm_a"), new Name("alphar")]),
            new Name("Fmp"),
          ]),
        ]),
      ]),
      texName: "qM",
    })
    .addAssignment("qPno_qD", {
      fn: new Min([new Name("qPm"), new Name("qPp")]),
      texName: "qPno\\_qD",
    })
    .addAssignment("qE", {
      fn: new Add([
        new Name("NPQ"),
        new Minus([new Name("qI")]),
        new Minus([new Name("qM")]),
      ]),
      texName: "qE",
    })
    .addAssignment("fqEss", {
      fn: new Add([new Num(1.0), new Minus([new Name("qPno_qD")])]),
      texName: "fqEss",
    })
    .addAssignment("PhiqEss", {
      fn: new Mul([
        new Name("PhiqEmax"),
        new Add([
          new Mul([new Name("fqEss"), new Name("gamma1")]),
          new Mul([new Name("fqEss"), new Name("gamma3")]),
          new Mul([
            new Name("gamma2"),
            new Pow(new Name("fqEss"), new Num(2.0)),
          ]),
        ]),
      ]),
      texName: "PhiqEss",
    })
    .addAssignment("PhiIIoss", {
      fn: new Add([new Name("PhiIIop"), new Minus([new Name("PhiqEss")])]),
      texName: "PhiIIoss",
    })
    .addAssignment("J2qE", {
      fn: new Piecewise([
        new Mul([
          new Name("J2pp"),
          new Add([
            new Num(1.0),
            new Minus([
              new Divide([
                new Add([
                  new Name("PhiIIoss"),
                  new Minus([new Name("PhiIIo")]),
                ]),
                new Name("PhiIIoss"),
              ]),
            ]),
          ]),
        ]),
        new LessThan([new Name("PhiIIo"), new Name("PhiIIoss")]),
        new Name("J2pp"),
      ]),
      texName: "J2qE",
    })
    .addAssignment("VrJ", {
      fn: new Divide([
        new Mul([
          new Num(0.5),
          new Name("J2qE"),
          new Add([
            new Num(1.0),
            new Minus([
              new Divide([
                new Name("fpseudo"),
                new Add([new Num(1.0), new Minus([new Name("fcyc")])]),
              ]),
            ]),
          ]),
          new Add([new Num(2.0), new Mul([new Num(1.5), new Name("phi")])]),
        ]),
        new Add([new Num(2.0), new Mul([new Num(2.0), new Name("phi")])]),
      ]),
      texName: "VrJ",
    })
    .addAssignment("J2", {
      fn: new Min([new Name("J2pm"), new Name("J2qE")]),
      texName: "J2",
    })
    .addAssignment("fRBss_r", {
      fn: new Piecewise([
        new Name("fRBmin"),
        new LessEqual([new Name("PAR"), new Num(1e-22)]),
        new Divide([
          new Min([new Name("VrJ"), new Name("VrTPU")]),
          new Mul([
            new Add([new Num(2.0), new Mul([new Num(1.5), new Name("phi")])]),
            new Max([
              new Num(1e-30),
              new Divide([
                new Name("Vc"),
                new Mul([new Name("fRB"), new Name("fRuBP")]),
              ]),
            ]),
          ]),
        ]),
      ]),
      texName: "fRBss\\_r",
    })
    .addAssignment("Vr", {
      fn: new Min([new Name("VrE"), new Name("VrJ"), new Name("VrTPU")]),
      texName: "Vr",
    })
    .addAssignment("qP", {
      fn: new Divide([
        new Name("J2"),
        new Mul([
          new Name("PARaP2"),
          new Max([new Num(1e-30), new Name("PhiIIo")]),
        ]),
      ]),
      texName: "qP",
    })
    .addAssignment("PhiII", {
      fn: new Piecewise([
        new Divide([new Name("J2"), new Name("PARaP2")]),
        new GreaterThan([new Name("PARaP2"), new Num(1e-22)]),
        new Name("PhiIIo"),
      ]),
      texName: "PhiII",
    })
    .addAssignment("reg_limit", {
      fn: new Piecewise([
        new Num(1.0),
        new LessThan([
          new Abs(new Add([new Name("Vr"), new Minus([new Name("VrJ")])])),
          new Num(1e-22),
        ]),
        new Num(2.0),
        new LessThan([
          new Abs(new Add([new Name("Vr"), new Minus([new Name("VrTPU")])])),
          new Num(1e-22),
        ]),
        new Num(3.0),
      ]),
      texName: "reg\\_limit",
    })
    .addAssignment("fRBss", {
      fn: new Min([new Name("fRBss_nr"), new Name("fRBss_r")]),
      texName: "fRBss",
    })
    .addAssignment("gbc", {
      fn: new Mul([new Num(0.7299270072992701), new Name("gbw")]),
      texName: "gbc",
    })
    .addAssignment("gsc", {
      fn: new Mul([new Num(0.641025641025641), new Name("gsw")]),
      texName: "gsc",
    })
    .addAssignment("Mv", {
      fn: new Mul([new Num(8.231683168316833e-5), new Name("Ta")]),
      texName: "Mv",
    })
    .addAssignment("ea", {
      fn: new Mul([new Num(101000000.0), new Name("H2OR")]),
      texName: "ea",
    })
    .addAssignment("Photo", {
      fn: new Divide([
        new Add([
          new Mul([new Name("CO2R"), new Name("Flow")]),
          new Minus([new Mul([new Name("Ca"), new Name("Flow")])]),
        ]),
        new Name("leaf_surface"),
      ]),
      texName: "Photo",
    })
    .addAssignment("Trmmol", {
      fn: new Divide([
        new Mul([
          new Name("Flow"),
          new Add([new Name("H2OS"), new Minus([new Name("H2OR")])]),
        ]),
        new Mul([
          new Name("leaf_surface"),
          new Add([new Num(1.0), new Minus([new Name("H2OS")])]),
        ]),
      ]),
      texName: "Trmmol",
    })
    .addAssignment("es_leaf", {
      fn: new Mul([
        new Num(610780.0),
        new Exp(
          new Divide([
            new Add([
              new Num(-4717.027349999999),
              new Mul([new Num(17.269), new Name("Tl")]),
            ]),
            new Add([new Num(-35.849999999999966), new Name("Tl")]),
          ]),
        ),
      ]),
      texName: "es\\_leaf",
    })
    .addAssignment("VPDleaf", {
      fn: new Max([
        new Num(100000.0),
        new Add([new Name("es_leaf"), new Minus([new Name("ea")])]),
      ]),
      texName: "VPDleaf",
    })
    .addAssignment("fvpd", {
      fn: new Divide([
        new Num(1.0),
        new Add([
          new Num(1.0),
          new Divide([new Name("VPDleaf"), new Name("D0")]),
        ]),
      ]),
      texName: "fvpd",
    })
    .addAssignment("gtw", {
      fn: new Divide([
        new Mul([
          new Name("Trmmol"),
          new Add([
            new Num(101000000.0),
            new Minus([new Mul([new Num(0.5), new Name("ea")])]),
            new Minus([new Mul([new Num(0.5), new Name("es_leaf")])]),
          ]),
        ]),
        new Name("VPDleaf"),
      ]),
      texName: "gtw",
    })
    .addAssignment("transpiration", {
      fn: new Divide([
        new Mul([new Num(1.0), new Name("VPDleaf")]),
        new Mul([
          new Add([
            new Divide([new Num(1.0), new Name("gbw")]),
            new Divide([new Num(1.0), new Name("gsw")]),
          ]),
          new Add([
            new Num(101000000.0),
            new Minus([new Mul([new Num(0.5), new Name("ea")])]),
            new Minus([new Mul([new Num(0.5), new Name("es_leaf")])]),
          ]),
        ]),
      ]),
      texName: "transpiration",
    })
    .addAssignment("fI", {
      fn: new Divide([
        new Add([
          new Num(0.5),
          new Mul([new Num(0.5), new Name("fI0")]),
          new Minus([
            new Mul([
              new Num(0.5),
              new Sqrt(
                new Max([
                  new Num(0.0),
                  new Add([
                    new Pow(
                      new Add([
                        new Num(-1.0),
                        new Minus([new Name("fI0")]),
                        new Minus([
                          new Mul([new Name("PAR"), new Name("alphafI")]),
                        ]),
                      ]),
                      new Num(2.0),
                    ),
                    new Minus([
                      new Mul([
                        new Num(4.0),
                        new Name("thetafI"),
                        new Add([
                          new Name("fI0"),
                          new Mul([new Name("PAR"), new Name("alphafI")]),
                        ]),
                      ]),
                    ]),
                  ]),
                ]),
                new Num(2),
              ),
            ]),
          ]),
          new Mul([new Num(0.5), new Name("PAR"), new Name("alphafI")]),
        ]),
        new Name("thetafI"),
      ]),
      texName: "fI",
    })
    .addAssignment("gss", {
      fn: new Mul([new Name("fI"), new Name("fvpd"), new Name("gswm")]),
      texName: "gss",
    })
    .addAssignment("Cond", {
      fn: new Divide([
        new Num(1.0),
        new Add([
          new Divide([new Num(1.0), new Name("gtw")]),
          new Minus([new Divide([new Num(1.0), new Name("gbw")])]),
        ]),
      ]),
      texName: "Cond",
    })
    .addReaction("dPGA_dt", {
      fn: new Add([
        new Minus([new Name("Vr")]),
        new Mul([new Num(2.0), new Name("Vc")]),
        new Mul([new Num(1.5), new Name("Vc"), new Name("phi")]),
      ]),
      stoichiometry: [{ name: "PGA", value: new Num(1.0) }],
      texName: "dPGA\\_dt",
    })
    .addReaction("dRuBP_dt", {
      fn: new Add([
        new Minus([
          new Mul([new Name("Vc"), new Add([new Num(1.0), new Name("phi")])]),
        ]),
        new Divide([
          new Mul([new Name("Vr"), new Add([new Num(1.0), new Name("phi")])]),
          new Add([new Num(2.0), new Mul([new Num(1.5), new Name("phi")])]),
        ]),
      ]),
      stoichiometry: [{ name: "RuBP", value: new Num(1.0) }],
      texName: "dRuBP\\_dt",
    })
    .addReaction("dPR_dt", {
      fn: new Add([
        new Mul([new Name("Vc"), new Name("phi")]),
        new Minus([new Mul([new Name("PR"), new Name("kPR")])]),
      ]),
      stoichiometry: [{ name: "PR", value: new Num(1.0) }],
      texName: "dPR\\_dt",
    })
    .addReaction("dfP_dt", {
      fn: new Piecewise([
        new Mul([
          new Name("KiqEp"),
          new Add([new Name("fqEss"), new Minus([new Name("fP")])]),
        ]),
        new LessThan([new Name("fP"), new Name("fqEss")]),
        new Mul([
          new Name("KdqEp"),
          new Add([new Name("fqEss"), new Minus([new Name("fP")])]),
        ]),
      ]),
      stoichiometry: [{ name: "fP", value: new Num(1.0) }],
      texName: "dfP\\_dt",
    })
    .addReaction("dfZ_dt", {
      fn: new Piecewise([
        new Mul([
          new Name("KiqEz"),
          new Add([new Name("fqEss"), new Minus([new Name("fZ")])]),
        ]),
        new LessThan([new Name("fZ"), new Name("fqEss")]),
        new Mul([
          new Name("KdqEz"),
          new Add([new Name("fqEss"), new Minus([new Name("fZ")])]),
        ]),
      ]),
      stoichiometry: [{ name: "fZ", value: new Num(1.0) }],
      texName: "dfZ\\_dt",
    })
    .addReaction("dalphar_dt", {
      fn: new Piecewise([
        new Mul([
          new Name("Kialpha"),
          new Add([new Name("alpharss"), new Minus([new Name("alphar")])]),
        ]),
        new LessThan([new Name("alphar"), new Name("alpharss")]),
        new Mul([
          new Name("Kdalpha"),
          new Add([new Name("alpharss"), new Minus([new Name("alphar")])]),
        ]),
      ]),
      stoichiometry: [{ name: "alphar", value: new Num(1.0) }],
      texName: "dalphar\\_dt",
    })
    .addReaction("dPSIId_dt", {
      fn: new Add([
        new Minus([new Mul([new Name("Krep"), new Name("PSIId")])]),
        new Mul([
          new Name("Kinh"),
          new Name("PARa"),
          new Name("alphar"),
          new Add([new Num(1.0), new Minus([new Name("PSIId")])]),
        ]),
      ]),
      stoichiometry: [{ name: "PSIId", value: new Num(1.0) }],
      texName: "dPSIId\\_dt",
    })
    .addReaction("dfR_dt", {
      fn: new Piecewise([
        new Mul([
          new Name("KiR"),
          new Add([new Name("fRss"), new Minus([new Name("fR")])]),
        ]),
        new LessThan([new Name("fR"), new Name("fRss")]),
        new Mul([
          new Name("KdR"),
          new Add([new Name("fRss"), new Minus([new Name("fR")])]),
        ]),
      ]),
      stoichiometry: [{ name: "fR", value: new Num(1.0) }],
      texName: "dfR\\_dt",
    })
    .addReaction("dfRB_dt", {
      fn: new Piecewise([
        new Mul([
          new Name("Krca"),
          new Name("RCA"),
          new Name("fRCA"),
          new Add([new Name("fRBss"), new Minus([new Name("fRB")])]),
        ]),
        new LessThan([new Name("fRB"), new Name("fRBss")]),
        new Mul([
          new Name("KdRB"),
          new Add([new Name("fRBss"), new Minus([new Name("fRB")])]),
        ]),
      ]),
      stoichiometry: [{ name: "fRB", value: new Num(1.0) }],
      texName: "dfRB\\_dt",
    })
    .addReaction("dCc_dt", {
      fn: new Divide([
        new Mul([
          new Name("Mv"),
          new Add([
            new Minus([new Name("Vc")]),
            new Mul([
              new Name("gc"),
              new Add([new Name("Ccyt"), new Minus([new Name("Cc")])]),
            ]),
          ]),
        ]),
        new Name("Vref"),
      ]),
      stoichiometry: [{ name: "Cc", value: new Num(1.0) }],
      texName: "dCc\\_dt",
    })
    .addReaction("dCcyt_dt", {
      fn: new Divide([
        new Mul([
          new Name("Mv"),
          new Add([
            new Name("Rm"),
            new Name("Rp"),
            new Mul([
              new Name("gw"),
              new Add([new Name("Ci"), new Minus([new Name("Ccyt")])]),
            ]),
            new Minus([
              new Mul([
                new Name("gc"),
                new Add([new Name("Ccyt"), new Minus([new Name("Cc")])]),
              ]),
            ]),
          ]),
        ]),
        new Name("Vref"),
      ]),
      stoichiometry: [{ name: "Ccyt", value: new Num(1.0) }],
      texName: "dCcyt\\_dt",
    })
    .addReaction("dCi_dt", {
      fn: new Divide([
        new Mul([
          new Name("Mv"),
          new Add([
            new Divide([
              new Add([new Name("Ca"), new Minus([new Name("Ci")])]),
              new Add([
                new Divide([new Num(1.0), new Name("gbc")]),
                new Divide([new Num(1.0), new Name("gsc")]),
              ]),
            ]),
            new Minus([
              new Mul([
                new Name("gw"),
                new Add([new Name("Ci"), new Minus([new Name("Ccyt")])]),
              ]),
            ]),
          ]),
        ]),
        new Name("Vref"),
      ]),
      stoichiometry: [{ name: "Ci", value: new Num(1.0) }],
      texName: "dCi\\_dt",
    })
    .addReaction("dCa_dt", {
      fn: new Divide([
        new Mul([
          new Num(9.900990099009902e-9),
          new Name("Ta"),
          new Add([
            new Mul([new Num(8314.0), new Name("CO2R"), new Name("Flow")]),
            new Minus([
              new Mul([
                new Num(8314.0),
                new Name("A"),
                new Name("leaf_surface"),
              ]),
            ]),
            new Minus([
              new Mul([new Num(8314.0), new Name("Ca"), new Name("Flow")]),
            ]),
          ]),
        ]),
        new Name("volume_chamber"),
      ]),
      stoichiometry: [{ name: "Ca", value: new Num(1.0) }],
      texName: "dCa\\_dt",
    })
    .addReaction("dH2OS_dt", {
      fn: new Divide([
        new Mul([
          new Num(9.900990099009902e-9),
          new Name("Ta"),
          new Add([
            new Mul([new Num(8314.0), new Name("Flow"), new Name("H2OR")]),
            new Mul([
              new Num(8314.0),
              new Name("H2OS"),
              new Add([
                new Minus([new Name("Flow")]),
                new Minus([
                  new Mul([
                    new Name("leaf_surface"),
                    new Name("transpiration"),
                  ]),
                ]),
              ]),
            ]),
            new Mul([
              new Num(8314.0),
              new Name("leaf_surface"),
              new Name("transpiration"),
            ]),
          ]),
        ]),
        new Name("volume_chamber"),
      ]),
      stoichiometry: [{ name: "H2OS", value: new Num(1.0) }],
      texName: "dH2OS\\_dt",
    })
    .addReaction("dgsw_dt", {
      fn: new Piecewise([
        new Mul([
          new Name("Kgsi"),
          new Add([new Name("gss"), new Minus([new Name("gsw")])]),
        ]),
        new GreaterThan([new Name("gss"), new Name("gsw")]),
        new Mul([
          new Name("Kgsd"),
          new Add([new Name("gss"), new Minus([new Name("gsw")])]),
        ]),
      ]),
      stoichiometry: [{ name: "gsw", value: new Num(1.0) }],
      texName: "dgsw\\_dt",
    });
}
