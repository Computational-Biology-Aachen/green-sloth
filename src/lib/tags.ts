export const PARTS = [
  "PSII",
  "OEC",
  "ATP Synthase",
  "Cytochrome b6f",
  "PQ Cycle",
  "PC",
  "FNR",
  "PSI",
  "CBB Cycle",
  "Proton motive force (pmf)",
  "NPQ",
  "Photorespiration",
] as const;

export const MODEL_TYPES = ["ODE", "Steady State"] as const;

export const EXPERIMENTAL_DATA = [
  "PAM fluorescence",
  "OJIP transient",
  "Gas exchange",
  "P700 absorbance",
  "Frequency domain",
  "ECS (P515)",
  "Concentration changes",
  "Fluorescence lifetime",
] as const;

export const ORGANISMS = [
  "Arabidopsis thaliana",
  "Chlamydomonas reinhardtii",
  "Chlorella sorokiniana",
  "Epipremnum aureum",
  "Euglena gracilis",
  "Glycine max",
  "Hordeum vulgare",
  "Nicotiana benthamiana",
  "Nicotiana tabacum",
  "Raphanus sativus",
  "Spinacia oleracea",
  "Triticum aestivum",
  "Generic C3 plant",
  "Theoretical",
] as const;

export const PMF_DESCRIPTIONS = [
  "Full; ΔpH + Δψ",
  "Only ΔpH",
] as const;

export type Part = typeof PARTS[number];
export type ModelType = typeof MODEL_TYPES[number];
export type ExperimentalData = typeof EXPERIMENTAL_DATA[number];
export type Organism = typeof ORGANISMS[number];
export type PMFdescription = typeof PMF_DESCRIPTIONS[number];

export const AVAILABLE_TAGS = {
  "Part of Photosynthesis": PARTS,
  "Model type": MODEL_TYPES,
  "Explains data": EXPERIMENTAL_DATA,
  "Organism": ORGANISMS,
  "PMF description": PMF_DESCRIPTIONS,
};

export type TagValues = {
  "Part of Photosynthesis": Array<Part>;
  "Model type": Array<ModelType>;
  "Explains data": Array<ExperimentalData>;
  "Organism": Array<Organism>;
  "PMF description": Array<PMFdescription>;
};

export type Tags = {
  [K in keyof TagValues]: TagValues[K];
};
