"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getCurrentWorkspace } from "./session";
import { refineAsset } from "./ai";
import { runGenerate, runPublish } from "./release-engine";
import { createDraftRelease } from "./releases";
import { sampleCommits } from "./sample-commits";
import { AssetType, ChannelType, RefineAction } from "./constants";

function revalidateApp() {
  revalidatePath("/", "layout");
}

/**
 * Every release action below is reachable from the browser with an arbitrary id,
 * so each one must prove the release belongs to the caller's workspace first.
 * Without this a signed-in user could read, edit, publish, or delete another
 * workspace's release just by knowing its id.
 */
async function assertOwnedRelease(releaseId: string) {
  const ws = await getCurrentWorkspace();
  const release = await prisma.release.findFirst({
    where: { id: releaseId, workspaceId: ws.id },
    select: { id: true, workspaceId: true },
  });
  if (!release) throw new Error("Release not found");
  return release;
}

/** Same idea for repositories. */
async function assertOwnedRepository(repositoryId: string) {
  const ws = await getCurrentWorkspace();
  const repo = await prisma.repository.findFirst({
    where: { id: repositoryId, workspaceId: ws.id },
    select: { id: true },
  });
  if (!repo) throw new Error("Repository not found");
  return repo;
}

// --- Releases -------------------------------------------------------------

/** Run the full generation pipeline for a release and persist all assets. */
export async function generateRelease(releaseId: string) {
  await assertOwnedRelease(releaseId);
  await runGenerate(releaseId);
}

export async function refineReleaseAsset(
  releaseId: string,
  type: AssetType,
  action: RefineAction,
) {
  await assertOwnedRelease(releaseId);
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
  await assertOwnedRelease(releaseId);
  await prisma.releaseAsset.update({
    where: { releaseId_type: { releaseId, type } },
    data: { content, edited: true },
  });
  revalidatePath(`/app/releases/${releaseId}`);
}

export async function updateReleaseMeta(releaseId: string, data: { title?: string }) {
  await assertOwnedRelease(releaseId);
  const title = data.title?.trim();
  await prisma.release.update({
    where: { id: releaseId },
    data: { title: title ? title.slice(0, 200) : null },
  });
  revalidatePath(`/app/releases/${releaseId}`);
  revalidatePath("/app/releases");
}

export async function publishRelease(releaseId: string, channels: ChannelType[]) {
  await assertOwnedRelease(releaseId);
  await runPublish(releaseId, channels);
}

export async function unpublishRelease(releaseId: string) {
  await assertOwnedRelease(releaseId);
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
  await assertOwnedRelease(releaseId);
  await prisma.release.delete({ where: { id: releaseId } });
  revalidateApp();
  redirect("/app/releases");
}

/** Manual "New release" — simulates a merged PR batch and drafts a release. */
export async function createReleaseForRepo(formData: FormData) {
  const repositoryId = String(formData.get("repositoryId") || "");
  const breaking = formData.get("breaking") === "on";
  if (!repositoryId) return;
  await assertOwnedRepository(repositoryId);

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
  await assertOwnedRepository(repositoryId);
  await prisma.repository.update({
    where: { id: repositoryId },
    data: { autoPublish: value },
  });
  revalidatePath("/app/repositories");
}

export async function removeRepository(repositoryId: string) {
  await assertOwnedRepository(repositoryId);
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
    create: { id: randomUUID(), email, name, emailVerified: false },
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
