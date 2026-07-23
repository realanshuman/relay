import * as React from "react";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

// Render a lucide icon by name (used so constants can reference icons as strings).
export function Icon({
  name,
  className,
  size = 16,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[
    name
  ];
  if (!Cmp) return null;
  return <Cmp size={size} className={className} />;
}

type Tone = "zinc" | "green" | "amber" | "red" | "blue" | "violet" | "brand";

const TONES: Record<Tone, string> = {
  zinc: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  brand: "bg-[var(--brand-soft)] text-[var(--brand)] ring-[color:var(--brand)]/20",
};

export function Badge({
  children,
  tone = "zinc",
  className,
  dot = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, Tone> = {
  draft: "zinc",
  generating: "blue",
  ready: "violet",
  published: "green",
  unpublished: "zinc",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge tone={STATUS_TONE[status] ?? "zinc"} dot>
      {label}
    </Badge>
  );
}

export function RiskBadge({ risk }: { risk: string }) {
  const tone: Tone = risk === "high" ? "red" : risk === "medium" ? "amber" : "green";
  const label = risk.charAt(0).toUpperCase() + risk.slice(1);
  return <Badge tone={tone}>{label} risk</Badge>;
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
            <Icon name={icon} size={18} />
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function ConfidenceStars({
  value,
  showPct = true,
  size = 14,
}: {
  value: number | null | undefined;
  showPct?: boolean;
  size?: number;
}) {
  const pct = value ?? 0;
  const stars = Math.round((pct / 100) * 5);
  return (
    <span className="inline-flex items-center gap-1.5 text-amber-500" title={`${pct}% confidence`}>
      <span className="inline-flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Icons.Star
            key={i}
            size={size}
            className={i < stars ? "fill-amber-400 text-amber-400" : "text-zinc-300"}
          />
        ))}
      </span>
      {showPct && <span className="text-xs font-medium text-zinc-500">{pct}%</span>}
    </span>
  );
}

export function EmptyState({
  icon = "Inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white/50 px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <Icon name={icon} size={20} />
      </div>
      <p className="text-sm font-semibold text-zinc-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
