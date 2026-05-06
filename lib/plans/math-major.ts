import { Requirement } from "../types";

export const mathMajorRequirements: Requirement = {
  kind: "and",
  label: "Math Major Requirements",
  children: [
    {
      kind: "and",
      label: "Core 1A/1B Math",
      children: [
        { kind: "course", code: "MATH 135" },
        { kind: "course", code: "MATH 137" },
        { kind: "course", code: "MATH 136" },
        { kind: "course", code: "MATH 138" },
      ],
    },
    {
      kind: "or",
      label: "Communication Skills Part 1",
      children: [
        { kind: "course", code: "ENGL 109" },
        { kind: "course", code: "ENGL 129R" },
        { kind: "course", code: "EMLS 101R" },
      ],
    },
    {
      kind: "count",
      label: "Upper-Year Math (3+ courses)",
      min: 3,
      from: [
        { kind: "course", code: "MATH 235" },
        { kind: "course", code: "MATH 237" },
        { kind: "course", code: "STAT 230" },
        { kind: "course", code: "STAT 231" },
        { kind: "course", code: "CO 250" },
      ],
    },
    {
      kind: "average",
      label: "Major Average (≥60)",
      min: 60,
      over: [
        { kind: "course", code: "MATH 135" },
        { kind: "course", code: "MATH 136" },
        { kind: "course", code: "MATH 137" },
        { kind: "course", code: "MATH 138" },
      ],
    }
  ],
};