"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getCurrentUser, getCurrentWorkspace } from "./session";
import { refineAsset } from "./ai";
import { runGenerate, runPublish } from "./release-engine";
import { sendReleaseToSubscribers } from "./notify";
import { getBaseUrl } from "./base-url";
import { createDraftRelease } from "./releases";
import { sampleCommits } from "./sample-commits";
import { AssetType, ChannelType, RefineAction } from "./constants";

function revalidateApp() {
  revalidatePath("/", "layout");
}

/** Conservative email check for values that arrive from a form. */
function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

/**
 * Team management (inviting, removing, changing roles) is restricted to owners and
 * admins. Without this any member could promote an accomplice or remove the owner.
 */
async function requireWorkspaceManager() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const ws = await getCurrentWorkspace();
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId: ws.id } },
    select: { role: true },
  });
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error("You don't have permission to manage this workspace's team.");
  }
  return { user, ws, role: membership.role };
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

export async function publishRelease(
  releaseId: string,
  channels: ChannelType[],
): Promise<{ emailed?: number; emailSkipped?: string }> {
  await assertOwnedRelease(releaseId);
  await runPublish(releaseId, channels);

  // Email is the one channel Relay delivers itself, and only when explicitly chosen.
  if (!channels.includes("email")) return {};

  const result = await sendReleaseToSubscribers(releaseId, getBaseUrl());
  await prisma.publishTarget.updateMany({
    where: { releaseId, channel: "email" },
    data: { status: result.sent > 0 ? "published" : "ready", sentCount: result.sent },
  });
  revalidatePath(`/app/releases/${releaseId}`);
  return { emailed: result.sent, emailSkipped: result.skipped };
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

/** Slugs that would collide with Relay's own routes or look official. */
const RESERVED_SLUGS = new Set([
  "app", "api", "admin", "login", "signup", "logout", "settings", "dashboard",
  "about", "contact", "terms", "privacy", "relay", "www", "new", "c", "help",
  "support", "status", "blog", "docs",
]);

export async function updateWorkspaceSlug(formData: FormData) {
  const ws = await getCurrentWorkspace();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Reject rather than crash: the column is unique, so an unchecked collision would
  // surface as a raw database error page.
  if (slug.length < 2 || slug.length > 40) return;
  if (RESERVED_SLUGS.has(slug)) return;
  if (slug === ws.slug) return;

  const taken = await prisma.workspace.findFirst({
    where: { slug, NOT: { id: ws.id } },
    select: { id: true },
  });
  if (taken) return;

  await prisma.workspace.update({ where: { id: ws.id }, data: { slug } });
  revalidateApp();
}

// --- Team -----------------------------------------------------------------

export async function inviteMember(formData: FormData) {
  const { ws } = await requireWorkspaceManager();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || email.split("@")[0]).trim();
  // Never trust the submitted role: "owner" is not grantable through this form,
  // otherwise any admin could mint another owner.
  const requested = String(formData.get("role") || "member");
  const role = requested === "admin" ? "admin" : "member";
  if (!isEmail(email)) return;

  const user = await prisma.user.upsert({
    where: { email },
    create: { id: randomUUID(), email, name: name || email, emailVerified: false },
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
  const { ws } = await requireWorkspaceManager();
  // Scope to this workspace: a membership id from another workspace must not resolve.
  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, workspaceId: ws.id },
    select: { id: true, role: true },
  });
  if (!membership) throw new Error("Member not found");

  if (membership.role === "owner") {
    const owners = await prisma.membership.count({
      where: { workspaceId: ws.id, role: "owner" },
    });
    if (owners <= 1) throw new Error("You can't remove the last owner of a workspace.");
  }

  await prisma.membership.delete({ where: { id: membership.id } });
  revalidatePath("/app/settings");
}

// --- Public changelog subscribe ------------------------------------------

export async function subscribeToChangelog(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  // This endpoint is public (it powers the changelog subscribe box), so validate
  // the address rather than storing whatever was posted.
  if (!slug || !isEmail(email) || email.length > 254) return;

  const ws = await prisma.workspace.findUnique({ where: { slug } });
  if (!ws) return;

  await prisma.subscriber.upsert({
    where: { workspaceId_email: { workspaceId: ws.id, email } },
    create: { workspaceId: ws.id, email },
    update: {},
  });
  revalidatePath(`/c/${slug}`);
}
