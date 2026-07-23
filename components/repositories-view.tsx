"use client";

import { useFormStatus } from "react-dom";
import { Toggle } from "./toggle";
import { Badge, Icon } from "./ui";
import { addRepository, toggleAutoPublish, removeRepository } from "@/lib/actions";
import { timeAgo } from "@/lib/utils";

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

export function RepositoriesView({ repos }: { repos: Repo[] }) {
  return (
    <div className="space-y-6">
      <form
        action={addRepository}
        className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
      >
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
              <Badge tone="green" dot>
                Connected
              </Badge>
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
