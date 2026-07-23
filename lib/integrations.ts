"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { getCurrentUser, getCurrentWorkspace } from "./session";
import { githubConfigured, getGithubAccessToken, listGithubRepos, GithubError } from "./github";
import type { GithubRepoOption, LoadReposError } from "./integrations-types";

type LoadResult =
  | { ok: true; repos: GithubRepoOption[] }
  | { ok: false; error: LoadReposError };

async function importedFullNames(workspaceId: string): Promise<Set<string>> {
  const rows = await prisma.repository.findMany({
    where: { workspaceId },
    select: { fullName: true },
  });
  return new Set(rows.map((r) => r.fullName));
}

/** Fetch the signed-in user's GitHub repositories, flagged with what's already imported. */
export async function loadGithubRepos(): Promise<LoadResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "not_signed_in" };
  if (!githubConfigured()) return { ok: false, error: "not_configured" };

  const token = await getGithubAccessToken(user.id);
  if (!token) return { ok: false, error: "not_connected" };

  let repos;
  try {
    repos = await listGithubRepos(token);
  } catch (err) {
    if (err instanceof GithubError && err.status === 401) return { ok: false, error: "token_expired" };
    return { ok: false, error: "fetch_failed" };
  }

  const ws = await getCurrentWorkspace();
  const existing = await importedFullNames(ws.id);

  return {
    ok: true,
    repos: repos.map((r) => ({ ...r, imported: existing.has(r.fullName) })),
  };
}

/** Import the selected GitHub repositories into the current workspace (skips duplicates). */
export async function importGithubRepos(
  items: { fullName: string; defaultBranch: string }[],
): Promise<{ imported: number }> {
  const ws = await getCurrentWorkspace();
  const existing = await importedFullNames(ws.id);

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

/**
 * Unlink the GitHub account. Guarded so a GitHub-only user can't lock themselves
 * out — Relay refuses to remove the last remaining sign-in method.
 */
export async function disconnectGithub(): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You're signed out — please sign in again." };

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    select: { providerId: true },
  });
  const hasOtherLogin = accounts.some((a) => a.providerId !== "github");
  if (!hasOtherLogin) {
    return {
      ok: false,
      error: "GitHub is your only sign-in method. Set a password first, then disconnect.",
    };
  }

  await prisma.account.deleteMany({ where: { userId: user.id, providerId: "github" } });
  revalidatePath("/app/integrations");
  return { ok: true };
}
