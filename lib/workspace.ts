import { prisma } from "./db";
import { getCurrentUser } from "./auth";

/**
 * Resolves the active workspace for the signed-in user (V1.5 = one workspace per user).
 * Every account gets its own workspace, so no two users share data.
 */
export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { workspace: true },
  });
  if (!membership) {
    // A signed-in user with no workspace shouldn't happen (sign-up creates one),
    // but self-heal rather than 500.
    return createWorkspaceForUser(user.id, user.name);
  }
  return membership.workspace;
}

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findUnique({ where: { slug } });
}

/** Generate a URL-safe slug that isn't already taken. */
export async function uniqueSlug(base: string): Promise<string> {
  const root =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "workspace";
  let candidate = root;
  for (let i = 2; await prisma.workspace.findUnique({ where: { slug: candidate } }); i++) {
    candidate = `${root}-${i}`;
  }
  return candidate;
}

/** Create a fresh, empty workspace owned by the user. */
export async function createWorkspaceForUser(userId: string, personName: string) {
  const first = personName.trim().split(/\s+/)[0] || "My";
  const name = `${first}'s Workspace`;
  const slug = await uniqueSlug(first);

  const workspace = await prisma.workspace.create({
    data: { name, slug, aiCredits: 100 },
  });
  await prisma.membership.create({
    data: { userId, workspaceId: workspace.id, role: "owner" },
  });
  return workspace;
}
