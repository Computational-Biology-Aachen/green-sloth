/**
 * The validation expression language: column maths as strings, such as
 * `wt.NPQ - npq4.NPQ` or `-log10(H_lumen * 1e-6)`. Parsed by hand (no `eval`) to
 * an AST that the engine evaluates and the export targets translate.
 */

export type Expr =
  | { k: "num"; value: number }
  | { k: "ref"; path: string[] }
  | { k: "neg"; arg: Expr }
  | { k: "bin"; op: "+" | "-" | "*" | "/" | "^"; l: Expr; r: Expr }
  | { k: "call"; fn: string; args: Expr[] };

export type Value = number | number[];

const ELEMENTWISE: Record<string, (x: number) => number> = {
  log10: Math.log10,
  log2: Math.log2,
  ln: Math.log,
  exp: Math.exp,
  sqrt: Math.sqrt,
  abs: Math.abs,
  sin: Math.sin,
};

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
function mean(xs: number[]): number {
  return sum(xs) / xs.length;
}

/** `std` is the sample standard deviation (`ddof=1`), as in the notebooks. */
const AGGREGATES: Record<string, (xs: number[]) => number> = {
  mean,
  sum,
  min: (xs) => Math.min(...xs),
  max: (xs) => Math.max(...xs),
  first: (xs) => xs[0],
  last: (xs) => xs[xs.length - 1],
  std: (xs) => {
    const m = mean(xs);
    return Math.sqrt(
      xs.reduce((a, x) => a + (x - m) * (x - m), 0) / (xs.length - 1),
    );
  },
};

export const FUNCTIONS = new Set([
  ...Object.keys(ELEMENTWISE),
  ...Object.keys(AGGREGATES),
  "at",
]);

const TOKEN =
  /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)|([-+*/^(),]))/y;

type Token = { num: number } | { name: string } | { sym: string };

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < src.length) {
    if (src.slice(TOKEN.lastIndex).trim() === "") break;
    const at = TOKEN.lastIndex;
    const m = TOKEN.exec(src);
    if (!m) throw new Error(`Unexpected "${src.slice(at)}" in "${src}"`);
    if (m[1] !== undefined) out.push({ num: Number(m[1]) });
    else if (m[2] !== undefined) out.push({ name: m[2] });
    else out.push({ sym: m[3] });
  }
  return out;
}

export function parse(src: string): Expr {
  const tokens = tokenize(src);
  let i = 0;
  const isSym = (s: string) => {
    const t = tokens[i];
    return t !== undefined && "sym" in t && t.sym === s;
  };
  const expect = (s: string) => {
    if (!isSym(s)) throw new Error(`Expected "${s}" in "${src}"`);
    i++;
  };

  function additive(): Expr {
    let l = multiplicative();
    while (isSym("+") || isSym("-")) {
      const op = (tokens[i++] as { sym: "+" | "-" }).sym;
      l = { k: "bin", op, l, r: multiplicative() };
    }
    return l;
  }
  function multiplicative(): Expr {
    let l = unary();
    while (isSym("*") || isSym("/")) {
      const op = (tokens[i++] as { sym: "*" | "/" }).sym;
      l = { k: "bin", op, l, r: unary() };
    }
    return l;
  }
  // Binds looser than `^`, as in Python: -2^2 is -(2^2).
  function unary(): Expr {
    if (isSym("-")) {
      i++;
      return { k: "neg", arg: unary() };
    }
    return power();
  }
  function power(): Expr {
    const l = atom();
    if (isSym("^")) {
      i++;
      return { k: "bin", op: "^", l, r: unary() };
    }
    return l;
  }
  function atom(): Expr {
    const t = tokens[i];
    if (t === undefined) throw new Error(`Unexpected end of "${src}"`);
    if ("num" in t) {
      i++;
      return { k: "num", value: t.num };
    }
    if ("name" in t) {
      i++;
      if (!isSym("(")) return { k: "ref", path: t.name.split(".") };
      if (!FUNCTIONS.has(t.name)) {
        throw new Error(`Unknown function "${t.name}" in "${src}"`);
      }
      i++;
      const args = [additive()];
      while (isSym(",")) {
        i++;
        args.push(additive());
      }
      expect(")");
      return { k: "call", fn: t.name, args };
    }
    if (isSym("(")) {
      i++;
      const inner = additive();
      expect(")");
      return inner;
    }
    throw new Error(`Unexpected token in "${src}"`);
  }

  const out = additive();
  if (i !== tokens.length) throw new Error(`Trailing input in "${src}"`);
  return out;
}

