export type Course = {
  code: string;
  grade: number | null;
  term: string;
  credits: number;
};

export type Transcript = {
  studentId?: string;
  courses: Course[];
  plan: string;
};

export type Requirement =
  | { kind: "course"; code: string; minGrade?: number }
  | { kind: "and"; label: string; children: Requirement[] }
  | { kind: "or"; label: string; children: Requirement[] }
  | { kind: "count"; label: string; min: number; from: Requirement[] }
  | { kind: "average"; label: string; min: number; over: Requirement[] };

// NEW
export type Status = "completed" | "in-progress" | "not-met";

export type EvalResult = {
  status: Status;          // CHANGED — was: satisfied: boolean
  progress: number;
  label: string;
  detail: string;
  children?: EvalResult[];
};