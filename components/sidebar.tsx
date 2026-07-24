"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn, initials } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Icon } from "./ui";
import { LogoMark } from "./logo";

type NavItem = { href: string; label: string; icon: string; exact?: boolean };
type NavGroup = { label: string | null; items: NavItem[] };

const NAV: NavGroup[] = [
  { label: null, items: [{ href: "/app", label: "Dashboard", icon: "LayoutDashboard", exact: true }] },
  {
    label: "Releases",
    items: [
      { href: "/app/releases", label: "Releases", icon: "Rocket" },
      { href: "/app/changelog", label: "Public Changelog", icon: "Globe" },
    ],
  },
  {
    label: "Sources",
    items: [
      { href: "/app/repositories", label: "Repositories", icon: "Package" },
      { href: "/app/integrations", label: "Integrations", icon: "Blocks" },
    ],
  },
  { label: null, items: [{ href: "/app/settings", label: "Settings", icon: "Settings" }] },
];

export function Sidebar({
  workspace,
  user,
  onNavigate,
}: {
  workspace: { name: string; slug: string; faviconEmoji: string };
  user: { name: string; email: string };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-4 py-4"
        title="Relay home"
      >
        <LogoMark size={30} />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-zinc-900">Relay</div>
          <div className="text-[11px] text-zinc-400">AI Release Manager</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {NAV.map((group, gi) => (
          <div key={gi} className="space-y-0.5">
            {group.label && (
              <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
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
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-zinc-100 p-3">
        <Link
          href={`/c/${workspace.slug}`}
          target="_blank"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-600 transition hover:border-zinc-300 hover:bg-white"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-base leading-none">{workspace.faviconEmoji}</span>
            <span className="truncate font-medium text-zinc-700">{workspace.name}</span>
          </span>
          <Icon name="ExternalLink" size={13} className="shrink-0 text-zinc-400" />
        </Link>

        <UserMenu user={user} />
      </div>
    </aside>
  );
}

function UserMenu({ user }: { user: { name: string; email: string } }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function handleSignOut() {
    startTransition(async () => {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    });
  }
  return (
    <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
        {initials(user.name)}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-xs font-semibold text-zinc-800">{user.name}</div>
        <div className="truncate text-[11px] text-zinc-400">{user.email}</div>
      </div>
      <button
        onClick={handleSignOut}
        disabled={pending}
        title="Sign out"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
      >
        <Icon name={pending ? "Loader2" : "LogOut"} size={15} className={pending ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
