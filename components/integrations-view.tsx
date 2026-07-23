"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Icon, Badge } from "./ui";
import { SubmitButton } from "./submit-button";
import { addRepository } from "@/lib/actions";
import { loadGithubRepos, importGithubRepos, disconnectGithub } from "@/lib/integrations";
import type { GithubRepoOption, LoadReposError } from "@/lib/integrations-types";
import { cn, timeAgo } from "@/lib/utils";

type GithubProps = {
  configured: boolean;
  connected: boolean;
  login: string | null;
  callbackUrl: string;
};

export function IntegrationsView({
  github,
  connectError,
}: {
  github: GithubProps;
  connectError?: boolean;
}) {
  return (
    <div className="space-y-8">
      {connectError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          GitHub couldn&apos;t be connected. Please try again — if it keeps failing, re-check that your
          OAuth app&apos;s callback URL matches the one shown below.
        </div>
      )}
      <GithubCard github={github} />
      <ComingSoon />
    </div>
  );
}

function GithubCard({ github }: { github: GithubProps }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Icon name="Github" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900">GitHub</span>
              {github.connected ? (
                <Badge tone="green" dot>
                  Connected
                </Badge>
              ) : github.configured ? (
                <Badge tone="zinc">Not connected</Badge>
              ) : (
                <Badge tone="amber">Setup needed</Badge>
              )}
            </div>
            <p className="text-sm text-zinc-500">
              {github.connected && github.login
                ? `Connected as @${github.login}`
                : "Import repositories and detect releases automatically."}
            </p>
          </div>
        </div>
        {github.connected && <DisconnectButton />}
      </div>

      <div className="p-4">
        {!github.configured ? (
          <NotConfigured callbackUrl={github.callbackUrl} />
        ) : !github.connected ? (
          <ConnectPrompt />
        ) : (
          <RepoPicker />
        )}
        <ManualAdd />
      </div>
    </div>
  );
}

