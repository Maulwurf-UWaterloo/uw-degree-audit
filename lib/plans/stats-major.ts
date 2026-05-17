import { Requirement } from "../types";
import { bmathFoundation } from "./bmath-foundation";

// Statistics (Bachelor of Mathematics — Honours) Plan Requirements
// Source: UW Academic Calendar — BMath Statistics, 2026 catalog.
//
// LIMITATIONS — current Requirement type system cannot express:
//   1. Wildcard / range matching ("any STAT 400-level course",
//      "any ACTSC/AMATH/CO/CS/MATBUS/MATH/PMATH/STAT 300/400-level course")
//      → approximated with hand-maintained course lists.
//   2. Unit-based counting (13.0 units math, 5.0 units non-math)
//      → not modeled.
//   3. Course consumption / non-double-counting. A course used to satisfy one
//      requirement can simultaneously satisfy another in our evaluator. The
//      catalog implicitly assumes each course counts once.
//   4. Substitution rules (e.g. STAT 371 → STAT 331 for double-degree students,
//      BUS 362W → ENGL 378)
//      → not modeled.
//   5. Negative constraints ("STAT 334 is NOT acceptable for STAT 330/333",
//      "STAT 373 is NOT acceptable for STAT 331")
//      → forbidden courses simply excluded from option lists.
//   6. Major average over "all math courses" — approximated with plan courses.
//
// All such cases are flagged with TODO markers.

// ---------------------------------------------------------------------------
// Hand-maintained range expansions
// ---------------------------------------------------------------------------

// STAT 400-level options.
// TODO: full enumeration; below is a representative subset.
const STAT_400_OPTIONS: Requirement[] = [
  { kind: "course", code: "STAT 430" },
  { kind: "course", code: "STAT 431" },
  { kind: "course", code: "STAT 433" },
  { kind: "course", code: "STAT 440" },
  { kind: "course", code: "STAT 441" },
  { kind: "course", code: "STAT 442" },
  { kind: "course", code: "STAT 443" },
  { kind: "course", code: "STAT 444" },
  { kind: "course", code: "STAT 450" },
  { kind: "course", code: "STAT 454" },
  { kind: "course", code: "STAT 456" },
  { kind: "course", code: "STAT 460" },
];

// STAT 300-level options (excluding STAT 330/331/332/333 — already required,
// and STAT 334, 373 per the "not acceptable substitutes" rule).
// TODO: full enumeration.
const STAT_300_OPTIONS: Requirement[] = [
  { kind: "course", code: "STAT 335" },
  { kind: "course", code: "STAT 337" },
  { kind: "course", code: "STAT 340" },
  { kind: "course", code: "STAT 341" },
  { kind: "course", code: "STAT 371" }, // valid for non-double-degree as elective
  { kind: "course", code: "STAT 372" },
];

// STAT 300- or 400-level (combined pool).
const STAT_300_400_POOL: Requirement[] = [...STAT_300_OPTIONS, ...STAT_400_OPTIONS];

// "ACTSC, AMATH, CO, CS, MATBUS, MATH, PMATH, STAT" at 300/400 level.
// TODO: full enumeration; below is a representative subset.
const MATH_300_400_POOL: Requirement[] = [
  // ACTSC
  { kind: "course", code: "ACTSC 331" },
  { kind: "course", code: "ACTSC 371" },
  { kind: "course", code: "ACTSC 372" },
  { kind: "course", code: "ACTSC 431" },
  { kind: "course", code: "ACTSC 432" },
  { kind: "course", code: "ACTSC 445" },
  // AMATH
  { kind: "course", code: "AMATH 331" },
  { kind: "course", code: "AMATH 341" },
  { kind: "course", code: "AMATH 350" },
  { kind: "course", code: "AMATH 351" },
  { kind: "course", code: "AMATH 353" },
  { kind: "course", code: "AMATH 391" },
  { kind: "course", code: "AMATH 442" },
  // CO
  { kind: "course", code: "CO 327" },
  { kind: "course", code: "CO 331" },
  { kind: "course", code: "CO 342" },
  { kind: "course", code: "CO 351" },
  { kind: "course", code: "CO 370" },
  { kind: "course", code: "CO 430" },
  { kind: "course", code: "CO 450" },
  // CS (3xx + 4xx)
  { kind: "course", code: "CS 341" },
  { kind: "course", code: "CS 348" },
  { kind: "course", code: "CS 350" },
  { kind: "course", code: "CS 360" },
  { kind: "course", code: "CS 370" },
  { kind: "course", code: "CS 442" },
  { kind: "course", code: "CS 446" },
  { kind: "course", code: "CS 451" },
  // MATBUS
  { kind: "course", code: "MATBUS 371" },
  { kind: "course", code: "MATBUS 470" },
  // MATH
  { kind: "course", code: "MATH 335" },
  { kind: "course", code: "MATH 337" },
  // PMATH
  { kind: "course", code: "PMATH 347" },
  { kind: "course", code: "PMATH 348" },
  { kind: "course", code: "PMATH 351" },
  { kind: "course", code: "PMATH 352" },
  { kind: "course", code: "PMATH 365" },
  { kind: "course", code: "PMATH 367" },
  { kind: "course", code: "PMATH 432" },
  { kind: "course", code: "PMATH 440" },
  // STAT (the 300/400 not already required)
  ...STAT_300_400_POOL,
];

