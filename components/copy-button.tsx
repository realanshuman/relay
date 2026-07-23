"use client";

import { useState } from "react";
import { Icon } from "./ui";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  className,
  label = "Copy",
}: {
  text: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for insecure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn("btn-subtle gap-1.5 text-xs", className)}
      title="Copy to clipboard"
    >
      <Icon name={copied ? "Check" : "Copy"} size={13} className={copied ? "text-emerald-600" : ""} />
      {copied ? "Copied" : label}
    </button>
  );
}
