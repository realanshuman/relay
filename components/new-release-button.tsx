"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createReleaseForRepo } from "@/lib/actions";
import { checkRepositoryForUpdates } from "@/lib/sync-actions";
import { Icon } from "./ui";
import { cn } from "@/lib/utils";

interface Repo {
  id: string;
  name: string;
  targetBranch: string;
}

type RepoState = { status: "idle" | "checking"; message?: string; tone?: "ok" | "warn" };

/**
 * Drafts a release. The primary path is real: it asks GitHub what has landed on the
 * repository's branch since the last release and drafts from those commits. Sample
 * commits stay available behind an explicit toggle so Relay can still be tried before
 * GitHub is connected, but they are no longer the default.
 */
export function NewReleaseButton({
  repos,
  githubConnected,
}: {
  repos: Repo[];
  githubConnected: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [useSample, setUseSample] = useState(!githubConnected);
  const [breaking, setBreaking] = useState(false);
  const [state, setState] = useState<Record<string, RepoState>>({});
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // If GitHub gets connected later, prefer the real path again.
  useEffect(() => {
    setUseSample(!githubConnected);
  }, [githubConnected]);

  function checkRepo(repo: Repo) {
    setState((s) => ({ ...s, [repo.id]: { status: "checking" } }));
    startTransition(async () => {
      const res = await checkRepositoryForUpdates(repo.id);
      if (res.releaseId) {
        setOpen(false);
        setState((s) => ({ ...s, [repo.id]: { status: "idle" } }));
        router.push(`/app/releases/${res.releaseId}`);
        router.refresh();
        return;
      }
      setState((s) => ({
        ...s,
        [repo.id]: {
          status: "idle",
          message: res.message,
          tone: res.tone === "error" || res.tone === "warning" ? "warn" : "ok",
        },
      }));
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button className="btn-brand" onClick={() => setOpen((o) => !o)}>
        <Icon name="Plus" size={16} />
        <span className="hidden sm:inline">New Release</span>
        <span className="sm:hidden">New</span>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] origin-top-right animate-fade-in rounded-xl border border-zinc-200 bg-white p-2 shadow-pop">
          <div className="px-2 pb-2 pt-1">
            <p className="text-xs font-semibold text-zinc-800">
              {useSample ? "Draft from sample commits" : "Draft from your latest commits"}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
              {useSample
                ? "Creates a release from example commits so you can see the workflow."
                : "Relay checks the branch for anything merged since your last release."}
            </p>
          </div>

          {repos.length === 0 && (
            <div className="px-2.5 py-3">
              <p className="text-sm text-zinc-500">No repositories yet.</p>
              <Link
                href="/app/integrations"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:underline"
              >
                <Icon name="Github" size={14} />
                Connect GitHub
              </Link>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {repos.map((repo) => {
              const st = state[repo.id];
              const checking = st?.status === "checking";

              if (useSample) {
                return (
                  <form key={repo.id} action={createReleaseForRepo}>
                    <input type="hidden" name="repositoryId" value={repo.id} />
                    {breaking && <input type="hidden" name="breaking" value="on" />}
                    <button
                      type="submit"
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon name="Package" size={15} className="shrink-0 text-zinc-400" />
                        <span className="truncate font-medium">{repo.name}</span>
                        <span className="shrink-0 font-mono text-[11px] text-zinc-400">
                          {repo.targetBranch}
                        </span>
                      </span>
                      <Icon name="Plus" size={14} className="shrink-0 text-zinc-400" />
                    </button>
                  </form>
                );
              }

              return (
                <div key={repo.id}>
                  <button
                    onClick={() => checkRepo(repo)}
                    disabled={checking}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-70"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon name="Package" size={15} className="shrink-0 text-zinc-400" />
                      <span className="truncate font-medium">{repo.name}</span>
                      <span className="shrink-0 font-mono text-[11px] text-zinc-400">
                        {repo.targetBranch}
                      </span>
                    </span>
                    <Icon
                      name={checking ? "Loader2" : "RefreshCw"}
                      size={14}
                      className={cn("shrink-0 text-zinc-400", checking && "animate-spin")}
                    />
                  </button>
                  {st?.message && (
                    <p
                      className={cn(
                        "px-2.5 pb-1.5 text-[11px] leading-relaxed",
                        st.tone === "warn" ? "text-amber-600" : "text-zinc-500",
                      )}
                    >
                      {st.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-1 space-y-1.5 border-t border-zinc-100 px-2.5 pt-2.5">
            {useSample && (
              <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
                <input
                  type="checkbox"
                  checked={breaking}
                  onChange={(e) => setBreaking(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                />
                Include a breaking change
              </label>
            )}
            {githubConnected && (
              <button
                onClick={() => setUseSample((v) => !v)}
                className="text-[11px] font-medium text-zinc-400 underline-offset-2 transition hover:text-zinc-700 hover:underline"
              >
                {useSample ? "Use my real commits instead" : "Try it with sample commits"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
