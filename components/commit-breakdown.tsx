import { analyzeCommits, type ChangeCategory } from "@/lib/commits";
import { Badge, Icon } from "./ui";

const CAT: Record<ChangeCategory, { label: string; icon: string; tone: any }> = {
  feature: { label: "Feature", icon: "Sparkles", tone: "brand" },
  fix: { label: "Fix", icon: "Bug", tone: "blue" },
  performance: { label: "Perf", icon: "Zap", tone: "amber" },
  breaking: { label: "Breaking", icon: "AlertTriangle", tone: "red" },
  refactor: { label: "Refactor", icon: "Wrench", tone: "zinc" },
  docs: { label: "Docs", icon: "BookOpen", tone: "zinc" },
  chore: { label: "Chore", icon: "Settings2", tone: "zinc" },
};

export function CommitBreakdown({
  commits,
}: {
  commits: { sha: string; message: string; author: string }[];
}) {
  const analysis = analyzeCommits(commits);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/60 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
          <Icon name="GitCommitHorizontal" size={15} className="text-zinc-400" />
          {analysis.total} commits analyzed
        </span>
        <span className="text-xs text-zinc-400">
          {analysis.contributors.length} contributor
          {analysis.contributors.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="divide-y divide-zinc-50">
        {analysis.changes.map((c, i) => {
          const meta = CAT[c.category];
          return (
            <li key={i} className="flex items-center gap-3 px-4 py-2.5">
              <Badge tone={meta.tone} className="w-24 justify-center">
                <Icon name={meta.icon} size={12} />
                {meta.label}
              </Badge>
              <span className="min-w-0 flex-1 truncate text-sm text-zinc-700">
                {c.scope && <span className="font-medium text-zinc-500">{c.scope}: </span>}
                {c.summary}
              </span>
              <code className="hidden shrink-0 font-mono text-xs text-zinc-400 sm:block">
                {c.sha}
              </code>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
