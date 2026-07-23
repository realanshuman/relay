import { prisma } from "./db";

// Leaf module (imports only prisma) so both the Better Auth config and the
// session helpers can use it without an import cycle.

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findUnique({ where: { slug } });
}

export async function getWorkspaceForUser(userId: string) {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { workspace: true },
  });
  return membership?.workspace ?? null;
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

/** Create a fresh, empty workspace owned by the user (used on sign-up). */
export async function createWorkspaceForUser(userId: string, personName: string) {
  const first = (personName || "My").trim().split(/\s+/)[0] || "My";
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