// "ACTSC, AMATH, CO, CS, MATBUS, MATH, PMATH, STAT" — any level.
// TODO: full enumeration; below adds lower-level courses to MATH_300_400_POOL.
const MATH_ANY_LEVEL_POOL: Requirement[] = [
  // Lower-level math subject courses
  { kind: "course", code: "ACTSC 231" },
  { kind: "course", code: "ACTSC 232" },
  { kind: "course", code: "AMATH 231" },
  { kind: "course", code: "AMATH 242" },
  { kind: "course", code: "AMATH 250" },
  { kind: "course", code: "AMATH 251" },
  { kind: "course", code: "CO 250" },
  { kind: "course", code: "CS 240" },
  { kind: "course", code: "CS 241" },
  { kind: "course", code: "CS 245" },
  { kind: "course", code: "CS 246" },
  { kind: "course", code: "PMATH 245" },
  ...MATH_300_400_POOL,
];

// "All math courses" for the cumulative major average (≥65%).
// TODO: catalog says ALL math courses the student takes, not just plan courses.
const PLAN_MATH_COURSES: Requirement[] = [
  { kind: "course", code: "STAT 330" },
  { kind: "course", code: "STAT 331" },
  { kind: "course", code: "STAT 332" },
  { kind: "course", code: "STAT 333" },
  ...STAT_400_OPTIONS,
  ...MATH_300_400_POOL,
];

// ---------------------------------------------------------------------------
// Plan tree
// ---------------------------------------------------------------------------

export const statsMajorRequirements: Requirement = {
  kind: "and",
  label: "Statistics (BMath Honours) — Plan Requirements",
  children: [
    bmathFoundation,
    // -----------------------------------------------------------------------
    // Required core
    // -----------------------------------------------------------------------
    {
      kind: "and",
      label: "Required core",
      children: [
        // TODO: allow BUS 362W substitute for Business Admin & Math double-degree
        { kind: "course", code: "ENGL 378" },
        { kind: "course", code: "STAT 330" },
        // TODO: STAT 371 may substitute for STAT 331 in certain double-degree plans
        { kind: "course", code: "STAT 331" },
        // TODO: STAT 372 may substitute for STAT 332 in certain double-degree plans
        { kind: "course", code: "STAT 332" },
        { kind: "course", code: "STAT 333" },
      ],
    },

    // -----------------------------------------------------------------------
    // 1 of computational / analytic math
    // -----------------------------------------------------------------------
    {
      kind: "or",
      label:
        "Computational / Analytic Math (1 of AMATH 231/242/250/251/350, CS 371, MATH 239/249)",
      children: [
        { kind: "course", code: "AMATH 231" },
        { kind: "course", code: "AMATH 242" },
        { kind: "course", code: "AMATH 250" },
        { kind: "course", code: "AMATH 251" },
        { kind: "course", code: "AMATH 350" },
        { kind: "course", code: "CS 371" },
        { kind: "course", code: "MATH 239" },
        { kind: "course", code: "MATH 249" },
      ],
    },

    // -----------------------------------------------------------------------
    // Calculus 3
    // -----------------------------------------------------------------------
    {
      kind: "or",
      label: "Calculus 3 (1 of MATH 237 / 247)",
      children: [
        { kind: "course", code: "MATH 237" },
        { kind: "course", code: "MATH 247" },
      ],
    },

    // -----------------------------------------------------------------------
    // STAT depth: 2 + 1 (+ 1 OR CS) = 4 STAT/CS courses beyond core
    // -----------------------------------------------------------------------
    {
      kind: "count",
      label: "2 STAT courses at the 400-level",
      min: 2,
      from: STAT_400_OPTIONS,
    },
    {
      kind: "count",
      label: "1 additional STAT course at the 300- or 400-level",
      min: 1,
      from: STAT_300_400_POOL,
    },
    // Nested choice: "1 more STAT 400" OR "1 of CS 457/485/486"
    // Note: a count-of-1 inside an or-block has slightly loose semantics in our
    // evaluator — a single completed STAT 400 satisfies the count even if it
    // was already used for the "2 STAT 400" requirement above (no consumption
    // tracking). TODO: add per-course consumption to fully model this.
    {
      kind: "or",
      label: "1 more STAT 400-level course OR 1 of CS 457 / 485 / 486",
      children: [
        {
          kind: "count",
          label: "1 additional STAT 400-level",
          min: 1,
          from: STAT_400_OPTIONS,
        },
        { kind: "course", code: "CS 457" },
        { kind: "course", code: "CS 485" },
        { kind: "course", code: "CS 486" },
      ],
    },

    // -----------------------------------------------------------------------
    // Math-subject depth electives
    // -----------------------------------------------------------------------
    {
      kind: "count",
      label:
        "4 additional courses at 300- or 400-level (ACTSC / AMATH / CO / CS / MATBUS / MATH / PMATH / STAT)",
      min: 4,
      from: MATH_300_400_POOL,
    },
    {
      kind: "count",
      label:
        "3 additional courses (ACTSC / AMATH / CO / CS / MATBUS / MATH / PMATH / STAT)",
      min: 3,
      from: MATH_ANY_LEVEL_POOL,
    },

    // -----------------------------------------------------------------------
    // Averages
    // -----------------------------------------------------------------------
    // TODO: cumulative overall avg should be over ALL courses, not plan courses.
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

    // NOT MODELED:
    // - 13.0 units of math courses (unit-based)
    // - 5.0 units of non-math courses (unit-based)
    // - BMath degree-level requirements (Communication, breadth, math foundations)
    // - Double-degree substitution rules:
    //     * STAT 371 → STAT 331
    //     * STAT 372 → STAT 332
    //     * BUS 362W → ENGL 378
    // - Negative constraints on substitutes (STAT 334, 373, 374, AFM 323)
  ],
};
