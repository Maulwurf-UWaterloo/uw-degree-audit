import { Requirement } from "../types";
import { pmathMajorRequirements } from "./pmath-major";
import { csMajorRequirements } from "./cs-major";
import { statsMajorRequirements } from "./stats-major";

export type PlanKey = "pmath" | "cs" | "stats";

export type Plan = {
  key: PlanKey;
  name: string;          // Display name in the dropdown
  shortName: string;     // For headers / breadcrumbs
  faculty: string;
  requirements: Requirement;
  status: "stable" | "alpha" | "stub"; // for UI badge
};

export const plans: Record<PlanKey, Plan> = {
  pmath: {
    key: "pmath",
    name: "Pure Mathematics (Honours)",
    shortName: "Pure Math",
    faculty: "Mathematics",
    requirements: pmathMajorRequirements,
    status: "alpha",
  },
  cs: {
    key: "cs",
    name: "Computer Science (Honours)",
    shortName: "CS",
    faculty: "Mathematics",
    requirements: csMajorRequirements,
    status: "alpha",
  },
  stats: {
    key: "stats",
    name: "Statistics (Honours)",
    shortName: "Stats",
    faculty: "Mathematics",
    requirements: statsMajorRequirements,
    status: "alpha",
  },
};

export const planList = Object.values(plans);
