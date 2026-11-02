/**
 * Runs a validation against a pristine model: builds each scenario on a clone,
 * simulates it, then applies ops and derived columns. Takes `simulate` as an
 * argument so the browser (worker pool) and the tests (Node) share all of this.
 */
import type {
  KineticModelBuilder,
  SimulationRequest,
} from "@computational-biology-aachen/mxlweb-core";
import { derivedKeys } from "../utils";
import { evaluate, parse, toMathml, type Value } from "./expr";
import { expandScans } from "./helpers";
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
  rhs?: number[][];
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

/** MxlPy's sampling: `points` intervals per step, boundaries not repeated. */
export function protocolGrid(steps: ProtocolStep[], perStep = 10): number[] {
  const out: number[] = [];
  let t = 0;
  steps.forEach((step, s) => {
    const points = step.points ?? perStep;
    const end = t + step.duration;
    for (let i = s === 0 ? 0 : 1; i < points; i++) {
      out.push(t + (i / points) * step.duration);
    }
    out.push(end);
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
  } else if ("parameterToAssignment" in edit) {
    model.removeParameter(edit.parameterToAssignment);
    model.addAssignment(edit.parameterToAssignment, {
      fn: toMathml(parse(edit.to)),
    });
  } else {
    const current = model.assignments.get(edit.setAssignment);
    if (!current) {
      throw new Error(`Unknown assignment "${edit.setAssignment}"`);
    }
    model.updateAssignment(edit.setAssignment, {
      ...current,
      fn: toMathml(parse(edit.to)),
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
    req.tEnd = sim.tEval[sim.tEval.length - 1];
  } else {
    req.protocol = protocolSegments(sim.steps);
    req.tEval = sim.tEval ?? protocolGrid(sim.steps, sim.pointsPerStep);
  }
  if (validation.returnRhs) req.returnRhs = true;
  return req;
}

function toFrame(
  model: KineticModelBuilder,
  res: SimulateResult,
  allNames: string[],
): Frame {
  const names = model.getNames();
  const columns = [...names, ...derivedKeys(model)];
  const frame: Frame = { time: res.time };
  columns.forEach((name, j) => {
    frame[name] = res.values.map((row) => row[j]);
  });
  // A clamped variable has no column in that phase of a chain.
  for (const name of allNames) {
    frame[name] ??= res.time.map(() => NaN);
  }
  if (res.rhs) {
    names.forEach((name, j) => {
      frame[`ddt.${name}`] = res.rhs!.map((row) => row[j]);
    });
  }
  return frame;
}

function shiftSim(sim: Simulation, by: number): number[] {
  if (sim.kind === "timeCourse") return sim.tEval.map((t) => t + by);
  if (sim.kind === "protocol") {
    return (sim.tEval ?? protocolGrid(sim.steps, sim.pointsPerStep)).map(
      (t) => t + by,
    );
  }
  throw new Error("A steady state can't be a stage of a chain");
}

async function runStages(
  id: string,
  scenario: Scenario,
  built: ReturnType<typeof buildScenario>,
  validation: Validation,
  simulate: Simulate,
): Promise<Frame> {
  const { model: first } = built;
  const allNames = [...first.getNames(), ...derivedKeys(first)];
  // As in MxlPy, a chain hands on what the last phase simulated: a variable a
  // phase clamped starts the next one from its initial value again.
  const initial = new Map(
    first.getNames().map((name, i) => [name, first.resolveInitialValues()[i]]),
  );
  let state = initial;
  const out: Frame = {};
  let offset = 0;
  for (const [s, stage] of (scenario.stages ?? []).entries()) {
    const model = first.clone() as KineticModelBuilder;
    stage.edits?.forEach((edit) => applyEdit(model, edit));
    const y0 = model.getNames().map((name) => {
      const value = state.get(name) ?? initial.get(name);
      if (value === undefined) throw new Error(`No state for "${name}"`);
      return value;
    });
    const res = await simulate(
      buildRequest(
        model,
        stage.simulate,
        y0,
        scenario,
        validation,
        `${id}/${s}`,
      ),
    );
    if (res.err) throw new Error(`${id} stage ${s}: ${res.err.message}`);
    if (!res.finalState) throw new Error(`${id}: backend has no final state`);
    state = new Map(
      model.getNames().map((name, i) => [name, res.finalState![i]]),
    );

    const frame = toFrame(model, res, allNames);
    frame.time = shiftSim(stage.simulate, offset);
    const skip = s === 0 ? 0 : 1;
    for (const [name, col] of Object.entries(frame)) {
      (out[name] ??= []).push(...col.slice(skip));
    }
    offset = frame.time[frame.time.length - 1];
  }
  return out;
}

async function runScenario(
  id: string,
  scenario: Scenario,
  base: KineticModelBuilder,
  validation: Validation,
  simulate: Simulate,
): Promise<ScenarioState> {
  const built = buildScenario(base, scenario);
  const { model, params, init } = built;
  const sim = scenario.simulate ?? validation.simulate;

  if (scenario.stages) {
    const frame = await runStages(id, scenario, built, validation, simulate);
    return { frame, ops: {}, protocol: undefined, params, init };
  }
  if (!sim) throw new Error(`${id}: no simulation`);

  let y0 = model.resolveInitialValues();
  for (const pre of scenario.pre ?? []) {
    const req = buildRequest(model, pre, y0, scenario, validation, `${id}/pre`);
    for (const [key, value] of Object.entries(pre.set ?? {})) {
      const i = req.parNames!.indexOf(key);
      if (i < 0) throw new Error(`Unknown parameter "${key}"`);
      req.pars[i] = value;
    }
    const res = await simulate(req);
    if (res.err) throw new Error(`${id} (pre): ${res.err.message}`);
    if (!res.finalState) throw new Error(`${id}: backend has no final state`);
    y0 = res.finalState;
  }

  // Headless, a failed solve throws; through a worker it comes back as `err`.
  let res = await simulate(
    buildRequest(model, sim, y0, scenario, validation, id),
  ).catch((e: Error): SimulateResult => ({
    time: [],
    values: [],
    err: { message: e.message },
  }));
  if (res.err) {
    if (!scenario.allowFailure) throw new Error(`${id}: ${res.err.message}`);
    const width = model.getNames().length + derivedKeys(model).length;
    res = { time: [NaN], values: [Array(width).fill(NaN)] };
  }
  return {
    frame: toFrame(model, res, []),
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
  spec: Validation,
  base: KineticModelBuilder,
  simulate: Simulate,
  { concurrency = 1, onProgress }: RunOptions = {},
): Promise<ValidationResult> {
  const validation = expandScans(spec);
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
  const tables: Record<string, Frame> = {};

  const data = (name: string) => {
    const col = validation.data?.[name];
    if (!col) throw new Error(`Unknown data column "${name}"`);
    return col;
  };

  const inScenario = (state: ScenarioState) => (path: string[]) => {
    const [a, b] = path;
    if (a === "data") return data(b);
    if (a === "param" || a === "init") {
      const value = (a === "param" ? state.params : state.init).get(b);
      if (value === undefined) throw new Error(`Unknown ${path.join(".")}`);
      return value;
    }
    if (a in state.ops) {
      const col = state.ops[a][b ?? "value"];
      if (col) return col;
    } else if (a === "ddt" && `ddt.${b}` in state.frame) {
      return state.frame[`ddt.${b}`];
    } else if (path.length === 1 && a in state.frame) {
      return state.frame[a];
    }
    throw new Error(`Unknown column "${path.join(".")}"`);
  };

  const global = (path: string[]): Value => {
    if (path.length === 1 && path[0] in derived) return derived[path[0]];
    if (path[0] === "data") return data(path[1]);
    const table = tables[path[0]];
    if (table) {
      if (path[1] in table) return table[path[1]];
      throw new Error(`Unknown column "${path.join(".")}"`);
    }
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
  for (const opSpec of validation.ops ?? []) {
    for (const id of opSpec.scenario ? [opSpec.scenario] : ids) {
      const state = scenarios[id];
      const resolve = inScenario(state);
      if (opSpec.op === "column") {
        state.frame[opSpec.as] = evalColumn(opSpec.expr as string, resolve);
        continue;
      }
      const def = OPS[opSpec.op];
      if (!def) throw new Error(`Unknown op "${opSpec.op}"`);
      const out = def.run(opSpec, {
        protocol: state.protocol,
        column: (src) => evalColumn(src, resolve),
      });
      state.ops[opSpec.as] = out;
      if (opSpec.into) state.frame[opSpec.as] = out.value;
    }
  }
  for (const [name, table] of Object.entries(validation.collect ?? {})) {
    const frame: Frame = { x: table.x };
    for (const [col, exprs] of Object.entries(table.columns)) {
      frame[col] = exprs.map((src) => {
        const v = evaluate(parse(src), global);
        if (typeof v !== "number") throw new Error(`"${src}" is not a number`);
        return v;
      });
    }
    tables[name] = frame;
  }
  for (const [name, src] of Object.entries(validation.derive ?? {})) {
    derived[name] = evalColumn(src, global);
  }

  return {
    value: (src) => evaluate(parse(src), global),
    column: (src) => evalColumn(src, global),
  };
}