function ConnectPrompt() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setPending(true);
    setError(null);
    try {
      const { data, error } = await authClient.linkSocial({
        provider: "github",
        scopes: ["repo", "read:org"],
        callbackURL: "/app/integrations?connected=1",
        errorCallbackURL: "/app/integrations?error=github",
      });
      if (error) {
        setError(error.message || "Couldn't start the GitHub connect flow.");
        setPending(false);
        return;
      }
      if (data && "url" in data && data.url) {
        window.location.href = data.url as string;
        return;
      }
      // Some client builds auto-redirect; leave the button in its pending state.
    } catch {
      setError("Couldn't start the GitHub connect flow. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-zinc-600">
        Authorize Relay to see your repositories. You&apos;ll choose exactly which ones to import —
        nothing is added automatically.
      </p>
      <button onClick={connect} disabled={pending} className="btn-brand">
        <Icon name={pending ? "Loader2" : "Github"} size={16} className={pending ? "animate-spin" : ""} />
        {pending ? "Redirecting to GitHub…" : "Connect GitHub"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function DisconnectButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => {
          if (
            !confirm(
              "Disconnect GitHub? Imported repositories stay, but Relay loses API access until you reconnect.",
            )
          )
            return;
          startTransition(async () => {
            const res = await disconnectGithub();
            if (!res.ok) setError(res.error || "Couldn't disconnect.");
          });
        }}
        disabled={pending}
        className="btn-ghost text-zinc-500 hover:text-red-600"
      >
        <Icon name={pending ? "Loader2" : "Unplug"} size={15} className={pending ? "animate-spin" : ""} />
        Disconnect
      </button>
      {error && <p className="max-w-[16rem] text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}

function RepoPicker() {
  const [repos, setRepos] = useState<GithubRepoOption[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [importing, startImport] = useTransition();
  const [importedCount, setImportedCount] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    setImportedCount(null);
    const res = await loadGithubRepos();
    setLoading(false);
    if (!res.ok) {
      setLoadError(loadErrorMessage(res.error));
      return;
    }
    setRepos(res.repos);
  }

  const q = query.trim().toLowerCase();
  const filtered = (repos ?? []).filter((r) => r.fullName.toLowerCase().includes(q));
  const selectedList = (repos ?? []).filter((r) => selected[r.fullName] && !r.imported);

  function toggle(fullName: string) {
    setSelected((s) => ({ ...s, [fullName]: !s[fullName] }));
  }

  function doImport() {
    const items = selectedList.map((r) => ({ fullName: r.fullName, defaultBranch: r.defaultBranch }));
    if (!items.length) return;
    startImport(async () => {
      const { imported } = await importGithubRepos(items);
      setImportedCount(imported);
      setSelected({});
      await load();
    });
  }

  if (!repos && !loading && !loadError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-zinc-600">
          Load your GitHub repositories, then pick the ones Relay should watch for releases.
        </p>
        <button onClick={load} className="btn-brand">
          <Icon name="RefreshCw" size={15} /> Load my repositories
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Icon
            name="Search"
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories"
            className="input pl-9"
          />
        </div>
        <button onClick={load} disabled={loading} className="btn-ghost" title="Refresh list">
          <Icon name={loading ? "Loader2" : "RefreshCw"} size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {importedCount !== null && importedCount > 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Imported {importedCount} {importedCount === 1 ? "repository" : "repositories"}.{" "}
          <Link href="/app/repositories" className="font-medium underline underline-offset-2">
            View them →
          </Link>
        </div>
      )}

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      {loading && !repos && (
        <div className="flex items-center gap-2 py-8 text-sm text-zinc-500">
          <Icon name="Loader2" size={16} className="animate-spin" /> Loading repositories…
        </div>
      )}

      {repos && (
        <>
          <div className="max-h-[22rem] divide-y divide-zinc-100 overflow-y-auto rounded-lg border border-zinc-200">
            {filtered.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-zinc-500">
                {query ? `No repositories match “${query}”.` : "No repositories found."}
              </div>
            )}
            {filtered.map((r) => {
              const checked = r.imported || !!selected[r.fullName];
              return (
                <label
                  key={r.fullName}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5",
                    r.imported ? "cursor-default bg-zinc-50" : "cursor-pointer hover:bg-zinc-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={r.imported}
                    onChange={() => toggle(r.fullName)}
                    className="h-4 w-4 shrink-0 rounded border-zinc-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-zinc-800">{r.fullName}</span>
                      {r.private && <Icon name="Lock" size={12} className="shrink-0 text-zinc-400" />}
                      {r.language && (
                        <span className="shrink-0 text-[11px] text-zinc-400">{r.language}</span>
                      )}
                    </div>
                    {r.description && <p className="truncate text-xs text-zinc-500">{r.description}</p>}
                  </div>
                  {r.imported ? (
                    <Badge tone="green">Added</Badge>
                  ) : (
                    r.pushedAt && (
                      <span className="shrink-0 text-[11px] text-zinc-400">{timeAgo(r.pushedAt)}</span>
                    )
                  )}
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">{selectedList.length} selected</span>
            <button onClick={doImport} disabled={!selectedList.length || importing} className="btn-brand">
              <Icon
                name={importing ? "Loader2" : "Plus"}
                size={15}
                className={importing ? "animate-spin" : ""}
              />
              {importing
                ? "Importing…"
                : selectedList.length
                  ? `Import ${selectedList.length} ${selectedList.length === 1 ? "repository" : "repositories"}`
                  : "Import repositories"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NotConfigured({ callbackUrl }: { callbackUrl: string }) {
  return (
    <div className="space-y-3 text-sm text-zinc-600">
      <p>
        To enable one-click connect, register a GitHub OAuth app and add its keys to Relay. It takes
        about two minutes:
      </p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Open{" "}
          <a
            className="font-medium text-zinc-800 underline underline-offset-2"
            href="https://github.com/settings/developers"
            target="_blank"
            rel="noreferrer"
          >
            GitHub → Settings → Developer settings → OAuth Apps
          </a>{" "}
          and click <b>New OAuth App</b>.
        </li>
        <li>
          Set the <b>Authorization callback URL</b> to:
          <CopyRow value={callbackUrl} />
        </li>
        <li>
          Copy the <b>Client ID</b> and generate a <b>Client secret</b>.
        </li>
        <li>
          In Vercel → your project → <b>Settings → Environment Variables</b>, add{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs">GITHUB_CLIENT_ID</code> and{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs">GITHUB_CLIENT_SECRET</code>,
          then <b>Redeploy</b>.
        </li>
      </ol>
      <p className="text-zinc-500">
        The <b>Connect GitHub</b> button appears here automatically once those are set.
      </p>
    </div>
  );
}

function ManualAdd() {
  return (
    <details className="mt-4 border-t border-zinc-100 pt-3">
      <summary className="cursor-pointer select-none text-xs font-medium text-zinc-500 hover:text-zinc-700">
        Add a repository manually instead
      </summary>
      <form action={addRepository} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Repository</label>
          <div className="relative">
            <Icon
              name="Github"
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input name="fullName" placeholder="owner/repository" className="input pl-9" required />
          </div>
        </div>
        <div className="w-full sm:w-36">
          <label className="label">Target branch</label>
          <input name="targetBranch" placeholder="main" defaultValue="main" className="input" />
        </div>
        <SubmitButton icon="Plus">Add</SubmitButton>
      </form>
    </details>
  );
}

function CopyRow({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-1 flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700">
        {value}
      </code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="btn-ghost shrink-0 px-2 py-1 text-xs"
      >
        <Icon name={copied ? "Check" : "Copy"} size={13} /> {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function ComingSoon() {
  const items = [
    { name: "Slack", icon: "Slack", desc: "Post releases to a channel" },
    { name: "Discord", icon: "MessageSquare", desc: "Announce to your community" },
    { name: "Webhooks", icon: "Webhook", desc: "Send release events anywhere" },
    { name: "Linear", icon: "SquareKanban", desc: "Link shipped issues" },
  ];
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        More integrations
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.name} className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                <Icon name={it.icon} size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-800">{it.name}</div>
                <div className="text-xs text-zinc-500">{it.desc}</div>
              </div>
            </div>
            <Badge tone="zinc">Soon</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function loadErrorMessage(error: LoadReposError): string {
  switch (error) {
    case "not_configured":
      return "GitHub isn't set up yet — add your OAuth app keys first.";
    case "not_connected":
      return "Connect GitHub first, then load your repositories.";
    case "token_expired":
      return "Your GitHub authorization expired. Click Disconnect, then Connect GitHub again.";
    case "not_signed_in":
      return "You're signed out — please sign in again.";
    default:
      return "Couldn't reach GitHub. Please try again in a moment.";
  }
}
