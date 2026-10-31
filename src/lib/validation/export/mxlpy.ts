/**
 * Compiles a model's validations to a Jupyter notebook on MxlPy, pandas, numpy
 * and matplotlib. Generated on demand; misc/mxl-e2e executes the result and holds
 * it to the same goldens as the TS engine.
 */
import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import { parse, refs, toPython } from "../expr";
import { OPS } from "../ops";
import type {
  ModelEdit,
  Plot,
  PreRun,
  Scenario,
  ScenarioValue,
  Simulation,
  Validation,
} from "../types";

const str = JSON.stringify;

/** JSON is Python, apart from `null` and non-finite numbers, which specs lack. */
const literal = (v: unknown) => (v === null ? "None" : JSON.stringify(v));

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

const stepRows = (sim: Simulation) =>
  sim.kind === "protocol"
    ? `[${sim.steps
        .map(
          (s) =>
            `(${s.duration}, ${literal(s.set)}, ${s.points ?? sim.pointsPerStep ?? 10})`,
        )
        .join(", ")}]`
    : "None";

/** Code running `sim` on simulator `s`. */
function simulateLine(sim: Simulation): string {
  if (sim.kind === "steadyState") return "s.simulate_to_steady_state()";
  if (sim.kind === "timeCourse") {
    return `s.simulate_time_course(${literal(sim.tEval)})`;
  }
  if (sim.tEval) {
    return `s.simulate_protocol_time_course(make_protocol([(d, p) for d, p, _ in ${stepRows(sim)}]), ${literal(sim.tEval)})`;
  }
  return `run_protocol(s, ${stepRows(sim)})`;
}

/** The times a run reports; MxlPy may also return its start and step ends. */
const outputTimes = (sim: Simulation): number[] | undefined => {
  if (sim.kind === "timeCourse") return sim.tEval;
  if (sim.kind === "protocol" && sim.tEval) return sim.tEval;
  return undefined;
};

function integrator(scenario: Scenario, v: Validation): string {
  const rtol = v.exportTolerances?.rtol ?? scenario.rtol ?? v.rtol ?? 1e-8;
  const atol = v.exportTolerances?.atol ?? scenario.atol ?? v.atol ?? 1e-8;
  return `partial(Scipy, method=${str(v.exportMethod ?? "Radau")}, rtol=${rtol}, atol=${atol})`;
}

function preRun(pre: PreRun, scenario: Scenario, v: Validation): string[] {
  const set = pre.set ? [`pre.update_parameters(${literal(pre.set)})`] : [];
  return [
    "pre = copy.deepcopy(m)",
    ...set,
    `s = Simulator(pre, integrator=${integrator(scenario, v)})`,
    simulateLine(pre),
    "m.update_variables(s.get_result().unwrap_or_err().get_new_y0())",
  ];
}

