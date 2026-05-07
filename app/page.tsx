"use client";
import { useState } from "react";
import { evaluate } from "@/lib/evaluator";
import { pmathMajorRequirements } from "@/lib/plans/pmath-major";
import { sampleTranscript } from "@/data/sample-transcript";
import { EvalResult, Status, Course } from "@/lib/types";

type CourseState = "not-taken" | "completed" | "in-progress";

function getCourseState(code: string, courses: Course[]): CourseState {
  const taken = courses.find(c => c.code === code);
  if (!taken) return "not-taken";
  if (taken.grade === null) return "in-progress";
  return "completed";
}

function nextCourseState(current: CourseState): CourseState {
  switch (current) {
    case "not-taken": return "completed";
    case "completed": return "in-progress";
    case "in-progress": return "not-taken";
  }
}

function statusIcon(status: Status): string {
  switch (status) {
    case "completed": return "✅";
    case "in-progress": return "🟡";
    case "not-met": return "⬜";
  }
}

type ReqNodeProps = {
  result: EvalResult;
  depth?: number;
  courses: Course[];
  onToggleCourse: (code: string) => void;
};

function ReqNode({ result, depth = 0, courses, onToggleCourse }: ReqNodeProps) {
  const isCourse = /^[A-Z]+ \d+/.test(result.label);

  return (
    <div style={{ marginLeft: depth * 20 }} className="my-1">
      <div className="flex items-center gap-2">
        <span>{statusIcon(result.status)}</span>
        <span className="font-medium">{result.label}</span>
        <span className="text-sm text-gray-500">— {result.detail}</span>
        {isCourse && (
          <button
            onClick={() => onToggleCourse(result.label)}
            className="text-xs px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100"
          >
            toggle
          </button>
        )}
      </div>
      {result.children?.map((c, i) => (
        <ReqNode
          key={i}
          result={c}
          depth={depth + 1}
          courses={courses}
          onToggleCourse={onToggleCourse}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>(sampleTranscript.courses);
  const result = evaluate(pmathMajorRequirements, courses);

  const toggleCourse = (code: string) => {
    const current = getCourseState(code, courses);
    const next = nextCourseState(current);

    const without = courses.filter(c => c.code !== code);

    if (next === "not-taken") {
      setCourses(without);
    } else if (next === "completed") {
      setCourses([...without, { code, grade: 80, term: "?", credits: 0.5 }]);
    } else {
      setCourses([...without, { code, grade: null, term: "?", credits: 0.5 }]);
    }
  };

  const reset = () => {
    setCourses(sampleTranscript.courses);
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">UW Degree Audit (alpha)</h1>
        <button
          onClick={reset}
          className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Click <code className="px-1 bg-gray-100 rounded">toggle</code> next to a course to cycle through Not taken / Completed / In progress.
      </p>
      <ReqNode
        result={result}
        courses={courses}
        onToggleCourse={toggleCourse}
      />
    </main>
  );
}