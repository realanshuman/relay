"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: (next: boolean) => Promise<void> | void;
  label?: string;
}) {
  const [on, setOn] = useState(checked);
  const [pending, startTransition] = useTransition();

  function handle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      try {
        await onToggle(next);
      } catch {
        setOn(!next); // revert on failure
      }
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={handle}
      disabled={pending}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-60",
        on ? "bg-[var(--brand)]" : "bg-zinc-200",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
