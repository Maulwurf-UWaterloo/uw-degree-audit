"use client";
import { evaluate } from "@/lib/evaluator";
import { pmathMajorRequirements } from "@/lib/plans/pmath-major";
import { sampleTranscript } from "@/data/sample-transcript";
import { EvalResult, Status } from "@/lib/types";

function statusIcon(status: Status): string {
  switch (status) {
    case "completed": return "✅";
    case "in-progress": return "🟡";
    case "not-met": return "⬜";
  }
}

function ReqNode({ result, depth = 0 }: { result: EvalResult; depth?: number }) {
  return (
    <div style={{ marginLeft: depth * 20 }} className="my-1">
      <div className="flex items-center gap-2">
        <span>{statusIcon(result.status)}</span>
        <span className="font-medium">{result.label}</span>
        <span className="text-sm text-gray-500">— {result.detail}</span>
      </div>
      {result.children?.map((c, i) => (
        <ReqNode key={i} result={c} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function Home() {
  const result = evaluate(pmathMajorRequirements, sampleTranscript.courses);
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">UW Degree Audit (alpha)</h1>
      <ReqNode result={result} />
    </main>
  );
}