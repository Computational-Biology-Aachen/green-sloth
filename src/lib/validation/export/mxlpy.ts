/**
 * Compiles a model's validations to a Jupyter notebook on MxlPy, pandas, numpy
 * and matplotlib. Generated on demand; misc/mxl-e2e executes the result and holds
 * it to the same goldens as the TS engine.
 */
import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import { isRef, parse, refs, toPython } from "../expr";
import { scanX } from "../helpers";
import { OPS } from "../ops";
import type {
  Mca,
  ModelEdit,
  PointSetup,
  Plot,
  PreRun,
  ProtocolSimulation,
  Scan,
  Scenario,
  ScenarioValue,
  Simulation,
  Validation,
} from "../types";

const str = JSON.stringify;

/** JSON is Python, apart from `null` and non-finite numbers, which specs lack. */
const literal = (v: unknown) => (v === null ? "None" : JSON.stringify(v));

const closeTo = (a: number[], b: (i: number) => number) => {
  const scale = Math.max(...a.map(Math.abs));
  return a.every((v, i) => Math.abs(v - b(i)) <= 1e-12 * scale);
};

/** An array as numpy would generate it, or else as a list. */
function pyArray(xs: number[]): string {
  const n = xs.length;
  const [from, to] = [xs[0], xs[n - 1]];
  if (n >= 3 && from !== to) {
    const linear = (i: number) => from + (i * (to - from)) / (n - 1);
    if (closeTo(xs, linear)) return `np.linspace(${from}, ${to}, ${n})`;
    if (from > 0 && to > 0) {
      const geometric = (i: number) => from * (to / from) ** (i / (n - 1));
      if (closeTo(xs, geometric)) return `np.geomspace(${from}, ${to}, ${n})`;
    }
  }
  return `np.array(${literal(xs)})`;
}

function values(o: Record<string, ScenarioValue>): string {
  const body = Object.entries(o).map(([k, v]) => {
    if (typeof v === "number") return `${str(k)}: ${v}`;
    const expr = toPython(parse(v), ([scope, name]) =>
      scope === "param"
        ? `base.get_parameter_values()[${str(name)}]`
        : `base.get_initial_conditions()[${str(name)}]`,
    );
    return `${str(k)}: ${expr}`;
  });
  return `{${body.join(", ")}}`;
}

/** An expression over model ids, as a `fn`/`args` pair for MxlPy. */
function rule(src: string): string {
  const expr = parse(src);
  const args = [...new Set(refs(expr).map((p) => p.join(".")))];
  const body = toPython(expr, (p) => p.join("."));
  return `fn=lambda ${args.join(", ")}: ${body}, args=${literal(args)}`;
}

function edit(e: ModelEdit, model = "m"): string {
  if ("removeReaction" in e) {
    return `${model}.remove_reaction(${str(e.removeReaction)})`;
  }
  if ("addParameter" in e) {
    return `${model}.add_parameter(${str(e.addParameter)}, ${e.value})`;
  }
  if ("clampVariable" in e) {
    const id = str(e.clampVariable);
    return `${model}.remove_variable(${id})\n${model}.add_parameter(${id}, ${e.to})`;
  }
  if ("parameterToAssignment" in e) {
    const id = str(e.parameterToAssignment);
    return `${model}.remove_parameter(${id})\n${model}.add_derived(${id}, ${rule(e.to)})`;
  }
  return `${model}.update_derived(${str(e.setAssignment)}, ${rule(e.to)})`;
}

const stepRows = (sim: ProtocolSimulation) =>
  `[${sim.steps.map((s) => `(${s.duration}, ${literal(s.set)})`).join(", ")}]`;

/**
 * Calls of `simulate_protocol`. A protocol table holds one value per step, so
 * steps setting other parameters, or sampled differently, start a new call.
 */
