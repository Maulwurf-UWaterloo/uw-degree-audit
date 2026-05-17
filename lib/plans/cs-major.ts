import { Requirement } from "../types";
import { bmathFoundation } from "./bmath-foundation";

// Computer Science (Bachelor of Mathematics — Honours) Plan Requirements
// Source: UW Academic Calendar — BMath CS Major, 2026 catalog.
//
// NOTE: This is the BMath CS Major (degree = BMath). The plan assumes the
// student has completed the BMath core 1A/1B math sequence elsewhere
// (MATH 135/136/137/138, etc.) — those are degree-level requirements, not
// plan requirements, so they are not in this tree.
//
// LIMITATIONS — current Requirement type system cannot express:
//   1. Wildcard / range matching ("CS 340–CS 398", "CS 440–CS 489",
//      "any ACTSC/AMATH/CO/PMATH/STAT course")
//      → approximated with hand-maintained course lists.
//   2. Unit-based counting (13.75 units math, 5.0 units non-math, etc.)
//      → not modeled.
//   3. Subject-code / faculty filters for the Elective Requirement
//      (Arts / Env / Health / Sci, BET / BUS / COMM / STV)
//      → not modeled.
//   4. Declaration-time prerequisites (CS 136/146 + CS 136L credit,
//      65% math + 70% CS major average)
//      → not modeled (these are admission rules, not graduation rules).
//   5. Negative constraints / exclusion lists ("cannot count this course",
//      "courses cross-listed with CS excluded", readings/topics courses excluded)
//      → partially approximated by excluding from the option lists.
//
// All such cases are flagged with TODO markers.

// ---------------------------------------------------------------------------
// Hand-maintained range expansions (TODO: keep in sync with catalog)
// ---------------------------------------------------------------------------

// CS 340–CS 398 (partial list of common offerings).
// TODO: full enumeration from course catalog.
const CS_340_398_OPTIONS: Requirement[] = [
  { kind: "course", code: "CS 343" },
  { kind: "course", code: "CS 348" },
  { kind: "course", code: "CS 349" },
  { kind: "course", code: "CS 360" },
  { kind: "course", code: "CS 365" },
  { kind: "course", code: "CS 370" },
  { kind: "course", code: "CS 371" },
  { kind: "course", code: "CS 380" },
  { kind: "course", code: "CS 383" },
  { kind: "course", code: "CS 398" },
];

// CS 440–CS 489 (partial list).
// TODO: full enumeration from course catalog.
const CS_440_489_OPTIONS: Requirement[] = [
  { kind: "course", code: "CS 442" },
  { kind: "course", code: "CS 444" },
  { kind: "course", code: "CS 445" },
  { kind: "course", code: "CS 446" },
  { kind: "course", code: "CS 447" },
  { kind: "course", code: "CS 448" },
  { kind: "course", code: "CS 449" },
  { kind: "course", code: "CS 450" },
  { kind: "course", code: "CS 451" },
  { kind: "course", code: "CS 452" },
  { kind: "course", code: "CS 454" },
  { kind: "course", code: "CS 456" },
  { kind: "course", code: "CS 458" },
  { kind: "course", code: "CS 462" },
  { kind: "course", code: "CS 466" },
  { kind: "course", code: "CS 467" },
  { kind: "course", code: "CS 475" },
  { kind: "course", code: "CS 476" },
  { kind: "course", code: "CS 479" },
  { kind: "course", code: "CS 480" },
  { kind: "course", code: "CS 482" },
  { kind: "course", code: "CS 484" },
  { kind: "course", code: "CS 485" },
  { kind: "course", code: "CS 486" },
  { kind: "course", code: "CS 488" },
];

// Combined pool for "1 additional CS from CS 340-398 or CS 440-489".
const CS_DEPTH_POOL: Requirement[] = [...CS_340_398_OPTIONS, ...CS_440_489_OPTIONS];

