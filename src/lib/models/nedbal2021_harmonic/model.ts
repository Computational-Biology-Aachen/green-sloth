import { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  Minus,
  Mul,
  Name,
  Num,
  Sin,
} from "@computational-biology-aachen/mxlweb-core/mathml";

export function initModel(): KineticModelBuilder {
  return new KineticModelBuilder()
    .addParameter("period", {
      value: 1.0,
      texName: "period",
    })
    .addParameter("light_amplitude", {
      value: 6.0,
      texName: "light\\_amplitude",
    })
    .addParameter("a1", {
      value: 0.034,
      texName: "a1",
    })
    .addParameter("a2", {
      value: 0.0015,
      texName: "a2",
    })
    .addParameter("a3", {
      value: 0.001,
      texName: "a3",
    })
    .addParameter("a4", {
      value: 0.0006,
      texName: "a4",
    })
    .addParameter("p1", {
      value: 0.5,
      texName: "p1",
    })
    .addParameter("p2", {
      value: 0.2,
      texName: "p2",
    })
    .addParameter("p3", {
      value: 0.1,
      texName: "p3",
    })
    .addParameter("p4", {
      value: 0.05,
      texName: "p4",
    })
    .addParameter("n1", {
      value: 1.0,
      texName: "n1",
    })
    .addParameter("n2", {
      value: 2.0,
      texName: "n2",
    })
    .addParameter("n3", {
      value: 3.0,
      texName: "n3",
    })
    .addParameter("n4", {
      value: 4.0,
      texName: "n4",
    })
    .addVariable("Light", {
      value: 8.0,
      texName: "Light",
    })
    .addVariable("Fit", {
      value: 0.6910978387074505,
      texName: "Fit",
    })
    .addVariable("H1", {
      value: 0.6941621928957273,
      texName: "H1",
    })
    .addVariable("H2", {
      value: 0.7225299001332381,
      texName: "H2",
    })
    .addVariable("H3", {
      value: 0.723004995834722,
      texName: "H3",
    })
    .addVariable("H4", {
      value: 0.723400749843763,
      texName: "H4",
    })
    .addReaction("light", {
      fn: new Divide([
        new Mul([
          new Num(2.0),
          new Num(3.141592653589793),
          new Name("light_amplitude"),
          new Sin(
            new Divide([
              new Mul([
                new Num(2.0),
                new Num(3.141592653589793),
                new Name("time"),
              ]),
              new Name("period"),
            ]),
          ),
        ]),
        new Name("period"),
      ]),
      stoichiometry: [{ name: "Light", value: new Num(1.0) }],
      texName: "light",
    })
    .addReaction("fluorescence", {
      fn: new Add([
        new Minus([
          new Divide([
            new Mul([
              new Num(2.0),
              new Num(3.141592653589793),
              new Name("p1"),
              new Sin(
                new Add([
                  new Name("a1"),
                  new Minus([
                    new Divide([
                      new Mul([
                        new Num(2.0),
                        new Num(3.141592653589793),
                        new Name("p1"),
                        new Name("time"),
                      ]),
                      new Name("period"),
                    ]),
                  ]),
                ]),
              ),
            ]),
            new Name("period"),
          ]),
        ]),
        new Minus([
          new Divide([
            new Mul([
              new Num(4.0),
              new Num(3.141592653589793),
              new Name("p2"),
              new Sin(
                new Add([
                  new Name("a2"),
                  new Minus([
                    new Divide([
                      new Mul([
                        new Num(2.0),
                        new Num(3.141592653589793),
                        new Name("p2"),
                        new Name("time"),
                      ]),
                      new Name("period"),
                    ]),
                  ]),
                ]),
              ),
            ]),
            new Name("period"),
          ]),
        ]),
        new Minus([
          new Divide([
            new Mul([
              new Num(8.0),
              new Num(3.141592653589793),
              new Name("p4"),
              new Sin(
                new Add([
                  new Name("a4"),
                  new Minus([
                    new Divide([
                      new Mul([
                        new Num(2.0),
                        new Num(3.141592653589793),
                        new Name("p4"),
                        new Name("time"),
                      ]),
                      new Name("period"),
                    ]),
                  ]),
                ]),
              ),
            ]),
            new Name("period"),
          ]),
        ]),
        new Minus([
          new Divide([
            new Mul([
              new Num(6.0),
              new Num(3.141592653589793),
              new Name("p3"),
              new Sin(
                new Add([
                  new Name("a3"),
                  new Minus([
                    new Divide([
                      new Mul([
                        new Num(2.0),
                        new Num(3.141592653589793),
                        new Name("p3"),
                        new Name("time"),
                      ]),
                      new Name("period"),
                    ]),
                  ]),
                ]),
              ),
            ]),
            new Name("period"),
          ]),
        ]),
      ]),
      stoichiometry: [{ name: "Fit", value: new Num(1.0) }],
      texName: "fluorescence",
    })
    .addReaction("harmonic_1", {
      fn: new Divide([
        new Mul([
          new Num(2.0),
          new Num(3.141592653589793),
          new Name("a1"),
          new Name("n1"),
          new Sin(
            new Add([
              new Minus([new Name("p1")]),
              new Divide([
                new Mul([
                  new Num(2.0),
                  new Num(3.141592653589793),
                  new Name("n1"),
                  new Name("time"),
                ]),
                new Name("period"),
              ]),
            ]),
          ),
        ]),
        new Name("period"),
      ]),
      stoichiometry: [{ name: "H1", value: new Num(1.0) }],
      texName: "harmonic\\_1",
    })
    .addReaction("harmonic_2", {
      fn: new Divide([
        new Mul([
          new Num(2.0),
          new Num(3.141592653589793),
          new Name("a2"),
          new Name("n2"),
          new Sin(
            new Add([
              new Minus([new Name("p2")]),
              new Divide([
                new Mul([
                  new Num(2.0),
                  new Num(3.141592653589793),
                  new Name("n2"),
                  new Name("time"),
                ]),
                new Name("period"),
              ]),
            ]),
          ),
        ]),
        new Name("period"),
      ]),
      stoichiometry: [{ name: "H2", value: new Num(1.0) }],
      texName: "harmonic\\_2",
    })
    .addReaction("harmonic_3", {
      fn: new Divide([
        new Mul([
          new Num(2.0),
          new Num(3.141592653589793),
          new Name("a3"),
          new Name("n3"),
          new Sin(
            new Add([
              new Minus([new Name("p3")]),
              new Divide([
                new Mul([
                  new Num(2.0),
                  new Num(3.141592653589793),
                  new Name("n3"),
                  new Name("time"),
                ]),
                new Name("period"),
              ]),
            ]),
          ),
        ]),
        new Name("period"),
      ]),
      stoichiometry: [{ name: "H3", value: new Num(1.0) }],
      texName: "harmonic\\_3",
    })
    .addReaction("harmonic_4", {
      fn: new Divide([
        new Mul([
          new Num(2.0),
          new Num(3.141592653589793),
          new Name("a4"),
          new Name("n4"),
          new Sin(
            new Add([
              new Minus([new Name("p4")]),
              new Divide([
                new Mul([
                  new Num(2.0),
                  new Num(3.141592653589793),
                  new Name("n4"),
                  new Name("time"),
                ]),
                new Name("period"),
              ]),
            ]),
          ),
        ]),
        new Name("period"),
      ]),
      stoichiometry: [{ name: "H4", value: new Num(1.0) }],
      texName: "harmonic\\_4",
    });
}
