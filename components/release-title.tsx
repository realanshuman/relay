"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateReleaseMeta } from "@/lib/actions";
import { Icon } from "./ui";

/** Click-to-edit release title. The AI drafts it; the user owns the final wording. */
export function ReleaseTitle({
  releaseId,
  title,
}: {
  releaseId: string;
  title: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    const next = value.trim();
    if (next === (title ?? "")) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      await updateReleaseMeta(releaseId, { title: next });
      setEditing(false);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="mt-1 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setValue(title ?? "");
              setEditing(false);
            }
          }}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          maxLength={200}
          placeholder="Give this release a title"
          className="input max-w-md text-base"
        />
        <button onClick={save} disabled={pending} className="btn-brand shrink-0">
          <Icon name={pending ? "Loader2" : "Check"} size={15} className={pending ? "animate-spin" : ""} />
          Save
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Click to edit the title"
      className="group mt-1 flex items-center gap-2 text-left"
    >
      <span className="text-lg text-zinc-600">{title || "Untitled release"}</span>
      <Icon
        name="Pencil"
        size={13}
        className="shrink-0 text-zinc-300 transition group-hover:text-zinc-500"
      />
    </button>
  );
}
