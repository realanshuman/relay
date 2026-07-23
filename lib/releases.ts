import { prisma } from "./db";
import { deriveTitle, riskForCommits } from "./ai";
import type { RawCommit } from "./commits";

/** Suggest the next semver-ish version for a repo based on its latest release. */
export async function suggestNextVersion(
  repositoryId: string,
  bump: "minor" | "patch" | "major" = "minor",
): Promise<string> {
  const last = await prisma.release.findFirst({
    where: { repositoryId },
    orderBy: { createdAt: "desc" },
  });
  if (!last) return "v1.0.0";
  const m = last.version.match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (!m) return "v1.0.0";
  let [major, minor, patch] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (bump === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `v${major}.${minor}.${patch}`;
}

interface CreateReleaseInput {
  repositoryId: string;
  version?: string;
  commits: RawCommit[];
}

/**
 * Automatic Release Detection (docs/prd-v1.5.md §9.1.2): create a draft release from a
 * set of commits. Shared by the GitHub webhook and the manual "new release" action.
 */
export async function createDraftRelease({ repositoryId, version, commits }: CreateReleaseInput) {
  const repo = await prisma.repository.findUniqueOrThrow({ where: { id: repositoryId } });
  const resolvedVersion = version || (await suggestNextVersion(repositoryId));
  const risk = riskForCommits(commits);
  const title = deriveTitle(commits, resolvedVersion);

  const release = await prisma.release.create({
    data: {
      version: resolvedVersion,
      title,
      status: "draft",
      publishStatus: "unpublished",
      risk,
      workspaceId: repo.workspaceId,
      repositoryId: repo.id,
      commits: {
        create: commits.map((c) => ({
          sha: c.sha,
          message: c.message,
          author: c.author,
        })),
      },
    },
  });

  // Keep the repository's "latest commit" pointer fresh.
  const head = commits[0];
  if (head) {
    await prisma.repository.update({
      where: { id: repo.id },
      data: {
        latestCommit: head.sha.slice(0, 7),
        latestCommitMessage: head.message.split("\n")[0],
        latestCommitAt: new Date(),
      },
    });
  }

  return release;
}
