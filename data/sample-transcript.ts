import { Transcript, Course } from "../lib/types";
import { PlanKey } from "../lib/plans";

// My transcript — Tung-li Wu (Maulwurf-UWaterloo)
// UW Math, Honours Co-op
// Last updated: end of Winter 2026 (Spring 2026 in progress)
//
// NOTE on CR (Credit / No-Grade) courses:
//   CS 136L is a 0.25-credit lab graded CR. The Course type can't currently
//   distinguish "completed but no numeric grade" from "in-progress" — both
//   would use grade: null. As a workaround, CR-completed courses are stored
//   with grade: 100 (sentinel). This is safe because CS 136L is not part of
//   any major-average pool. TODO: extend Course type with a Status field.
//
//   MTHEL 99 (first-year readiness, CR) and PD 1 (career fundamentals) are
//   excluded entirely — they don't map to any plan requirement.

const myCourses: Course[] = [
  // ===== Fall 2025 — 1A =====
  { code: "AFM 101",   grade: 85, term: "1A F25", credits: 0.5 },
  { code: "CS 135",    grade: 90, term: "1A F25", credits: 0.5 },
  { code: "EMLS 129R", grade: 93, term: "1A F25", credits: 0.5 },
  { code: "MATH 135",  grade: 94, term: "1A F25", credits: 0.5 },
  { code: "MATH 137",  grade: 93, term: "1A F25", credits: 0.5 },

  // ===== Winter 2026 — 1B =====
  { code: "CS 136",    grade: 81,  term: "1B W26", credits: 0.5  },
  { code: "CS 136L",   grade: 100, term: "1B W26", credits: 0.25 }, // CR — sentinel grade
  { code: "ECON 101",  grade: 82,  term: "1B W26", credits: 0.5  },
  { code: "MATH 136",  grade: 89,  term: "1B W26", credits: 0.5  },
  { code: "MATH 148",  grade: 94,  term: "1B W26", credits: 0.5  },
  { code: "STAT 230",  grade: 84,  term: "1B W26", credits: 0.5  },

  // ===== Spring 2026 — 2A (in progress) =====
  { code: "ACTSC 231", grade: null, term: "2A S26", credits: 0.5 },
  { code: "AFM 102",   grade: null, term: "2A S26", credits: 0.5 },
  { code: "CS 246",    grade: null, term: "2A S26", credits: 0.5 },
  { code: "MATH 235",  grade: null, term: "2A S26", credits: 0.5 },
  { code: "MATH 237",  grade: null, term: "2A S26", credits: 0.5 },
  { code: "STAT 231",  grade: null, term: "2A S26", credits: 0.5 },
];

// All plans share the same transcript — this is a personal audit tool.
// The plan switcher answers "what if I were in this plan?" against my courses.
export const sampleTranscripts: Record<PlanKey, Course[]> = {
  pmath: myCourses,
  cs:    myCourses,
  stats: myCourses,
};

// Legacy export — kept for backward compatibility with any imports.
export const sampleTranscript: Transcript = {
  plan: "pmath",
  courses: myCourses,
};
