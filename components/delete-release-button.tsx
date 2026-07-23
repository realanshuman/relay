"use client";

import { useTransition } from "react";
import { Icon } from "./ui";
import { deleteRelease } from "@/lib/actions";

export function DeleteReleaseButton({ releaseId }: { releaseId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (confirm("Delete this release? This cannot be undone."))
          startTransition(() => deleteRelease(releaseId));
      }}
      disabled={pending}
      className="btn-subtle text-zinc-400 hover:text-red-600"
      title="Delete release"
    >
      <Icon name={pending ? "Loader2" : "Trash2"} size={16} className={pending ? "animate-spin" : ""} />
    </button>
  );
}
