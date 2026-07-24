import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { exchangeManifestCode, GITHUB_STATE_COOKIE } from "@/lib/github-app";

export const dynamic = "force-dynamic";

// GitHub redirects here after the owner creates the app from our manifest, with a
// single-use `code`. We exchange it for the app's credentials, store them, then send
// the user straight on to install the app and choose repositories.
export async function GET(req: NextRequest) {
  const base = new URL(req.url).origin;
  const back = (query: string) => NextResponse.redirect(`${base}/app/integrations?${query}`, 302);

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${base}/login`, 302);

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get(GITHUB_STATE_COOKIE)?.value;

  // State must match the httpOnly cookie we set — this guards against a forged code
  // being planted into someone else's Relay.
  if (!code || !state || !cookieState || state !== cookieState) {
    return back("error=state");
  }

  try {
    const created = await exchangeManifestCode(code);
    // One app per instance: replace any prior registration.
    await prisma.githubApp.deleteMany({});
    const app = await prisma.githubApp.create({
      data: {
        appId: created.id,
        slug: created.slug,
        name: created.name,
        clientId: created.client_id,
        clientSecret: created.client_secret,
        webhookSecret: created.webhook_secret ?? null,
        privateKey: created.pem,
      },
    });

    // Chain into installation so "set up" flows straight into "pick repositories".
    const installState = crypto.randomUUID();
    const installUrl = `https://github.com/apps/${encodeURIComponent(app.slug)}/installations/new?state=${encodeURIComponent(installState)}`;
    const resp = NextResponse.redirect(installUrl, 302);
    resp.cookies.set(GITHUB_STATE_COOKIE, installState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return resp;
  } catch {
    return back("error=setup");
  }
}
