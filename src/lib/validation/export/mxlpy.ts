/**
 * Compiles a model's validations to a Jupyter notebook on MxlPy, pandas, numpy
 * and matplotlib. Generated on demand; misc/mxl-e2e executes the result and holds
 * it to the same goldens as the TS engine.
 */
import type { KineticModelBuilder } from "@computational-biology-aachen/mxlweb-core";
import { parse, toPython } from "../expr";
import { OPS } from "../ops";
import type {
  ModelEdit,
  Scenario,
  ScenarioValue,
  Simulation,
  Validation,
} from "../types";

const dict = (o: Record<string, unknown>) => JSON.stringify(o);

function value(v: ScenarioValue): string {
  if (typeof v === "number") return String(v);
  return toPython(parse(v), ([scope, name]) =>
    scope === "param"
      ? `base.get_parameter_values()[${JSON.stringify(name)}]`
      : `base.get_initial_conditions()[${JSON.stringify(name)}]`,
  );
}

function values(o: Record<string, ScenarioValue>): string {
  const body = Object.entries(o).map(
    ([k, v]) => `${JSON.stringify(k)}: ${value(v)}`,
  );
  return `{${body.join(", ")}}`;
}

function edit(e: ModelEdit): string {
  if ("removeReaction" in e) {
    return `m.remove_reaction(${JSON.stringify(e.removeReaction)})`;
  }
  if ("addParameter" in e) {
    return `m.add_parameter(${JSON.stringify(e.addParameter)}, ${e.value})`;
  }
  if ("clampVariable" in e) {
    const id = JSON.stringify(e.clampVariable);
    return `m.remove_variable(${id})\nm.add_parameter(${id}, ${e.to})`;
  }
  throw new Error(`setAssignment "${e.setAssignment}" has no MxlPy export yet`);
}

function protocolLiteral(sim: Simulation): string {
  if (sim.kind !== "protocol") return "None";
  const rows = sim.steps.map((s) => `(${s.duration}, ${dict(s.set)})`);
  return `[${rows.join(", ")}]`;
}

function simulateLines(sim: Simulation, record: boolean): string[] {
  const finish = record ? [] : [];
  if (sim.kind === "protocol") {
    return [
      `s.simulate_protocol(make_protocol(${protocolLiteral(sim)}), time_points_per_step=${sim.pointsPerStep})`,
      ...finish,
    ];
  }
  if (sim.kind === "timeCourse") {
    return [`s.simulate_time_course(${JSON.stringify(sim.tEval)})`, ...finish];
  }
  return ["s.simulate_to_steady_state()", ...finish];
}

function scenarioCell(
  id: string,
  scenario: Scenario,
  validation: Validation,
): string[] {
  const sim = scenario.simulate ?? validation.simulate;
  const rtol = scenario.rtol ?? validation.rtol ?? 1e-8;
  const atol = scenario.atol ?? validation.atol ?? 1e-8;
  const integrator = `partial(Scipy, method="Radau", rtol=${rtol}, atol=${atol})`;
  const lines = [`# Scenario ${id}`, "m = get_model()"];
  if (scenario.parameters) {
    lines.push(`m.update_parameters(${values(scenario.parameters)})`);
  }
  scenario.edits?.forEach((e) => lines.push(edit(e)));
  if (scenario.initial) {
    lines.push(`m.update_variables(${values(scenario.initial)})`);
  }
  for (const pre of scenario.pre ?? []) {
    lines.push(
      `s = Simulator(m, integrator=${integrator})`,
      ...simulateLines(pre, false),
      "m.update_variables(s.get_result().unwrap_or_err().get_new_y0())",
    );
  }
  lines.push(
    `s = Simulator(m, integrator=${integrator})`,
    ...simulateLines(sim, true),
    `res[${JSON.stringify(id)}] = (`,
    '    s.get_result().unwrap_or_err().get_combined().rename_axis("time").reset_index()',
    ")",
    `protocols[${JSON.stringify(id)}] = ${protocolLiteral(sim)}`,
  );
  return lines;
}

