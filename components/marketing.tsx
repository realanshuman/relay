import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "./ui";

/* ============================================================================
   Relay public-site design system
   ----------------------------------------------------------------------------
   Brand foundations (the rules every public page follows):

   COLOR      Ink zinc-950 on white. One accent: indigo-600 (#4f46e5), used for
              the eyebrow bullet, links, and one highlight per screen, never for
              large fills. Emerald only for "live/success" dots. Everything else
              is a zinc.
   TYPE       System sans. Headings: font-semibold tracking-tight. Labels,
              eyebrows, versions, shas: font-mono uppercase. Body: zinc-500/600,
              relaxed leading. No serif on marketing (serif belongs to the
              public changelog).
   LINES      Hairline zinc-200 borders do the structure work. Shadows are rare
              and soft. Radius: 8 controls, 12 cards, 16 frames.
   TEXTURE    Dotted baseline grid in the hero, "+" corner marks on framed
              sections (drawn, not implied), status dots with pulse.
   VOICE      Concrete and short. Say what it does: "reads your commits",
              "drafts the notes". No em dashes, no "empower/unlock".
   ========================================================================== */

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto max-w-6xl px-6", className)}>{children}</div>;
}

/* Mono eyebrow with a square accent bullet: the section signature. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
      <span className="h-1.5 w-1.5 bg-indigo-600" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto flex flex-col items-center text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
        {title}
      </h2>
      {lede && <p className="mt-4 text-lg leading-relaxed text-zinc-500">{lede}</p>}
    </div>
  );
}

export function ButtonPrimary({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition",
        "hover:bg-zinc-800 active:translate-y-px",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function ButtonGhost({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition",
        "hover:border-zinc-300 hover:bg-zinc-50 active:translate-y-px",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* Framed section with drawn "+" marks at the corners (Vercel-style survey marks). */
export function PlusFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mark = "absolute h-[17px] w-[17px] text-zinc-300";
  const plus = (
    <svg viewBox="0 0 17 17" fill="none" aria-hidden>
      <path d="M8.5 0v17M0 8.5h17" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
  return (
    <div className={cn("relative border border-zinc-200", className)}>
      <span className={cn(mark, "-left-[9px] -top-[9px]")}>{plus}</span>
      <span className={cn(mark, "-right-[9px] -top-[9px]")}>{plus}</span>
      <span className={cn(mark, "-bottom-[9px] -left-[9px]")}>{plus}</span>
      <span className={cn(mark, "-bottom-[9px] -right-[9px]")}>{plus}</span>
      {children}
    </div>
  );
}

/* Small mono chip used for metadata rows (shas, versions, counts). */
export function MonoChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-zinc-600",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* Live status dot with a soft pulse ring. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)} aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}

/* Tiny avatar chip from a name: deterministic zinc tone, initials only. */
export function AvatarChip({ name, className }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600 ring-2 ring-white",
        className,
      )}
      title={name}
    >
      {initial}
    </span>
  );
}

/* ============================================================================
   Marketing assets: hand-built product vignettes with real content.
   Everything is CSS/SVG. No screenshots, no images, crisp at every DPR.
   ========================================================================== */

const COMMITS = [
  { sha: "f3a91c2", msg: "feat(auth): passkey sign-in", author: "Ada" },
  { sha: "8d02b7e", msg: "perf(dashboard): halve initial load", author: "Lin" },
  { sha: "c114f9a", msg: "fix(api): rate-limit header casing", author: "Sam" },
  { sha: "77b3d10", msg: "feat(api)!: scoped tokens", author: "Ada" },
];

