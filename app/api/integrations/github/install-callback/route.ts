import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/session";
import { getGithubApp, getInstallationAccountLogin, GITHUB_STATE_COOKIE } from "@/lib/github-app";

export const dynamic = "force-dynamic";

// GitHub redirects here after the user installs the app and selects repositories,
// with `installation_id`. We record it on the workspace so we can list/act on repos.
export async function GET(req: NextRequest) {
  const base = new URL(req.url).origin;

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${base}/login`, 302);

  const installationId = req.nextUrl.searchParams.get("installation_id");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get(GITHUB_STATE_COOKIE)?.value;

  // State is verified when present (GitHub echoes it back); installation_id isn't a secret.
  if (state && cookieState && state !== cookieState) {
    return NextResponse.redirect(`${base}/app/integrations?error=state`, 302);
  }
  if (!installationId || Number.isNaN(Number(installationId))) {
    return NextResponse.redirect(`${base}/app/integrations?error=install`, 302);
  }

  const ws = await getCurrentWorkspace();
  const app = await getGithubApp();
  let login: string | null = null;
  if (app) {
    login = await getInstallationAccountLogin(app, Number(installationId));
  }

  await prisma.workspace.update({
    where: { id: ws.id },
    data: { githubInstallationId: Number(installationId), githubAccountLogin: login },
  });

  return NextResponse.redirect(`${base}/app/integrations?installed=1`, 302);
}
