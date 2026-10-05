import { describe, expect, it } from "vitest";
import {
  arrayColumn,
  fuzzyMatch,
  partitionByGroups,
  partitionByOrderOfMagnitude,
  toStyleString,
  type LineDataset,
} from "../src/lib/utils";

const ds = (label: string, data: number[]): LineDataset => ({ label, data });
const labels = (groups: LineDataset[][]): string[][] =>
  groups.map((g) => g.map((d) => d.label));

describe("arrayColumn", () => {
  it("extracts the n-th column of a row-major matrix", () => {
    expect(
      arrayColumn(
        [
          [1, 2],
          [3, 4],
          [5, 6],
        ],
        1,
      ),
    ).toEqual([2, 4, 6]);
  });
});

describe("toStyleString", () => {
  it("joins defined custom properties and skips undefined ones", () => {
    expect(
      toStyleString({ "--a": "1px", "--b": undefined, "--c": "red" }),
    ).toBe("--a:1px;--c:red");
  });

  it("returns an empty string when nothing is set", () => {
    expect(toStyleString({})).toBe("");
  });
});

describe("fuzzyMatch", () => {
  it("matches characters in order, case-insensitively", () => {
    expect(fuzzyMatch("Matuszynska 2016", "mtz16")).toBe(true);
    expect(fuzzyMatch("Matuszynska 2016", "MATU")).toBe(true);
  });

  it("rejects out-of-order characters", () => {
    expect(fuzzyMatch("Poolman 2000", "np")).toBe(false);
  });

  it("treats a blank query as matching everything", () => {
    expect(fuzzyMatch("anything", "   ")).toBe(true);
  });
});

describe("partitionByGroups", () => {
  const datasets = [ds("A", [1]), ds("B", [2]), ds("C", [3]), ds("D", [4])];

  it("follows the group order, not the dataset order", () => {
    expect(labels(partitionByGroups(datasets, [["C", "A"], ["B"]]))).toEqual([
      ["A", "C"],
      ["B"],
      ["D"],
    ]);
  });

  it("collects unnamed series into a trailing subplot", () => {
    expect(labels(partitionByGroups(datasets, [["A"]]))).toEqual([
      ["A"],
      ["B", "C", "D"],
    ]);
  });

  it("drops groups that match no series", () => {
    expect(
      labels(partitionByGroups(datasets, [["X"], ["A", "B", "C", "D"]])),
    ).toEqual([["A", "B", "C", "D"]]);
  });

  it("returns the original dataset objects", () => {
    const [[first]] = partitionByGroups(datasets, [["A"]]);
    expect(first).toBe(datasets[0]);
  });
});

describe("partitionByOrderOfMagnitude", () => {
  it("groups by floor(log10(max |value|)) in ascending order", () => {
    const groups = partitionByOrderOfMagnitude([
      ds("big", [0, 250]),
      ds("small", [0.02, 0.05]),
      ds("alsoBig", [-900, 1]),
      ds("unit", [3]),
    ]);
    expect(labels(groups)).toEqual([["small"], ["unit"], ["big", "alsoBig"]]);
  });

  it("puts all-zero and non-finite series first", () => {
    const groups = partitionByOrderOfMagnitude([
      ds("unit", [1]),
      ds("zero", [0, 0]),
      ds("nan", [NaN, Infinity]),
    ]);
    expect(labels(groups)).toEqual([["zero", "nan"], ["unit"]]);
  });

  it("returns no groups for no datasets", () => {
    expect(partitionByOrderOfMagnitude([])).toEqual([]);
  });
});
