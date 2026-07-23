"use client";

import { useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createReleaseForRepo } from "@/lib/actions";
import { Icon } from "./ui";

interface Repo {
  id: string;
  name: string;
  targetBranch: string;
}

function CreateItem({ repo }: { repo: Repo }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60"
    >
      <span className="flex items-center gap-2">
        <Icon name="Package" size={15} className="text-zinc-400" />
        <span className="font-medium">{repo.name}</span>
        <span className="text-xs text-zinc-400">{repo.targetBranch}</span>
      </span>
      {pending ? (
        <Icon name="Loader2" size={14} className="animate-spin text-[var(--brand)]" />
      ) : (
        <Icon name="Plus" size={14} className="text-zinc-400" />
      )}
    </button>
  );
}

export function NewReleaseButton({ repos }: { repos: Repo[] }) {
  const [open, setOpen] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button className="btn-brand" onClick={() => setOpen((o) => !o)}>
        <Icon name="Plus" size={16} />
        New Release
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 origin-top-right animate-fade-in rounded-xl border border-zinc-200 bg-white p-2 shadow-pop">
          <div className="px-2 pb-2 pt-1">
            <p className="text-xs font-semibold text-zinc-800">Detect a release</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
              Simulates a merged PR batch into the target branch and drafts a release.
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {repos.length === 0 && (
              <p className="px-2.5 py-3 text-sm text-zinc-400">Connect a repository first.</p>
            )}
            {repos.map((repo) => (
              <form key={repo.id} action={createReleaseForRepo}>
                <input type="hidden" name="repositoryId" value={repo.id} />
                {breaking && <input type="hidden" name="breaking" value="on" />}
                <CreateItem repo={repo} />
              </form>
            ))}
          </div>
          <label className="mt-1 flex cursor-pointer items-center gap-2 border-t border-zinc-100 px-2.5 pt-2.5 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={breaking}
              onChange={(e) => setBreaking(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-300 text-[var(--brand)] focus:ring-[var(--brand)]"
            />
            Include a breaking change
          </label>
        </div>
      )}
    </div>
  );
}
