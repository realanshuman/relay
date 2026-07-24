import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { createDraftRelease } from "@/lib/releases";
import { generateRelease, publishRelease } from "@/lib/actions";
import type { RawCommit } from "@/lib/commits";
import type { ChannelType } from "@/lib/constants";

export const dynamic = "force-dynamic";

function matchesSecret(body: string, signature: string, secret: string): boolean {
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function verifySignature(body: string, signature: string | null): Promise<boolean> {
  const secrets: string[] = [];
  if (process.env.GITHUB_WEBHOOK_SECRET) secrets.push(process.env.GITHUB_WEBHOOK_SECRET);
  // The GitHub App (created via the manifest flow) has its own webhook secret in the DB.
  try {
    const app = await prisma.githubApp.findFirst({ select: { webhookSecret: true } });
    if (app?.webhookSecret) secrets.push(app.webhookSecret);
  } catch {
    /* DB unavailable — fall through to env-only check */
  }
  if (secrets.length === 0) return true; // no secret configured → allow (dev/manual testing)
  if (!signature) return false;
  return secrets.some((secret) => matchesSecret(body, signature, secret));
}

/**
 * Automatic Release Detection (docs/prd-v1.5.md §9.1.2).
 * Point a GitHub webhook (push + pull_request events) at this endpoint. On a push to
 * a repository's target branch, Relay drafts a release; if Auto Publish is on, it also
 * generates and publishes automatically.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  if (!(await verifySignature(raw, signature))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event") ?? "push";
  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fullName: string | undefined = payload?.repository?.full_name;
  if (!fullName) {
    return Response.json({ error: "Missing repository" }, { status: 400 });
  }

  const repo = await prisma.repository.findFirst({
    where: { fullName, connected: true },
  });
  if (!repo) {
    return Response.json({ skipped: `Repository ${fullName} not connected` }, { status: 202 });
  }

  let commits: RawCommit[] = [];
  let version: string | undefined;

  if (event === "push") {
    const ref: string = payload.ref ?? "";
    if (ref !== `refs/heads/${repo.targetBranch}`) {
      return Response.json({ skipped: `Ignoring ref ${ref}` }, { status: 202 });
    }
    commits = ((payload.commits ?? []) as any[])
      .map((c) => ({
        sha: String(c.id ?? "").slice(0, 7),
        message: String(c.message ?? ""),
        author: String(c.author?.name ?? c.author?.username ?? "unknown"),
      }))
      .reverse(); // newest first
  } else if (event === "pull_request") {
    if (!(payload.action === "closed" && payload.pull_request?.merged)) {
      return Response.json({ skipped: "PR not merged" }, { status: 202 });
    }
    const pr = payload.pull_request;
    if (pr.base?.ref && pr.base.ref !== repo.targetBranch) {
      return Response.json({ skipped: `PR not into ${repo.targetBranch}` }, { status: 202 });
    }
    commits = [
      {
        sha: String(pr.merge_commit_sha ?? pr.head?.sha ?? "").slice(0, 7),
        message: String(pr.title ?? "Merged pull request"),
        author: String(pr.user?.login ?? "unknown"),
      },
    ];
  } else {
    return Response.json({ skipped: `Unhandled event ${event}` }, { status: 202 });
  }

  if (commits.length === 0) {
    return Response.json({ skipped: "No commits" }, { status: 202 });
  }

  const release = await createDraftRelease({ repositoryId: repo.id, version, commits });

  // Auto Publish: run the full pipeline and publish to the website + prepared channels.
  if (repo.autoPublish) {
    try {
      await generateRelease(release.id);
      await publishRelease(release.id, [
        "website",
        "twitter",
        "linkedin",
        "email",
      ] as ChannelType[]);
    } catch (err) {
      return Response.json(
        { releaseId: release.id, autoPublish: "failed", detail: String(err) },
        { status: 200 },
      );
    }
  }

  return Response.json(
    {
      releaseId: release.id,
      version: release.version,
      status: repo.autoPublish ? "published" : "draft",
    },
    { status: 201 },
  );
}
