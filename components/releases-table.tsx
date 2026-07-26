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

/**
 * Releases list. A table is the right shape on a wide screen and the wrong shape on a
 * phone, so small screens get a stacked card per release instead of a sideways scroll.
 */
export function ReleasesTable({
  releases,
  variant = "full",
}: {
  releases: ReleaseRow[];
  variant?: "full" | "compact";
}) {
  return (
    <>
      {/* Phone: one card per release */}
      <ul className="divide-y divide-zinc-100 md:hidden">
        {releases.map((r) => (
          <li key={r.id}>
            <Link href={`/app/releases/${r.id}`} className="block px-4 py-3 active:bg-zinc-50">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[13px] font-semibold text-zinc-900">
                  {r.version}
                </span>
                <StatusBadge status={r.status} />
              </div>
              {r.title && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{r.title}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Icon name="Package" size={12} />
                  {r.repository.name}
                </span>
                <RiskBadge risk={r.risk} />
                <span>
                  {r.publishedAt ? timeAgo(r.publishedAt) : "Not published"}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: the table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
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
                      {r.publishStatus === "published" && <Badge tone="green">Published</Badge>}
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
    </>
  );
}
