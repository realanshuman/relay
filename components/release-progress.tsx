"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "./ui";

type Step = { key: string; label: string; icon: string; href?: string };

/**
 * The release workflow at a glance: detected -> generated -> reviewed -> published.
 * Tells the user where they are and what the next action is, which the tab strip
 * alone never made obvious.
 */
export function ReleaseProgress({
  releaseId,
  generated,
  reviewed,
  published,
}: {
  releaseId: string;
  generated: boolean;
  reviewed: boolean;
  published: boolean;
}) {
  const steps: Step[] = [
    { key: "detected", label: "Detected", icon: "GitMerge" },
    { key: "generated", label: "Generated", icon: "Sparkles", href: `/app/releases/${releaseId}?tab=overview` },
    { key: "reviewed", label: "Reviewed", icon: "PenLine", href: `/app/releases/${releaseId}?tab=notes` },
    { key: "published", label: "Published", icon: "Send", href: `/app/releases/${releaseId}?tab=publish` },
  ];

  const done: Record<string, boolean> = {
    detected: true,
    generated,
    reviewed: reviewed || published,
    published,
  };
  // The first step that isn't done is the one to nudge.
  const currentIndex = steps.findIndex((s) => !done[s.key]);

  const hint = published
    ? "This release is live on your changelog."
    : !generated
      ? "Next: generate the release assets."
      : !reviewed
        ? "Next: review the notes and posts, then publish."
        : "Next: publish to your changelog.";

  return (
    <div className="card mb-6 p-4">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {steps.map((s, i) => {
          const isDone = done[s.key];
          const isCurrent = i === currentIndex;
          const body = (
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition",
                isDone
                  ? "font-medium text-zinc-800"
                  : isCurrent
                    ? "font-medium text-[var(--brand)]"
                    : "text-zinc-400",
                s.href && "hover:bg-zinc-100",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-[var(--brand-soft)] text-[var(--brand)] ring-1 ring-[color:var(--brand)]/30"
                      : "bg-zinc-100 text-zinc-400",
                )}
              >
                <Icon name={isDone ? "Check" : s.icon} size={12} />
              </span>
              {s.label}
            </span>
          );
          return (
            <li key={s.key} className="flex items-center">
              {s.href ? <Link href={s.href}>{body}</Link> : body}
              {i < steps.length - 1 && (
                <Icon name="ChevronRight" size={14} className="mx-0.5 shrink-0 text-zinc-300" />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 border-t border-zinc-100 pt-2 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
