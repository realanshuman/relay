import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { generateAssets } from "../lib/ai";
import { deriveTitle, riskForCommits } from "../lib/ai";
import { sampleCommits } from "../lib/sample-commits";
import type { RawCommit } from "../lib/commits";

const prisma = new PrismaClient();

/** Create a Better Auth user; with a password it also gets a credential account for login. */
async function createUser(opts: { email: string; name: string; password?: string }) {
  const user = await prisma.user.create({
    data: { id: randomUUID(), email: opts.email, name: opts.name, emailVerified: true },
  });
  if (opts.password) {
    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: await hashPassword(opts.password),
      },
    });
  }
  return user;
}

const CURATED: Record<string, RawCommit[]> = {
  "api-2.3.0": [
    { sha: "a1b2c3d", message: "feat(api)!: v2 authentication requires scoped tokens", author: "Grace Hopper" },
    { sha: "e4f5061", message: "feat(api): add cursor-based pagination to all list endpoints", author: "Ada Lovelace" },
    { sha: "7a8b9c0", message: "feat(webhooks): retry failed deliveries with backoff", author: "Ken T." },
    { sha: "d1e2f30", message: "perf(api): cache workspace metadata, 40% faster loads", author: "Ada Lovelace" },
    { sha: "112233a", message: "fix(auth): resolve session expiry race condition", author: "Margaret H." },
    { sha: "445566b", message: "docs(readme): document the v2 migration path", author: "Linus T." },
  ],
  "dashboard-1.8.0": [
    { sha: "aa11bb2", message: "feat(dashboard): add customizable widget layout", author: "Margaret H." },
    { sha: "cc33dd4", message: "feat: dark mode across the entire app", author: "Ada Lovelace" },
    { sha: "ee55ff6", message: "perf(render): virtualize long activity lists", author: "Ken T." },
    { sha: "778899a", message: "fix(ui): dropdown clipping inside modals", author: "Grace Hopper" },
  ],
  "website-3.1.0": [
    { sha: "12ab34c", message: "feat(search): fuzzy matching across the docs", author: "Linus T." },
    { sha: "56de78f", message: "feat(blog): add RSS feed and reading time", author: "Ada Lovelace" },
    { sha: "90gh12i", message: "perf: preload critical fonts for faster LCP", author: "Margaret H." },
    { sha: "34jk56l", message: "fix: correct OG image dimensions for social cards", author: "Ken T." },
  ],
};

async function reset() {
  await prisma.publishTarget.deleteMany();
  await prisma.releaseAsset.deleteMany();
  await prisma.commit.deleteMany();
  await prisma.release.deleteMany();
  await prisma.repository.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();
}

