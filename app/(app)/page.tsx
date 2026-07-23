import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { startOfMonth, timeAgo } from "@/lib/utils";
import { Card, Icon, EmptyState } from "@/components/ui";
import { ReleasesTable } from "@/components/releases-table";

function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "zinc",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: string;
  tone?: "zinc" | "green" | "brand";
}) {
  const iconTone =
    tone === "green"
      ? "bg-emerald-50 text-emerald-600"
      : tone === "brand"
        ? "bg-[var(--brand-soft)] text-[var(--brand)]"
        : "bg-zinc-100 text-zinc-500";
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon name={icon} size={15} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-zinc-400">{sub}</div>}
    </Card>
  );
}

export default async function DashboardPage() {
  const ws = await getCurrentWorkspace();

  const [repoCount, monthCount, latestPublished, unpublishedCount, latestReleases] =
    await Promise.all([
      prisma.repository.count({ where: { workspaceId: ws.id, connected: true } }),
      prisma.release.count({
        where: { workspaceId: ws.id, publishedAt: { gte: startOfMonth() } },
      }),
      prisma.release.findFirst({
        where: { workspaceId: ws.id, publishStatus: "published" },
        orderBy: { publishedAt: "desc" },
        include: { repository: true },
      }),
      prisma.release.count({
        where: { workspaceId: ws.id, status: "ready", publishStatus: "unpublished" },
      }),
      prisma.release.findMany({
        where: { workspaceId: ws.id },
        orderBy: { releaseDate: "desc" },
        take: 6,
        include: { repository: { select: { name: true } } },
      }),
    ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          Good to see you 👋
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Here's what's shipping across {ws.name}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Repositories" value={repoCount} icon="Package" sub="connected" />
        <StatCard
          label="Releases this month"
          value={monthCount}
          icon="Rocket"
          tone="brand"
          sub="published"
        />
        <StatCard
          label="Latest Deployment"
          value={latestPublished ? latestPublished.version : "—"}
          icon="GitCommitVertical"
          sub={
            latestPublished
              ? `${latestPublished.repository.name} · ${timeAgo(latestPublished.publishedAt)}`
              : "Nothing published yet"
          }
        />
        <StatCard label="AI Credits" value={ws.aiCredits} icon="Sparkles" sub="remaining" />
        <StatCard
          label="Publishing"
          value={unpublishedCount > 0 ? `${unpublishedCount} ready` : "All clear"}
          icon={unpublishedCount > 0 ? "Clock" : "CheckCircle2"}
          tone={unpublishedCount > 0 ? "zinc" : "green"}
          sub={unpublishedCount > 0 ? "awaiting publish" : "up to date"}
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Latest Releases</h2>
          <Link
            href="/releases"
            className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-[var(--brand)]"
          >
            View all
            <Icon name="ArrowRight" size={13} />
          </Link>
        </div>
        <Card className="overflow-hidden">
          {latestReleases.length ? (
            <ReleasesTable releases={latestReleases} />
          ) : (
            <div className="p-6">
              <EmptyState
                icon="Rocket"
                title="No releases yet"
                description="Click “New Release” to detect one from a repository, or connect GitHub."
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
