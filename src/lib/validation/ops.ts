/**
 * Named ops: the non-scalar data handling of a validation. Each op has both
 * implementations here, so one can't exist without the other; a target that
 * can't express an op has to say so in its `python` field.
 * tests/fixtures/validation-ops.json pins both to the same numbers, and semantics
 * follow numpy/scipy where the two could differ.
 */
import { evaluate, parse, type Value } from "./expr";
import type { ProtocolStep } from "./types";

export type Frame = Record<string, number[]>;

export interface OpContext {
  column(expr: string): number[];
  protocol: ProtocolStep[] | undefined;
}

export interface OpDef {
  run(args: Record<string, unknown>, ctx: OpContext): Frame;
  /** numpy/pandas source of `def <python.name>(frame, protocol, **args)`. */
  python: { name: string; source: string };
}

/** Strict interior maxima; a plateau reports its midpoint, as scipy.signal. */
export function localMaxima(x: number[]): number[] {
  const out: number[] = [];
  let i = 1;
  while (i < x.length - 1) {
    if (x[i - 1] < x[i]) {
      let ahead = i + 1;
      while (ahead < x.length - 1 && x[ahead] === x[i]) ahead++;
      if (x[ahead] < x[i]) {
        out.push(Math.floor((i + ahead - 1) / 2));
        i = ahead;
      }
    }
    i++;
  }
  return out;
}

/** scipy.ndimage.gaussian_filter1d with mode="reflect", truncate=4. */
export function gaussianFilter(x: number[], sigma: number): number[] {
  const radius = Math.round(4 * sigma);
  const kernel: number[] = [];
  for (let i = -radius; i <= radius; i++) {
    kernel.push(Math.exp((-0.5 * i * i) / (sigma * sigma)));
  }
  const norm = kernel.reduce((a, b) => a + b, 0);
  const n = x.length;
  const at = (i: number) => {
    const period = 2 * n;
    const m = ((i % period) + period) % period;
    return x[m < n ? m : period - 1 - m];
  };
  return x.map((_, i) =>
    kernel.reduce((sum, w, k) => sum + (w * at(i + k - radius)) / norm, 0),
  );
}

/** numpy.gradient on a non-uniform grid: second-order inside, first at edges. */
export function gradient(y: number[], x: number[]): number[] {
  const n = y.length;
  return y.map((_, i) => {
    if (i === 0) return (y[1] - y[0]) / (x[1] - x[0]);
    if (i === n - 1) return (y[n - 1] - y[n - 2]) / (x[n - 1] - x[n - 2]);
    const a = x[i] - x[i - 1];
    const b = x[i + 1] - x[i];
    return (
      (-b / (a * (a + b))) * y[i - 1] +
      ((b - a) / (a * b)) * y[i] +
      (a / (b * (a + b))) * y[i + 1]
    );
  });
}

/** numpy.interp: clamps outside the sample range. */
export function interp(at: number[], x: number[], y: number[]): number[] {
  return at.map((t) => {
    if (t <= x[0]) return y[0];
    if (t >= x[x.length - 1]) return y[y.length - 1];
    let lo = 0;
    let hi = x.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (x[mid] <= t) lo = mid;
      else hi = mid;
    }
    return y[lo] + ((t - x[lo]) / (x[hi] - x[lo])) * (y[hi] - y[lo]);
  });
}

/** Left bases of scipy.signal.peak_prominences (default wlen). */
function leftBases(x: number[], peaks: number[]): number[] {
  return peaks.map((peak) => {
    let base = peak;
    let lowest = x[peak];
    for (let i = peak; i >= 0 && x[i] <= x[peak]; i--) {
      if (x[i] < lowest) {
        lowest = x[i];
        base = i;
      }
    }
    return base;
  });
}

/** Math.min(...x) overflows the stack on long columns; these two extremes don't. */
function minMaxSafe(x: number[]): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of x) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return [lo, hi];
}

/** Sample windows [from, to) around each saturating pulse. */
function pulseWindows(
  time: number[],
  protocol: ProtocolStep[],
  pulse: Record<string, number>,
  mode: "pulse" | "between",
): Array<[number, number]> {
  const nearest = (t: number) => {
    let best = 0;
    time.forEach((x, i) => {
      if (Math.abs(x - t) < Math.abs(time[best] - t)) best = i;
    });
    return best;
  };
  const spans: Array<[number, number]> = [];
  let t = 0;
  protocol.forEach((step) => {
    const end = t + step.duration;
    if (Object.entries(pulse).every(([k, v]) => step.set[k] === v)) {
      spans.push([t, end]);
    }
    t = end;
  });
  if (mode === "pulse") {
    // A sample at a step's start belongs to the previous step.
    return spans.map(([from, to]) => {
      const lo = time.findIndex((x) => x > from);
      let hi = time.length;
      while (hi > 0 && time[hi - 1] > to) hi--;
      return [lo, hi];
    });
  }
  // Half-way to the neighbouring pulses, indexed by each pulse's end time.
  const centres = spans.map(([, to]) => nearest(to));
  return centres.map((c, i) => [
    i === 0 ? 0 : c - Math.floor((c - centres[i - 1]) / 2),
    i === centres.length - 1
      ? time.length - 1
      : c + Math.floor((centres[i + 1] - c) / 2),
  ]);
}

