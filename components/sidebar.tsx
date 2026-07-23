"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "./ui";

const NAV = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/releases", label: "Releases", icon: "Rocket" },
  { href: "/repositories", label: "Repositories", icon: "Package" },
  { href: "/changelog", label: "Public Changelog", icon: "Globe" },
  { href: "/settings", label: "Settings", icon: "Settings" },
];

export function Sidebar({
  workspaceName,
  faviconEmoji,
  slug,
}: {
  workspaceName: string;
  faviconEmoji: string;
  slug: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--brand)]/70 text-sm text-white shadow-sm">
          <Icon name="Radio" size={17} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-zinc-900">Relay</div>
          <div className="text-[11px] text-zinc-400">AI Release Manager</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2.5 py-2">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <Icon
                name={item.icon}
                size={17}
                className={active ? "text-[var(--brand)]" : "text-zinc-400 group-hover:text-zinc-600"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3">
        <Link
          href={`/c/${slug}`}
          target="_blank"
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-600 transition hover:border-zinc-300 hover:bg-white"
        >
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">{faviconEmoji}</span>
            <span className="font-medium text-zinc-700">{workspaceName}</span>
          </span>
          <Icon name="ExternalLink" size={13} className="text-zinc-400" />
        </Link>
      </div>
    </aside>
  );
}
