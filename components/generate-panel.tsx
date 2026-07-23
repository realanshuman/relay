"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./ui";
import { generateRelease } from "@/lib/actions";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Analyzing commits", icon: "GitCommitHorizontal" },
  { label: "Translating for customers", icon: "Languages" },
  { label: "Writing announcements", icon: "PenLine" },
  { label: "Generating banner", icon: "Image" },
  { label: "Assembling release", icon: "PackageCheck" },
];

export function GeneratePanel({
  releaseId,
  generated,
}: {
  releaseId: string;
  generated: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!pending) {
      setStep(0);
      return;
    }
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 700);
    return () => clearInterval(t);
  }, [pending]);

  function run() {
    startTransition(async () => {
      await generateRelease(releaseId);
      router.refresh();
    });
  }

  if (pending) {
    return (
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800">
          <Icon name="Sparkles" size={16} className="text-[var(--brand)]" />
          Relay is generating your release…
        </div>
        <div className="space-y-2">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={s.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                    : done
                      ? "text-zinc-500"
                      : "text-zinc-300",
                )}
              >
                <Icon
                  name={done ? "CheckCircle2" : active ? "Loader2" : s.icon}
                  size={16}
                  className={cn(active && "animate-spin", done && "text-emerald-500")}
                />
                {s.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <button onClick={run} className={cn(generated ? "btn-ghost" : "btn-brand", "gap-2")}>
      <Icon name={generated ? "RefreshCw" : "Sparkles"} size={16} />
      {generated ? "Regenerate all" : "Generate"}
    </button>
  );
}