/** Every reference in an expression, for static id checks. */
export function refs(e: Expr, out: string[][] = []): string[][] {
  if (e.k === "ref") out.push(e.path);
  else if (e.k === "neg") refs(e.arg, out);
  else if (e.k === "bin") {
    refs(e.l, out);
    refs(e.r, out);
  } else if (e.k === "call") e.args.forEach((a) => refs(a, out));
  return out;
}

function broadcast(
  a: Value,
  b: Value,
  f: (x: number, y: number) => number,
): Value {
  if (typeof a === "number" && typeof b === "number") return f(a, b);
  if (typeof a === "number") return (b as number[]).map((y) => f(a, y));
  if (typeof b === "number") return a.map((x) => f(x, b));
  if (a.length !== b.length) {
    throw new Error(`Column length mismatch: ${a.length} vs ${b.length}`);
  }
  return a.map((x, i) => f(x, b[i]));
}

const BINARY = {
  "+": (x: number, y: number) => x + y,
  "-": (x: number, y: number) => x - y,
  "*": (x: number, y: number) => x * y,
  "/": (x: number, y: number) => x / y,
  "^": (x: number, y: number) => x ** y,
};

function asColumn(v: Value, fn: string): number[] {
  if (typeof v === "number") throw new Error(`${fn}() needs a column`);
  return v;
}

/** `resolve` maps a reference to its value, throwing if it doesn't exist. */
export function evaluate(e: Expr, resolve: (path: string[]) => Value): Value {
  const ev = (x: Expr) => evaluate(x, resolve);
  switch (e.k) {
    case "num":
      return e.value;
    case "ref":
      return resolve(e.path);
    case "neg":
      return broadcast(0, ev(e.arg), (_, y) => -y);
    case "bin":
      return broadcast(ev(e.l), ev(e.r), BINARY[e.op]);
    case "call": {
      if (e.fn === "at") {
        // at(col, t, timeCol): the value at the sample nearest to t.
        const [col, t, times] = e.args.map(ev);
        const ts = asColumn(times, "at");
        const target = t as number;
        let best = 0;
        ts.forEach((x, i) => {
          if (Math.abs(x - target) < Math.abs(ts[best] - target)) best = i;
        });
        return asColumn(col, "at")[best];
      }
      const arg = ev(e.args[0]);
      const aggregate = AGGREGATES[e.fn];
      if (aggregate) return aggregate(asColumn(arg, e.fn));
      const f = ELEMENTWISE[e.fn];
      return typeof arg === "number" ? f(arg) : arg.map(f);
    }
  }
}

const PY_ELEMENTWISE: Record<string, string> = {
  log10: "np.log10",
  log2: "np.log2",
  ln: "np.log",
  exp: "np.exp",
  sqrt: "np.sqrt",
  abs: "np.abs",
  sin: "np.sin",
};
const PY_AGGREGATES: Record<string, (x: string) => string> = {
  mean: (x) => `np.mean(${x})`,
  sum: (x) => `np.sum(${x})`,
  min: (x) => `np.min(${x})`,
  max: (x) => `np.max(${x})`,
  first: (x) => `${x}[0]`,
  last: (x) => `${x}[-1]`,
  std: (x) => `np.std(${x}, ddof=1)`,
};

/** The same expression as numpy; `ref` maps a reference to a Python array. */
export function toPython(e: Expr, ref: (path: string[]) => string): string {
  const py = (x: Expr) => toPython(x, ref);
  switch (e.k) {
    case "num":
      return String(e.value);
    case "ref":
      return ref(e.path);
    case "neg":
      return `(-${py(e.arg)})`;
    case "bin":
      return `(${py(e.l)} ${e.op === "^" ? "**" : e.op} ${py(e.r)})`;
    case "call":
      if (e.fn === "at") {
        const [col, t, times] = e.args.map(py);
        return `${col}[np.argmin(np.abs(${times} - ${t}))]`;
      }
      if (e.fn in PY_AGGREGATES) return PY_AGGREGATES[e.fn](py(e.args[0]));
      return `${PY_ELEMENTWISE[e.fn]}(${py(e.args[0])})`;
  }
}
