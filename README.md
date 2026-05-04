# UW Degree Audit

> Interactive degree-requirement checker and what-if simulator for University of Waterloo students.

UW's official degree audit (Quest) is hard to read, doesn't show progress visually, and can't answer "what if I drop this course?" or "what if I switch from Math to AMATH?". This project does.

![Screenshot of the audit UI](docs/screenshot.png)

## Why this exists

Every term, thousands of UW students manually cross-reference their unofficial transcripts against the undergraduate calendar to check if they're on track to graduate. Quest gives you a yes/no per requirement; it doesn't show you *how close* you are, what's missing, or what changes if your plan changes. This tool fills that gap.

## Features

- Parse-free: paste or hand-enter your courses, see your status in seconds
- Hierarchical view of every degree requirement with live progress
- Supports `AND`, `OR`, "N-of-M" cardinality, and minimum-grade constraints
- In-progress courses (no grade yet) are first-class citizens
- Privacy-first: nothing leaves your browser

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- Pure client-side: no backend, no database, no tracking
- Deployed on Vercel

## Design highlights

The core of this project is a **recursive AST** that represents UWaterloo's degree requirements as a typed expression tree. Each node is one of five constructors:

```typescript
type Requirement =
  | { kind: "course";  code: string; minGrade?: number }
  | { kind: "and";     label: string; children: Requirement[] }
  | { kind: "or";      label: string; children: Requirement[] }
  | { kind: "count";   label: string; min: number; from: Requirement[] }
  | { kind: "average"; label: string; min: number; over: Requirement[] };
```

Evaluation is a **structural recursion** over the tree — about 60 lines of TypeScript handle arbitrarily deep nesting. Adding a new requirement type is one line in the union plus one `case` in the evaluator; TypeScript's exhaustiveness checking flags every spot that needs an update.

The UI mirrors the data structure: a recursive React component renders the recursive `EvalResult` tree, with depth-driven indentation and per-node satisfaction state.

## Project status

Active development. Currently supported:

- ✅ Math Major (partial — Core 1A/1B, Communication Skills, Upper-Year Math)
- 🚧 Math Major (full)
- 🚧 PDF transcript upload (client-side parsing via pdfjs-dist)
- 🚧 What-if simulator (drop / add courses, switch plans)
- 🚧 Plan comparison (e.g. Math Major vs. AMATH Major)

## Getting started

Requires Node.js 18+.

```bash
git clone git@github.com:Maulwurf-UWaterloo/uw-degree-audit.git
cd uw-degree-audit
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Disclaimer

Not affiliated with the University of Waterloo. For unofficial planning only — always verify graduation requirements with your academic advisor.

## Author

Built by Wu Tung-li ([@Maulwurf-UWaterloo](https://github.com/Maulwurf-UWaterloo)) — Math, UWaterloo 2A.
