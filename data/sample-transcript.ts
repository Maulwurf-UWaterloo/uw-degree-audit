import { Transcript } from "../lib/types";

export const sampleTranscript: Transcript = {
  plan: "pmath-major",
  courses: [
    // 1A/1B
    { code: "MATH 135", grade: 87, term: "1A", credits: 0.5 },
    { code: "MATH 137", grade: 82, term: "1A", credits: 0.5 },
    { code: "MATH 136", grade: 90, term: "1B", credits: 0.5 },
    { code: "MATH 138", grade: 85, term: "1B", credits: 0.5 },
    { code: "ENGL 109", grade: 88, term: "1A", credits: 0.5 },
    // 2A/2B
    { code: "MATH 237", grade: 78, term: "2A", credits: 0.5 },
    { code: "MATH 239", grade: 81, term: "2B", credits: 0.5 },
    { code: "PMATH 347", grade: 84, term: "2B", credits: 0.5 },
    // 3A — in progress
    { code: "PMATH 351", grade: null, term: "3A", credits: 0.5 },
    { code: "PMATH 365", grade: null, term: "3A", credits: 0.5 },
  ],
};