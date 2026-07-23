// Minimal GitHub REST helpers built on native fetch (no extra dependency).
// Server-only: imports the Prisma client and reads stored OAuth tokens.
import { prisma } from "./db";

const GH_API = "https://api.github.com";
const COMMON_HEADERS: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "relay-release-manager",
};

export type GithubRepo = {
  fullName: string;
  name: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
  pushedAt: string | null;
  stargazers: number;
  language: string | null;
};

export type GithubUser = { login: string; name: string | null; avatarUrl: string | null };

/** Error carrying the HTTP status so callers can distinguish 401 (revoked token). */
export class GithubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GithubError";
    this.status = status;
  }
}

/** True when a GitHub OAuth app is configured (client id + secret present). */
export function githubConfigured(): boolean {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
}

/**
 * The stored GitHub OAuth access token for a user, or null if GitHub isn't linked.
 * Tokens are stored in plaintext (Better Auth's default — token encryption is off),
 * so a direct read is sufficient here.
 */
export async function getGithubAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "github" },
    orderBy: { createdAt: "desc" },
    select: { accessToken: true },
  });
  return account?.accessToken ?? null;
}

async function gh<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${GH_API}${path}`, {
    headers: { ...COMMON_HEADERS, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new GithubError(res.status, `GitHub API ${res.status} on ${path}`);
  }
  return (await res.json()) as T;
}

export async function getGithubUser(token: string): Promise<GithubUser> {
  const u = await gh<{ login: string; name: string | null; avatar_url: string | null }>("/user", token);
  return { login: u.login, name: u.name ?? null, avatarUrl: u.avatar_url ?? null };
}

/** Repositories the user owns / can push to, most-recently-pushed first (first 100). */
export async function listGithubRepos(token: string): Promise<GithubRepo[]> {
  const rows = await gh<
    Array<{
      full_name: string;
      name: string;
      owner?: { login?: string };
      private: boolean;
      default_branch: string;
      description: string | null;
      pushed_at: string | null;
      stargazers_count: number;
      language: string | null;
    }>
  >(
    "/user/repos?per_page=100&sort=pushed&affiliation=owner,collaborator,organization_member",
    token,
  );
  return rows.map((r) => ({
    fullName: r.full_name,
    name: r.name,
    owner: r.owner?.login ?? r.full_name.split("/")[0],
    private: Boolean(r.private),
    defaultBranch: r.default_branch || "main",
    description: r.description ?? null,
    pushedAt: r.pushed_at ?? null,
    stargazers: r.stargazers_count ?? 0,
    language: r.language ?? null,
  }));
}

/** Connection status for the Integrations page (also validates the token). */
export async function getGithubConnection(
  userId: string,
): Promise<{ connected: boolean; login: string | null }> {
  const token = await getGithubAccessToken(userId);
  if (!token) return { connected: false, login: null };
  try {
    const user = await getGithubUser(token);
    return { connected: true, login: user.login };
  } catch (err) {
    // 401 → token revoked on GitHub's side; treat as disconnected so the UI re-prompts.
    if (err instanceof GithubError && err.status === 401) return { connected: false, login: null };
    // Transient error: still linked, we just couldn't fetch the handle right now.
    return { connected: true, login: null };
  }
}
