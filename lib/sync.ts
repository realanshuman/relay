// Automatic release detection by polling.
//
// Relay detects new work two ways:
//   1. Push / merged-PR webhooks from the GitHub App (instant, see
//      app/api/webhooks/github/route.ts).
//   2. This poller, which asks GitHub "what landed on the release branch since the
//      commit I last saw?" It is the safety net when a webhook is missed, powers the
//      "Check for updates" button, and runs on a schedule via /api/cron/sync.
//
// Both paths converge on createDraftRelease, so a release looks the same either way.
// Server-only: reads installation credentials.
import { prisma } from "./db";
import { getGithubApp, getInstallationToken, listRepoCommits } from "./github-app";
import { createDraftRelease } from "./releases";
import { generateRelease, publishRelease } from "./actions";
import type { ChannelType } from "./constants";

export type RepoSyncResult = {
  repositoryId: string;
  fullName: string;
  status: "created" | "up_to_date" | "skipped" | "error";
  newCommits: number;
  releaseId?: string;
  version?: string;
  detail?: string;
};

/**
 * Check one repository for new commits on its target branch and draft a release
 * when there are any. Idempotent: with no new commits it does nothing.
 */
export async function syncRepository(repositoryId: string): Promise<RepoSyncResult> {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: { workspace: { select: { githubInstallationId: true } } },
  });
  if (!repo) {
    return { repositoryId, fullName: "", status: "error", newCommits: 0, detail: "Repository not found" };
  }

  const base: Omit<RepoSyncResult, "status" | "newCommits"> = {
    repositoryId: repo.id,
    fullName: repo.fullName,
  };

  if (!repo.connected) {
    return { ...base, status: "skipped", newCommits: 0, detail: "Repository is disconnected" };
  }

  const installationId = repo.workspace.githubInstallationId;
  if (!installationId) {
    return { ...base, status: "skipped", newCommits: 0, detail: "GitHub is not connected" };
  }

  const app = await getGithubApp();
  if (!app) {
    return { ...base, status: "skipped", newCommits: 0, detail: "GitHub app is not configured" };
  }

  let commits;
  try {
    const token = await getInstallationToken(app, installationId);
    commits = await listRepoCommits(token, repo.fullName, repo.targetBranch, repo.latestCommit);
  } catch (err) {
    return {
      ...base,
      status: "error",
      newCommits: 0,
      detail: err instanceof Error ? err.message : "Could not reach GitHub",
    };
  }

  if (commits.length === 0) {
    await prisma.repository.update({ where: { id: repo.id }, data: { lastSyncedAt: new Date() } });
    return { ...base, status: "up_to_date", newCommits: 0 };
  }

  // First sync of a brand-new repo: record where we are without inventing a release
  // out of the entire git history.
  if (!repo.latestCommit) {
    const head = commits[0];
    await prisma.repository.update({
      where: { id: repo.id },
      data: {
        latestCommit: head.sha.slice(0, 7),
        latestCommitMessage: head.message.split("\n")[0],
        latestCommitAt: head.date ? new Date(head.date) : new Date(),
        lastSyncedAt: new Date(),
      },
    });
    return {
      ...base,
      status: "up_to_date",
      newCommits: 0,
      detail: "Baseline set. The next merge creates a release.",
    };
  }

  const release = await createDraftRelease({
    repositoryId: repo.id,
    commits: commits.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.message.split("\n")[0],
      author: c.author,
    })),
  });

  await prisma.repository.update({ where: { id: repo.id }, data: { lastSyncedAt: new Date() } });

  if (repo.autoPublish) {
    try {
      await generateRelease(release.id);
      await publishRelease(release.id, ["website"] as ChannelType[]);
    } catch {
      /* leave it as a draft; the user can generate manually */
    }
  }

  return {
    ...base,
    status: "created",
    newCommits: commits.length,
    releaseId: release.id,
    version: release.version,
  };
}

/** Check every connected repository in a workspace. */
export async function syncWorkspace(workspaceId: string): Promise<RepoSyncResult[]> {
  const repos = await prisma.repository.findMany({
    where: { workspaceId, connected: true },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const out: RepoSyncResult[] = [];
  for (const r of repos) out.push(await syncRepository(r.id));
  return out;
}

/** Check every connected repository across all workspaces that have GitHub linked. */
export async function syncAllWorkspaces(): Promise<RepoSyncResult[]> {
  const repos = await prisma.repository.findMany({
    where: { connected: true, workspace: { githubInstallationId: { not: null } } },
    select: { id: true },
  });
  const out: RepoSyncResult[] = [];
  for (const r of repos) out.push(await syncRepository(r.id));
  return out;
}
