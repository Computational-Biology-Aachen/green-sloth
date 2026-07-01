import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  Exp,
  Minus,
  Mul,
  Name,
  Num,
} from "@computational-biology-aachen/mxlweb-core/mathml";

export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("j", {
      value: 0.04,
      texName: "j",
    })
    .addParameter("i", {
      value: 0.006,
      texName: "i",
    })
    .addParameter("p", {
      value: 0.014,
      texName: "p",
    })
    .addParameter("tau_j", {
      value: 0.00025,
      texName: "tau\\_j",
    })
    .addParameter("tau_i", {
      value: 0.004,
      texName: "tau\\_i",
    })
    .addParameter("tau_p", {
      value: 0.03,
      texName: "tau\\_p",
    })
    .addVariable("ChlF", {
      value: 0.02,
      texName: "ChlF",
    })
    .addReaction("ojip", {
      fn: new Add([
        new Divide([
          new Mul([
            new Name("i"),
            new Exp(
              new Minus([new Divide([new Name("time"), new Name("tau_i")])]),
            ),
          ]),
          new Name("tau_i"),
        ]),
        new Divide([
          new Mul([
            new Name("j"),
            new Exp(
              new Minus([new Divide([new Name("time"), new Name("tau_j")])]),
            ),
          ]),
          new Name("tau_j"),
        ]),
        new Divide([
          new Mul([
            new Name("p"),
            new Exp(
              new Minus([new Divide([new Name("time"), new Name("tau_p")])]),
            ),
          ]),
          new Name("tau_p"),
        ]),
      ]),
      stoichiometry: [{ name: "ChlF", value: new Num(1.0) }],
      texName: "ojip",
    });
}
