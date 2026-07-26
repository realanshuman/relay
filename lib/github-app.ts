// GitHub *App* helpers: manifest creation, installation tokens, and repo listing.
// Server-only — reads the app's private key from the database and signs JWTs with
// Node's built-in crypto (no external dependency). Never expose the private key,
// client secret, or webhook secret to the client.
import crypto from "node:crypto";
import { prisma } from "./db";

/** httpOnly cookie holding the anti-CSRF state for the GitHub setup/install redirects. */
export const GITHUB_STATE_COOKIE = "relay_gh_state";

const GH_API = "https://api.github.com";
const HEADERS: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "relay-release-manager",
};

export type StoredGithubApp = {
  id: string;
  appId: number;
  slug: string;
  name: string;
  clientId: string;
  clientSecret: string;
  webhookSecret: string | null;
  privateKey: string;
};

export type InstallationRepo = {
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

export type GithubAppCreds = {
  appId: number;
  slug: string;
  name: string;
  privateKey: string;
  webhookSecret: string | null;
  /** Who ran the one-time setup (null for env-provided or legacy registrations). */
  registeredByUserId: string | null;
  /** "env" = credentials from environment variables; "db" = created via the manifest flow. */
  source: "env" | "db";
};

/**
 * The ONE official Relay GitHub App for this instance.
 *
 * This is deliberately singular: the operator registers it once, and every user
 * simply installs it on their own repos (GitHub keeps installations per account,
 * so users never conflict with each other and never create apps themselves).
 *
 * Resolution order:
 *  1. Environment variables (production-grade: survives DB resets, supports key
 *     rotation): GITHUB_APP_ID + GITHUB_APP_SLUG + GITHUB_APP_PRIVATE_KEY
 *     (raw PEM with \n escapes, or base64-encoded PEM) and optionally
 *     GITHUB_APP_WEBHOOK_SECRET.
 *  2. The GithubApp row stored by the one-time manifest setup flow.
 */
export async function getGithubApp(): Promise<GithubAppCreds | null> {
  const id = process.env.GITHUB_APP_ID;
  const slug = process.env.GITHUB_APP_SLUG;
  const rawKey = process.env.GITHUB_APP_PRIVATE_KEY;
  if (id && slug && rawKey && Number.isFinite(Number(id))) {
    const privateKey = rawKey.includes("BEGIN")
      ? rawKey.replace(/\\n/g, "\n")
      : Buffer.from(rawKey, "base64").toString("utf8");
    return {
      appId: Number(id),
      slug,
      name: process.env.GITHUB_APP_NAME || "Relay",
      privateKey,
      webhookSecret: process.env.GITHUB_APP_WEBHOOK_SECRET || null,
      registeredByUserId: null,
      source: "env",
    };
  }
  const row = await prisma.githubApp.findFirst({ orderBy: { createdAt: "desc" } });
  if (!row) return null;
  return {
    appId: row.appId,
    slug: row.slug,
    name: row.name,
    privateKey: row.privateKey,
    webhookSecret: row.webhookSecret,
    registeredByUserId: row.registeredByUserId,
    source: "db",
  };
}

/**
 * Is this user the instance operator (the person who runs this Relay)?
 *
 * Only the operator ever sees or manages the shared GitHub App registration.
 * Regular users must never see it: it belongs to the instance, not to them.
 *
 * Resolution, in order:
 *  1. RELAY_ADMIN_EMAILS (comma-separated) always wins, if set.
 *  2. The user who ran the one-time setup.
 *  3. Legacy/env registrations with no recorded operator: the very first account
 *     created on this instance.
 */
export async function isInstanceOperator(user: { id: string; email: string }): Promise<boolean> {
  const admins = (process.env.RELAY_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (admins.length) return admins.includes(user.email.toLowerCase());

  const app = await getGithubApp();
  if (app?.registeredByUserId) return app.registeredByUserId === user.id;

  const first = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return first?.id === user.id;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/** App-level JWT (RS256) used to authenticate as the GitHub App itself. */
function appJwt(app: { appId: number; privateKey: string }): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  // iat backdated 60s to tolerate clock skew; exp within GitHub's 10-minute max.
  const payload = base64url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: app.appId }));
  const data = `${header}.${payload}`;
  const signature = crypto.createSign("RSA-SHA256").update(data).sign(app.privateKey);
  return `${data}.${base64url(signature)}`;
}

