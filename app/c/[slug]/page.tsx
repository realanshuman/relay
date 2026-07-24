import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { shortDate, cn } from "@/lib/utils";
import { AssetType } from "@/lib/constants";
import { parseChanges, TAG_META, type ChangeTag, type ChangeTone } from "@/lib/changelog";
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

const TONE_CLASS: Record<ChangeTone, string> = {
  brand: "bg-[var(--brand)] text-white",
  violet: "bg-violet-100 text-violet-700",
  blue: "bg-sky-100 text-sky-700",
  zinc: "bg-zinc-100 text-zinc-600",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

function TagBadge({ tag }: { tag: ChangeTag }) {
  const meta = TAG_META[tag];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        TONE_CLASS[meta.tone],
      )}
    >
      {meta.label}
    </span>
  );
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
        const changelog = assetContent(r.assets, "changelog") ?? "";
        return (
          r.version.toLowerCase().includes(q) ||
          (r.title ?? "").toLowerCase().includes(q) ||
          notes.toLowerCase().includes(q) ||
          changelog.toLowerCase().includes(q)
        );
      })
    : all;

  const brandStyle = {
    ["--brand" as string]: ws.primaryColor,
    ["--brand-soft" as string]: `color-mix(in srgb, ${ws.primaryColor} 12%, white)`,
  } as React.CSSProperties;

  return (
    <div style={brandStyle} className="min-h-screen bg-white">
      {/* ---- Header ------------------------------------------------------ */}
      <header
        className="border-b border-zinc-200"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${ws.primaryColor} 7%, white), white)`,
        }}
      >
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-2xl shadow-card">
                {ws.faviconEmoji}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--brand)]">
                  Changelog
                </p>
                <h1 className="truncate font-serif text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl">
                  {ws.name}
                </h1>
                {ws.tagline && <p className="mt-0.5 text-sm text-zinc-500">{ws.tagline}</p>}
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              {ws.customDomain && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Icon name="Globe" size={13} />
                  {ws.customDomain}
                </span>
              )}
              <a
                href={`/c/${ws.slug}/rss.xml`}
                title="RSS feed"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:text-[var(--brand)]"
              >
                <Icon name="Rss" size={14} />
                RSS
              </a>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SubscribeForm slug={ws.slug} />
            <form method="get" className="sm:w-60">
              <div className="relative">
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
        </div>
      </header>

      {/* ---- Timeline ---------------------------------------------------- */}
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-12">
        {q && (
          <p className="mb-8 text-sm text-zinc-500">
            {releases.length} result{releases.length === 1 ? "" : "s"} for{" "}
            <span className="font-medium text-zinc-700">“{searchParams.q}”</span> ·{" "}
            <Link href={`/c/${ws.slug}`} className="font-medium text-[var(--brand)] hover:underline">
              Clear
            </Link>
          </p>
        )}

        {releases.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-20 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <Icon name={q ? "SearchX" : "Rocket"} size={20} />
            </span>
            <p className="text-sm font-medium text-zinc-700">
              {q ? "No matching releases" : "No releases published yet"}
            </p>
            <p className="mt-1 max-w-xs text-sm text-zinc-400">
              {q
                ? "Try a different search term."
                : "Check back soon — new releases will appear here as they ship."}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* vertical rail */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-2 top-3 bottom-0 w-px"
              style={{
                background: "linear-gradient(to bottom, #e4e4e7 0%, #e4e4e7 92%, transparent 100%)",
              }}
            />

            {releases.map((r, i) => {
              const banner = assetContent(r.assets, "banner_image");
              const summary = assetContent(r.assets, "summary");
              const notes = assetContent(r.assets, "release_notes");
              const changelog = assetContent(r.assets, "changelog");
              const items = parseChanges(changelog, notes);
              const featured = i === 0 && !q;

              return (
                <article
                  key={r.id}
                  id={r.version}
                  className="relative scroll-mt-24 pb-14 pl-9 last:pb-0 sm:pl-12"
                >
                  {/* node */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-2 top-1.5 z-10 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white",
                      featured ? "border-[var(--brand)]" : "border-zinc-300",
                    )}
                  >
                    {featured && <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />}
                  </span>

                  <time className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                    {shortDate(r.publishedAt)}
                  </time>

                  <h2 className="mt-1 font-serif text-2xl font-medium leading-tight tracking-tight text-zinc-900 sm:text-[28px]">
                    {r.title || `Release ${r.version}`}
                  </h2>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
                    <span className="rounded bg-[var(--brand-soft)] px-1.5 py-0.5 font-mono font-medium text-[var(--brand)]">
                      {r.version}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{r.repository.name}</span>
                    {featured && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="font-medium text-[var(--brand)]">Latest</span>
                      </>
                    )}
                  </div>

                  {featured && banner && (
                    <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 shadow-card [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
                      <div dangerouslySetInnerHTML={{ __html: banner }} />
                    </div>
                  )}

                  {summary && (
                    <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
                      {summary.replace(/\*\*/g, "").trim()}
                    </p>
                  )}

                  {items.length > 0 ? (
                    <ul className="mt-5 space-y-3">
                      {items.map((it, j) => (
                        <li key={j} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                          <div className="shrink-0 sm:w-[76px] sm:pt-[3px]">
                            <TagBadge tag={it.tag} />
                          </div>
                          <p className="text-[15px] leading-relaxed text-zinc-600">
                            {it.label && (
                              <span className="font-semibold text-zinc-900">{it.label}</span>
                            )}
                            {it.label && " — "}
                            {it.text}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    notes && (
                      <div className="mt-4">
                        <Markdown>{notes}</Markdown>
                      </div>
                    )
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ---- Footer ------------------------------------------------------ */}
      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-6 text-xs text-zinc-400 sm:flex-row">
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
