"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, ConfidenceStars, Badge } from "./ui";
import { CopyButton } from "./copy-button";
import { Markdown } from "./markdown";
import { REFINE_ACTIONS, RefineAction, AssetType } from "@/lib/constants";
import { refineReleaseAsset, saveReleaseAsset } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface Props {
  releaseId: string;
  type: AssetType;
  label: string;
  hint: string;
  icon: string;
  content: string;
  confidence: number;
  edited: boolean;
  isBanner?: boolean;
}

export function AssetEditor(props: Props) {
  const { releaseId, type, label, hint, icon, content, confidence, edited, isBanner } = props;
  const router = useRouter();
  const [value, setValue] = useState(content);
  const [mode, setMode] = useState<"preview" | "edit">(isBanner ? "preview" : "preview");
  const [busy, setBusy] = useState<RefineAction | "save" | null>(null);
  const [pending, startTransition] = useTransition();
  const serverContent = useRef(content);

  // Re-sync when the server content changes (after refine / generate remount safety).
  useEffect(() => {
    if (content !== serverContent.current) {
      serverContent.current = content;
      setValue(content);
    }
  }, [content]);

  const dirty = value !== content;

  function runRefine(action: RefineAction) {
    setBusy(action);
    startTransition(async () => {
      await refineReleaseAsset(releaseId, type, action);
      router.refresh();
      setBusy(null);
    });
  }

  function save() {
    setBusy("save");
    startTransition(async () => {
      await saveReleaseAsset(releaseId, type, value);
      serverContent.current = value;
      router.refresh();
      setBusy(null);
    });
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/60 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Icon name={icon} size={15} className="shrink-0 text-zinc-400" />
          <span className="truncate text-sm font-semibold text-zinc-800">{label}</span>
          {edited && <Badge tone="zinc">edited</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceStars value={confidence} size={12} />
          {!isBanner && (
            <div className="flex items-center rounded-md border border-zinc-200 bg-white p-0.5">
              {(["preview", "edit"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-medium capitalize transition",
                    mode === m ? "bg-zinc-100 text-zinc-800" : "text-zinc-400 hover:text-zinc-600",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
          <CopyButton text={value} />
        </div>
      </div>

      <div className="relative">
        {pending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
              <Icon name="Loader2" size={16} className="animate-spin" />
              {busy === "save" ? "Saving…" : "Regenerating…"}
            </span>
          </div>
        )}

        {isBanner ? (
          <div className="p-4">
            <div
              className="overflow-hidden rounded-lg border border-zinc-200 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          </div>
        ) : mode === "edit" ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y bg-white px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-800 outline-none"
          />
        ) : (
          <div className="px-4 py-3">
            <Markdown>{value || "_Nothing generated yet._"}</Markdown>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50/60 px-3 py-2">
        {isBanner ? (
          <p className="px-1 text-xs text-zinc-400">{hint}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            {REFINE_ACTIONS.map((a) => (
              <button
                key={a.action}
                onClick={() => runRefine(a.action)}
                disabled={pending}
                className="btn-subtle gap-1.5 text-xs disabled:opacity-50"
                title={a.label}
              >
                <Icon
                  name={busy === a.action ? "Loader2" : a.icon}
                  size={13}
                  className={busy === a.action ? "animate-spin text-[var(--brand)]" : "text-zinc-400"}
                />
                {a.label}
              </button>
            ))}
          </div>
        )}
        {dirty && !isBanner && (
          <button onClick={save} disabled={pending} className="btn-brand px-3 py-1.5 text-xs">
            <Icon name="Check" size={13} />
            Save changes
          </button>
        )}
      </div>
    </div>
  );
}
