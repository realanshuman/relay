import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/session";
import { PageHeader, Card, EmptyState, Icon } from "@/components/ui";
import { ReleasesTable } from "@/components/releases-table";
import { cn } from "@/lib/utils";

export const metadata = { title: "Releases" };
export const dynamic = "force-dynamic";

type Search = { status?: string; q?: string; repo?: string };

/** Build the Prisma filter for a status tab. */
function statusWhere(status: string): Prisma.ReleaseWhereInput {
  if (status === "published") return { publishStatus: "published" };
  if (status === "ready") return { status: "ready", publishStatus: "unpublished" };
  if (status === "draft") return { status: "draft" };
  return {};
}

/** Preserve the other filters when switching one of them. */
function href(current: Search, patch: Partial<Search>): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  if (next.status && next.status !== "all") params.set("status", next.status);
  if (next.q) params.set("q", next.q);
  if (next.repo && next.repo !== "all") params.set("repo", next.repo);
  const qs = params.toString();
  return qs ? `/app/releases?${qs}` : "/app/releases";
}

export default async function ReleasesPage({ searchParams }: { searchParams: Search }) {
  const ws = await getCurrentWorkspace();
  const status = searchParams.status ?? "all";
  const q = (searchParams.q ?? "").trim();
  const repo = searchParams.repo ?? "all";

  const search: Prisma.ReleaseWhereInput = q
    ? {
        OR: [
          { version: { contains: q, mode: "insensitive" } },
          { title: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  const repoWhere: Prisma.ReleaseWhereInput = repo !== "all" ? { repositoryId: repo } : {};
  const base: Prisma.ReleaseWhereInput = { workspaceId: ws.id, ...search, ...repoWhere };

  const [releases, repos, counts] = await Promise.all([
    prisma.release.findMany({
      where: { ...base, ...statusWhere(status) },
      orderBy: { releaseDate: "desc" },
      include: { repository: { select: { name: true } } },
      take: 100,
    }),
    prisma.repository.findMany({
      where: { workspaceId: ws.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    // Counts respect the search and repo filters so the tabs stay honest.
    Promise.all(
      ["all", "draft", "ready", "published"].map((key) =>
        prisma.release.count({ where: { ...base, ...statusWhere(key) } }),
      ),
    ),
  ]);

  const FILTERS = [
    { key: "all", label: "All", count: counts[0] },
    { key: "draft", label: "Draft", count: counts[1] },
    { key: "ready", label: "Ready", count: counts[2] },
    { key: "published", label: "Published", count: counts[3] },
  ];

  const filtering = q !== "" || repo !== "all" || status !== "all";

  return (
    <div>
      <PageHeader
        title="Releases"
        subtitle="Every release, from detected draft to published."
        icon="Rocket"
      />

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {FILTERS.map((f) => {
            const active = status === f.key;
            return (
              <Link
                key={f.key}
                href={href(searchParams, { status: f.key })}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                    active ? "bg-white/70 text-[var(--brand)]" : "bg-zinc-100 text-zinc-500",
                  )}
                >
                  {f.count}
                </span>
              </Link>
            );
          })}
        </div>

        <form method="get" className="flex flex-col gap-2 sm:flex-row">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <div className="relative flex-1">
            <Icon
              name="Search"
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by version or title"
              className="input pl-9"
            />
          </div>
          {repos.length > 1 && (
            <select name="repo" defaultValue={repo} className="input sm:w-52">
              <option value="all">All repositories</option>
              {repos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
          <button type="submit" className="btn-ghost shrink-0">
            <Icon name="Filter" size={15} />
            Apply
          </button>
          {filtering && (
            <Link href="/app/releases" className="btn-subtle shrink-0 text-zinc-500">
              Clear
            </Link>
          )}
        </form>
      </div>

      <Card className="overflow-hidden">
        {releases.length ? (
          <ReleasesTable releases={releases} />
        ) : (
          <div className="p-6">
            {filtering ? (
              <EmptyState
                icon="SearchX"
                title="No releases match those filters"
                description="Try a different search term, repository, or status."
                action={
                  <Link href="/app/releases" className="btn-ghost">
                    Clear filters
                  </Link>
                }
              />
            ) : (
              <EmptyState
                icon="Rocket"
                title="No releases yet"
                description="Connect a repository and Relay drafts a release the next time you merge. You can also use New Release to try it with sample commits."
                action={
                  <Link href="/app/integrations" className="btn-brand">
                    <Icon name="Github" size={15} />
                    Connect GitHub
                  </Link>
                }
              />
            )}
          </div>
        )}
      </Card>

      {releases.length === 100 && (
        <p className="mt-3 text-center text-xs text-zinc-400">
          Showing the 100 most recent releases. Use search to narrow it down.
        </p>
      )}
    </div>
  );
}