function protocolLines(sim: ProtocolSimulation): string[] {
  const perStep = sim.pointsPerStep ?? 10;
  const signature = (s: ProtocolSimulation["steps"][number]) =>
    `${s.points ?? perStep}|${Object.keys(s.set).join()}`;
  const runs: ProtocolSimulation["steps"][] = [];
  sim.steps.forEach((step, i) => {
    if (i > 0 && signature(step) === signature(sim.steps[i - 1])) {
      runs[runs.length - 1].push(step);
    } else {
      runs.push([step]);
    }
  });
  return runs.map(
    (steps) =>
      `s.simulate_protocol(make_protocol(${stepRows({ ...sim, steps })}), time_points_per_step=${steps[0].points ?? perStep})`,
  );
}

/** Code running `sim` on simulator `s`. */
function simulateLines(sim: Simulation): string[] {
  if (sim.kind === "steadyState") return ["s.simulate_to_steady_state()"];
  if (sim.kind === "timeCourse") {
    return [`s.simulate_time_course(${pyArray(sim.tEval)})`];
  }
  if (sim.tEval) {
    return [
      `s.simulate_protocol_time_course(make_protocol(${stepRows(sim)}), ${pyArray(sim.tEval)})`,
    ];
  }
  return protocolLines(sim);
}

/** The times a run reports; MxlPy may also return its start and step ends. */
const outputTimes = (sim: Simulation): number[] | undefined => {
  if (sim.kind === "timeCourse") return sim.tEval;
  if (sim.kind === "protocol" && sim.tEval) return sim.tEval;
  return undefined;
};

function integrator(
  tolerances: { rtol?: number; atol?: number },
  v: Validation,
): string {
  const rtol = v.exportTolerances?.rtol ?? tolerances.rtol ?? v.rtol ?? 1e-8;
  const atol = v.exportTolerances?.atol ?? tolerances.atol ?? v.atol ?? 1e-8;
  return `partial(Scipy, method=${str(v.exportMethod ?? "Radau")}, rtol=${rtol}, atol=${atol})`;
}

function preRun(pre: PreRun, scenario: Scenario, v: Validation): string[] {
  const set = pre.set ? [`pre.update_parameters(${literal(pre.set)})`] : [];
  return [
    "pre = copy.deepcopy(m)",
    ...set,
    `s = Simulator(pre, integrator=${integrator(scenario, v)})`,
    ...simulateLines(pre),
    "m.update_variables(s.get_result().unwrap_or_err().get_new_y0())",
  ];
}

/** `r` as one table: time, variables, derived values and maybe dy/dt. */
function frameOf(sim: Simulation, v: Validation): string {
  const combined = v.returnRhs
    ? `pd.concat([r.get_combined(), r.get_right_hand_side().add_prefix("ddt.")], axis=1)`
    : "r.get_combined()";
  const times = outputTimes(sim);
  // MxlPy also returns the start and each step's end; keep the requested times.
  const selected =
    times && !(sim.kind === "timeCourse" && times[0] === 0)
      ? `${combined}.reindex(${pyArray(times)}, method="nearest")`
      : combined;
  return `${selected}.rename_axis("time").reset_index()`;
}

