import { prisma } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * One-click unsubscribe from a release announcement. The link is signed per
 * workspace + address, so it can only ever remove the person who received it.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const workspaceId = url.searchParams.get("w") ?? "";
  const email = (url.searchParams.get("e") ?? "").toLowerCase();
  const token = url.searchParams.get("t") ?? "";

  const page = (title: string, body: string) =>
    new Response(
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
       <title>${title}</title>
       <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:420px;margin:80px auto;padding:0 24px;text-align:center">
         <h1 style="font-size:20px;color:#18181b;margin:0 0 8px">${title}</h1>
         <p style="color:#52525b;line-height:1.6;margin:0">${body}</p>
       </div>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );

  if (!workspaceId || !email || !verifyUnsubscribeToken(workspaceId, email, token)) {
    return page("Link not valid", "This unsubscribe link is invalid or has expired.");
  }

  await prisma.subscriber.deleteMany({ where: { workspaceId, email } });
  return page(
    "You're unsubscribed",
    "You won't receive any more release emails from this changelog.",
  );
}

/** Mail clients that honour RFC 8058 POST to the same URL. */
export async function POST(req: Request) {
  return GET(req);
}