/* The hero vignette: merged PR on the left becomes a ready release on the right. */
export function HeroProduct() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* main frame */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-24px_rgba(24,24,27,0.18)]">
        {/* window bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          </div>
          <span className="hidden items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 font-mono text-[11px] text-zinc-400 sm:flex">
            <Icon name="Lock" size={10} />
            tryrelay.run/app/releases/v2.4.0
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            <LiveDot />
            watching main
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1.15fr]">
          {/* left: what merged */}
          <div className="p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Merged into main
              </p>
              <MonoChip>4 commits</MonoChip>
            </div>
            <div className="mt-3 space-y-1">
              {COMMITS.map((c) => (
                <div
                  key={c.sha}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-zinc-50"
                >
                  <AvatarChip name={c.author} />
                  <span className="truncate text-[13px] text-zinc-700">{c.msg}</span>
                  <span className="ml-auto hidden font-mono text-[11px] text-zinc-300 sm:block">
                    {c.sha}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200/70 bg-amber-50/60 px-3 py-2">
              <Icon name="AlertTriangle" size={13} className="shrink-0 text-amber-600" />
              <span className="text-[12px] text-amber-800">
                Breaking change found. Migration notes drafted.
              </span>
            </div>
          </div>

          {/* center: the relay */}
          <div className="relative hidden items-center md:flex">
            <div className="flex h-full flex-col items-center justify-center gap-2 px-1">
              <span className="h-full w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent" />
              <span className="absolute flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                <Icon name="Sparkles" size={14} className="text-indigo-600" />
              </span>
            </div>
          </div>

          {/* right: the drafted release */}
          <div className="border-t border-zinc-100 bg-zinc-50/40 p-5 md:border-l md:border-t-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MonoChip className="bg-zinc-950 text-white">v2.4.0</MonoChip>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Ready to review
                </span>
              </div>
              <span className="font-mono text-[11px] text-zinc-400">92%</span>
            </div>

            <h4 className="mt-3 text-[15px] font-semibold text-zinc-900">
              Passkeys and a faster dashboard
            </h4>
            <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-zinc-600">
              <li className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
                Sign in with a passkey. No password needed.
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
                The dashboard now loads about twice as fast.
              </li>
              <li className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
                API tokens are scoped. See the migration guide.
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {["Notes", "Changelog", "Post", "Email", "Banner"].map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-600"
                >
                  <Icon name="Check" size={11} className="text-emerald-500" />
                  {a}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-950 py-2 text-xs font-semibold text-white">
                Publish release
                <Icon name="ArrowRight" size={12} />
              </span>
              <span className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600">
                Edit
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* floating detail: the announcement chip */}
      <div className="absolute -bottom-16 -left-6 hidden w-60 rotate-[-1.2deg] rounded-xl border border-zinc-200 bg-white p-3.5 shadow-[0_12px_32px_-12px_rgba(24,24,27,0.25)] lg:block">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700">
            <Icon name="Twitter" size={12} className="text-zinc-400" />
            Announcement
          </span>
          <span className="font-mono text-[10px] text-zinc-400">drafted</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
          Acme v2.4.0 is out. Passkey sign-in, a 2x faster dashboard, and scoped API tokens.
        </p>
      </div>

      {/* floating detail: the banner chip */}
      <div className="absolute -right-2 -top-6 hidden w-44 rotate-[1.5deg] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_12px_32px_-12px_rgba(24,24,27,0.25)] lg:block">
        <div className="flex h-16 flex-col justify-center bg-gradient-to-br from-indigo-500 to-violet-600 px-3">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-white/70">
            Acme
          </span>
          <span className="text-[13px] font-bold text-white">What&apos;s new in v2.4.0</span>
        </div>
        <div className="px-3 py-1.5 text-[10px] font-medium text-zinc-400">banner.svg</div>
      </div>
    </div>
  );
}

/* The pipeline: one line, five stops. Used under "how it works". */
export function Pipeline() {
  const stops = [
    { icon: "GitMerge", label: "PR merges" },
    { icon: "ScanLine", label: "Commits read" },
    { icon: "PenLine", label: "Draft written" },
    { icon: "UserCheck", label: "You review" },
    { icon: "Send", label: "Published" },
  ];
  return (
    <div className="relative">
      <span className="absolute left-4 right-4 top-1/2 hidden h-px -translate-y-1/2 bg-zinc-200 sm:block" aria-hidden />
      <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-0">
        {stops.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center gap-2 text-center">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border bg-white",
                i === 3 ? "border-indigo-300 text-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.08)]" : "border-zinc-200 text-zinc-500",
              )}
            >
              <Icon name={s.icon} size={15} />
            </span>
            <span className="text-xs font-medium text-zinc-600">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