function scenarioCell(
  id: string,
  scenario: Scenario,
  v: Validation,
  withProtocols: boolean,
): string[] {
  if (scenario.allowFailure) {
    throw new Error(`${id}: only a scan can allow failures in an export`);
  }
  const key = str(id);
  const lines = [`# Scenario ${id}`, "m = get_model()"];
  scenario.edits?.forEach((e) => lines.push(edit(e)));
  if (scenario.parameters) {
    lines.push(`m.update_parameters(${values(scenario.parameters)})`);
  }
  if (scenario.initial) {
    lines.push(`m.update_variables(${values(scenario.initial)})`);
  }

  if (scenario.stages) {
    if (withProtocols) lines.push(`protocols[${key}] = None`);
    lines.push("frames, y, offset = [], None, 0.0");
    scenario.stages.forEach((stage) => {
      lines.push("stage = copy.deepcopy(m)");
      stage.edits?.forEach((e) => lines.push(edit(e, "stage")));
      lines.push(
        "if y is not None:",
        "    stage.update_variables({k: v for k, v in y.items() if k in stage.get_variable_names()})",
        `s = Simulator(stage, integrator=${integrator(scenario, v)})`,
        ...simulateLines(stage.simulate),
        "r = s.get_result().unwrap_or_err()",
        "y = r.get_new_y0()",
        `frame = ${frameOf(stage.simulate, v)}`,
        "frame['time'] += offset",
        "offset = frame['time'].iloc[-1]",
        "frames.append(frame if not frames else frame.iloc[1:])",
      );
    });
    lines.push(`res[${key}] = pd.concat(frames, ignore_index=True)`);
    return lines;
  }

  const sim = scenario.simulate ?? v.simulate;
  if (!sim) throw new Error(`${id}: no simulation`);
  scenario.pre?.forEach((pre) => lines.push(...preRun(pre, scenario, v)));
  if (withProtocols) {
    lines.push(
      `protocols[${key}] = ${sim.kind === "protocol" ? stepRows(sim) : "None"}`,
    );
  }
  lines.push(
    `s = Simulator(m, integrator=${integrator(scenario, v)})`,
    ...simulateLines(sim),
    "r = s.get_result().unwrap_or_err()",
    `res[${key}] = ${frameOf(sim, v)}`,
  );
  return lines;
}

function toScan(scan: Scan): string {
  const column = (xs: number[]) =>
    xs.length === 1 ? String(xs[0]) : pyArray(xs);
  const over = Object.entries(scan.over).map(
    ([id, xs]) => `${str(id)}: ${scan.grid ? pyArray(xs) : column(xs)}`,
  );
  const scale = Object.entries(scan.scale ?? {}).map(
    ([id, xs]) =>
      `${str(id)}: base.get_parameter_values()[${str(id)}] * ${column(xs)}`,
  );
  const body = `{${[...over, ...scale].join(", ")}}`;
  return scan.grid ? `cartesian_product(${body})` : `pd.DataFrame(${body})`;
}

function scanCell(name: string, scan: Scan, v: Validation): string[] {
  const sim = scan.simulate ?? v.simulate;
  if (sim?.kind !== "steadyState" && sim?.kind !== "timeCourse") {
    throw new Error(`${name}: a scan runs a steady state or a time course`);
  }
  const steady = sim.kind === "steadyState";
  const lines = [`# Scan ${name}`];
  const model = scan.edits ? "m" : "get_model()";
  if (scan.edits) {
    lines.push("m = get_model()");
    scan.edits.forEach((e) => lines.push(edit(e)));
  }
  lines.push(
    `to_scan = ${toScan(scan)}`,
    `result = scan.${steady ? "steady_state" : "time_course"}(`,
    `    ${model},`,
    "    to_scan=to_scan,",
    ...(steady ? [] : [`    time_points=${pyArray(sim.tEval)},`]),
    `    runner=KineticRunner(integrator=${integrator({}, v)}),`,
    ")",
    steady
      ? "frame = result.combined"
      : `frame = result.combined.groupby(level="n").last()`,
  );
  if (!scan.allowFailure) {
    lines.push(
      `assert not frame[${literal(scan.columns)}].isna().any(axis=None)`,
    );
  }
  const firstColumn = Object.entries(scan.over).find(([, xs]) => xs.length > 1);
  const x =
    !scan.x && !scan.grid && firstColumn
      ? `to_scan[${str(firstColumn[0])}].to_numpy()`
      : pyArray(scanX(scan));
  const usesIndex = Object.values(v.golden ?? {}).some(
    (g) => g.x === `${name}.index`,
  );
  const columns = scan.columns.map(
    (c) => `    ${str(c)}: frame[${str(c)}].to_numpy(),`,
  );
  lines.push(
    `tables[${str(name)}] = {`,
    `    "x": ${x},`,
    ...(usesIndex ? ['    "index": np.arange(len(to_scan)),'] : []),
    ...columns,
    "}",
  );
  return lines;
}

