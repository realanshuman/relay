"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, Badge } from "./ui";
import { CopyButton } from "./copy-button";
import { CHANNELS, ChannelType, AssetType } from "@/lib/constants";
import { publishRelease, unpublishRelease } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface Props {
  releaseId: string;
  slug: string;
  published: boolean;
  publishedChannels: string[];
  assets: Partial<Record<AssetType, string>>;
  baseUrl: string;
}

export function PublishPanel({
  releaseId,
  slug,
  published,
  publishedChannels,
  assets,
  baseUrl,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<ChannelType>>(
    new Set(CHANNELS.map((c) => c.channel)),
  );

  function toggle(ch: ChannelType) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(ch) ? next.delete(ch) : next.add(ch);
      return next;
    });
  }

  function publish() {
    startTransition(async () => {
      await publishRelease(releaseId, Array.from(selected));
      router.refresh();
    });
  }

  function unpublish() {
    startTransition(async () => {
      await unpublishRelease(releaseId);
      router.refresh();
    });
  }

  const changelogUrl = `${baseUrl}/c/${slug}`;

  if (published) {
    return (
      <div className="space-y-4">
        <div className="card border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Icon name="CheckCircle2" size={16} />
            This release is published
          </div>
          <a
            href={changelogUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-emerald-700 underline underline-offset-2"
          >
            {changelogUrl}
            <Icon name="ExternalLink" size={13} />
          </a>
        </div>

        <div className="card divide-y divide-zinc-100">
          {CHANNELS.map((c) => {
            const isPublished = publishedChannels.includes(c.channel);
            const content = c.asset ? assets[c.asset] : undefined;
            return (
              <div key={c.channel} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Icon name={c.icon} size={16} className="text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-700">{c.label}</span>
                  {isPublished ? (
                    c.autoPublished ? (
                      <Badge tone="green" dot>
                        Live
                      </Badge>
                    ) : (
                      <Badge tone="blue">Ready to post</Badge>
                    )
                  ) : (
                    <Badge tone="zinc">Skipped</Badge>
                  )}
                </div>
                {isPublished && !c.autoPublished && content && (
                  <CopyButton text={content} label="Copy post" />
                )}
                {isPublished && c.autoPublished && (
                  <a
                    href={changelogUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-subtle gap-1.5 text-xs"
                  >
                    <Icon name="ExternalLink" size={13} />
                    View
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={unpublish} disabled={pending} className="btn-ghost text-zinc-500">
          <Icon name={pending ? "Loader2" : "Undo2"} size={15} className={pending ? "animate-spin" : ""} />
          Unpublish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card divide-y divide-zinc-100">
        {CHANNELS.map((c) => {
          const on = selected.has(c.channel);
          return (
            <label
              key={c.channel}
              className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(c.channel)}
                  className="h-4 w-4 rounded border-zinc-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                />
                <Icon name={c.icon} size={16} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-700">{c.label}</span>
              </div>
              <span className="text-xs text-zinc-400">
                {c.autoPublished ? "Published to your changelog" : "Ready-to-copy content"}
              </span>
            </label>
          );
        })}
      </div>

      <button
        onClick={publish}
        disabled={pending || selected.size === 0}
        className={cn("btn-brand w-full py-2.5", pending && "opacity-80")}
      >
        <Icon name={pending ? "Loader2" : "Send"} size={16} className={pending ? "animate-spin" : ""} />
        {pending ? "Publishing…" : `Publish to ${selected.size} channel${selected.size === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
