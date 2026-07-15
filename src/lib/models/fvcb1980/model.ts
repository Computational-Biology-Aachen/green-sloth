import { SteadyStateModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import {
  Add,
  Divide,
  LessEqual,
  Min,
  Minus,
  Mul,
  Name,
  Num,
  Piecewise,
} from "@computational-biology-aachen/mxlweb-core/mathml";

export function initModel(): SteadyStateModelBuilder {
  return new SteadyStateModelBuilder()
    .addParameter("Ci", { value: 500, displayName: "Ci", texName: "C_i" })
    .addParameter("vcmax", { value: 80, texName: "V_{cmax}" })
    .addParameter("kc", { value: 259, texName: "K_c" })
    .addParameter("ko", { value: 179, texName: "K_o" })
    .addParameter("ccp", { value: 38.6, texName: "\\Gamma^*" })
    .addParameter("rl", { value: 1, texName: "R_d" })
    .addParameter("alpha", { value: 0, texName: "\\alpha" })
    .addParameter("o", { value: 210, displayName: "O₂", texName: "O", slider: { min: "100", max: "500", step: "1" } })
    .addParameter("j", { value: 124, displayName: "J", texName: "J", slider: { min: "50", max: "300", step: "1" } })
    .addParameter("tp", { value: 15, displayName: "Tp", texName: "T_p", slider: { min: "5", max: "50", step: "1" } })
    .addAssignment("wc", { fn: new Divide([new Mul([new Name("Ci"), new Name("vcmax")]), new Add([new Name("Ci"), new Mul([new Name("kc"), new Add([new Num(1), new Divide([new Name("o"), new Name("ko")])])])])]), displayName: "Wc", texName: "W_c" })
    .addAssignment("wj", { fn: new Divide([new Mul([new Name("Ci"), new Name("j")]), new Add([new Mul([new Num(4), new Name("Ci")]), new Mul([new Num(8), new Name("ccp")])])]), displayName: "Wj", texName: "W_j" })
    .addAssignment("wp", { fn: new Piecewise([new Num(100), new LessEqual([new Name("Ci"), new Mul([new Name("ccp"), new Add([new Num(1), new Mul([new Num(3), new Name("alpha")])])])]), new Divide([new Mul([new Num(3), new Name("Ci"), new Name("tp")]), new Minus([new Name("Ci"), new Mul([new Name("ccp"), new Add([new Num(1), new Mul([new Num(3), new Name("alpha")])])])])])]), displayName: "Wp", texName: "W_p" })
    .addAssignment("vc", { fn: new Min([new Name("wc"), new Name("wj"), new Name("wp")]), displayName: "Vc", texName: "V_c" })
    .addAssignment("an", { fn: new Minus([new Mul([new Name("vc"), new Minus([new Num(1), new Divide([new Name("ccp"), new Name("Ci")])])]), new Name("rl")]), displayName: "An", texName: "A_n" });
}