function refMapper(validation: Validation, scope?: string) {
  const ids = new Set(Object.keys(validation.scenarios));
  const opNames = new Set((validation.ops ?? []).map((o) => o.as));
  const inScenario = (id: string, path: string[]) => {
    const key = JSON.stringify(id);
    const [a, b] = path;
    if (opNames.has(a)) {
      return `ops[${key}][${JSON.stringify(a)}][${JSON.stringify(b ?? "value")}].to_numpy()`;
    }
    return `res[${key}][${JSON.stringify(a)}].to_numpy()`;
  };
  return (path: string[]): string => {
    if (path[0] === "param") {
      return `base.get_parameter_values()[${JSON.stringify(path[1])}]`;
    }
    if (path[0] === "init") {
      return `base.get_initial_conditions()[${JSON.stringify(path[1])}]`;
    }
    if (scope) return inScenario(scope, path);
    if (ids.has(path[0])) return inScenario(path[0], path.slice(1));
    return `derived[${JSON.stringify(path[0])}]`;
  };
}

function plotCell(validation: Validation): string[] {
  const map = refMapper(validation);
  const py = (src: string) => toPython(parse(src), map);
  const n = validation.plots.length;
  const lines = [
    `fig, axs = plt.subplots(ncols=${n}, figsize=(${5 * n}, 4), squeeze=False)`,
  ];
  validation.plots.forEach((plot, i) => {
    const ax = `axs[0, ${i}]`;
    for (const series of plot.y) {
      const label = series.label
        ? `, label=${JSON.stringify(series.label)}`
        : "";
      lines.push(
        `${ax}.plot(${py(series.x ?? plot.x)}, ${py(series.of)}${label})`,
      );
    }
    if (plot.title)
      lines.push(`${ax}.set_title(${JSON.stringify(plot.title)})`);
    if (plot.xLabel)
      lines.push(`${ax}.set_xlabel(${JSON.stringify(plot.xLabel)})`);
    if (plot.yLabel)
      lines.push(`${ax}.set_ylabel(${JSON.stringify(plot.yLabel)})`);
    if (plot.xLim) lines.push(`${ax}.set_xlim(${plot.xLim.join(", ")})`);
    if (plot.yLim) lines.push(`${ax}.set_ylim(${plot.yLim.join(", ")})`);
    if (plot.y.some((s) => s.label)) lines.push(`${ax}.legend()`);
  });
  lines.push("plt.tight_layout()", "plt.show()");
  return lines;
}

function validationCells(validation: Validation): string[][] {
  const ids = Object.keys(validation.scenarios);
  const sim = ["res = {}", "protocols = {}"];
  for (const id of ids) {
    sim.push("", ...scenarioCell(id, validation.scenarios[id], validation));
  }

  const data = ["ops = {id: {} for id in res}", "derived = {}"];
  for (const id of ids) {
    for (const [name, src] of Object.entries(validation.deriveEach ?? {})) {
      const expr = toPython(parse(src), refMapper(validation, id));
      data.push(
        `res[${JSON.stringify(id)}][${JSON.stringify(name)}] = ${expr}`,
      );
    }
  }
  for (const { op, as, scenario, ...args } of validation.ops ?? []) {
    for (const id of scenario ? [scenario] : ids) {
      const key = JSON.stringify(id);
      data.push(
        `ops[${key}][${JSON.stringify(as)}] = ${OPS[op].python.name}(res[${key}], protocols[${key}], **${dict(args)})`,
      );
    }
  }
  for (const [name, src] of Object.entries(validation.derive ?? {})) {
    data.push(
      `derived[${JSON.stringify(name)}] = ${toPython(parse(src), refMapper(validation))}`,
    );
  }
  const golden = Object.entries(validation.golden ?? {}).map(([name, g]) => {
    const py = (s: string) => toPython(parse(s), refMapper(validation));
    return `    ${JSON.stringify(name)}: (${py(g.x)}, ${py(g.y)}),`;
  });
  data.push(
    `validation_series[${JSON.stringify(validation.id)}] = {`,
    ...golden,
    "}",
  );
  return [sim, data, plotCell(validation)];
}

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
    validations.flatMap((v) => (v.ops ?? []).map((o) => o.op)),
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
