import { evaluate } from "./evaluator";
import { Course, Requirement } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function taken(code: string, grade: number | null, term = "1A"): Course {
  return { code, grade, term, credits: 0.5 };
}

// ---------------------------------------------------------------------------
// course
// ---------------------------------------------------------------------------

describe("evaluator: course", () => {
  test("completed — course taken with grade, no minGrade", () => {
    const req: Requirement = { kind: "course", code: "MATH 135" };
    const result = evaluate(req, [taken("MATH 135", 87)]);
    expect(result.status).toBe("completed");
    expect(result.progress).toBe(1);
    expect(result.label).toBe("MATH 135");
  });

  test("completed — grade exactly equal to minGrade (boundary)", () => {
    const req: Requirement = { kind: "course", code: "MATH 135", minGrade: 60 };
    const result = evaluate(req, [taken("MATH 135", 60)]);
    expect(result.status).toBe("completed");
  });

  test("not-met — course not taken at all", () => {
    const req: Requirement = { kind: "course", code: "MATH 135" };
    const result = evaluate(req, []);
    expect(result.status).toBe("not-met");
    expect(result.progress).toBe(0);
  });

  test("not-met — grade below minGrade", () => {
    const req: Requirement = { kind: "course", code: "MATH 135", minGrade: 60 };
    const result = evaluate(req, [taken("MATH 135", 59)]);
    expect(result.status).toBe("not-met");
    expect(result.progress).toBe(0);
  });

  test("in-progress — course taken with null grade, progress is 0", () => {
    const req: Requirement = { kind: "course", code: "CS 246" };
    const result = evaluate(req, [taken("CS 246", null)]);
    expect(result.status).toBe("in-progress");
    expect(result.progress).toBe(0); // policy: in-progress doesn't count toward progress
  });

  test("unrelated courses in transcript do not interfere", () => {
    const req: Requirement = { kind: "course", code: "MATH 135" };
    const result = evaluate(req, [taken("CS 135", 90), taken("STAT 230", 84)]);
    expect(result.status).toBe("not-met");
  });
});

// ---------------------------------------------------------------------------
// and
// ---------------------------------------------------------------------------

