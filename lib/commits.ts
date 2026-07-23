// Commit Analyzer — turns raw commits into structured, categorized change data.
// (docs/prd-v1.5.md §5.1)

export interface RawCommit {
  sha: string;
  message: string;
  author: string;
}

export type ChangeCategory =
  | "feature"
  | "fix"
  | "performance"
  | "breaking"
  | "docs"
  | "refactor"
  | "chore";

export interface AnalyzedChange {
  category: ChangeCategory;
  scope?: string;
  summary: string; // human-friendly, capitalized
  breaking: boolean;
  sha: string;
  author: string;
}

export interface CommitAnalysis {
  changes: AnalyzedChange[];
  byCategory: Record<ChangeCategory, AnalyzedChange[]>;
  hasBreaking: boolean;
  featureCount: number;
  fixCount: number;
  total: number;
  contributors: string[];
}

const TYPE_MAP: Record<string, ChangeCategory> = {
  feat: "feature",
  feature: "feature",
  fix: "fix",
  bugfix: "fix",
  perf: "performance",
  performance: "performance",
  refactor: "refactor",
  docs: "docs",
  doc: "docs",
  chore: "chore",
  build: "chore",
  ci: "chore",
  test: "chore",
  style: "chore",
};

const CONVENTIONAL = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;

function humanize(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return cleaned;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function analyzeCommit(commit: RawCommit): AnalyzedChange {
  const firstLine = commit.message.split("\n")[0].trim();
  const body = commit.message.toLowerCase();
  const match = firstLine.match(CONVENTIONAL);

  let category: ChangeCategory = "chore";
  let scope: string | undefined;
  let summary = firstLine;
  let breaking = /breaking change/i.test(commit.message);

  if (match) {
    const [, type, matchedScope, bang, desc] = match;
    category = TYPE_MAP[type.toLowerCase()] ?? "chore";
    scope = matchedScope;
    summary = desc;
    if (bang === "!") breaking = true;
  } else {
    // Heuristic fallback for non-conventional messages.
    if (/\b(fix|bug|patch|resolve|hotfix)\b/i.test(firstLine)) category = "fix";
    else if (/\b(add|new|introduce|implement|support|feature)\b/i.test(firstLine))
      category = "feature";
    else if (/\b(perf|performance|faster|optimiz|speed)\b/i.test(firstLine))
      category = "performance";
    else if (/\b(refactor|cleanup|clean up|rename)\b/i.test(firstLine))
      category = "refactor";
    else if (/\b(docs?|readme|documentation)\b/i.test(firstLine)) category = "docs";
  }

  if (breaking) category = "breaking";

  return {
    category,
    scope,
    summary: humanize(summary),
    breaking,
    sha: commit.sha.slice(0, 7),
    author: commit.author,
  };
}

export function analyzeCommits(commits: RawCommit[]): CommitAnalysis {
  const changes = commits.map(analyzeCommit);
  const byCategory = {
    feature: [],
    fix: [],
    performance: [],
    breaking: [],
    docs: [],
    refactor: [],
    chore: [],
  } as Record<ChangeCategory, AnalyzedChange[]>;

  for (const change of changes) byCategory[change.category].push(change);

  const contributors = Array.from(new Set(changes.map((c) => c.author))).filter(Boolean);

  return {
    changes,
    byCategory,
    hasBreaking: byCategory.breaking.length > 0,
    featureCount: byCategory.feature.length,
    fixCount: byCategory.fix.length,
    total: changes.length,
    contributors,
  };
}

export function computeRisk(analysis: CommitAnalysis): "low" | "medium" | "high" {
  if (analysis.hasBreaking) return "high";
  if (analysis.total >= 12 || analysis.featureCount >= 5) return "medium";
  return "low";
}
