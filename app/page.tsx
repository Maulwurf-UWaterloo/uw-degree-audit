"use client";

import { useMemo, useState } from "react";
import { evaluate } from "@/lib/evaluator";
import { plans, planList, type PlanKey } from "@/lib/plans";
import { sampleTranscripts } from "@/data/sample-transcript";
import { EvalResult, Status, Course, Requirement } from "@/lib/types";

// ---------------------------------------------------------------------------
// Course-state helpers
// ---------------------------------------------------------------------------

type CourseState = "not-taken" | "completed" | "in-progress";

function getCourseState(code: string, courses: Course[]): CourseState {
  const taken = courses.find((c) => c.code === code);
  if (!taken) return "not-taken";
  if (taken.grade === null) return "in-progress";
  return "completed";
}

function nextCourseState(current: CourseState): CourseState {
  switch (current) {
    case "not-taken":
      return "completed";
    case "completed":
      return "in-progress";
    case "in-progress":
      return "not-taken";
  }
}

function tally(req: Requirement, result: EvalResult) {
  let completed = 0;
  let inProgress = 0;
  let notMet = 0;

  function walk(rq: Requirement, rs: EvalResult) {
    if (rs.status === "completed") completed++;
    else if (rs.status === "in-progress") inProgress++;
    else notMet++;

    // Only descend into 'and' blocks — those group independent sub-requirements.
    // 'or' / 'count' / 'average' children are alternates/inputs, not requirements.
    if (rq.kind === "and" && rs.children) {
      rq.children.forEach((childReq, i) => {
        const childRes = rs.children![i];
        if (childRes) walk(childReq, childRes);
      });
    }
  }

  // Skip root — only count first-level children and below.
  if (req.kind === "and" && result.children) {
    req.children.forEach((childReq, i) => {
      const childRes = result.children![i];
      if (childRes) walk(childReq, childRes);
    });
  }

  return { completed, inProgress, notMet };
}

// Filter tree: keep only branches with not-met or in-progress nodes anywhere.
// Completed branches are pruned entirely. Returns null if everything is done.
function filterIncomplete(node: EvalResult): EvalResult | null {
  if (node.status === "completed") return null;

  if (node.children) {
    const filtered = node.children
      .map(filterIncomplete)
      .filter((c): c is EvalResult => c !== null);
    return { ...node, children: filtered };
  }
  return node;
}

// ---------------------------------------------------------------------------
// Presentational components
// ---------------------------------------------------------------------------

