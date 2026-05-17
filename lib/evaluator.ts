import { Course, Requirement, EvalResult, Status } from "./types";

export function evaluate(req: Requirement, courses: Course[]): EvalResult {
  switch (req.kind) {
    case "course": {
      const taken = courses.find(c => c.code === req.code);

      let status: Status;
      let detail: string;

      if (!taken) {
        status = "not-met";
        detail = "Not taken";
      } else if (taken.grade === null) {
        status = "in-progress";
        detail = "In progress";
      } else if (req.minGrade != null && taken.grade < req.minGrade) {
        status = "not-met";
        detail = `Taken (${taken.grade}, below ${req.minGrade})`;
      } else {
        status = "completed";
        detail = `Taken (${taken.grade})`;
      }

      // Only completed contributes to progress. In-progress is 0 — no grade yet,
      // could fail or drop, so it cannot be claimed as partial completion.
      return {
        status,
        progress: status === "completed" ? 1 : 0,
        label: req.code,
        detail,
      };
    }

    case "and": {
      const children = req.children.map(c => evaluate(c, courses));

      let status: Status;
      if (children.some(c => c.status === "not-met")) {
        status = "not-met";
      } else if (children.some(c => c.status === "in-progress")) {
        status = "in-progress";
      } else {
        status = "completed";
      }

      const numCompleted = children.filter(c => c.status === "completed").length;
      const progress = children.reduce((s, c) => s + c.progress, 0) / children.length;

      return {
        status,
        progress,
        label: req.label,
        detail: `${numCompleted}/${children.length} completed`,
        children,
      };
    }

    case "or": {
      const children = req.children.map(c => evaluate(c, courses));

      let status: Status;
      if (children.some(c => c.status === "completed")) {
        status = "completed";
      } else if (children.some(c => c.status === "in-progress")) {
        status = "in-progress";
      } else {
        status = "not-met";
      }

      const progress = Math.max(...children.map(c => c.progress));

      return {
        status,
        progress,
        label: req.label,
        detail:
          status === "completed" ? "Satisfied" :
          status === "in-progress" ? "Pending in-progress course" :
          "Choose one",
        children,
      };
    }

    case "count": {
      const children = req.from.map(c => evaluate(c, courses));
      const numCompleted = children.filter(c => c.status === "completed").length;
      const numInProgress = children.filter(c => c.status === "in-progress").length;

      let status: Status;
      if (numCompleted >= req.min) {
        status = "completed";
      } else if (numCompleted + numInProgress >= req.min) {
        status = "in-progress";
      } else {
        status = "not-met";
      }

      // In-progress courses no longer contribute partial progress.
      const progress = Math.min(1, numCompleted / req.min);

      return {
        status,
        progress,
        label: req.label,
        detail: numInProgress > 0
          ? `${numCompleted}/${req.min} completed (+${numInProgress} in progress)`
          : `${numCompleted}/${req.min} completed`,
        children,
      };
    }

    case "average": {
      const grades: number[] = [];
      let inProgressCount = 0;
      let takenAtAll = 0;

      for (const child of req.over) {
        if (child.kind !== "course") continue;
        const taken = courses.find(c => c.code === child.code);
        if (!taken) continue;
        takenAtAll++;
        if (taken.grade === null) {
          inProgressCount++;
        } else {
          grades.push(taken.grade);
        }
      }

      if (takenAtAll === 0) {
        return {
          status: "not-met",
          progress: 0,
          label: req.label,
          detail: "No courses taken yet",
        };
      }

      if (grades.length === 0) {
        // All courses in the pool are in-progress — no grades to average yet.
        // Per "in-progress contributes 0" policy, progress is 0.
        return {
          status: "in-progress",
          progress: 0,
          label: req.label,
          detail: `Awaiting grades (${inProgressCount} in progress)`,
        };
      }

      const avg = grades.reduce((s, g) => s + g, 0) / grades.length;
      const meets = avg >= req.min;

      let status: Status;
      if (meets && inProgressCount === 0) status = "completed";
      else if (!meets && inProgressCount === 0) status = "not-met";
      else status = "in-progress";

      const inProgressNote = inProgressCount > 0 ? ` (+${inProgressCount} in progress)` : "";

      return {
        status,
        progress: Math.min(1, avg / req.min),
        label: req.label,
        detail: `Average: ${avg.toFixed(1)} (need ${req.min}, over ${grades.length} course${grades.length === 1 ? "" : "s"})${inProgressNote}`,
      };
    }
  }
}
