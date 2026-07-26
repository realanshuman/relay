"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Toggle } from "./toggle";
import { Badge, Icon } from "./ui";
import { addRepository, toggleAutoPublish, removeRepository } from "@/lib/actions";
import { checkForUpdates, checkRepositoryForUpdates, type SyncSummary } from "@/lib/sync-actions";
import { timeAgo, cn } from "@/lib/utils";

interface Repo {
  id: string;
  name: string;
  fullName: string;
  targetBranch: string;
  autoPublish: boolean;
  connected: boolean;
  latestCommit: string | null;
  latestCommitMessage: string | null;
  latestCommitAt: Date | null;
  lastSyncedAt: Date | null;
  latestReleaseVersion: string | null;
}

function ConnectButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-brand" disabled={pending}>
      {pending ? (
        <Icon name="Loader2" size={15} className="animate-spin" />
      ) : (
        <Icon name="Plus" size={15} />
      )}
      Connect
    </button>
  );
}

/** Header strip: explains how detection works and offers a manual check. */
function AutoDetectBar({ repos }: { repos: Repo[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncSummary | null>(null);

  const watching = repos.filter((r) => r.connected).length;
  const lastSync = repos
    .map((r) => r.lastSyncedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];

  function run() {
    setResult(null);
    startTransition(async () => {
      const summary = await checkForUpdates();
      setResult(summary);
      router.refresh();
    });
  }

  return (
    <div className="card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Icon name="RadioTower" size={17} />
          </span>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              Auto detection
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                On
              </span>
            </div>
            <p className="mt-0.5 text-sm text-zinc-500">
              Watching {watching} {watching === 1 ? "repository" : "repositories"}. A merge to the
              target branch drafts a release automatically
              {lastSync ? `. Last checked ${timeAgo(lastSync)}` : ""}.
            </p>
          </div>
        </div>
        <button onClick={run} disabled={pending} className="btn-ghost shrink-0">
          <Icon
            name={pending ? "Loader2" : "RefreshCw"}
            size={15}
            className={pending ? "animate-spin" : ""}
          />
          {pending ? "Checking…" : "Check for updates"}
        </button>
      </div>

      {result && (
        <div
          className={cn(
            "mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
            result.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : result.tone === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : result.tone === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600",
          )}
        >
          <Icon
            name={
              result.tone === "success"
                ? "PartyPopper"
                : result.tone === "error"
                  ? "AlertCircle"
                  : result.tone === "warning"
                    ? "Unplug"
                    : "Check"
            }
            size={15}
            className="shrink-0"
          />
          <span>{result.message}</span>
          {result.created > 0 ? (
            <Link
              href="/app/releases"
              className="ml-auto shrink-0 font-medium underline underline-offset-2"
            >
              View releases →
            </Link>
          ) : result.tone === "warning" ? (
            <Link
              href="/app/integrations"
              className="ml-auto shrink-0 font-medium underline underline-offset-2"
            >
              Connect GitHub →
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

function CheckRepoButton({ repositoryId }: { repositoryId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await checkRepositoryForUpdates(repositoryId);
          router.refresh();
        })
      }
      disabled={pending}
      title="Check this repository for new commits"
      className="btn-subtle text-zinc-400 hover:text-zinc-700"
    >
      <Icon name={pending ? "Loader2" : "RefreshCw"} size={15} className={pending ? "animate-spin" : ""} />
    </button>
  );
}

export function RepositoriesView({ repos }: { repos: Repo[] }) {
  return (
    <div className="space-y-6">
      {repos.length > 0 && <AutoDetectBar repos={repos} />}

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-900">Add repositories</div>
            <p className="text-sm text-zinc-500">
              Connect GitHub once and pick your repos — no need to type <code>owner/repo</code>.
            </p>
          </div>
          <Link href="/app/integrations" className="btn-brand shrink-0">
            <Icon name="Github" size={16} />
            Import from GitHub
          </Link>
        </div>

        <details className="mt-3 border-t border-zinc-100 pt-3">
          <summary className="cursor-pointer select-none text-xs font-medium text-zinc-500 hover:text-zinc-700">
            Add one manually instead
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
                <input
                  name="fullName"
                  placeholder="owner/repository"
                  className="input pl-9"
                  required
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <label className="label">Target branch</label>
              <input name="targetBranch" placeholder="main" defaultValue="main" className="input" />
            </div>
            <ConnectButton />
          </form>
        </details>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {repos.map((repo) => (
          <div key={repo.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                  <Icon name="Package" size={17} />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">{repo.name}</div>
                  <div className="font-mono text-xs text-zinc-400">{repo.fullName}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge tone="green" dot>
                  Watching
                </Badge>
                <CheckRepoButton repositoryId={repo.id} />
              </div>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-zinc-400">Latest commit</dt>
                <dd className="flex items-center gap-1.5 text-zinc-600">
                  {repo.latestCommit ? (
                    <>
                      <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">
                        {repo.latestCommit}
                      </code>
                      <span className="text-xs text-zinc-400">{timeAgo(repo.latestCommitAt)}</span>
                    </>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </dd>
              </div>
              {repo.latestCommitMessage && (
                <p className="truncate text-xs text-zinc-500">{repo.latestCommitMessage}</p>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-zinc-400">Latest release</dt>
                <dd className="font-mono text-zinc-600">
                  {repo.latestReleaseVersion ?? <span className="text-zinc-400">None yet</span>}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-zinc-400">Last checked</dt>
                <dd className="text-xs text-zinc-500">
                  {repo.lastSyncedAt ? timeAgo(repo.lastSyncedAt) : "Not yet"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-zinc-400">Branch</dt>
                <dd>
                  <Badge tone="zinc">
                    <Icon name="GitBranch" size={12} />
                    {repo.targetBranch}
                  </Badge>
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <Toggle
                  checked={repo.autoPublish}
                  onToggle={(v) => toggleAutoPublish(repo.id, v)}
                  label="Auto publish"
                />
                Auto Publish
              </label>
              <button
                onClick={() => {
                  if (confirm(`Disconnect ${repo.name}? This removes its releases.`))
                    removeRepository(repo.id);
                }}
                className="btn-subtle text-zinc-400 hover:text-red-600"
                title="Disconnect"
              >
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
