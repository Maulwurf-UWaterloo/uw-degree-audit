import { Requirement } from "../types";

// BMath Degree-Level Foundation Requirements
// Shared across Pure Math / CS (BMath) / Statistics / and other BMath plans.
//
// Source: UW Academic Calendar — Bachelor of Mathematics degree-level requirements.
//
// LIMITATIONS:
//   - Only models the foundation math sequence + Communication Requirement Part 1
//     + first-year CS + Probability — the most universal BMath baseline.
//   - Does NOT model: Communication Requirement Part 2 (200+ level), breadth
//     requirements, total unit thresholds, elective distribution rules.
//   - STAT 230 / 240 is technically required across nearly all BMath plans, so
//     it lives here. If a specific plan reintroduces it, the audit will simply
//     mark it complete in both places (harmless overlap).

export const bmathFoundation: Requirement = {
  kind: "and",
  label: "BMath Foundation (degree-level)",
  children: [
    {
      kind: "or",
      label: "Algebra (1 of MATH 135 / 145)",
      children: [
        { kind: "course", code: "MATH 135" },
        { kind: "course", code: "MATH 145" },
      ],
    },
    {
      kind: "or",
      label: "Linear Algebra 1 (1 of MATH 136 / 146)",
      children: [
        { kind: "course", code: "MATH 136" },
        { kind: "course", code: "MATH 146" },
      ],
    },
    {
      kind: "or",
      label: "Calculus 1 (1 of MATH 137 / 147)",
      children: [
        { kind: "course", code: "MATH 137" },
        { kind: "course", code: "MATH 147" },
      ],
    },
    {
      kind: "or",
      label: "Calculus 2 (1 of MATH 138 / 148)",
      children: [
        { kind: "course", code: "MATH 138" },
        { kind: "course", code: "MATH 148" },
      ],
    },
    {
      kind: "or",
      label: "First-year CS (1 of CS 115 / 135 / 145)",
      children: [
        { kind: "course", code: "CS 115" },
        { kind: "course", code: "CS 135" },
        { kind: "course", code: "CS 145" },
      ],
    },
    {
      kind: "or",
      label: "Probability (1 of STAT 230 / 240)",
      children: [
        { kind: "course", code: "STAT 230" },
        { kind: "course", code: "STAT 240" },
      ],
    },
    {
      kind: "or",
      label: "Communication Requirement Part 1",
      children: [
        { kind: "course", code: "ENGL 109" },
        { kind: "course", code: "ENGL 129R" },
        { kind: "course", code: "EMLS 101R" },
        { kind: "course", code: "EMLS 129R" },
      ],
    },
    // NOT MODELED:
    // - Communication Requirement Part 2 (a 200+ level English / Comm course)
    // - Breadth requirements
    // - Total math units (varies by plan: ~13.0-13.75)
    // - Total non-math units (5.0)
  ],
};