export const OPS: Record<string, OpDef> = {
  /** Fm per saturating pulse, NPQ = (Fm0 - Fm) / Fm, Fo, and ΦPSII. */
  pamNpq: {
    run(args, ctx) {
      if (!ctx.protocol) throw new Error("pamNpq needs a protocol simulation");
      const fluo = ctx.column(args.fluo as string);
      const time = ctx.column("time");
      const windows = pulseWindows(
        time,
        ctx.protocol,
        args.pulse as Record<string, number>,
        (args.window as "pulse" | "between" | undefined) ?? "pulse",
      );
      const peaks = windows.map(([from, to]) => {
        let best = from;
        for (let i = from; i < to; i++) if (fluo[i] > fluo[best]) best = i;
        return best;
      });
      const fm = peaks.map((i) => fluo[i]);
      const fo = leftBases(fluo, peaks).map((i) => fluo[i]);
      return {
        time: peaks.map((i) => time[i]),
        Fm: fm,
        Fo: fo,
        value: fm.map((f) => (fm[0] - f) / f),
        phiPSII: fm.map((f, i) => (f - fo[i]) / f),
      };
    },
    python: {
      name: "pam_npq",
      source: `def pam_npq(frame, protocol, fluo, pulse, window="pulse"):
    fluo = frame[fluo].to_numpy()
    time = frame["time"].to_numpy()
    ends = np.cumsum([d for d, _ in protocol])
    starts = ends - np.array([d for d, _ in protocol])
    spans = [
        (s, e)
        for s, e, (_, step) in zip(starts, ends, protocol)
        if all(step.get(k) == v for k, v in pulse.items())
    ]
    if window == "pulse":
        windows = [
            (int(np.argmax(time > s)), int(np.searchsorted(time, e, side="right")))
            for s, e in spans
        ]
    else:
        c = [int(np.argmin(np.abs(time - e))) for _, e in spans]
        windows = [
            (
                0 if i == 0 else c[i] - (c[i] - c[i - 1]) // 2,
                len(time) - 1 if i == len(c) - 1 else c[i] + (c[i + 1] - c[i]) // 2,
            )
            for i in range(len(c))
        ]
    peaks = [lo + int(np.argmax(fluo[lo:hi])) for lo, hi in windows]
    fm = fluo[peaks]
    _, bases, _ = peak_prominences(fluo, peaks)
    fo = fluo[bases]
    return pd.DataFrame(
        {
            "time": time[peaks],
            "Fm": fm,
            "Fo": fo,
            "value": (fm[0] - fm) / fm,
            "phiPSII": (fm - fo) / fm,
        }
    )
`,
    },
  },

  /** Indices and values of the local maxima of `of`. */
  peaks: {
    run(args, ctx) {
      const x = ctx.column(args.of as string);
      const time = ctx.column("time");
      const idx = localMaxima(x);
      return { time: idx.map((i) => time[i]), value: idx.map((i) => x[i]) };
    },
    python: {
      name: "peaks",
      source: `def peaks(frame, protocol, of):
    x = frame[of].to_numpy()
    idx, _ = find_peaks(x)
    return pd.DataFrame({"time": frame["time"].to_numpy()[idx], "value": x[idx]})
`,
    },
  },

  /** Indices and values of the local minima of `of`. */
  valleys: {
    run(args, ctx) {
      const x = ctx.column(args.of as string);
      const time = ctx.column("time");
      const idx = localMaxima(x.map((v) => -v));
      return { time: idx.map((i) => time[i]), value: idx.map((i) => x[i]) };
    },
    python: {
      name: "valleys",
      source: `def valleys(frame, protocol, of):
    x = frame[of].to_numpy()
    idx, _ = find_peaks(-x)
    return pd.DataFrame({"time": frame["time"].to_numpy()[idx], "value": x[idx]})
`,
    },
  },

  gaussianSmooth: {
    run(args, ctx) {
      return {
        value: gaussianFilter(
          ctx.column(args.of as string),
          args.sigma as number,
        ),
      };
    },
    python: {
      name: "gaussian_smooth",
      source: `def gaussian_smooth(frame, protocol, of, sigma):
    return pd.DataFrame({"value": gaussian_filter1d(frame[of].to_numpy(), sigma)})
`,
    },
  },

  /** d(of)/d(x); `x` defaults to time. */
  gradient: {
    run(args, ctx) {
      return {
        value: gradient(
          ctx.column(args.of as string),
          ctx.column((args.x as string | undefined) ?? "time"),
        ),
      };
    },
    python: {
      name: "gradient",
      source: `def gradient(frame, protocol, of, x="time"):
    return pd.DataFrame(
        {"value": np.gradient(frame[of].to_numpy(), frame[x].to_numpy(), edge_order=1)}
    )
`,
    },
  },

  /** First differences divided by the time step, starting at 0. */
  diff: {
    run(args, ctx) {
      const y = ctx.column(args.of as string);
      const t = ctx.column("time");
      return {
        value: y.map((v, i) =>
          i === 0 ? 0 : (v - y[i - 1]) / (t[i] - t[i - 1]),
        ),
      };
    },
    python: {
      name: "diff",
      source: `def diff(frame, protocol, of):
    rate = np.diff(frame[of].to_numpy()) / np.diff(frame["time"].to_numpy())
    return pd.DataFrame({"value": np.concatenate([[0.0], rate])})
`,
    },
  },

  /** Cumulative trapezoid over time, starting at 0. */
  cumTrapz: {
    run(args, ctx) {
      const y = ctx.column(args.of as string);
      const t = ctx.column("time");
      let total = 0;
      return {
        value: y.map((v, i) => {
          if (i > 0) total += ((v + y[i - 1]) / 2) * (t[i] - t[i - 1]);
          return total;
        }),
      };
    },
    python: {
      name: "cum_trapz",
      source: `def cum_trapz(frame, protocol, of):
    return pd.DataFrame(
        {"value": cumulative_trapezoid(frame[of].to_numpy(), frame["time"].to_numpy(), initial=0)}
    )
`,
    },
  },

  /**
   * Times and values of the O, J, I and P steps of a fluorescence induction:
   * global min, global max, and the first two local minima of the smoothed
   * derivative over log time between them.
   */
  ojip: {
    run(args, ctx) {
      const f = ctx.column(args.of as string);
      const time = ctx.column("time");
      const iO = f.indexOf(Math.min(...minMaxSafe(f)));
      const iP = f.indexOf(Math.max(...minMaxSafe(f)));
      const slope = gradient(
        gaussianFilter(f, args.sigma as number),
        time.map(Math.log10),
      );
      const between = localMaxima(slope.map((v) => -v)).filter(
        (v) => iO < v && v < iP,
      );
      const idx = [iO, between[0], between[1], iP];
      return { time: idx.map((i) => time[i]), value: idx.map((i) => f[i]) };
    },
    python: {
      name: "ojip",
      source: `def ojip(frame, protocol, of, sigma):
    f = frame[of].to_numpy()
    time = frame["time"].to_numpy()
    i_o, i_p = int(np.argmin(f)), int(np.argmax(f))
    slope = np.gradient(gaussian_filter1d(f, sigma), np.log10(time))
    found, _ = find_peaks(-slope)
    between = [v for v in found if i_o < v < i_p]
    idx = [i_o, between[0], between[1], i_p]
    return pd.DataFrame({"time": time[idx], "value": f[idx]})
`,
    },
  },

  /** max - min of `of` over `from <= time <= to`. */
  range: {
    run(args, ctx) {
      const y = ctx.column(args.of as string);
      const t = ctx.column("time");
      const from = (args.from as number | undefined) ?? -Infinity;
      const to = (args.to as number | undefined) ?? Infinity;
      const inWindow = y.filter((_, i) => t[i] >= from && t[i] <= to);
      const [lo, hi] = minMaxSafe(inWindow);
      return { value: [hi - lo] };
    },
    python: {
      name: "value_range",
      source: `def value_range(frame, protocol, of, **window):
    t = frame["time"].to_numpy()
    mask = (t >= window.get("from", -np.inf)) & (t <= window.get("to", np.inf))
    y = frame[of].to_numpy()[mask]
    return pd.DataFrame({"value": [y.max() - y.min()]})
`,
    },
  },
};

export function evalColumn(
  src: string,
  resolve: (path: string[]) => Value,
): number[] {
  const v = evaluate(parse(src), resolve);
  if (typeof v === "number") throw new Error(`"${src}" is not a column`);
  return v;
}