function StatusPill({ status }: { status: Status }) {
  const config = {
    completed: {
      classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      label: "Done",
    },
    "in-progress": {
      classes: "bg-amber-50 text-amber-700 ring-amber-200",
      label: "In progress",
    },
    "not-met": {
      classes: "bg-gray-50 text-gray-500 ring-gray-200",
      label: "Not met",
    },
  } as const;

  const { classes, label } = config[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset ${classes}`}
    >
      {label}
    </span>
  );
}

function ProgressBar({
  value,
  size = "md",
}: {
  value: number;
  size?: "md" | "sm";
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const h = size === "sm" ? "h-1" : "h-2";
  return (
    <div className={`${h} w-full overflow-hidden rounded-full bg-gray-100`}>
      <div
        className={`${h} rounded-full bg-emerald-500 transition-all duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PlanStatusBadge({
  status,
}: {
  status: "stable" | "alpha" | "stub";
}) {
  if (status === "stable") return null;
  const text = status === "alpha" ? "Alpha" : "Stub — placeholder data";
  const classes =
    status === "alpha"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-rose-50 text-rose-700 ring-rose-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ring-1 ring-inset ${classes}`}
    >
      {text}
    </span>
  );
}

// Hover affordance: cycle icon that appears on hover for course rows
function CycleIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

type ReqNodeProps = {
  result: EvalResult;
  depth?: number;
  onToggleCourse: (code: string) => void;
};

function ReqNode({ result, depth = 0, onToggleCourse }: ReqNodeProps) {
  const isCourse = /^[A-Z]+ \d+/.test(result.label);
  const isRoot = depth === 0;
  const hasChildren = !!result.children && result.children.length > 0;

  // Pills only on leaf-like nodes (no children). Group nodes get progress bars instead.
  const showPill = !isRoot && !hasChildren;
  // Progress bars for group nodes (have children) but not the root (root has overall card).
  const showProgressBar = !isRoot && hasChildren;

  return (
    <div className={depth > 0 ? "ml-2 border-l border-gray-100 pl-4" : ""}>
      <div
        role={isCourse ? "button" : undefined}
        tabIndex={isCourse ? 0 : undefined}
        onClick={isCourse ? () => onToggleCourse(result.label) : undefined}
        onKeyDown={
          isCourse
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleCourse(result.label);
                }
              }
            : undefined
        }
        className={`group flex items-start gap-3 py-2 ${
          isCourse
            ? "-mx-2 cursor-pointer rounded-md px-2 transition-colors hover:bg-gray-50"
            : ""
        }`}
      >
        {showPill && (
          <div className="pt-0.5">
            <StatusPill status={result.status} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`truncate ${
                isRoot
                  ? "text-base font-semibold text-gray-900"
                  : isCourse
                  ? "font-mono text-sm font-medium text-gray-900"
                  : "text-sm font-medium text-gray-900"
              }`}
            >
              {result.label}
            </div>
            {isCourse && <CycleIcon />}
          </div>
          {result.detail && (
            <div className="mt-0.5 text-xs text-gray-500">{result.detail}</div>
          )}
          {showProgressBar && (
            <div className="mt-2 max-w-[280px]">
              <ProgressBar value={result.progress} size="sm" />
            </div>
          )}
        </div>
      </div>
      {hasChildren && (
        <div>
          {result.children!.map((c, i) => (
            <ReqNode
              key={i}
              result={c}
              depth={depth + 1}
              onToggleCourse={onToggleCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Home() {
  // Default to CS — best matches the loaded transcript (more done/in-progress visible)
  const [planKey, setPlanKey] = useState<PlanKey>("stats");
  const [courses, setCourses] = useState<Course[]>(sampleTranscripts[planKey]);
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

  const plan = plans[planKey];
  const fullResult = useMemo(
    () => evaluate(plan.requirements, courses),
    [plan, courses]
  );
  const stats = useMemo(
    () => tally(plan.requirements, fullResult),
    [plan, fullResult]
  );

  // Apply filter for display only; stats still reflect the full tree.
  const displayResult = useMemo(() => {
    if (!showOnlyIncomplete) return fullResult;
    return filterIncomplete(fullResult);
  }, [fullResult, showOnlyIncomplete]);

  const handlePlanChange = (key: PlanKey) => {
    setPlanKey(key);
    setCourses(sampleTranscripts[key]);
  };

  const toggleCourse = (code: string) => {
    const current = getCourseState(code, courses);
    const next = nextCourseState(current);
    const without = courses.filter((c) => c.code !== code);

    if (next === "not-taken") setCourses(without);
    else if (next === "completed")
      setCourses([...without, { code, grade: 80, term: "?", credits: 0.5 }]);
    else setCourses([...without, { code, grade: null, term: "?", credits: 0.5 }]);
  };

  const reset = () => setCourses(sampleTranscripts[planKey]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              UW Degree Audit
            </h1>
            <a
              href="https://github.com/Maulwurf-UWaterloo/uw-degree-audit"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-500 underline decoration-gray-300 underline-offset-4 hover:text-gray-700"
            >
              View source on GitHub
            </a>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            My personal degree audit — built to fill the gaps in UWaterloo's
            Quest (no progress tracking, no what-if scenarios). Currently loaded
            with my own transcript as a 2A UW Math Co-op student. Click any
            course to toggle:{" "}
            <span className="font-medium text-gray-900">
              Not taken → Completed → In progress
            </span>
            .
          </p>
        </header>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label
            htmlFor="plan-select"
            className="text-sm font-medium text-gray-700"
          >
            Plan
          </label>
          <select
            id="plan-select"
            value={planKey}
            onChange={(e) => handlePlanChange(e.target.value as PlanKey)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {planList.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
          <PlanStatusBadge status={plan.status} />

          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showOnlyIncomplete}
              onChange={(e) => setShowOnlyIncomplete(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            Show only incomplete
          </label>
          <button
            onClick={reset}
            className="text-sm text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-gray-900 hover:decoration-gray-700"
          >
            Reset
          </button>
        </div>

        {/* Summary card */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Overall Progress
            </h2>
            <div className="text-3xl font-bold tabular-nums text-gray-900">
              {Math.round(fullResult.progress * 100)}
              <span className="ml-0.5 text-lg font-medium text-gray-400">%</span>
            </div>
          </div>
          <ProgressBar value={fullResult.progress} />
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold tabular-nums text-gray-900">
                {stats.completed}
              </span>
              <span className="text-gray-500">completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              <span className="font-semibold tabular-nums text-gray-900">
                {stats.inProgress}
              </span>
              <span className="text-gray-500">in progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
              <span className="font-semibold tabular-nums text-gray-900">
                {stats.notMet}
              </span>
              <span className="text-gray-500">not met</span>
            </div>
          </div>
        </section>

        {/* Requirements tree */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {displayResult ? (
            <ReqNode result={displayResult} onToggleCourse={toggleCourse} />
          ) : (
            <div className="py-12 text-center">
              <p className="text-base font-semibold text-emerald-700">
                All requirements complete 🎉
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Toggle off the filter to see the full plan.
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-500">
          <p>
            Built by{" "}
            <a
              href="https://github.com/Maulwurf-UWaterloo"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-gray-300 underline-offset-4 hover:text-gray-700"
            >
              @Maulwurf-UWaterloo
            </a>
          </p>
          <p className="mt-1">
            Not affiliated with the University of Waterloo. Plan data is
            best-effort — always verify against Quest before making decisions.
          </p>
        </footer>
      </div>
    </main>
  );
}
