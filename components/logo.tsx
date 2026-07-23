import { cn } from "@/lib/utils";

// The Relay mark: a minimal bot face in a solid circle — flat, geometric,
// monochrome with a single accent. Same mark everywhere: nav, sidebar, auth,
// favicon, public changelog.
//
//   base   — badge color (defaults to near-black)
//   invert — white badge / dark face, for dark surfaces

export function LogoMark({
  size = 28,
  invert = false,
  className,
}: {
  size?: number;
  invert?: boolean;
  className?: string;
}) {
  const badge = invert ? "#ffffff" : "#18181b";
  const face = invert ? "#18181b" : "#ffffff";
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Relay"
    >
      {/* badge */}
      <circle cx="16" cy="16" r="16" fill={badge} />
      {/* antenna */}
      <rect x="15.25" y="7.5" width="1.5" height="3.5" rx="0.75" fill={face} />
      <circle cx="16" cy="6.5" r="1.75" fill="#818cf8" />
      {/* head */}
      <rect x="8" y="11.5" width="16" height="12.5" rx="6" fill={face} />
      {/* eyes */}
      <circle cx="12.75" cy="17" r="1.9" fill={badge} />
      <circle cx="19.25" cy="17" r="1.9" fill={badge} />
      {/* mouth */}
      <rect x="13.75" y="20.4" width="4.5" height="1.5" rx="0.75" fill={badge} />
    </svg>
  );
}

export function Logo({
  size = 28,
  invert = false,
  className,
  wordClassName,
}: {
  size?: number;
  invert?: boolean;
  className?: string;
  wordClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} invert={invert} />
      <span
        className={cn(
          "text-[17px] font-semibold tracking-tight",
          invert ? "text-white" : "text-zinc-900",
          wordClassName,
        )}
      >
        Relay
      </span>
    </span>
  );
}
