"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { getCurrentUser, getCurrentWorkspace } from "./session";
import { getBaseUrl } from "./base-url";
import type { GithubRepoOption, LoadReposError } from "./integrations-types";
import {
  GITHUB_STATE_COOKIE,
  getGithubApp,
  buildManifest,
  getInstallationToken,
  listInstallationRepos,
  deleteInstallation,
} from "./github-app";

function newState(): string {
  const state = crypto.randomUUID();
  cookies().set(GITHUB_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return state;
}

function appHost(): string {
  return (process.env.BETTER_AUTH_URL || getBaseUrl()).replace(/\/$/, "");
}

/** A GitHub-app name that's likely unique (global on GitHub); the user can still edit it. */
function suggestedAppName(workspaceName: string): string {
  const clean = workspaceName
    .replace(/[^A-Za-z0-9 .-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 26);
  return `${clean || "Relay"} Releases`;
}

/**
 * Step 1 (one-time): start creating the Relay GitHub App from a manifest. Returns the
 * GitHub URL to POST to and the manifest JSON; the client submits a form so GitHub shows
 * a pre-filled "Create app" screen. GitHub then posts the keys back to our callback.
 */
export async function beginGithubSetup(): Promise<
  { ok: true; url: string; manifest: string } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const ws = await getCurrentWorkspace();
  const state = newState();
  const manifest = JSON.stringify(buildManifest(appHost(), suggestedAppName(ws.name)));
  const url = `https://github.com/settings/apps/new?state=${encodeURIComponent(state)}`;
  return { ok: true, url, manifest };
}

/** Step 2: send the user to GitHub to install the app and pick repositories. */
export async function beginGithubInstall(): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const app = await getGithubApp();
  if (!app) return { ok: false, error: "Set up the GitHub app first." };
  const state = newState();
  const url = `https://github.com/apps/${encodeURIComponent(app.slug)}/installations/new?state=${encodeURIComponent(state)}`;
  return { ok: true, url };
}

type LoadResult = { ok: true; repos: GithubRepoOption[] } | { ok: false; error: LoadReposError };

/** Fetch the installation's repositories, flagged with what's already imported. */
export async function loadInstallationRepos(): Promise<LoadResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "not_signed_in" };

  const app = await getGithubApp();
  if (!app) return { ok: false, error: "no_app" };

  const ws = await getCurrentWorkspace();
  if (!ws.githubInstallationId) return { ok: false, error: "not_installed" };

  let token: string;
  try {
    token = await getInstallationToken(app, ws.githubInstallationId);
  } catch {
    return { ok: false, error: "token_failed" };
  }

  let repos;
  try {
    repos = await listInstallationRepos(token);
  } catch {
    return { ok: false, error: "fetch_failed" };
  }

  const existing = new Set(
    (await prisma.repository.findMany({ where: { workspaceId: ws.id }, select: { fullName: true } })).map(
      (r) => r.fullName,
    ),
  );

  return { ok: true, repos: repos.map((r) => ({ ...r, imported: existing.has(r.fullName) })) };
}

/** Import the selected GitHub repositories into the current workspace (skips duplicates). */
export async function importGithubRepos(
  items: { fullName: string; defaultBranch: string }[],
): Promise<{ imported: number }> {
  const ws = await getCurrentWorkspace();
  const existing = new Set(
    (await prisma.repository.findMany({ where: { workspaceId: ws.id }, select: { fullName: true } })).map(
      (r) => r.fullName,
    ),
  );

  const seen = new Set<string>();
  const toCreate = items
    .filter((i) => {
      const fn = i.fullName?.trim();
      if (!fn || !fn.includes("/") || existing.has(fn) || seen.has(fn)) return false;
      seen.add(fn);
      return true;
    })
    .map((i) => ({
      name: i.fullName.split("/")[1] || i.fullName,
      fullName: i.fullName.trim(),
      targetBranch: i.defaultBranch?.trim() || "main",
      provider: "github",
      connected: true,
      workspaceId: ws.id,
    }));

  if (toCreate.length) {
    await prisma.repository.createMany({ data: toCreate });
  }

  revalidatePath("/app/integrations");
  revalidatePath("/app/repositories");
  revalidatePath("/app");
  return { imported: toCreate.length };
}

/** Disconnect: uninstall on GitHub (best-effort) and clear the workspace's installation. */
export async function disconnectGithubInstall(): Promise<{ ok: boolean }> {
  const ws = await getCurrentWorkspace();
  const app = await getGithubApp();
  if (app && ws.githubInstallationId) {
    await deleteInstallation(app, ws.githubInstallationId);
  }
  await prisma.workspace.update({
    where: { id: ws.id },
    data: { githubInstallationId: null, githubAccountLogin: null },
  });
  revalidatePath("/app/integrations");
  return { ok: true };
}
