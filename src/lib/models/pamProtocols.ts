import type { PamGroup } from "@computational-biology-aachen/mxlweb-core/pam";

/**
 * Standard PAM protocol: a low-light phase, a high-light phase, and a recovery
 * phase, each interrupted by saturating pulses. Shared across PAM-capable
 * models so the fluorescence traces are comparable.
 */
export const defaultPamProtocol: PamGroup[] = [
  {
    steps: [
      { pfd: 100, duration: 9.2 },
      { pfd: 5000, duration: 0.8 },
    ],
    repetitions: 3,
  },
  {
    steps: [
      { pfd: 500, duration: 9.2 },
      { pfd: 5000, duration: 0.8 },
    ],
    repetitions: 3,
  },
  {
    steps: [
      { pfd: 100, duration: 9.2 },
      { pfd: 5000, duration: 0.8 },
    ],
    repetitions: 3,
  },
];
