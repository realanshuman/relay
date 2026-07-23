import { prisma } from "./db";

// V1.5 runs single-workspace. This resolves the active workspace for the app shell.
// (Auth / multi-workspace switching is a post-V1.5 concern — see docs/prd-v1.5.md §13.)
export async function getCurrentWorkspace() {
  const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (!ws) {
    throw new Error(
      "No workspace found. Run `npm run setup` (or `npm run db:seed`) to seed the database.",
    );
  }
  return ws;
}

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findUnique({ where: { slug } });
}
