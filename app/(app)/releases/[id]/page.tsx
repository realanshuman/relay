import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/base-url";
import { shortDate, cn } from "@/lib/utils";
import { ASSETS_BY_TYPE, AssetType } from "@/lib/constants";
import { StatusBadge, RiskBadge, ConfidenceStars, Icon, EmptyState } from "@/components/ui";
import { GeneratePanel } from "@/components/generate-panel";
import { AssetEditor } from "@/components/asset-editor";
import { PublishPanel } from "@/components/publish-panel";
import { CommitBreakdown } from "@/components/commit-breakdown";
import { DeleteReleaseButton } from "@/components/delete-release-button";
import { Markdown } from "@/components/markdown";

const TABS = [
  { key: "overview", label: "Overview", icon: "LayoutGrid" },
  { key: "notes", label: "Release Notes", icon: "FileText" },
  { key: "marketing", label: "Marketing", icon: "Megaphone" },
  { key: "publish", label: "Publish", icon: "Send" },
];

const NOTE_TYPES: AssetType[] = ["summary", "release_notes", "changelog"];
const MARKETING_TYPES: AssetType[] = [
  "twitter",
  "linkedin",
  "discord",
  "telegram",
  "email",
  "banner_image",
];

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const release = await prisma.release.findUnique({ where: { id: params.id } });
  return { title: release ? `${release.version} · Releases` : "Release" };
}

export default async function ReleaseDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const release = await prisma.release.findUnique({
    where: { id: params.id },
    include: {
      commits: true,
      repository: true,
      workspace: true,
      assets: true,
      publishTargets: true,
    },
  });

  if (!release) notFound();

  const tab = TABS.some((t) => t.key === searchParams.tab) ? searchParams.tab! : "overview";
  const assetMap = new Map(release.assets.map((a) => [a.type as AssetType, a]));
  const generated = release.assets.length > 0;
  const published = release.publishStatus === "published";
  const publishedChannels = release.publishTargets.map((t) => t.channel);
  const contentByType: Partial<Record<AssetType, string>> = {};
  for (const a of release.assets) contentByType[a.type as AssetType] = a.content;

  function EditorFor({ type }: { type: AssetType }) {
    const asset = assetMap.get(type);
    const meta = ASSETS_BY_TYPE[type];
    if (!asset) return null;
    return (
      <AssetEditor
        key={`${type}-${asset.updatedAt.getTime()}`}
        releaseId={release!.id}
        type={type}
        label={meta.label}
        hint={meta.hint}
        icon={meta.icon}
        content={asset.content}
        confidence={asset.confidence}
        edited={asset.edited}
        isBanner={type === "banner_image"}
      />
    );
  }

  const summaryAsset = assetMap.get("summary");

  return (
    <div>
      <Link
        href="/releases"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <Icon name="ArrowLeft" size={15} />
        Releases
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-900">
              {release.version}
            </h1>
            <StatusBadge status={release.status} />
          </div>
          <p className="mt-1 text-lg text-zinc-600">{release.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Icon name="Package" size={14} />
              {release.repository.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="GitBranch" size={14} />
              {release.repository.targetBranch}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="Calendar" size={14} />
              {shortDate(release.releaseDate)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GeneratePanel releaseId={release.id} generated={generated} />
          <DeleteReleaseButton releaseId={release.id} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 border-b border-zinc-200">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/releases/${release.id}?tab=${t.key}`}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-zinc-500 hover:text-zinc-800",
              )}
            >
              <Icon name={t.icon} size={15} />
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {generated && summaryAsset && (
              <div className="card p-4">
                <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <Icon name="Sparkles" size={15} className="text-[var(--brand)]" />
                  AI Summary
                </div>
                <Markdown className="prose-sm">{summaryAsset.content}</Markdown>
              </div>
            )}
            {!generated && (
              <div className="card p-6">
                <EmptyState
                  icon="Sparkles"
                  title="Ready to generate"
                  description="Relay analyzed the commits below. Click Generate to produce release notes, a changelog, announcements, and a banner — all at once."
                  action={<GeneratePanel releaseId={release.id} generated={false} />}
                />
              </div>
            )}
            <CommitBreakdown commits={release.commits} />
          </div>

          <div className="space-y-3">
            <div className="card p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-800">Release details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Risk</dt>
                  <dd>
                    <RiskBadge risk={release.risk} />
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">AI confidence</dt>
                  <dd>
                    {release.confidence != null ? (
                      <ConfidenceStars value={release.confidence} />
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Publish status</dt>
                  <dd>
                    <StatusBadge status={release.publishStatus} />
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Commits</dt>
                  <dd className="font-medium text-zinc-700">{release.commits.length}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {tab === "notes" &&
        (generated ? (
          <div className="space-y-4">
            {NOTE_TYPES.map((type) => (
              <EditorFor key={type} type={type} />
            ))}
          </div>
        ) : (
          <GenerateFirst releaseId={release.id} />
        ))}

      {tab === "marketing" &&
        (generated ? (
          <div className="grid gap-4 md:grid-cols-2">
            {MARKETING_TYPES.map((type) => (
              <EditorFor key={type} type={type} />
            ))}
          </div>
        ) : (
          <GenerateFirst releaseId={release.id} />
        ))}

      {tab === "publish" &&
        (generated ? (
          <div className="max-w-2xl">
            <PublishPanel
              releaseId={release.id}
              slug={release.workspace.slug}
              published={published}
              publishedChannels={publishedChannels}
              assets={contentByType}
              baseUrl={getBaseUrl()}
            />
          </div>
        ) : (
          <GenerateFirst releaseId={release.id} />
        ))}
    </div>
  );
}

function GenerateFirst({ releaseId }: { releaseId: string }) {
  return (
    <div className="card p-6">
      <EmptyState
        icon="Sparkles"
        title="Generate the release first"
        description="Head to Overview and click Generate. Relay will produce everything you can review and publish here."
        action={<GeneratePanel releaseId={releaseId} generated={false} />}
      />
    </div>
  );
}
