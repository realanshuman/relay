import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { shortDate } from "@/lib/utils";
import { AssetType } from "@/lib/constants";
import { Markdown } from "@/components/markdown";
import { SubscribeForm } from "@/components/subscribe-form";
import { Icon } from "@/components/ui";
import { LogoMark } from "@/components/logo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const ws = await getWorkspaceBySlug(params.slug);
  if (!ws) return { title: "Changelog not found" };
  const title = `${ws.name} Changelog`;
  const description = ws.tagline ?? `Latest releases and product updates from ${ws.name}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { types: { "application/rss+xml": `/c/${ws.slug}/rss.xml` } },
  };
}

function assetContent(
  assets: { type: string; content: string }[],
  type: AssetType,
): string | undefined {
  return assets.find((a) => a.type === type)?.content;
}

export default async function PublicChangelog({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { q?: string };
}) {
  const ws = await getWorkspaceBySlug(params.slug);
  if (!ws) notFound();

  const q = (searchParams.q ?? "").trim().toLowerCase();

  const all = await prisma.release.findMany({
    where: {
      workspaceId: ws.id,
      publishStatus: "published",
      publishTargets: { some: { channel: "website" } },
    },
    orderBy: { publishedAt: "desc" },
    include: { repository: true, assets: true },
  });

  const releases = q
    ? all.filter((r) => {
        const notes = assetContent(r.assets, "release_notes") ?? "";
        return (
          r.version.toLowerCase().includes(q) ||
          (r.title ?? "").toLowerCase().includes(q) ||
          notes.toLowerCase().includes(q)
        );
      })
    : all;

  const brandStyle = {
    ["--brand" as string]: ws.primaryColor,
    ["--brand-soft" as string]: `color-mix(in srgb, ${ws.primaryColor} 12%, white)`,
  } as React.CSSProperties;

  return (
    <div style={brandStyle} className="min-h-screen bg-white">
      {/* Hero */}
      <header
        className="border-b border-zinc-200"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${ws.primaryColor} 8%, white), white)`,
        }}
      >
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{ws.faviconEmoji}</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                {ws.name} Changelog
              </h1>
              {ws.tagline && <p className="text-sm text-zinc-500">{ws.tagline}</p>}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SubscribeForm slug={ws.slug} />
            <div className="flex items-center gap-3 text-sm">
              <a
                href={`/c/${ws.slug}/rss.xml`}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-[var(--brand)]"
              >
                <Icon name="Rss" size={15} />
                RSS
              </a>
              {ws.customDomain && (
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Icon name="Globe" size={14} />
                  {ws.customDomain}
                </span>
              )}
            </div>
          </div>

          <form method="get" className="mt-4">
            <div className="relative max-w-md">
              <Icon
                name="Search"
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                name="q"
                defaultValue={searchParams.q ?? ""}
                placeholder="Search releases…"
                className="input pl-9"
              />
            </div>
          </form>
        </div>
      </header>

      {/* Timeline */}
      <main className="mx-auto max-w-3xl px-6 py-10">
        {releases.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-400">
            {q ? `No releases match “${searchParams.q}”.` : "No releases published yet."}
          </p>
        ) : (
          <div className="space-y-14">
            {releases.map((r) => {
              const banner = assetContent(r.assets, "banner_image");
              const summary = assetContent(r.assets, "summary");
              const notes = assetContent(r.assets, "release_notes");
              return (
                <article key={r.id} id={r.version} className="scroll-mt-6">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 font-mono text-sm font-semibold text-[var(--brand)]">
                      {r.version}
                    </span>
                    <time className="text-sm text-zinc-400">{shortDate(r.publishedAt)}</time>
                    <span className="text-sm text-zinc-300">·</span>
                    <span className="text-sm text-zinc-400">{r.repository.name}</span>
                  </div>

                  {r.title && (
                    <h2 className="mb-3 text-xl font-bold tracking-tight text-zinc-900">
                      {r.title}
                    </h2>
                  )}

                  {banner && (
                    <div
                      className="mb-5 overflow-hidden rounded-xl border border-zinc-200 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: banner }}
                    />
                  )}

                  {summary && (
                    <div className="mb-4 rounded-lg border-l-2 border-[var(--brand)] bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                      <Markdown className="prose-sm">{summary}</Markdown>
                    </div>
                  )}

                  {notes && <Markdown>{notes}</Markdown>}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 text-xs text-zinc-400">
          <span>
            © {new Date().getFullYear()} {ws.name}
          </span>
          <Link
            href="/"
            className="flex items-center gap-1.5 font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            Powered by
            <LogoMark size={14} />
            Relay
          </Link>
        </div>
      </footer>
    </div>
  );
}