// 3 additional courses from ACTSC, AMATH, CO, PMATH, STAT.
// Per catalog, the following are EXCLUDED: ACTSC 221, CO 353, CO 380, CO 480.
// Also excluded (per additional constraints):
//   - Courses with requisites excluding CS Honours students
//   - Courses cross-listed with a CS course
//   - Courses explicitly listed as alternatives to CS courses
//   - Readings and topics courses
// TODO: full enumeration; below is a representative subset known to be eligible.
const MATH_SUBJECT_OPTIONS: Requirement[] = [
  // ACTSC
  { kind: "course", code: "ACTSC 231" },
  { kind: "course", code: "ACTSC 232" },
  { kind: "course", code: "ACTSC 331" },
  { kind: "course", code: "ACTSC 371" },
  // AMATH (242 excluded — counts as alternative to CS 370/371)
  { kind: "course", code: "AMATH 250" },
  { kind: "course", code: "AMATH 251" },
  { kind: "course", code: "AMATH 331" },
  { kind: "course", code: "AMATH 341" },
  { kind: "course", code: "AMATH 351" },
  // CO (353, 380, 480 explicitly excluded by plan)
  { kind: "course", code: "CO 250" },
  { kind: "course", code: "CO 327" },
  { kind: "course", code: "CO 331" },
  { kind: "course", code: "CO 342" },
  { kind: "course", code: "CO 351" },
  { kind: "course", code: "CO 370" },
  { kind: "course", code: "CO 372" },
  { kind: "course", code: "CO 430" },
  { kind: "course", code: "CO 450" },
  // PMATH
  { kind: "course", code: "PMATH 347" },
  { kind: "course", code: "PMATH 348" },
  { kind: "course", code: "PMATH 351" },
  { kind: "course", code: "PMATH 352" },
  { kind: "course", code: "PMATH 365" },
  { kind: "course", code: "PMATH 367" },
  { kind: "course", code: "PMATH 432" },
  { kind: "course", code: "PMATH 440" },
  // STAT
  { kind: "course", code: "STAT 330" },
  { kind: "course", code: "STAT 331" },
  { kind: "course", code: "STAT 333" },
  { kind: "course", code: "STAT 340" },
  { kind: "course", code: "STAT 430" },
  { kind: "course", code: "STAT 441" },
];

// CS courses counted in the major average per catalog.
// "CS136, CS138, CS146; CS240-299, CS340-399, CS440-499; CS600-699, CS700-799;
//  AMATH242; CO481, CO487; ECE222, ECE451, ECE452, ECE453; FINE383; PHYS467;
//  SE212, SE350, SE463, SE464, SE465; STAT440."
// TODO: enumerate fully; below is a representative subset.
const PLAN_CS_MAJOR_AVG_COURSES: Requirement[] = [
  { kind: "course", code: "CS 136" },
  { kind: "course", code: "CS 146" },
  { kind: "course", code: "CS 240" },
  { kind: "course", code: "CS 241" },
  { kind: "course", code: "CS 245" },
  { kind: "course", code: "CS 246" },
  { kind: "course", code: "CS 251" },
  { kind: "course", code: "CS 341" },
  { kind: "course", code: "CS 350" },
  { kind: "course", code: "AMATH 242" },
  { kind: "course", code: "CO 487" },
  { kind: "course", code: "STAT 440" },
  ...CS_340_398_OPTIONS,
  ...CS_440_489_OPTIONS,
];

// ---------------------------------------------------------------------------
// Plan tree
// ---------------------------------------------------------------------------

