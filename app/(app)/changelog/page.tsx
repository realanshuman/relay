import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getBaseUrl } from "@/lib/base-url";
import { shortDate } from "@/lib/utils";
import { PageHeader, Card, Icon, Badge, EmptyState } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

export const metadata = { title: "Public Changelog" };

export default async function ChangelogPage() {
  const ws = await getCurrentWorkspace();
  const baseUrl = getBaseUrl();
  const publicUrl = `${baseUrl}/c/${ws.slug}`;

  const [published, subscribers] = await Promise.all([
    prisma.release.findMany({
      where: {
        workspaceId: ws.id,
        publishStatus: "published",
        publishTargets: { some: { channel: "website" } },
      },
      orderBy: { publishedAt: "desc" },
      include: { repository: { select: { name: true } } },
    }),
    prisma.subscriber.findMany({
      where: { workspaceId: ws.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Public Changelog"
        subtitle="Your branded, SEO-friendly release page — with search, RSS, and email subscribers."
        icon="Globe"
        action={
          <Link href={publicUrl} target="_blank" className="btn-brand">
            <Icon name="ExternalLink" size={15} />
            View live page
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-4">
            <label className="label">Public URL</label>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 truncate rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-600">
                <Icon name="Link" size={14} className="shrink-0 text-zinc-400" />
                <span className="truncate">{publicUrl}</span>
              </div>
              <CopyButton text={publicUrl} className="btn-ghost" />
              <Link href={`/c/${ws.slug}/rss.xml`} target="_blank" className="btn-ghost text-xs">
                <Icon name="Rss" size={14} />
                RSS
              </Link>
            </div>
            {ws.customDomain ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                <Icon name="CheckCircle2" size={13} className="text-emerald-500" />
                Also serving on <span className="font-medium">{ws.customDomain}</span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-zinc-400">
                Add a custom domain in{" "}
                <Link href="/settings" className="text-[var(--brand)] underline underline-offset-2">
                  Settings → Branding
                </Link>
                .
              </p>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/60 px-4 py-2.5 text-sm font-semibold text-zinc-800">
              Live on your changelog
            </div>
            {published.length ? (
              <ul className="divide-y divide-zinc-100">
                {published.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/releases/${r.id}`}
                      className="flex items-center justify-between px-4 py-3 transition hover:bg-zinc-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-zinc-900">
                          {r.version}
                        </span>
                        <span className="text-sm text-zinc-500">{r.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone="zinc">{r.repository.name}</Badge>
                        <span className="text-xs text-zinc-400">{shortDate(r.publishedAt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon="Globe"
                  title="Nothing published yet"
                  description="Publish a release to the Website channel and it will appear here."
                />
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Subscribers</span>
              <Icon name="Users" size={15} className="text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-zinc-900">{subscribers.length}</div>
            <div className="mt-3 space-y-1.5">
              {subscribers.slice(0, 8).map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm text-zinc-600">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand)]">
                    {s.email[0]?.toUpperCase()}
                  </span>
                  <span className="truncate">{s.email}</span>
                </div>
              ))}
              {subscribers.length === 0 && (
                <p className="text-sm text-zinc-400">No subscribers yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-zinc-800">Features</h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              {[
                ["Search", "Search"],
                ["RSS feed", "Rss"],
                ["Email subscribe", "Mail"],
                ["SEO optimized", "TrendingUp"],
                ["Custom domain", "Globe"],
              ].map(([label, icon]) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon name={icon} size={14} className="text-[var(--brand)]" />
                  {label}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
