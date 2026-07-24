"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Icon, Badge } from "./ui";
import { SubmitButton } from "./submit-button";
import { addRepository } from "@/lib/actions";
import {
  beginGithubSetup,
  beginGithubInstall,
  loadInstallationRepos,
  importGithubRepos,
  disconnectGithubInstall,
} from "@/lib/integrations";
import type { GithubRepoOption, LoadReposError } from "@/lib/integrations-types";
import { cn, timeAgo } from "@/lib/utils";

type GithubProps = {
  hasApp: boolean;
  installed: boolean;
  accountLogin: string | null;
};

type Notice = { tone: "success" | "error"; text: string } | null;

export function IntegrationsView({ github, notice }: { github: GithubProps; notice: Notice }) {
  return (
    <div className="space-y-8">
      {notice && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {notice.text}
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
              {github.installed ? (
                <Badge tone="green" dot>
                  Connected
                </Badge>
              ) : github.hasApp ? (
                <Badge tone="blue">Ready to install</Badge>
              ) : (
                <Badge tone="amber">Set up in one click</Badge>
              )}
            </div>
            <p className="text-sm text-zinc-500">
              {github.installed && github.accountLogin
                ? `Installed on @${github.accountLogin}`
                : "Import repositories and auto-detect releases on merge."}
            </p>
          </div>
        </div>
        {github.installed && <DisconnectButton />}
      </div>

      <div className="p-4">
        {github.installed ? (
          <RepoPicker />
        ) : github.hasApp ? (
          <InstallPrompt />
        ) : (
          <SetupPrompt />
        )}
        <ManualAdd />
      </div>
    </div>
  );
}

function SetupPrompt() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setup() {
    setPending(true);
    setError(null);
    const res = await beginGithubSetup();
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    // Submit the manifest to GitHub as a form POST so it opens the pre-filled
    // "Create GitHub App" screen. GitHub posts the keys back to our callback.
    const form = document.createElement("form");
    form.method = "POST";
    form.action = res.url;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "manifest";
    input.value = res.manifest;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-zinc-600">
        Click below and GitHub shows you a pre-filled <b>Create app</b> screen. Approve it, and
        GitHub sends the keys straight back to Relay — nothing to copy, no environment variables.
        You&apos;ll then pick your repositories on GitHub&apos;s own screen.
      </p>
      <button onClick={setup} disabled={pending} className="btn-brand">
        <Icon name={pending ? "Loader2" : "Github"} size={16} className={pending ? "animate-spin" : ""} />
        {pending ? "Opening GitHub…" : "Set up GitHub"}
      </button>
      <p className="text-xs text-zinc-400">
        Creates a private GitHub App in your account. One-time — future sign-ins just click Connect.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function InstallPrompt() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function install() {
    setPending(true);
    setError(null);
    const res = await beginGithubInstall();
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    window.location.href = res.url;
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-zinc-600">
        Your Relay GitHub App is ready. Install it and choose which repositories Relay can see —
        you pick them right on GitHub&apos;s screen.
      </p>
      <button onClick={install} disabled={pending} className="btn-brand">
        <Icon name={pending ? "Loader2" : "Github"} size={16} className={pending ? "animate-spin" : ""} />
        {pending ? "Opening GitHub…" : "Install & choose repositories"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function DisconnectButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (
          !confirm(
            "Disconnect GitHub? Imported repositories stay, but Relay stops seeing new commits until you reconnect.",
          )
        )
          return;
        startTransition(async () => {
          await disconnectGithubInstall();
        });
      }}
      disabled={pending}
      className="btn-ghost text-zinc-500 hover:text-red-600"
    >
      <Icon name={pending ? "Loader2" : "Unplug"} size={15} className={pending ? "animate-spin" : ""} />
      Disconnect
    </button>
  );
}

function RepoPicker() {
  const [repos, setRepos] = useState<GithubRepoOption[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [importing, startImport] = useTransition();
  const [importedCount, setImportedCount] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    setImportedCount(null);
    const res = await loadInstallationRepos();
    setLoading(false);
    if (!res.ok) {
      setLoadError(loadErrorMessage(res.error));
      return;
    }
    setRepos(res.repos);
  }

  // Auto-load once — the user just installed, so show their repos immediately.
  useEffect(() => {
    load();
  }, []);

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
                {query
                  ? `No repositories match “${query}”.`
                  : "No repositories in this installation yet."}
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
            <a
              href="https://github.com/settings/installations"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline"
            >
              Add or remove repos on GitHub ↗
            </a>
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

function ManualAdd() {
  return (
    <details className="mt-4 border-t border-zinc-100 pt-3">
      <summary className="cursor-pointer select-none text-xs font-medium text-zinc-500 hover:text-zinc-700">
        Add a repository manually instead
      </summary>
      <form action={addRepository} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
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
    case "no_app":
      return "Set up the GitHub app first.";
    case "not_installed":
      return "Install the GitHub app first, then load your repositories.";
    case "token_failed":
      return "Couldn't authenticate with GitHub. Try disconnecting and reconnecting.";
    case "not_signed_in":
      return "You're signed out — please sign in again.";
    default:
      return "Couldn't reach GitHub. Please try again in a moment.";
  }
}
