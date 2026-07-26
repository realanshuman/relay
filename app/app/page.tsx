import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/session";
import { getCurrentUser } from "@/lib/session";
import { startOfMonth, timeAgo } from "@/lib/utils";
import { Card, Icon, EmptyState } from "@/components/ui";
import { ReleasesTable } from "@/components/releases-table";
import { Onboarding } from "@/components/onboarding";

function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "zinc",
  href,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: string;
  tone?: "zinc" | "green" | "brand";
  href?: string;
}) {
  const iconTone =
    tone === "green"
      ? "bg-emerald-50 text-emerald-600"
      : tone === "brand"
        ? "bg-[var(--brand-soft)] text-[var(--brand)]"
        : "bg-zinc-100 text-zinc-500";

  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon name={icon} size={15} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">{value}</div>
      {sub && <div className="mt-0.5 truncate text-xs text-zinc-400">{sub}</div>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="card block p-4 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-card"
      >
        {body}
      </Link>
    );
  }
  return <Card className="p-4">{body}</Card>;
}

/** Work waiting on the user, with the action attached. Hidden when there's nothing to do. */
function NeedsAttention({
  drafts,
  ready,
  reposConnected,
}: {
  drafts: number;
  ready: number;
  reposConnected: number;
}) {
  const items: { icon: string; text: string; cta: string; href: string }[] = [];
  if (reposConnected === 0) {
    items.push({
      icon: "Github",
      text: "No repository connected yet",
      cta: "Connect GitHub",
      href: "/app/integrations",
    });
  }
  if (drafts > 0) {
    items.push({
      icon: "Sparkles",
      text: `${drafts} draft${drafts > 1 ? "s" : ""} waiting to be generated`,
      cta: "Generate",
      href: "/app/releases?status=draft",
    });
  }
  if (ready > 0) {
    items.push({
      icon: "Send",
      text: `${ready} release${ready > 1 ? "s" : ""} ready to publish`,
      cta: "Review and publish",
      href: "/app/releases?status=ready",
    });
  }
  if (!items.length) return null;

  return (
    <Card className="mt-6 overflow-hidden p-0">
      <div className="border-b border-zinc-100 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-zinc-900">Needs your attention</h2>
      </div>
      <ul className="divide-y divide-zinc-100">
        {items.map((it) => (
          <li
            key={it.text}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex items-center gap-2.5 text-sm text-zinc-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
                <Icon name={it.icon} size={14} />
              </span>
              {it.text}
            </span>
            <Link href={it.href} className="btn-ghost shrink-0 self-start sm:self-auto">
              {it.cta}
              <Icon name="ArrowRight" size={14} />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default async function DashboardPage() {
  const [ws, user] = await Promise.all([getCurrentWorkspace(), getCurrentUser()]);
  const firstName = (user?.name || "there").split(/\s+/)[0];

  const [
    repoCount,
    monthCount,
    latestPublished,
    unpublishedCount,
    latestReleases,
    totalReleases,
    publishedCount,
  ] = await Promise.all([
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
    prisma.release.count({ where: { workspaceId: ws.id } }),
    prisma.release.count({ where: { workspaceId: ws.id, publishStatus: "published" } }),
  ]);

  const draftCount = await prisma.release.count({
    where: { workspaceId: ws.id, status: "draft" },
  });

  const showOnboarding = publishedCount === 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {showOnboarding ? `Welcome, ${firstName}` : `Good to see you, ${firstName}`}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {showOnboarding
            ? "Let's get your first release out the door."
            : `Here's what's shipping across ${ws.name}.`}
        </p>
      </div>

      {showOnboarding && (
        <Onboarding
          firstName={firstName}
          repoCount={repoCount}
          releaseCount={totalReleases}
          publishedCount={publishedCount}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Repositories"
          value={repoCount}
          icon="Package"
          sub="watched"
          href="/app/repositories"
        />
        <StatCard
          label="Releases this month"
          value={monthCount}
          icon="Rocket"
          tone="brand"
          sub="published"
          href="/app/releases?status=published"
        />
        <StatCard
          label="Latest release"
          value={latestPublished ? latestPublished.version : "—"}
          icon="GitCommitVertical"
          sub={
            latestPublished
              ? `${latestPublished.repository.name} · ${timeAgo(latestPublished.publishedAt)}`
              : "Nothing published yet"
          }
          href={latestPublished ? `/app/releases/${latestPublished.id}` : undefined}
        />
        <StatCard
          label="AI credits"
          value={ws.aiCredits}
          icon="Sparkles"
          sub="remaining"
          href="/app/settings?tab=billing"
        />
        <StatCard
          label="Publishing"
          value={unpublishedCount > 0 ? `${unpublishedCount} ready` : "All clear"}
          icon={unpublishedCount > 0 ? "Clock" : "CheckCircle2"}
          tone={unpublishedCount > 0 ? "zinc" : "green"}
          sub={unpublishedCount > 0 ? "awaiting publish" : "up to date"}
          href={unpublishedCount > 0 ? "/app/releases?status=ready" : undefined}
        />
      </div>

      {!showOnboarding && (
        <NeedsAttention drafts={draftCount} ready={unpublishedCount} reposConnected={repoCount} />
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Latest Releases</h2>
          <Link
            href="/app/releases"
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
                description="Connect a repository and Relay drafts a release the next time you merge."
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
