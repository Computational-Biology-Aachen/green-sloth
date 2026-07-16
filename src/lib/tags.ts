export type Part =
  | "PSII"
  | "OEC"
  | "ATP Synthase"
  | "Cytochrome b6f"
  | "PQ Cycle"
  | "PC"
  | "FNR"
  | "PSI"
  | "CBB Cycle"
  | "Proton motive force (pmf)"
  | "NPQ"
  | "Photorespiration";

export type ModelType = "ODE" | "Steady State";

/**
 * Kinds of experimental photosynthesis data a model can be used to explain.
 * Each value maps to a section on the `/data` page.
 */
export type ExperimentalData =
  | "PAM fluorescence"
  | "OJIP transient"
  | "Gas exchange"
  | "P700 absorbance"
  | "Frequency domain"
  | "ECS (P515)"
  | "Concentration changes";

/**
 * Organism(s) a model was calibrated or validated against. "Generic C3
 * plant" covers gas-exchange models not pinned to one species; "Theoretical"
 * covers abstract kinetic schemes with no organism-specific grounding.
 */
export type Organism =
  | "Arabidopsis thaliana"
  | "Chlamydomonas reinhardtii"
  | "Chlorella sorokiniana"
  | "Epipremnum aureum"
  | "Euglena gracilis"
  | "Glycine max"
  | "Hordeum vulgare"
  | "Nicotiana benthamiana"
  | "Nicotiana tabacum"
  | "Raphanus sativus"
  | "Spinacia oleracea"
  | "Triticum aestivum"
  | "Generic C3 plant"
  | "Theoretical";

// Maps each tag category to its value union. Add a category here (and its
// value type) to extend the tag system — Tags below follows automatically.
export type TagValues = {
  "Part of Photosynthesis": Array<Part>;
  "Model type": Array<ModelType>;
  "Explains data": Array<ExperimentalData>;
  Organism: Array<Organism>;
};

export type Tags = {
  [K in keyof TagValues]: TagValues[K];
};