/** A point analysis' model: a fresh one with its changes applied. */
function pointModel(setup: PointSetup): string[] {
  return [
    "m = get_model()",
    ...(setup.edits ?? []).map((e) => edit(e)),
    ...(setup.set ? [`m.update_parameters(${values(setup.set)})`] : []),
    ...(setup.initial ? [`m.update_variables(${values(setup.initial)})`] : []),
  ];
}

function steadyStateLines(v: Validation): string[] {
  return [
    `s = Simulator(m, integrator=${integrator({}, v)})`,
    "s.simulate_to_steady_state()",
    "y = s.get_result().unwrap_or_err().get_new_y0()",
  ];
}

function mcaCell(name: string, spec: Mca, v: Validation): string[] {
  const options = [
    ...(spec.normalized !== undefined
      ? [`    normalized=${spec.normalized ? "True" : "False"},`]
      : []),
    ...(spec.displacement !== undefined
      ? [`    displacement=${spec.displacement},`]
      : []),
  ];
  const lines = [`# MCA ${name}`, ...pointModel(spec)];
  if (spec.type === "responseCoefficients") {
    lines.push(
      "coefs = mca.response_coefficients(",
      "    m,",
      `    to_scan=${literal(spec.wrt)},`,
      ...options,
      `    runner=KineticRunner(integrator=${integrator({}, v)}),`,
      ").combined.T",
    );
  } else {
    const steady = spec.at === "steadyState";
    if (steady) lines.push(...steadyStateLines(v));
    const fn =
      spec.type === "variableElasticities"
        ? "variable_elasticities"
        : "parameter_elasticities";
    lines.push(
      `coefs = mca.${fn}(`,
      "    m,",
      `    to_scan=${literal(spec.wrt)},`,
      ...(steady ? ["    variables=y,"] : []),
      ...options,
      ").T",
    );
  }
  const columns = spec.outputs.map(
    (c) => `    ${str(c)}: coefs[${str(c)}].to_numpy(),`,
  );
  lines.push(
    `tables[${str(name)}] = {`,
    '    "x": np.arange(len(coefs)),',
    ...columns,
    "}",
  );
  return lines;
}

function stabilityCell(
  name: string,
  setup: PointSetup,
  v: Validation,
): string[] {
  return [
    `# Stability ${name}`,
    ...pointModel(setup),
    ...steadyStateLines(v),
    "eig = np.sort_complex(mca.steady_state_stability(m, y).eigenvalues)",
    `tables[${str(name)}] = {"x": np.arange(len(eig)), "real": eig.real, "imag": eig.imag}`,
  ];
}

function refMapper(v: Validation, scope?: string) {
  const ids = new Set(Object.keys(v.scenarios ?? {}));
  const tables = new Set([
    ...Object.keys(v.collect ?? {}),
    ...Object.keys(v.scans ?? {}),
    ...Object.keys(v.mca ?? {}),
    ...Object.keys(v.stability ?? {}),
  ]);
  const opNames = new Set(
    (v.ops ?? []).filter((o) => !o.into && o.op !== "column").map((o) => o.as),
  );
  const inScenario = (id: string, path: string[]) => {
    const key = str(id);
    const [a, b] = path;
    if (a === "data") return `data[${str(b)}]`;
    if (a === "param") return `base.get_parameter_values()[${str(b)}]`;
    if (a === "init") return `base.get_initial_conditions()[${str(b)}]`;
    if (opNames.has(a)) {
      return `ops[${key}][${str(a)}][${str(b ?? "value")}].to_numpy()`;
    }
    return `res[${key}][${str(path.join("."))}].to_numpy()`;
  };
  return (path: string[]): string => {
    if (scope) return inScenario(scope, path);
    if (ids.has(path[0])) return inScenario(path[0], path.slice(1));
    if (tables.has(path[0])) return `tables[${str(path[0])}][${str(path[1])}]`;
    if (path[0] === "data" || path[0] === "param" || path[0] === "init") {
      return inScenario("", path);
    }
    return `derived[${str(path[0])}]`;
  };
}

