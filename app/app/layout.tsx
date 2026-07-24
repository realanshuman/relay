import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { aiEnabled } from "@/lib/ai";

// The app is DB-driven; always render against current data.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const workspace = await getCurrentWorkspace();
  const repos = await prisma.repository.findMany({
    where: { workspaceId: workspace.id, connected: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, targetBranch: true },
  });

  return (
    <AppShell
      workspace={{
        name: workspace.name,
        slug: workspace.slug,
        faviconEmoji: workspace.faviconEmoji,
        aiCredits: workspace.aiCredits,
        primaryColor: workspace.primaryColor,
      }}
      user={{ name: user.name, email: user.email }}
      repos={repos}
      aiLive={aiEnabled()}
    >
      {children}
    </AppShell>
  );
}
