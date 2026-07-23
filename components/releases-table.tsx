import Link from "next/link";
import { Badge, StatusBadge, RiskBadge, ConfidenceStars, Icon } from "./ui";
import { shortDate, timeAgo } from "@/lib/utils";

export interface ReleaseRow {
  id: string;
  version: string;
  title: string | null;
  status: string;
  publishStatus: string;
  risk: string;
  confidence: number | null;
  releaseDate: Date;
  publishedAt: Date | null;
  repository: { name: string };
}

export function ReleasesTable({
  releases,
  variant = "full",
}: {
  releases: ReleaseRow[];
  variant?: "full" | "compact";
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
            <th className="px-4 py-2.5 font-medium">Release</th>
            <th className="px-4 py-2.5 font-medium">Repository</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Risk</th>
            {variant === "full" && <th className="px-4 py-2.5 font-medium">AI</th>}
            <th className="px-4 py-2.5 font-medium">Published</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {releases.map((r) => (
            <tr key={r.id} className="group transition-colors hover:bg-zinc-50/70">
              <td className="px-4 py-3">
                <Link href={`/app/releases/${r.id}`} className="block">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-zinc-900">
                      {r.version}
                    </span>
                    {r.publishStatus === "published" && (
                      <Badge tone="green">Published</Badge>
                    )}
                  </div>
                  {r.title && (
                    <div className="mt-0.5 max-w-[240px] truncate text-xs text-zinc-500">
                      {r.title}
                    </div>
                  )}
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-600">{r.repository.name}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3">
                <RiskBadge risk={r.risk} />
              </td>
              {variant === "full" && (
                <td className="px-4 py-3">
                  {r.confidence != null ? (
                    <ConfidenceStars value={r.confidence} showPct={false} size={12} />
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </td>
              )}
              <td className="px-4 py-3 text-zinc-500">
                {r.publishedAt ? (
                  <span title={shortDate(r.publishedAt)}>{timeAgo(r.publishedAt)}</span>
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/app/releases/${r.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition group-hover:text-[var(--brand)]"
                >
                  Open
                  <Icon name="ArrowRight" size={13} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