async function main() {
  // Idempotent: only seed an empty database. Safe to run on every deploy.
  // Set SEED_FORCE=1 to wipe and reseed.
  const existing = await prisma.workspace.findFirst();
  if (existing && process.env.SEED_FORCE !== "1") {
    console.log(`↩︎  Workspace "${existing.slug}" already exists; skipping seed (SEED_FORCE=1 to reseed).`);
    return;
  }

  await reset();

  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme",
      slug: "acme",
      tagline: "Ship better products, faster.",
      primaryColor: "#6366f1",
      accentColor: "#8b5cf6",
      faviconEmoji: "🚀",
      aiCredits: 472,
    },
  });

  // Team. The demo + owner accounts can sign in (password: relaydemo123);
  // other members are display-only. (Real sign-up creates fresh workspaces.)
  const demo = await createUser({ email: "demo@tryrelay.run", name: "Demo User", password: "relaydemo123" });
  await prisma.membership.create({
    data: { userId: demo.id, workspaceId: workspace.id, role: "owner" },
  });

  const owner = await createUser({ email: "team@genflix.io", name: "You", password: "relaydemo123" });
  await prisma.membership.create({
    data: { userId: owner.id, workspaceId: workspace.id, role: "admin" },
  });

  for (const [email, name, role] of [
    ["grace@acme.dev", "Grace Hopper", "admin"],
    ["ada@acme.dev", "Ada Lovelace", "member"],
  ] as const) {
    const u = await createUser({ email, name });
    await prisma.membership.create({
      data: { userId: u.id, workspaceId: workspace.id, role },
    });
  }

  for (const email of ["dev.reader@example.com", "pm@example.com", "founder@startup.io"]) {
    await prisma.subscriber.create({ data: { workspaceId: workspace.id, email } });
  }

  // Repositories (docs/prd-v1.5.md §4.2)
  const repoData = [
    { name: "Website", branch: "main", auto: true },
    { name: "Backend", branch: "main", auto: false },
    { name: "Dashboard", branch: "release", auto: true },
    { name: "API", branch: "main", auto: false },
  ];
  const repos: Record<string, Awaited<ReturnType<typeof prisma.repository.create>>> = {};
  for (const r of repoData) {
    repos[r.name] = await prisma.repository.create({
      data: {
        name: r.name,
        fullName: `acme/${r.name.toLowerCase()}`,
        targetBranch: r.branch,
        autoPublish: r.auto,
        workspaceId: workspace.id,
        latestCommit: "0000000",
        latestCommitMessage: "Initial import",
        latestCommitAt: new Date(),
      },
    });
  }

  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  interface Plan {
    repo: string;
    version: string;
    commits: RawCommit[];
    date: Date;
    state: "published" | "ready" | "draft";
    channels?: string[];
  }

  const plans: Plan[] = [
    { repo: "API", version: "v2.3.0", commits: CURATED["api-2.3.0"], date: daysAgo(2), state: "published", channels: ["website", "twitter", "linkedin", "email"] },
    { repo: "Dashboard", version: "v1.8.0", commits: CURATED["dashboard-1.8.0"], date: daysAgo(6), state: "published", channels: ["website", "twitter", "discord"] },
    { repo: "Website", version: "v3.1.0", commits: CURATED["website-3.1.0"], date: daysAgo(11), state: "published", channels: ["website", "twitter", "linkedin"] },
    { repo: "Backend", version: "v2.5.0", commits: sampleCommits({ count: 6 }), date: daysAgo(1), state: "ready" },
    { repo: "API", version: "v2.2.0", commits: sampleCommits({ count: 5 }), date: daysAgo(24), state: "published", channels: ["website", "email"] },
    { repo: "Dashboard", version: "v1.7.0", commits: sampleCommits({ count: 4 }), date: daysAgo(31), state: "published", channels: ["website"] },
    { repo: "Website", version: "v3.2.0", commits: sampleCommits({ count: 5, breaking: false }), date: daysAgo(0), state: "draft" },
  ];

  for (const plan of plans) {
    const repo = repos[plan.repo];
    const risk = riskForCommits(plan.commits);
    const title = deriveTitle(plan.commits, plan.version);
    const published = plan.state === "published";

    const release = await prisma.release.create({
      data: {
        version: plan.version,
        title,
        risk,
        status: plan.state === "draft" ? "draft" : plan.state,
        publishStatus: published ? "published" : "unpublished",
        releaseDate: plan.date,
        publishedAt: published ? plan.date : null,
        workspaceId: workspace.id,
        repositoryId: repo.id,
        commits: {
          create: plan.commits.map((c) => ({ sha: c.sha, message: c.message, author: c.author })),
        },
      },
    });

    // Generate assets for everything except drafts.
    if (plan.state !== "draft") {
      const assets = await generateAssets({
        version: plan.version,
        title,
        repositoryName: repo.name,
        workspaceName: workspace.name,
        tagline: workspace.tagline,
        primaryColor: workspace.primaryColor,
        accentColor: workspace.accentColor,
        commits: plan.commits,
      });
      for (const a of assets) {
        await prisma.releaseAsset.create({
          data: { releaseId: release.id, type: a.type, content: a.content, confidence: a.confidence },
        });
      }
      const avg = Math.round(assets.reduce((s, a) => s + a.confidence, 0) / assets.length);
      await prisma.release.update({ where: { id: release.id }, data: { confidence: avg } });
    }

    if (published && plan.channels) {
      for (const channel of plan.channels) {
        await prisma.publishTarget.create({
          data: {
            releaseId: release.id,
            channel,
            status: channel === "website" ? "published" : "ready",
            publishedAt: plan.date,
          },
        });
      }
    }

    // Freshen repo head to this release's top commit.
    const head = plan.commits[0];
    await prisma.repository.update({
      where: { id: repo.id },
      data: {
        latestCommit: head.sha.slice(0, 7),
        latestCommitMessage: head.message.split("\n")[0],
        latestCommitAt: plan.date,
      },
    });
  }

  console.log("✅ Seeded workspace:", workspace.name, `(/c/${workspace.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
