/**
 * Runs a validation against a pristine model: builds each scenario on a clone,
 * simulates it, then applies ops and derived columns. Takes `simulate` as an
 * argument so the browser (worker pool) and the tests (Node) share all of this.
 */
import type {
  KineticModelBuilder,
  SimulationRequest,
} from "@computational-biology-aachen/mxlweb-core";
import { Name, Num } from "@computational-biology-aachen/mxlweb-core/mathml";
import { derivedKeys } from "../utils";
import { evaluate, parse, type Value } from "./expr";
import { evalColumn, OPS, type Frame } from "./ops";
import type {
  ModelEdit,
  ProtocolStep,
  Scenario,
  ScenarioValue,
  Simulation,
  Validation,
} from "./types";

export type SimulateResult = {
  time: number[];
  values: number[][];
  finalState?: number[];
  err?: { message: string };
};
export type Simulate = (req: SimulationRequest) => Promise<SimulateResult>;

export type RunOptions = {
  /** Scenarios simulated at once. */
  concurrency?: number;
  /** Called after each finished scenario. */
  onProgress?: (done: number, total: number) => void;
};

export interface ValidationResult {
  /** Resolves an expression over every scenario, op and derived column. */
  value(expr: string): Value;
  column(expr: string): number[];
}

type ScenarioState = {
  frame: Frame;
  ops: Record<string, Frame>;
  protocol: ProtocolStep[] | undefined;
  params: Map<string, number>;
  init: Map<string, number>;
};

const TIME_EPS = 1e-12;

/** MxlPy's sampling: `points` intervals per step, boundaries not repeated. */
export function protocolGrid(steps: ProtocolStep[], points: number): number[] {
  const out: number[] = [];
  let t = 0;
  steps.forEach((step, s) => {
    const end = t + step.duration;
    for (let i = s === 0 ? 0 : 1; i <= points; i++) {
      out.push(t + (i / points) * step.duration);
    }
    t = end;
  });
  return out;
}

function protocolSegments(steps: ProtocolStep[]) {
  let t = 0;
  return steps.map((step) => {
    t += step.duration;
    return { t_end: t, ...step.set };
  });
}

function scenarioValue(
  v: ScenarioValue,
  params: Map<string, number>,
  init: Map<string, number>,
): number {
  if (typeof v === "number") return v;
  const out = evaluate(parse(v), ([scope, name]) => {
    const value = (scope === "param" ? params : init).get(name);
    if ((scope !== "param" && scope !== "init") || value === undefined) {
      throw new Error(`Unknown reference "${scope}.${name}" in "${v}"`);
    }
    return value;
  });
  if (typeof out !== "number") throw new Error(`"${v}" is not a number`);
  return out;
}

function applyEdit(model: KineticModelBuilder, edit: ModelEdit) {
  if ("removeReaction" in edit) {
    model.removeReaction(edit.removeReaction);
  } else if ("addParameter" in edit) {
    model.addParameter(edit.addParameter, { value: edit.value });
  } else if ("clampVariable" in edit) {
    model.removeVariable(edit.clampVariable);
    model.addParameter(edit.clampVariable, { value: edit.to });
  } else {
    const current = model.assignments.get(edit.setAssignment);
    if (!current) {
      throw new Error(`Unknown assignment "${edit.setAssignment}"`);
    }
    const asNumber = Number(edit.to);
    model.updateAssignment(edit.setAssignment, {
      ...current,
      fn: Number.isNaN(asNumber) ? new Name(edit.to) : new Num(asNumber),
    });
  }
}

function buildScenario(base: KineticModelBuilder, scenario: Scenario) {
  const model = base.clone() as KineticModelBuilder;
  const params = new Map(
    [...base.parameters].map(([id, par]) => [id, par.value]),
  );
  const names = base.getNames();
  const initial = base.resolveInitialValues();
  const init = new Map(names.map((id, i) => [id, initial[i]]));

  for (const [id, v] of Object.entries(scenario.parameters ?? {})) {
    const par = model.parameters.get(id);
    if (!par) throw new Error(`Unknown parameter "${id}"`);
    model.updateParameter(id, {
      ...par,
      value: scenarioValue(v, params, init),
    });
  }
  scenario.edits?.forEach((edit) => applyEdit(model, edit));
  for (const [id, v] of Object.entries(scenario.initial ?? {})) {
    const vari = model.variables.get(id);
    if (!vari) throw new Error(`Unknown variable "${id}"`);
    model.updateVariable(id, {
      ...vari,
      value: scenarioValue(v, params, init),
    });
  }
  return { model, params, init };
}