function plotLines(plot: Plot, ax: string, v: Validation): string[] {
  const py = (src: string) => {
    const expr = parse(src);
    const code = toPython(expr, refMapper(v));
    // matplotlib takes a bare column as it is.
    return isRef(expr) ? code.replace(/\.to_numpy\(\)$/, "") : code;
  };
  const lines: string[] = [];
  if (plot.title) lines.push(`${ax}.set_title(${str(plot.title)})`);
  if (plot.type === "line") {
    const right = plot.y.some((s) => s.axis === "right");
    if (right) lines.push(`${ax}_right = ${ax}.twinx()`);
    for (const s of plot.y) {
      const target = s.axis === "right" ? `${ax}_right` : ax;
      const label = s.label ? `, label=${str(s.label)}` : "";
      const x = py(s.x ?? plot.x);
      const y = py(s.of);
      if (s.err) {
        lines.push(
          `${target}.errorbar(${x}, ${y}, yerr=${py(s.err)}, fmt="^"${label})`,
        );
      } else {
        const style = s.style === "markers" ? `, ls="none", marker="o"` : "";
        lines.push(`${target}.plot(${x}, ${y}${style}${label})`);
      }
    }
    if (plot.logX) lines.push(`${ax}.set_xscale("log")`);
    if (plot.xLabel) lines.push(`${ax}.set_xlabel(${str(plot.xLabel)})`);
    if (plot.yLabel) lines.push(`${ax}.set_ylabel(${str(plot.yLabel)})`);
    if (plot.xLim) lines.push(`${ax}.set_xlim(${plot.xLim.join(", ")})`);
    if (plot.yLim) lines.push(`${ax}.set_ylim(${plot.yLim.join(", ")})`);
    if (right && plot.yRightLabel) {
      lines.push(`${ax}_right.set_ylabel(${str(plot.yRightLabel)})`);
    }
    if (right && plot.yRightLim) {
      lines.push(`${ax}_right.set_ylim(${plot.yRightLim.join(", ")})`);
    }
    for (const p of plot.phases ?? []) {
      lines.push(`${ax}.axvspan(${p.from}, ${p.to}, color="gray", alpha=0.3)`);
    }
    if (plot.y.some((s) => s.label)) lines.push(`${ax}.legend()`);
  } else if (plot.type === "scatter") {
    for (const s of plot.series) {
      const label = s.label ? `, label=${str(s.label)}` : "";
      lines.push(`${ax}.scatter(${py(s.x)}, ${py(s.y)}${label})`);
    }
    if (plot.identity && plot.lim) {
      const lim = `[${plot.lim.join(", ")}]`;
      lines.push(`${ax}.plot(${lim}, ${lim}, color="black")`);
    }
    if (plot.lim) {
      lines.push(
        `${ax}.set_xlim(${plot.lim.join(", ")})`,
        `${ax}.set_ylim(${plot.lim.join(", ")})`,
      );
    }
    if (plot.xLabel) lines.push(`${ax}.set_xlabel(${str(plot.xLabel)})`);
    if (plot.yLabel) lines.push(`${ax}.set_ylabel(${str(plot.yLabel)})`);
  } else if (plot.type === "stackedBar") {
    lines.push(`bottom = np.zeros(${plot.categories.length})`);
    for (const stack of plot.stacks) {
      const heights = `[${stack.of.map(py).join(", ")}]`;
      lines.push(
        `${ax}.bar(${literal(plot.categories)}, ${heights}, bottom=bottom, label=${str(stack.label)})`,
        `bottom += np.array(${heights})`,
      );
    }
    if (plot.yLabel) lines.push(`${ax}.set_ylabel(${str(plot.yLabel)})`);
    if (plot.yLim) lines.push(`${ax}.set_ylim(${plot.yLim.join(", ")})`);
    lines.push(`${ax}.legend()`);
  } else {
    const z = plot.z.map((row) => `[${row.map(py).join(", ")}]`).join(", ");
    lines.push(
      `${ax}.imshow(np.array([${z}]), aspect="auto")`,
      `${ax}.set_yticks(range(${plot.rows.length}), ${literal(plot.rows)})`,
      `${ax}.set_xticks(range(${plot.columns.length}), ${literal(plot.columns)}, rotation=90)`,
    );
  }
  return lines;
}

