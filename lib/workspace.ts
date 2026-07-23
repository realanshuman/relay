import { prisma } from "./db";

// V1.5 runs single-workspace. This resolves the active workspace for the app shell.
// (Auth / multi-workspace switching is a post-V1.5 concern — see docs/prd-v1.5.md §13.)
export async function getCurrentWorkspace() {
  const ws = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (ws) return ws;

  // Safety net: never 500 on an un-seeded database. Bootstrap a bare workspace
  // (the demo repos/releases come from `npm run db:seed`). Upsert avoids races
  // between concurrent first requests.
  return prisma.workspace.upsert({
    where: { slug: "acme" },
    update: {},
    create: {
      name: "Acme",
      slug: "acme",
      tagline: "Ship better products, faster.",
    },
  });
}

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findUnique({ where: { slug } });
}