function buildRequest(
  model: KineticModelBuilder,
  sim: Simulation,
  y0: number[],
  scenario: Scenario,
  validation: Validation,
  id: string,
): SimulationRequest {
  const order = derivedKeys(model);
  const { allDerived, selectDerived } = model.buildJsDerived();
  const req: SimulationRequest = {
    requestId: id,
    rhsWat: model.buildWat(),
    allDerivedFn: allDerived,
    selectDerivedFn: selectDerived,
    pars: model.resolveParameters(),
    parNames: model.getParameterNames(),
    method: "radau5",
    initialValues: y0,
    rhsNames: model.getNames(),
    allDerivedNames: order,
    selectDerivedNames: order,
    tEnd: 0,
    nTimePoints: 2,
    calculateDerived: true,
    rtol: scenario.rtol ?? validation.rtol ?? 1e-8,
    atol: scenario.atol ?? validation.atol ?? 1e-8,
  };
  if (sim.kind === "steadyState") {
    req.steadyState = sim.tol === undefined ? {} : { tol: sim.tol };
  } else if (sim.kind === "timeCourse") {
    req.tEval = sim.tEval;
    req.tEnd = sim.tEval[sim.tEval.length - 1] * (1 + TIME_EPS);
  } else {
    req.protocol = protocolSegments(sim.steps);
    req.tEval = protocolGrid(sim.steps, sim.pointsPerStep);
    // Rounding must not push the last grid time past the final step's end.
    const last = req.protocol[req.protocol.length - 1];
    last.t_end = Math.max(last.t_end, req.tEval[req.tEval.length - 1]);
  }
  return req;
}

async function runScenario(
  id: string,
  scenario: Scenario,
  base: KineticModelBuilder,
  validation: Validation,
  simulate: Simulate,
): Promise<ScenarioState> {
  const { model, params, init } = buildScenario(base, scenario);
  const sim = scenario.simulate ?? validation.simulate;
  let y0 = model.resolveInitialValues();

  for (const pre of scenario.pre ?? []) {
    const res = await simulate(
      buildRequest(model, pre, y0, scenario, validation, `${id}/pre`),
    );
    if (res.err) throw new Error(`${id} (pre): ${res.err.message}`);
    if (!res.finalState) throw new Error(`${id}: backend has no final state`);
    y0 = res.finalState;
  }

  const res = await simulate(
    buildRequest(model, sim, y0, scenario, validation, id),
  );
  if (res.err) throw new Error(`${id}: ${res.err.message}`);

  const columns = [...model.getNames(), ...derivedKeys(model)];
  const frame: Frame = { time: res.time };
  columns.forEach((name, j) => {
    frame[name] = res.values.map((row) => row[j]);
  });
  return {
    frame,
    ops: {},
    protocol: sim.kind === "protocol" ? sim.steps : undefined,
    params,
    init,
  };
}

/** Maps `items` to promises with at most `limit` running at once. */
async function mapLimited<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: limit }, worker));
  return out;
}

export async function runValidation(
  validation: Validation,
  base: KineticModelBuilder,
  simulate: Simulate,
  { concurrency = 1, onProgress }: RunOptions = {},
): Promise<ValidationResult> {
  const ids = Object.keys(validation.scenarios);
  let done = 0;
  const states = await mapLimited(ids, concurrency, async (id) => {
    const state = await runScenario(
      id,
      validation.scenarios[id],
      base,
      validation,
      simulate,
    );
    onProgress?.(++done, ids.length);
    return state;
  });
  const scenarios = Object.fromEntries(ids.map((id, i) => [id, states[i]]));
  const derived: Frame = {};

  const inScenario = (state: ScenarioState) => (path: string[]) => {
    const [a, b] = path;
    if (a === "param" || a === "init") {
      const value = (a === "param" ? state.params : state.init).get(b);
      if (value === undefined) throw new Error(`Unknown ${path.join(".")}`);
      return value;
    }
    if (a in state.ops) {
      const col = state.ops[a][b ?? "value"];
      if (col) return col;
    } else if (path.length === 1 && a in state.frame) {
      return state.frame[a];
    }
    throw new Error(`Unknown column "${path.join(".")}"`);
  };

  const global = (path: string[]): Value => {
    if (path.length === 1 && path[0] in derived) return derived[path[0]];
    const state = scenarios[path[0]];
    if (state) return inScenario(state)(path.slice(1));
    if (path[0] === "param" || path[0] === "init") {
      return inScenario(states[0])(path);
    }
    throw new Error(
      `Unknown reference "${path.join(".")}": not a scenario or derived column`,
    );
  };

  for (const state of states) {
    for (const [name, src] of Object.entries(validation.deriveEach ?? {})) {
      state.frame[name] = evalColumn(src, inScenario(state));
    }
  }
  for (const spec of validation.ops ?? []) {
    const def = OPS[spec.op];
    if (!def) throw new Error(`Unknown op "${spec.op}"`);
    const targets = spec.scenario ? [spec.scenario] : ids;
    for (const id of targets) {
      const state = scenarios[id];
      state.ops[spec.as] = def.run(spec, {
        protocol: state.protocol,
        column: (src) => evalColumn(src, inScenario(state)),
      });
    }
  }
  for (const [name, src] of Object.entries(validation.derive ?? {})) {
    derived[name] = evalColumn(src, global);
  }

  return {
    value: (src) => evaluate(parse(src), global),
    column: (src) => evalColumn(src, global),
  };
}
