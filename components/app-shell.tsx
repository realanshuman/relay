"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { NewReleaseButton } from "./new-release-button";
import { Icon } from "./ui";

type Workspace = {
  name: string;
  slug: string;
  faviconEmoji: string;
  aiCredits: number;
  primaryColor: string;
};
type User = { name: string; email: string };
type Repo = { id: string; name: string; targetBranch: string };

const SEGMENT_LABEL: Record<string, string> = {
  releases: "Releases",
  repositories: "Repositories",
  integrations: "Integrations",
  changelog: "Public Changelog",
  settings: "Settings",
};

type Crumb = { label: string; href?: string };

function buildCrumbs(pathname: string): Crumb[] {
  const segs = pathname.replace(/^\/app\/?/, "").split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Dashboard", href: "/app" }];
  if (segs.length === 0) return [{ label: "Dashboard" }];
  const top = segs[0];
  crumbs.push({
    label: SEGMENT_LABEL[top] ?? top,
    href: segs.length > 1 ? `/app/${top}` : undefined,
  });
  if (segs.length > 1) {
    // Dynamic child (e.g. a release id) — a generic trailing label.
    crumbs.push({ label: top === "releases" ? "Release" : "Detail" });
  }
  return crumbs;
}

export function AppShell({
  workspace,
  user,
  repos,
  aiLive,
  children,
}: {
  workspace: Workspace;
  user: User;
  repos: Repo[];
  aiLive: boolean;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  // Close the mobile drawer on route change.
  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  const brandStyle = {
    ["--brand" as string]: workspace.primaryColor,
    ["--brand-soft" as string]: `color-mix(in srgb, ${workspace.primaryColor} 12%, white)`,
  } as React.CSSProperties;

  return (
    <div style={brandStyle} className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Desktop rail */}
      <div className="hidden lg:block">
        <Sidebar workspace={workspace} user={user} />
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 max-w-[85%] animate-slide-in-left shadow-2xl">
            <Sidebar workspace={workspace} user={user} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/80 px-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-1.5">
            <button
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 lg:hidden"
            >
              <Icon name="Menu" size={18} />
            </button>
            <nav className="flex min-w-0 items-center gap-1.5 text-sm">
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <span key={i} className="flex min-w-0 items-center gap-1.5">
                    {i > 0 && (
                      <Icon name="ChevronRight" size={14} className="shrink-0 text-zinc-300" />
                    )}
                    {c.href && !last ? (
                      <Link
                        href={c.href}
                        className="truncate text-zinc-500 transition hover:text-zinc-900"
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <span className={last ? "truncate font-semibold text-zinc-900" : "truncate text-zinc-500"}>
                        {c.label}
                      </span>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className="hidden items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 sm:inline-flex"
              title={aiLive ? "Live AI via OpenRouter" : "Built-in generator (set OPENROUTER_API_KEY for live AI)"}
            >
              <Icon name="Sparkles" size={13} className={aiLive ? "text-[var(--brand)]" : "text-zinc-400"} />
              {workspace.aiCredits}
            </span>
            <Link
              href={`/c/${workspace.slug}`}
              target="_blank"
              className="btn-ghost hidden sm:inline-flex"
            >
              <Icon name="Globe" size={15} />
              Changelog
            </Link>
            <NewReleaseButton repos={repos} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
