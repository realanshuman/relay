import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { getGithubApp } from "@/lib/github-app";
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
  // The official Relay GitHub App's webhook secret (env-provided or stored by setup).
  try {
    const app = await getGithubApp();
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

  // The same repository can be imported by several workspaces; every one of them
  // should get its own draft. (Previously only the first match was notified.)
  const repos = await prisma.repository.findMany({
    where: { fullName, connected: true },
  });
  if (repos.length === 0) {
    return Response.json({ skipped: `Repository ${fullName} not connected` }, { status: 202 });
  }

  /** Pull the commit list for this event, relative to one repo's target branch. */
  function commitsFor(targetBranch: string): RawCommit[] | { skip: string } {
    if (event === "push") {
      const ref: string = payload.ref ?? "";
      if (ref !== `refs/heads/${targetBranch}`) return { skip: `Ignoring ref ${ref}` };
      return ((payload.commits ?? []) as any[])
        .map((c) => ({
          sha: String(c.id ?? "").slice(0, 7),
          message: String(c.message ?? "").split("\n")[0],
          author: String(c.author?.name ?? c.author?.username ?? "unknown"),
        }))
        .reverse(); // newest first
    }
    if (event === "pull_request") {
      if (!(payload.action === "closed" && payload.pull_request?.merged)) {
        return { skip: "PR not merged" };
      }
      const pr = payload.pull_request;
      if (pr.base?.ref && pr.base.ref !== targetBranch) {
        return { skip: `PR not into ${targetBranch}` };
      }
      return [
        {
          sha: String(pr.merge_commit_sha ?? pr.head?.sha ?? "").slice(0, 7),
          message: String(pr.title ?? "Merged pull request"),
          author: String(pr.user?.login ?? "unknown"),
        },
      ];
    }
    return { skip: `Unhandled event ${event}` };
  }

  const results: Array<Record<string, unknown>> = [];

  for (const repo of repos) {
    const commits = commitsFor(repo.targetBranch);
    if (!Array.isArray(commits)) {
      results.push({ repositoryId: repo.id, skipped: commits.skip });
      continue;
    }
    if (commits.length === 0) {
      results.push({ repositoryId: repo.id, skipped: "No commits" });
      continue;
    }

    const release = await createDraftRelease({ repositoryId: repo.id, commits });
    await prisma.repository.update({
      where: { id: repo.id },
      data: { lastSyncedAt: new Date() },
    });

    let status = "draft";
    if (repo.autoPublish) {
      try {
        await generateRelease(release.id);
        await publishRelease(release.id, [
          "website",
          "twitter",
          "linkedin",
          "email",
        ] as ChannelType[]);
        status = "published";
      } catch (err) {
        results.push({
          repositoryId: repo.id,
          releaseId: release.id,
          autoPublish: "failed",
          detail: String(err),
        });
        continue;
      }
    }

    results.push({
      repositoryId: repo.id,
      releaseId: release.id,
      version: release.version,
      status,
    });
  }

  const created = results.filter((r) => r.releaseId).length;
  return Response.json({ received: repos.length, created, results }, { status: created ? 201 : 202 });
}