export const csMajorRequirements: Requirement = {
  kind: "and",
  label: "Computer Science (BMath Honours) — Plan Requirements",
  children: [
    bmathFoundation, 
    // -----------------------------------------------------------------------
    // Required CS courses (with regular vs. enriched / advanced options)
    // -----------------------------------------------------------------------
    {
      kind: "and",
      label: "Required CS courses",
      children: [
        // CS 136L is a 0.25-credit lab. Modeled as a regular course.
        { kind: "course", code: "CS 136L" },
        { kind: "course", code: "CS 341" },
        { kind: "course", code: "CS 350" },
        {
          kind: "or",
          label: "Numerical Computation (1 of AMATH 242 / CS 370 / CS 371)",
          children: [
            { kind: "course", code: "AMATH 242" },
            { kind: "course", code: "CS 370" },
            { kind: "course", code: "CS 371" },
          ],
        },
        {
          kind: "or",
          label: "Data Structures (1 of CS 240 / 240E)",
          children: [
            { kind: "course", code: "CS 240" },
            { kind: "course", code: "CS 240E" },
          ],
        },
        {
          kind: "or",
          label: "Foundations of Sequential Programs (1 of CS 241 / 241E)",
          children: [
            { kind: "course", code: "CS 241" },
            { kind: "course", code: "CS 241E" },
          ],
        },
        {
          kind: "or",
          label: "Logic and Computation (1 of CS 245 / 245E)",
          children: [
            { kind: "course", code: "CS 245" },
            { kind: "course", code: "CS 245E" },
          ],
        },
        {
          kind: "or",
          label: "OO Software Development (1 of CS 246 / 246E)",
          children: [
            { kind: "course", code: "CS 246" },
            { kind: "course", code: "CS 246E" },
          ],
        },
        {
          kind: "or",
          label: "Computer Organization (1 of CS 251 / 251E)",
          children: [
            { kind: "course", code: "CS 251" },
            { kind: "course", code: "CS 251E" },
          ],
        },
        {
          kind: "or",
          label: "Theory of Computing (1 of CS 360 / CS 365)",
          children: [
            { kind: "course", code: "CS 360" },
            { kind: "course", code: "CS 365" },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Math courses required by the plan
    // (other math requirements like MATH 135/136/137/138 are BMath degree-level,
    // not plan-level, so they are not modeled here.)
    // -----------------------------------------------------------------------
    {
      kind: "and",
      label: "Math required by plan",
      children: [
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
      ],
    },

    // -----------------------------------------------------------------------
    // CS depth electives
    // -----------------------------------------------------------------------
    {
      kind: "count",
      label: "1 additional CS course (CS 340–398 or CS 440–489)",
      min: 1,
      from: CS_DEPTH_POOL,
    },
    {
      kind: "count",
      label: "2 additional CS courses (CS 440–489)",
      min: 2,
      from: CS_440_489_OPTIONS,
    },

    // -----------------------------------------------------------------------
    // 3 additional from ACTSC / AMATH / CO / PMATH / STAT
    // (with exclusions for ACTSC 221, CO 353, CO 380, CO 480, and constraints)
    // -----------------------------------------------------------------------
    {
      kind: "count",
      label: "3 additional from ACTSC / AMATH / CO / PMATH / STAT",
      min: 3,
      from: MATH_SUBJECT_OPTIONS,
    },

    // -----------------------------------------------------------------------
    // List 1 — capstone / senior CS / advanced
    // TODO: real rule includes any CS 440-498 + any CS 600/700-level.
    // -----------------------------------------------------------------------
    {
      kind: "or",
      label: "List 1 (1 of CO 487 / CS 499T / STAT 440 / any CS 440–498 or 600–700)",
      children: [
        { kind: "course", code: "CO 487" },
        { kind: "course", code: "CS 499T" },
        { kind: "course", code: "STAT 440" },
        ...CS_440_489_OPTIONS, // TODO: extend with CS 490-498 + 600/700-level
      ],
    },

    // -----------------------------------------------------------------------
    // Averages (per "Minimum Average(s) Required")
    // -----------------------------------------------------------------------
    // TODO: cumulative overall avg should be over ALL courses, not plan courses.
    {
      kind: "average",
      label: "Cumulative Overall Average (≥60%)",
      min: 60,
      over: PLAN_CS_MAJOR_AVG_COURSES,
    },
    {
      kind: "average",
      label: "Cumulative CS Major Average (≥60%)",
      min: 60,
      over: PLAN_CS_MAJOR_AVG_COURSES,
    },

    // NOT MODELED:
    // - 13.75 units of math courses (unit-based)
    // - 5.0 units of non-math courses (unit-based)
    // - Elective Requirement: 1.0 Arts/BET/BUS/COMM/STV + 1.0 Env/Health/Sci + 2.0 mixed
    // - BMath degree-level requirements (Communication, breadth, math foundations)
    // - Declaration-time gates (65% math + 70% CS major avg to declare)
    // - Specializations (AI, Bioinformatics, SE, etc. — 8 options)
  ],
};
