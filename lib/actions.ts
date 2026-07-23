"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getCurrentWorkspace } from "./workspace";
import { generateAssets, refineAsset } from "./ai";
import { createDraftRelease } from "./releases";
import { sampleCommits } from "./sample-commits";
import { AssetType, ChannelType, RefineAction } from "./constants";
import type { RawCommit } from "./commits";

function revalidateApp() {
  revalidatePath("/", "layout");
}

// --- Releases -------------------------------------------------------------

/** Run the full generation pipeline for a release and persist all assets. */
export async function generateRelease(releaseId: string) {
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

export async function refineReleaseAsset(
  releaseId: string,
  type: AssetType,
  action: RefineAction,
) {
  const [asset, release] = await Promise.all([
    prisma.releaseAsset.findUniqueOrThrow({
      where: { releaseId_type: { releaseId, type } },
    }),
    prisma.release.findUniqueOrThrow({
      where: { id: releaseId },
      include: { workspace: true },
    }),
  ]);

  const result = await refineAsset(type, asset.content, action, {
    workspaceName: release.workspace.name,
    version: release.version,
  });

  await prisma.releaseAsset.update({
    where: { releaseId_type: { releaseId, type } },
    data: { content: result.content, confidence: result.confidence, edited: false },
  });

  await prisma.workspace.update({
    where: { id: release.workspaceId },
    data: { aiCredits: { decrement: 1 } },
  });

  revalidatePath(`/app/releases/${releaseId}`);
}

export async function saveReleaseAsset(releaseId: string, type: AssetType, content: string) {
  await prisma.releaseAsset.update({
    where: { releaseId_type: { releaseId, type } },
    data: { content, edited: true },
  });
  revalidatePath(`/app/releases/${releaseId}`);
}

export async function updateReleaseMeta(releaseId: string, data: { title?: string }) {
  await prisma.release.update({ where: { id: releaseId }, data });
  revalidatePath(`/app/releases/${releaseId}`);
}

export async function publishRelease(releaseId: string, channels: ChannelType[]) {
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

export async function unpublishRelease(releaseId: string) {
  await prisma.$transaction([
    prisma.publishTarget.deleteMany({ where: { releaseId } }),
    prisma.release.update({
      where: { id: releaseId },
      data: { status: "ready", publishStatus: "unpublished", publishedAt: null },
    }),
  ]);
  revalidateApp();
}

export async function deleteRelease(releaseId: string) {
  await prisma.release.delete({ where: { id: releaseId } });
  revalidateApp();
  redirect("/app/releases");
}

/** Manual "New release" — simulates a merged PR batch and drafts a release. */
export async function createReleaseForRepo(formData: FormData) {
  const repositoryId = String(formData.get("repositoryId") || "");
  const breaking = formData.get("breaking") === "on";
  if (!repositoryId) return;

  const release = await createDraftRelease({
    repositoryId,
    commits: sampleCommits({ breaking }),
  });

  revalidateApp();
  redirect(`/app/releases/${release.id}`);
}

// --- Repositories ---------------------------------------------------------

export async function addRepository(formData: FormData) {
  const ws = await getCurrentWorkspace();
  const fullName = String(formData.get("fullName") || "").trim();
  const targetBranch = String(formData.get("targetBranch") || "main").trim() || "main";
  if (!fullName) return;

  const name = fullName.includes("/") ? fullName.split("/")[1] : fullName;

  await prisma.repository.create({
    data: {
      name,
      fullName: fullName.includes("/") ? fullName : `${ws.slug}/${fullName}`,
      targetBranch,
      workspaceId: ws.id,
      connected: true,
    },
  });
  revalidateApp();
}

export async function toggleAutoPublish(repositoryId: string, value: boolean) {
  await prisma.repository.update({
    where: { id: repositoryId },
    data: { autoPublish: value },
  });
  revalidatePath("/app/repositories");
}

export async function removeRepository(repositoryId: string) {
  await prisma.repository.delete({ where: { id: repositoryId } });
  revalidateApp();
}

// --- Settings / Branding --------------------------------------------------

export async function updateBranding(formData: FormData) {
  const ws = await getCurrentWorkspace();
  await prisma.workspace.update({
    where: { id: ws.id },
    data: {
      name: String(formData.get("name") || ws.name),
      tagline: String(formData.get("tagline") || ""),
      primaryColor: String(formData.get("primaryColor") || ws.primaryColor),
      accentColor: String(formData.get("accentColor") || ws.accentColor),
      faviconEmoji: String(formData.get("faviconEmoji") || ws.faviconEmoji),
      customDomain: String(formData.get("customDomain") || "") || null,
    },
  });
  revalidateApp();
}

export async function updateWorkspaceSlug(formData: FormData) {
  const ws = await getCurrentWorkspace();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  if (!slug) return;
  await prisma.workspace.update({ where: { id: ws.id }, data: { slug } });
  revalidateApp();
}

// --- Team -----------------------------------------------------------------

export async function inviteMember(formData: FormData) {
  const ws = await getCurrentWorkspace();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || email.split("@")[0]).trim();
  const role = String(formData.get("role") || "member");
  if (!email) return;

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name },
    update: {},
  });

  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: ws.id } },
    create: { userId: user.id, workspaceId: ws.id, role },
    update: { role },
  });
  revalidatePath("/app/settings");
}

export async function removeMember(membershipId: string) {
  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath("/app/settings");
}

// --- Public changelog subscribe ------------------------------------------

export async function subscribeToChangelog(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !slug) return;

  const ws = await prisma.workspace.findUnique({ where: { slug } });
  if (!ws) return;

  await prisma.subscriber.upsert({
    where: { workspaceId_email: { workspaceId: ws.id, email } },
    create: { workspaceId: ws.id, email },
    update: {},
  });
  revalidatePath(`/c/${slug}`);
}
