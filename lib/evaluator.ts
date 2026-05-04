import { Course, Requirement, EvalResult } from "./types";

export function evaluate(req: Requirement, courses: Course[]): EvalResult {
  switch (req.kind) {
    case "course": {
      const taken = courses.find(c => c.code === req.code);
      const satisfied = !!taken && (req.minGrade == null || (taken.grade ?? 0) >= req.minGrade);
      return {
        satisfied,
        progress: satisfied ? 1 : 0,
        label: req.code,
        detail: taken ? `Taken (${taken.grade ?? "IP"})` : "Not taken",
      };
    }

    case "and": {
      const children = req.children.map(c => evaluate(c, courses));
      const satisfied = children.every(c => c.satisfied);
      const progress = children.reduce((s, c) => s + c.progress, 0) / children.length;
      return {
        satisfied,
        progress,
        label: req.label,
        detail: `${children.filter(c => c.satisfied).length}/${children.length} satisfied`,
        children,
      };
    }

    case "or": {
      const children = req.children.map(c => evaluate(c, courses));
      const satisfied = children.some(c => c.satisfied);
      const progress = Math.max(...children.map(c => c.progress));
      return {
        satisfied,
        progress,
        label: req.label,
        detail: satisfied ? "Satisfied" : "Choose one",
        children,
      };
    }

    case "count": {
      const children = req.from.map(c => evaluate(c, courses));
      const numSatisfied = children.filter(c => c.satisfied).length;
      const satisfied = numSatisfied >= req.min;
      return {
        satisfied,
        progress: Math.min(1, numSatisfied / req.min),
        label: req.label,
        detail: `${numSatisfied}/${req.min} courses completed`,
        children,
      };
    }

    case "average": {
      return {
        satisfied: false,
        progress: 0,
        label: req.label,
        detail: "Not yet implemented",
      };
    }
  }
}

