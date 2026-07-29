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
  subscriberCount: number;
  emailConfigured: boolean;
  emailSentCount: number | null;
}

export function PublishPanel({
  releaseId,
  slug,
  published,
  publishedChannels,
  assets,
  baseUrl,
  subscriberCount,
  emailConfigured,
  emailSentCount,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  // Email is opt-in per publish: it leaves Relay and lands in real inboxes.
  const [selected, setSelected] = useState<Set<ChannelType>>(
    new Set(CHANNELS.map((c) => c.channel).filter((c) => c !== "email")),
  );

  const canEmail = emailConfigured && subscriberCount > 0;

  function toggle(ch: ChannelType) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(ch) ? next.delete(ch) : next.add(ch);
      return next;
    });
  }

  function publish() {
    if (
      selected.has("email") &&
      !confirm(
        `Send this release to ${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}?\n\nEmails go out immediately and can't be recalled.`,
      )
    ) {
      return;
    }
    setNotice(null);
    startTransition(async () => {
      const res = await publishRelease(releaseId, Array.from(selected));
      if (res?.emailed !== undefined) {
        setNotice(
          res.emailed > 0
            ? `Emailed ${res.emailed} subscriber${res.emailed === 1 ? "" : "s"}.`
            : res.emailSkipped === "no_email_provider"
              ? "Published, but no email provider is connected so nothing was sent."
              : res.emailSkipped === "no_subscribers"
                ? "Published. There are no subscribers to email yet."
                : "Published, but the emails could not be sent.",
        );
      }
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
                    c.channel === "email" ? (
                      <Badge tone={emailSentCount ? "green" : "zinc"} dot={Boolean(emailSentCount)}>
                        {emailSentCount
                          ? `Sent to ${emailSentCount}`
                          : "Nothing sent"}
                      </Badge>
                    ) : c.autoPublished ? (
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
                {isPublished && !c.autoPublished && c.channel !== "email" && content && (
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
          const isEmail = c.channel === "email";
          const disabled = isEmail && !canEmail;
          return (
            <label
              key={c.channel}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={on && !disabled}
                  disabled={disabled}
                  onChange={() => toggle(c.channel)}
                  className="h-4 w-4 rounded border-zinc-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                />
                <Icon name={c.icon} size={16} className="shrink-0 text-zinc-400" />
                <span className="truncate text-sm font-medium text-zinc-700">{c.label}</span>
                {isEmail && canEmail && on && (
                  <Badge tone="amber">Sends {subscriberCount}</Badge>
                )}
              </div>
              <span className="shrink-0 text-right text-xs text-zinc-400">
                {isEmail
                  ? !emailConfigured
                    ? "No email provider"
                    : subscriberCount === 0
                      ? "No subscribers yet"
                      : `${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}`
                  : c.autoPublished
                    ? "Published to your changelog"
                    : "Ready-to-copy content"}
              </span>
            </label>
          );
        })}
      </div>

      {notice && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          {notice}
        </div>
      )}

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