async function ghJson<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GH_API}${path}`, {
    ...init,
    headers: { ...HEADERS, Authorization: `Bearer ${token}`, ...(init?.headers as Record<string, string>) },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status} on ${path}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export type ManifestConversion = {
  id: number;
  slug: string;
  name: string;
  client_id: string;
  client_secret: string;
  webhook_secret: string | null;
  pem: string;
  html_url: string;
};

/**
 * Exchange a one-time manifest `code` for the newly created app's credentials.
 * This endpoint needs no auth — the code itself is the credential (single-use).
 */
export async function exchangeManifestCode(code: string): Promise<ManifestConversion> {
  const res = await fetch(`${GH_API}/app-manifests/${encodeURIComponent(code)}/conversions`, {
    method: "POST",
    headers: HEADERS,
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Manifest conversion failed: ${res.status} ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as ManifestConversion;
}

/** A short-lived (≈1h) installation access token, scoped to the installed repos. */
export async function getInstallationToken(
  app: { appId: number; privateKey: string },
  installationId: number,
): Promise<string> {
  const jwt = appJwt(app);
  const data = await ghJson<{ token: string }>(
    `/app/installations/${installationId}/access_tokens`,
    jwt,
    { method: "POST" },
  );
  return data.token;
}

/** The account (user/org) an installation belongs to — for display. */
export async function getInstallationAccountLogin(
  app: { appId: number; privateKey: string },
  installationId: number,
): Promise<string | null> {
  try {
    const jwt = appJwt(app);
    const data = await ghJson<{ account?: { login?: string } }>(
      `/app/installations/${installationId}`,
      jwt,
    );
    return data.account?.login ?? null;
  } catch {
    return null;
  }
}

/** Every repository the installation can access (paginated up to 1000). */
export async function listInstallationRepos(installationToken: string): Promise<InstallationRepo[]> {
  const out: InstallationRepo[] = [];
  for (let page = 1; page <= 10; page++) {
    const data = await ghJson<{
      total_count: number;
      repositories: Array<{
        full_name: string;
        name: string;
        owner?: { login?: string };
        private: boolean;
        default_branch: string;
        description: string | null;
        pushed_at: string | null;
        stargazers_count: number;
        language: string | null;
      }>;
    }>(`/installation/repositories?per_page=100&page=${page}`, installationToken);

    for (const r of data.repositories ?? []) {
      out.push({
        fullName: r.full_name,
        name: r.name,
        owner: r.owner?.login ?? r.full_name.split("/")[0],
        private: Boolean(r.private),
        defaultBranch: r.default_branch || "main",
        description: r.description ?? null,
        pushedAt: r.pushed_at ?? null,
        stargazers: r.stargazers_count ?? 0,
        language: r.language ?? null,
      });
    }
    if (!data.repositories || data.repositories.length < 100) break;
  }
  return out;
}

/** Best-effort uninstall (revokes the installation on GitHub). */
export async function deleteInstallation(
  app: { appId: number; privateKey: string },
  installationId: number,
): Promise<void> {
  try {
    const jwt = appJwt(app);
    await fetch(`${GH_API}/app/installations/${installationId}`, {
      method: "DELETE",
      headers: { ...HEADERS, Authorization: `Bearer ${jwt}` },
      cache: "no-store",
    });
  } catch {
    /* ignore — local disconnect still proceeds */
  }
}

/**
 * The GitHub App creation manifest — pre-fills GitHub's "Create app" screen so the
 * owner only has to click Create. GitHub then posts the app's keys back to us.
 */
export function buildManifest(host: string, name: string) {
  const base = host.replace(/\/$/, "");
  return {
    name,
    url: base,
    hook_attributes: { url: `${base}/api/webhooks/github`, active: true },
    redirect_url: `${base}/api/integrations/github/manifest-callback`,
    setup_url: `${base}/api/integrations/github/install-callback`,
    setup_on_update: true,
    public: false,
    default_permissions: {
      contents: "read",
      metadata: "read",
      pull_requests: "read",
    },
    default_events: ["push", "pull_request"],
  };
}
