import { Transcript } from "../lib/types";

export const sampleTranscript: Transcript = {
  plan: "math-major",
  courses: [
    { code: "MATH 135", grade: 87, term: "1A", credits: 0.5 },
    { code: "MATH 137", grade: 82, term: "1A", credits: 0.5 },
    { code: "MATH 136", grade: 90, term: "1B", credits: 0.5 },
    { code: "MATH 138", grade: 85, term: "1B", credits: 0.5 },
    { code: "ENGL 109", grade: 88, term: "1A", credits: 0.5 },
    { code: "MATH 235", grade: null, term: "2A", credits: 0.5 },
  ],
};