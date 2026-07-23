import Link from "next/link";
import { getCurrentWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { NewReleaseButton } from "@/components/new-release-button";
import { Icon } from "@/components/ui";
import { aiEnabled } from "@/lib/ai";

// The app is DB-driven; always render against current data.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getCurrentWorkspace();
  const repos = await prisma.repository.findMany({
    where: { workspaceId: workspace.id, connected: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, targetBranch: true },
  });

  const brandStyle = {
    ["--brand" as string]: workspace.primaryColor,
    ["--brand-soft" as string]: `color-mix(in srgb, ${workspace.primaryColor} 12%, white)`,
  } as React.CSSProperties;

  return (
    <div style={brandStyle} className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar
        workspaceName={workspace.name}
        faviconEmoji={workspace.faviconEmoji}
        slug={workspace.slug}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="text-base leading-none">{workspace.faviconEmoji}</span>
            <span className="font-medium text-zinc-700">{workspace.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600"
              title={aiEnabled() ? "Live AI via OpenRouter" : "Deterministic generator (add OPENROUTER_API_KEY for live AI)"}
            >
              <Icon
                name="Sparkles"
                size={13}
                className={aiEnabled() ? "text-[var(--brand)]" : "text-zinc-400"}
              />
              {workspace.aiCredits} credits
            </div>
            <Link
              href={`/c/${workspace.slug}`}
              target="_blank"
              className="btn-ghost hidden sm:inline-flex"
            >
              <Icon name="Globe" size={15} />
              View changelog
            </Link>
            <NewReleaseButton repos={repos} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
