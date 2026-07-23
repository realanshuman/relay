import { prisma } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { RepositoriesView } from "@/components/repositories-view";

export const metadata = { title: "Repositories" };

export default async function RepositoriesPage() {
  const ws = await getCurrentWorkspace();
  const repos = await prisma.repository.findMany({
    where: { workspaceId: ws.id },
    orderBy: { createdAt: "asc" },
    include: {
      releases: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { version: true },
      },
    },
  });

  const shaped = repos.map((r) => ({
    id: r.id,
    name: r.name,
    fullName: r.fullName,
    targetBranch: r.targetBranch,
    autoPublish: r.autoPublish,
    connected: r.connected,
    latestCommit: r.latestCommit,
    latestCommitMessage: r.latestCommitMessage,
    latestCommitAt: r.latestCommitAt,
    latestReleaseVersion: r.releases[0]?.version ?? null,
  }));

  return (
    <div>
      <PageHeader
        title="Repositories"
        subtitle="Connect GitHub repositories. Relay drafts a release whenever the target branch is updated."
        icon="Package"
      />
      <RepositoriesView repos={shaped} />
    </div>
  );
}