describe("evaluator: and", () => {
  const req: Requirement = {
    kind: "and",
    label: "Core courses",
    children: [
      { kind: "course", code: "MATH 135" },
      { kind: "course", code: "MATH 136" },
    ],
  };

  test("completed — all children completed", () => {
    const result = evaluate(req, [taken("MATH 135", 90), taken("MATH 136", 85)]);
    expect(result.status).toBe("completed");
    expect(result.progress).toBe(1);
    expect(result.detail).toBe("2/2 completed");
  });

  test("not-met — one child not-met", () => {
    const result = evaluate(req, [taken("MATH 135", 90)]);
    expect(result.status).toBe("not-met");
  });

  test("not-met — both children not-met", () => {
    const result = evaluate(req, []);
    expect(result.status).toBe("not-met");
    expect(result.progress).toBe(0);
  });

  test("in-progress — one completed, one in-progress", () => {
    const result = evaluate(req, [taken("MATH 135", 90), taken("MATH 136", null)]);
    expect(result.status).toBe("in-progress");
  });

  test("in-progress — one in-progress, one not-met → not-met wins", () => {
    const result = evaluate(req, [taken("MATH 136", null)]);
    expect(result.status).toBe("not-met");
  });

  test("progress is average of children progress (completed + not-met case)", () => {
    // MATH 135 completed (1.0), MATH 136 not-met (0) → avg 0.5
    const result = evaluate(req, [taken("MATH 135", 90)]);
    expect(result.progress).toBeCloseTo(0.5);
  });

  test("progress is average of children progress (completed + in-progress case)", () => {
    // MATH 135 completed (1.0), MATH 136 in-progress (0 under new policy) → avg 0.5
    const result = evaluate(req, [taken("MATH 135", 90), taken("MATH 136", null)]);
    expect(result.progress).toBeCloseTo(0.5);
  });

  test("children array is populated", () => {
    const result = evaluate(req, [taken("MATH 135", 90), taken("MATH 136", 85)]);
    expect(result.children).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// or
// ---------------------------------------------------------------------------

describe("evaluator: or", () => {
  const req: Requirement = {
    kind: "or",
    label: "Elective",
    children: [
      { kind: "course", code: "PMATH 351" },
      { kind: "course", code: "PMATH 365" },
    ],
  };

  test("completed — one child completed", () => {
    const result = evaluate(req, [taken("PMATH 351", 80)]);
    expect(result.status).toBe("completed");
    expect(result.progress).toBe(1);
  });

  test("completed — both children completed", () => {
    const result = evaluate(req, [taken("PMATH 351", 80), taken("PMATH 365", 75)]);
    expect(result.status).toBe("completed");
  });

  test("in-progress — one in-progress, none completed", () => {
    const result = evaluate(req, [taken("PMATH 351", null)]);
    expect(result.status).toBe("in-progress");
  });

  test("not-met — no children taken", () => {
    const result = evaluate(req, []);
    expect(result.status).toBe("not-met");
    expect(result.progress).toBe(0);
  });

  test("progress is max of children progress — in-progress now contributes 0", () => {
    // one in-progress (0), one not-met (0) → max 0
    const result = evaluate(req, [taken("PMATH 351", null)]);
    expect(result.progress).toBe(0);
  });

  test("children array is populated", () => {
    const result = evaluate(req, []);
    expect(result.children).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// count
// ---------------------------------------------------------------------------

describe("evaluator: count", () => {
  const req: Requirement = {
    kind: "count",
    label: "400-level PMATH",
    min: 2,
    from: [
      { kind: "course", code: "PMATH 451" },
      { kind: "course", code: "PMATH 465" },
      { kind: "course", code: "PMATH 440" },
    ],
  };

  test("completed — exactly min completed", () => {
    const result = evaluate(req, [taken("PMATH 451", 80), taken("PMATH 465", 75)]);
    expect(result.status).toBe("completed");
    expect(result.progress).toBe(1);
    expect(result.detail).toBe("2/2 completed");
  });

  test("completed — more than min completed", () => {
    const result = evaluate(req, [
      taken("PMATH 451", 80),
      taken("PMATH 465", 75),
      taken("PMATH 440", 70),
    ]);
    expect(result.status).toBe("completed");
  });

  test("not-met — not enough completed or in-progress", () => {
    const result = evaluate(req, [taken("PMATH 451", 80)]);
    expect(result.status).toBe("not-met");
  });

  test("not-met — none taken", () => {
    const result = evaluate(req, []);
    expect(result.status).toBe("not-met");
    expect(result.progress).toBe(0);
  });

  test("in-progress — completed + in-progress >= min, but completed < min", () => {
    const result = evaluate(req, [taken("PMATH 451", 80), taken("PMATH 465", null)]);
    expect(result.status).toBe("in-progress");
  });

  test("in-progress detail includes in-progress count", () => {
    const result = evaluate(req, [taken("PMATH 451", 80), taken("PMATH 465", null)]);
    expect(result.detail).toContain("+1 in progress");
  });

  test("progress capped at 1", () => {
    const result = evaluate(req, [
      taken("PMATH 451", 80),
      taken("PMATH 465", 75),
      taken("PMATH 440", 70),
    ]);
    expect(result.progress).toBe(1);
  });

  test("in-progress courses do not contribute partial progress", () => {
    // min = 2; 1 completed, 1 in-progress → progress = 1/2 = 0.5 (not 1.0)
    const result = evaluate(req, [taken("PMATH 451", 80), taken("PMATH 465", null)]);
    expect(result.progress).toBeCloseTo(0.5);
  });

  test("only in-progress courses → progress 0", () => {
    // min = 2; 0 completed, 2 in-progress → progress = 0/2 = 0
    const result = evaluate(req, [taken("PMATH 451", null), taken("PMATH 465", null)]);
    expect(result.progress).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// average
// ---------------------------------------------------------------------------

describe("evaluator: average", () => {
  const req: Requirement = {
    kind: "average",
    label: "Major average ≥ 60",
    min: 60,
    over: [
      { kind: "course", code: "MATH 135" },
      { kind: "course", code: "MATH 136" },
      { kind: "course", code: "MATH 148" },
    ],
  };

  test("completed — avg meets min, no courses in-progress", () => {
    const result = evaluate(req, [
      taken("MATH 135", 90),
      taken("MATH 136", 80),
      taken("MATH 148", 70),
    ]);
    expect(result.status).toBe("completed");
    expect(result.detail).toContain("Average: 80.0");
  });

  test("not-met — avg below min, no courses in-progress", () => {
    const result = evaluate(req, [
      taken("MATH 135", 50),
      taken("MATH 136", 55),
    ]);
    expect(result.status).toBe("not-met");
  });

  test("in-progress — avg meets min but some courses in-progress", () => {
    const result = evaluate(req, [
      taken("MATH 135", 90),
      taken("MATH 136", null),
    ]);
    expect(result.status).toBe("in-progress");
  });

  test("not-met — no courses taken at all", () => {
    const result = evaluate(req, []);
    expect(result.status).toBe("not-met");
    expect(result.progress).toBe(0);
    expect(result.detail).toBe("No courses taken yet");
  });

  test("in-progress — all taken courses have null grade, progress is 0", () => {
    const result = evaluate(req, [taken("MATH 135", null), taken("MATH 136", null)]);
    expect(result.status).toBe("in-progress");
    expect(result.progress).toBe(0); // policy: in-progress doesn't count toward progress
    expect(result.detail).toContain("Awaiting grades");
  });

  test("progress is avg / min, capped at 1", () => {
    // avg = (90+90+90)/3 = 90, min = 60 → progress = min(1, 90/60) = 1
    const result = evaluate(req, [
      taken("MATH 135", 90),
      taken("MATH 136", 90),
      taken("MATH 148", 90),
    ]);
    expect(result.progress).toBe(1);
  });

  test("progress below 1 when avg < min", () => {
    // avg = 30, min = 60 → progress = 0.5
    const result = evaluate(req, [taken("MATH 135", 30)]);
    expect(result.progress).toBeCloseTo(0.5);
  });

  test("non-course children in 'over' are ignored", () => {
    const reqWithNested: Requirement = {
      kind: "average",
      label: "Test",
      min: 60,
      over: [
        { kind: "course", code: "MATH 135" },
        { kind: "and", label: "group", children: [] },
      ],
    };
    expect(() => evaluate(reqWithNested, [taken("MATH 135", 80)])).not.toThrow();
  });

  test("average rounds correctly in detail string", () => {
    // (85 + 86) / 2 = 85.5
    const result = evaluate(req, [taken("MATH 135", 85), taken("MATH 136", 86)]);
    expect(result.detail).toContain("Average: 85.5");
  });
});