function plotCell(v: Validation): string[] {
  const n = v.plots.length;
  const columns = Math.min(n, 3);
  const rows = Math.ceil(n / columns);
  const lines = [
    `fig, axs = plt.subplots(nrows=${rows}, ncols=${columns}, figsize=(${5 * columns}, ${4 * rows}), squeeze=False)`,
  ];
  v.plots.forEach((plot, i) => {
    const ax = `ax${i}`;
    lines.push(
      `${ax} = axs[${Math.floor(i / columns)}, ${i % columns}]`,
      ...plotLines(plot, ax, v),
    );
  });
  lines.push("plt.tight_layout()", "plt.show()");
  return lines;
}

function validationCells(v: Validation, goldenSeries: boolean): string[][] {
  const ids = Object.keys(v.scenarios ?? {});
  const namedOps = (v.ops ?? []).some((o) => o.op !== "column");
  const sim: string[] = [];
  if (v.data) {
    sim.push(
      `data = ${literal(v.data)}`,
      "data = {k: np.array(c) for k, c in data.items()}",
    );
  }
  if (ids.length > 0) sim.push("res = {}");
  if (namedOps) sim.push("protocols = {}");
  if (v.collect || v.scans || v.mca || v.stability) sim.push("tables = {}");
  for (const id of ids) {
    sim.push("", ...scenarioCell(id, v.scenarios![id], v, namedOps));
  }
  for (const [name, scan] of Object.entries(v.scans ?? {})) {
    sim.push("", ...scanCell(name, scan, v));
  }
  for (const [name, spec] of Object.entries(v.mca ?? {})) {
    sim.push("", ...mcaCell(name, spec, v));
  }
  for (const [name, setup] of Object.entries(v.stability ?? {})) {
    sim.push("", ...stabilityCell(name, setup, v));
  }

  const lines: string[] = [];
  if (namedOps) lines.push("ops = {id: {} for id in res}");
  if (v.derive) lines.push("derived = {}");
  const expr = (src: string, scope?: string) =>
    toPython(parse(src), refMapper(v, scope));
  for (const id of ids) {
    const frame = `res[${str(id)}]`;
    for (const [name, src] of Object.entries(v.deriveEach ?? {})) {
      lines.push(`${frame}[${str(name)}] = ${expr(src, id)}`);
    }
  }
  for (const { op, as, scenario, into, ...args } of v.ops ?? []) {
    for (const id of scenario ? [scenario] : ids) {
      const key = str(id);
      if (op === "column") {
        lines.push(
          `res[${key}][${str(as)}] = ${expr(args.expr as string, id)}`,
        );
        continue;
      }
      lines.push(
        `ops[${key}][${str(as)}] = ${OPS[op].python.name}(res[${key}], protocols[${key}], **${literal(args)})`,
      );
      if (into) {
        lines.push(
          `res[${key}][${str(as)}] = ops[${key}][${str(as)}]["value"].to_numpy()`,
        );
      }
    }
  }
  for (const [name, table] of Object.entries(v.collect ?? {})) {
    const columns = Object.entries(table.columns).map(
      ([col, exprs]) =>
        `${str(col)}: np.array([${exprs.map((e) => expr(e)).join(", ")}])`,
    );
    lines.push(
      `tables[${str(name)}] = {"x": ${pyArray(table.x)}, ${columns.join(", ")}}`,
    );
  }
  for (const [name, src] of Object.entries(v.derive ?? {})) {
    lines.push(`derived[${str(name)}] = ${expr(src)}`);
  }
  if (goldenSeries) {
    const golden = Object.entries(v.golden ?? {}).map(
      ([name, g]) => `    ${str(name)}: (${expr(g.x)}, ${expr(g.y)}),`,
    );
    lines.push(`validation_series[${str(v.id)}] = {`, ...golden, "}");
  }
  return [sim, lines, plotCell(v)].filter((cell) => cell.length > 0);
}

