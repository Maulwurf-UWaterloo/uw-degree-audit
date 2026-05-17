import { Requirement } from "../types";
import { bmathFoundation } from "./bmath-foundation";

// Pure Mathematics (Bachelor of Mathematics — Honours) Plan Requirements
// Source: UW Academic Calendar, Pure Mathematics page (2026 catalog)
//
// LIMITATIONS — current Requirement type cannot fully express:
//   1. Wildcard course matching ("any PMATH 400-level course")
//   2. Unit-based counting (13.0 units math, 5.0 units non-math)
//   3. Cross-plan references (BMath degree-level requirements)
// Workarounds below use hand-maintained course lists with TODO markers.

// Hand-maintained partial list of PMATH 400-level courses.
// TODO: full enumeration from course catalog; ideally replaced by wildcard match.
const PMATH_400_LEVEL_OPTIONS: Requirement[] = [
  { kind: "course", code: "PMATH 432" },
  { kind: "course", code: "PMATH 433" },
  { kind: "course", code: "PMATH 440" },
  { kind: "course", code: "PMATH 445" },
  { kind: "course", code: "PMATH 446" },
];

// 400-level math courses from approved subject codes (partial list).
// TODO: full enumeration; original rule = "ACTSC/AMATH/CO/CS/MATBUS/MATH/PMATH/STAT 4xx".
const FOURTH_YEAR_MATH_OPTIONS: Requirement[] = [
  ...PMATH_400_LEVEL_OPTIONS,
  { kind: "course", code: "CO 430" },
  { kind: "course", code: "CS 466" },
  { kind: "course", code: "STAT 440" },
  { kind: "course", code: "AMATH 451" },
];

// All "math courses in the plan" — used for the major average.
// TODO: real major average is over ALL math courses the student has taken
// (including math electives outside the plan). Approximating with plan courses.
const PLAN_MATH_COURSES: Requirement[] = [
  { kind: "course", code: "PMATH 347" },
  { kind: "course", code: "PMATH 348" },
  { kind: "course", code: "PMATH 351" },
  { kind: "course", code: "PMATH 352" },
  { kind: "course", code: "PMATH 450" },
  { kind: "course", code: "MATH 237" },
  { kind: "course", code: "MATH 247" },
  { kind: "course", code: "MATH 239" },
  { kind: "course", code: "MATH 249" },
  { kind: "course", code: "PMATH 365" },
  { kind: "course", code: "PMATH 367" },
  ...PMATH_400_LEVEL_OPTIONS,
];

export const pmathMajorRequirements: Requirement = {
  kind: "and",
  label: "Pure Mathematics (Honours) — Plan Requirements",
  children: [
    bmathFoundation, 
    {
      kind: "and",
      label: "PMATH Core (all 5 required)",
      children: [
        { kind: "course", code: "PMATH 347" },
        { kind: "course", code: "PMATH 348" },
        { kind: "course", code: "PMATH 351" },
        { kind: "course", code: "PMATH 352" },
        { kind: "course", code: "PMATH 450" },
      ],
    },
    {
      kind: "or",
      label: "Calculus 3 (1 of MATH 237 / 247)",
      children: [
        { kind: "course", code: "MATH 237" },
        { kind: "course", code: "MATH 247" },
      ],
    },
    {
      kind: "or",
      label: "Combinatorics (1 of MATH 239 / 249)",
      children: [
        { kind: "course", code: "MATH 239" },
        { kind: "course", code: "MATH 249" },
      ],
    },
    {
      kind: "or",
      label: "Geometry / Topology (1 of PMATH 365 / 367)",
      children: [
        { kind: "course", code: "PMATH 365" },
        { kind: "course", code: "PMATH 367" },
      ],
    },
    // TODO: real rule = any 3 PMATH 400-level courses (wildcard)
    {
      kind: "count",
      label: "3 additional PMATH 400-level courses",
      min: 3,
      from: PMATH_400_LEVEL_OPTIONS,
    },
    // TODO: real rule = any 2 from ACTSC/AMATH/CO/CS/MATBUS/MATH/PMATH/STAT 4xx
    {
      kind: "count",
      label: "2 additional 400-level math courses (approved subjects)",
      min: 2,
      from: FOURTH_YEAR_MATH_OPTIONS,
    },
    // TODO: should be over ALL courses taken, not just math/plan courses
    {
      kind: "average",
      label: "Cumulative Overall Average (≥60%)",
      min: 60,
      over: PLAN_MATH_COURSES,
    },
    {
      kind: "average",
      label: "Cumulative Major Average (≥65%, all math courses)",
      min: 65,
      over: PLAN_MATH_COURSES,
    },
    // NOT MODELED — minimum unit thresholds (13.0 math units / 5.0 non-math units)
    // require unit-based counting; future Day-3 work to extend type system.
  ],
};