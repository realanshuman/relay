import { syncAllWorkspaces } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Scheduled release detection: polls every connected repository for new commits on
 * its target branch and drafts releases for anything new. This is the backstop for
 * missed webhooks, and it makes detection work even before webhooks are verified.
 *
 * Wire it up with a Vercel Cron (see vercel.json). Protect it by setting CRON_SECRET;
 * Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>`. Without the variable
 * set the endpoint stays open, which is fine for a private preview but should be set
 * in production.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const started = Date.now();
  try {
    const results = await syncAllWorkspaces();
    const created = results.filter((r) => r.status === "created");
    return Response.json({
      ok: true,
      checked: results.length,
      created: created.length,
      releases: created.map((r) => ({ repo: r.fullName, version: r.version, id: r.releaseId })),
      ms: Date.now() - started,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 },
    );
  }
}