/** The imports a notebook's code uses. */
function importLines(source: string): string[] {
  const uses = (name: string) =>
    new RegExp(`(?<![\\w."])${name}\\b`).test(source);
  const mxlpy = ["Scipy", "Simulator", "cartesian_product", "make_protocol"]
    .filter(uses)
    .concat(/\bscan\.(steady_state|time_course)\(/.test(source) ? ["scan"] : [])
    .concat(/\bmca\.\w+\(/.test(source) ? ["mca"] : [])
    .sort();
  const scipySignal = ["find_peaks", "peak_prominences"].filter(uses);
  const third = [
    uses("plt") && "import matplotlib.pyplot as plt",
    uses("np") && "import numpy as np",
    uses("pd") && "import pandas as pd",
    mxlpy.length > 0 && `from mxlpy import ${mxlpy.join(", ")}`,
    uses("KineticRunner") && "from mxlpy.runners import KineticRunner",
    uses("cumulative_trapezoid") &&
      "from scipy.integrate import cumulative_trapezoid",
    uses("gaussian_filter1d") && "from scipy.ndimage import gaussian_filter1d",
    scipySignal.length > 0 &&
      `from scipy.signal import ${scipySignal.join(", ")}`,
  ].filter((l): l is string => Boolean(l));
  const std = [
    uses("copy") && "import copy",
    uses("partial") && "from functools import partial",
  ].filter((l): l is string => Boolean(l));
  return [...std, ...(std.length > 0 ? [""] : []), ...third];
}

/** A notebook as a plain .ipynb object. */
export function toMxlpyNotebook(
  title: string,
  model: KineticModelBuilder,
  validations: Validation[],
  { goldenSeries = false }: { goldenSeries?: boolean } = {},
): object {
  const code = (lines: string[]) => ({
    cell_type: "code",
    execution_count: null,
    metadata: {},
    outputs: [],
    source: lines.join("\n"),
  });
  const markdown = (text: string) => ({
    cell_type: "markdown",
    metadata: {},
    source: text,
  });
  const used = new Set(
    validations.flatMap((v) =>
      (v.ops ?? []).map((o) => o.op).filter((op) => op !== "column"),
    ),
  );
  const opCells =
    used.size > 0 ? [[...used].map((op) => OPS[op].python.source)] : [];
  const figures = validations.map((v) => ({
    title: v.title,
    cells: validationCells(v, goldenSeries),
  }));
  const body = [...opCells, ...figures.flatMap((f) => f.cells)]
    .flat()
    .join("\n");
  const usesBase = /\bbase\./.test(body);
  const setup = [
    ...(usesBase ? ["", "base = get_model()"] : []),
    ...(goldenSeries ? ["validation_series = {}"] : []),
  ];
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: { language_info: { name: "python" } },
    cells: [
      markdown(
        `# ${title}\n\nGenerated by GreenSloth from this model's validations.`,
      ),
      code(importLines(body)),
      code([model.buildMxlpy(), ...setup]),
      ...opCells.map(code),
      ...figures.flatMap((f) => [
        markdown(`## ${f.title}`),
        ...f.cells.map(code),
      ]),
    ],
  };
}
