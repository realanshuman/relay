// The generation and publishing engine.
//
// These functions do the work and perform NO permission checks, because they are
// also driven by trusted server-side callers with no user session: the GitHub
// webhook and the scheduled sync.
//
// Anything reachable from the browser must go through lib/actions.ts, which checks
// that the release belongs to the caller's workspace before delegating here.
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { generateAssets } from "./ai";
import type { AssetType, ChannelType } from "./constants";
import type { RawCommit } from "./commits";

function revalidateApp() {
  revalidatePath("/", "layout");
}

/** Run the full generation pipeline for a release and persist all assets. */
export async function runGenerate(releaseId: string) {
  const release = await prisma.release.findUniqueOrThrow({
    where: { id: releaseId },
    include: { commits: true, repository: true, workspace: true },
  });

  await prisma.release.update({ where: { id: releaseId }, data: { status: "generating" } });

  const commits: RawCommit[] = release.commits.map((c) => ({
    sha: c.sha,
    message: c.message,
    author: c.author,
  }));

  const assets = await generateAssets({
    version: release.version,
    title: release.title,
    repositoryName: release.repository.name,
    workspaceName: release.workspace.name,
    tagline: release.workspace.tagline,
    primaryColor: release.workspace.primaryColor,
    accentColor: release.workspace.accentColor,
    commits,
  });

  for (const asset of assets) {
    await prisma.releaseAsset.upsert({
      where: { releaseId_type: { releaseId, type: asset.type } },
      create: {
        releaseId,
        type: asset.type,
        content: asset.content,
        confidence: asset.confidence,
      },
      update: { content: asset.content, confidence: asset.confidence, edited: false },
    });
  }

  const avg = Math.round(
    assets.reduce((sum, a) => sum + a.confidence, 0) / Math.max(assets.length, 1),
  );

  await prisma.release.update({
    where: { id: releaseId },
    data: { status: "ready", confidence: avg },
  });

  // AI credits: one credit per generated asset.
  await prisma.workspace.update({
    where: { id: release.workspaceId },
    data: { aiCredits: { decrement: assets.length } },
  });

  revalidateApp();
}

/** Mark a release published and record its channel targets. */
export async function runPublish(releaseId: string, channels: ChannelType[]) {
  const chosen = channels.length ? channels : (["website"] as ChannelType[]);

  await prisma.$transaction([
    ...chosen.map((channel) =>
      prisma.publishTarget.upsert({
        where: { releaseId_channel: { releaseId, channel } },
        create: {
          releaseId,
          channel,
          status: channel === "website" ? "published" : "ready",
          publishedAt: new Date(),
        },
        update: {
          status: channel === "website" ? "published" : "ready",
          publishedAt: new Date(),
        },
      }),
    ),
    prisma.release.update({
      where: { id: releaseId },
      data: { status: "published", publishStatus: "published", publishedAt: new Date() },
    }),
  ]);

  revalidateApp();
}

export type { AssetType, ChannelType };
