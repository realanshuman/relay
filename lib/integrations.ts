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
  isInstanceOperator,
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
  // One official app per instance. Once it exists, nobody can replace it from the
  // UI (that would break every other user's installation) — users just install it.
  if (await getGithubApp()) {
    return { ok: false, error: "GitHub is already set up for Relay. Use Connect GitHub instead." };
  }
  if (!(await isInstanceOperator(user))) {
    return { ok: false, error: "Only the Relay instance owner can set up the GitHub app." };
  }
  const state = newState();
  const manifest = JSON.stringify(buildManifest(appHost(), "Relay Releases"));
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

/**
 * Clear the registered GitHub App so the one-time setup can run again.
 *
 * Guarded so this can't quietly break other people: refused when the credentials
 * come from environment variables, and refused when any OTHER workspace still has
 * the app installed (resetting would disconnect them).
 */
export async function resetGithubSetup(): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const app = await getGithubApp();
  if (!app) return { ok: true };

  // The shared registration belongs to the instance, not to any one user.
  if (!(await isInstanceOperator(user))) {
    return { ok: false, error: "Only the Relay instance owner can change this." };
  }

  if (app.source === "env") {
    return {
      ok: false,
      error:
        "These credentials come from environment variables. Remove the GITHUB_APP_* variables to change them.",
    };
  }

  const ws = await getCurrentWorkspace();
  const otherInstalls = await prisma.workspace.count({
    where: { githubInstallationId: { not: null }, id: { not: ws.id } },
  });
  if (otherInstalls > 0) {
    return {
      ok: false,
      error: `Can't reset: ${otherInstalls} other workspace${
        otherInstalls > 1 ? "s have" : " has"
      } this app installed, and resetting would disconnect them.`,
    };
  }

  await prisma.githubApp.deleteMany({});
  await prisma.workspace.update({
    where: { id: ws.id },
    data: { githubInstallationId: null, githubAccountLogin: null },
  });
  revalidatePath("/app/integrations");
  return { ok: true };
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