function scenarioCell(id: string, scenario: Scenario, v: Validation): string[] {
  const key = str(id);
  const lines = [`# Scenario ${id}`, "m = get_model()"];
  scenario.edits?.forEach((e) => lines.push(edit(e)));
  if (scenario.parameters) {
    lines.push(`m.update_parameters(${values(scenario.parameters)})`);
  }
  if (scenario.initial) {
    lines.push(`m.update_variables(${values(scenario.initial)})`);
  }
  lines.push(`protocols[${key}] = None`);

  if (scenario.stages) {
    lines.push("frames, y, offset = [], None, 0.0");
    scenario.stages.forEach((stage) => {
      lines.push("stage = copy.deepcopy(m)");
      stage.edits?.forEach((e) => lines.push(edit(e, "stage")));
      lines.push(
        "if y is not None:",
        "    stage.update_variables({k: v for k, v in y.items() if k in stage.get_variable_names()})",
        `s = Simulator(stage, integrator=${integrator(scenario, v)})`,
        simulateLine(stage.simulate),
        "r = s.get_result().unwrap_or_err()",
        "y = r.get_new_y0()",
        "frame = frame_of(r, s, " +
          `${literal(outputTimes(stage.simulate) ?? null)}, ${v.returnRhs ? "True" : "False"})`,
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
  if (sim.kind === "protocol")
    lines.push(`protocols[${key}] = [(d, p) for d, p, _ in ${stepRows(sim)}]`);
  const finish = `res[${key}] = frame_of(r, s, ${literal(outputTimes(sim) ?? null)}, ${v.returnRhs ? "True" : "False"})`;
  const run = [
    `s = Simulator(m, integrator=${integrator(scenario, v)})`,
    simulateLine(sim),
    "r = s.get_result().unwrap_or_err()",
  ];
  // MxlPy's scans leave out what doesn't settle, such as oscillating points.
  if (scenario.allowFailure || sim.kind === "steadyState") {
    lines.push(
      "try:",
      ...run.map((l) => `    ${l}`),
      `    ${finish}`,
      "except Exception:",
      `    res[${key}] = None`,
    );
  } else {
    lines.push(...run, finish);
  }
  return lines;
}

function refMapper(v: Validation, scope?: string) {
  const ids = new Set(Object.keys(v.scenarios));
  const tables = new Set(Object.keys(v.collect ?? {}));
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
    return `column(res[${key}], ${str(path.join("."))})`;
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
  const py = (src: string) => toPython(parse(src), refMapper(v));
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

function validationCells(v: Validation): string[][] {
  const ids = Object.keys(v.scenarios);
  const sim = [
    `data = ${literal(v.data ?? {})}`,
    "data = {k: np.array(c) for k, c in data.items()}",
    "res = {}",
    "protocols = {}",
  ];
  for (const id of ids) {
    sim.push("", ...scenarioCell(id, v.scenarios[id], v));
  }

  const lines = ["ops = {id: {} for id in res}", "tables = {}", "derived = {}"];
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
      `tables[${str(name)}] = {"x": np.array(${literal(table.x)}), ${columns.join(", ")}}`,
    );
  }
  for (const [name, src] of Object.entries(v.derive ?? {})) {
    lines.push(`derived[${str(name)}] = ${expr(src)}`);
  }
  const golden = Object.entries(v.golden ?? {}).map(
    ([name, g]) => `    ${str(name)}: (${expr(g.x)}, ${expr(g.y)}),`,
  );
  lines.push(`validation_series[${str(v.id)}] = {`, ...golden, "}");
  return [sim, lines, plotCell(v)];
}

const SUPPORT = `def run_protocol(s, steps):
    """Hold each step's parameters for its duration, as MxlPy's simulate_protocol."""
    t = 0.0
    for duration, parameters, points in steps:
        t += duration
        s.update_parameters(parameters)
        s.simulate(t, steps=points)


def frame_of(result, s, times, with_rhs):
    """One table per run: time, variables, derived values and dy/dt."""
    frame = result.get_combined()
    if with_rhs:
        frame = pd.concat([frame, result.get_right_hand_side().add_prefix("ddt.")], axis=1)
    frame = frame.rename_axis("time").reset_index()
    if times is not None:
        idx = [int(np.argmin(np.abs(frame["time"].to_numpy() - t))) for t in times]
        frame = frame.iloc[idx].reset_index(drop=True)
    return frame


def column(frame, name):
    """A column as an array; a failed run has only NaN."""
    return np.array([np.nan]) if frame is None else frame[name].to_numpy()`;

/** A notebook as a plain .ipynb object. */
export function toMxlpyNotebook(
  title: string,
  model: KineticModelBuilder,
  validations: Validation[],
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
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: { language_info: { name: "python" } },
    cells: [
      markdown(
        `# ${title}\n\nGenerated by GreenSloth from this model's validations.`,
      ),
      code([
        "import copy",
        "from functools import partial",
        "",
        "import matplotlib.pyplot as plt",
        "import numpy as np",
        "import pandas as pd",
        "from mxlpy import Model, Scipy, Simulator, make_protocol",
        "from scipy.integrate import cumulative_trapezoid",
        "from scipy.ndimage import gaussian_filter1d",
        "from scipy.signal import find_peaks, peak_prominences",
      ]),
      code([
        model.buildMxlpy(),
        "",
        "base = get_model()",
        "validation_series = {}",
      ]),
      code([SUPPORT]),
      ...(used.size > 0
        ? [code([...used].map((op) => OPS[op].python.source))]
        : []),
      ...validations.flatMap((v) => [
        markdown(`## ${v.title}`),
        ...validationCells(v).map(code),
      ]),
    ],
  };
}
