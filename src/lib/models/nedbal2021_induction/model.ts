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
    .addParameter("rise", {
      value: 0.58,
      texName: "rise",
    })
    .addParameter("tau_rise", {
      value: 0.012,
      texName: "tau\\_rise",
    })
    .addParameter("decline", {
      value: 0.3,
      texName: "decline",
    })
    .addParameter("tau_decline", {
      value: 120.0,
      texName: "tau\\_decline",
    })
    .addVariable("Signal", {
      value: 1.28,
      texName: "Signal",
    })
    .addReaction("induction", {
      fn: new Add([
        new Divide([
          new Mul([
            new Name("rise"),
            new Exp(
              new Minus([new Divide([new Name("time"), new Name("tau_rise")])]),
            ),
          ]),
          new Name("tau_rise"),
        ]),
        new Minus([
          new Divide([
            new Mul([
              new Name("decline"),
              new Exp(
                new Minus([
                  new Divide([new Name("time"), new Name("tau_decline")]),
                ]),
              ),
            ]),
            new Name("tau_decline"),
          ]),
        ]),
      ]),
      stoichiometry: [{ name: "Signal", value: new Num(1.0) }],
      texName: "induction",
    });
}
