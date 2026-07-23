// Relay's mascot — "Piko", a friendly little relay-bot that beams out your releases.
// Character-style (not an abstract mark) and avatar-friendly.
import { cn } from "@/lib/utils";

export function Mascot({
  size = 96,
  className,
  waves = true,
}: {
  size?: number;
  className?: string;
  waves?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Relay mascot"
    >
      <defs>
        <linearGradient id="m-head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b93ff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="m-ear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d6aff" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
        <radialGradient id="m-screen" cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#312e81" />
          <stop offset="1" stopColor="#0f0d2b" />
        </radialGradient>
        <radialGradient id="m-ant" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#a5f3fc" />
          <stop offset="1" stopColor="#22d3ee" />
        </radialGradient>
        <linearGradient id="m-eye" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      {/* antenna + relay signal */}
      {waves && (
        <g fill="none" stroke="#67e8f9" strokeWidth="5" strokeLinecap="round" opacity="0.85">
          <path d="M150 26 a22 22 0 0 1 0 26" />
          <path d="M163 17 a36 36 0 0 1 0 44" />
          <path d="M106 26 a22 22 0 0 0 0 26" />
          <path d="M93 17 a36 36 0 0 0 0 44" />
        </g>
      )}
      <path d="M128 72 L128 42" stroke="#8b93ff" strokeWidth="7" strokeLinecap="round" />
      <circle cx="128" cy="34" r="12" fill="url(#m-ant)" />
      <circle cx="123" cy="30" r="3.5" fill="#ecfeff" />

      {/* ears */}
      <rect x="38" y="120" width="26" height="52" rx="13" fill="url(#m-ear)" />
      <rect x="192" y="120" width="26" height="52" rx="13" fill="url(#m-ear)" />
      <circle cx="51" cy="146" r="6" fill="#c7d2fe" opacity="0.7" />
      <circle cx="205" cy="146" r="6" fill="#c7d2fe" opacity="0.7" />

      {/* head */}
      <rect x="54" y="74" width="148" height="140" rx="46" fill="url(#m-head)" />
      <path d="M78 96 q50 -20 100 0 q-50 -6 -100 0 Z" fill="#ffffff" opacity="0.18" />
      <g fill="#ffffff" opacity="0.26">
        <circle cx="74" cy="100" r="4" />
        <circle cx="182" cy="100" r="4" />
        <circle cx="74" cy="190" r="4" />
        <circle cx="182" cy="190" r="4" />
      </g>

      {/* face screen */}
      <rect x="74" y="102" width="108" height="86" rx="30" fill="url(#m-screen)" />
      <path d="M84 114 q44 -10 88 0 l0 9 q-44 -8 -88 0 Z" fill="#ffffff" opacity="0.07" />

      {/* eyes */}
      <g fill="url(#m-eye)">
        <rect x="97" y="128" width="20" height="26" rx="10" />
        <rect x="139" y="128" width="20" height="26" rx="10" />
      </g>
      <g fill="#ffffff">
        <circle cx="102" cy="134" r="3.5" />
        <circle cx="144" cy="134" r="3.5" />
      </g>

      {/* cheeks */}
      <circle cx="90" cy="162" r="8" fill="#fb7185" opacity="0.5" />
      <circle cx="166" cy="162" r="8" fill="#fb7185" opacity="0.5" />

      {/* mouth: a little soundwave = relaying */}
      <g fill="#67e8f9">
        <rect x="112" y="166" width="5" height="8" rx="2.5" />
        <rect x="121" y="161" width="5" height="18" rx="2.5" />
        <rect x="130" y="164" width="5" height="12" rx="2.5" />
        <rect x="139" y="167" width="5" height="6" rx="2.5" />
      </g>
    </svg>
  );
}
