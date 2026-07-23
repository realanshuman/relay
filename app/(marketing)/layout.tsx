import Link from "next/link";
import { Mascot } from "@/components/mascot";
import { Icon } from "@/components/ui";

const NAV_LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#how", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const FOOTER_COLS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/#product", label: "Features" },
      { href: "/#how", label: "How it works" },
      { href: "/c/acme", label: "Live changelog demo", external: true },
      { href: "/app", label: "Open dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Mascot size={36} waves={false} />
            <span className="text-[17px] font-bold tracking-tight">Relay</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/c/acme"
              className="hidden text-sm font-medium text-zinc-500 transition hover:text-zinc-900 sm:block"
            >
              Live demo
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Open dashboard
              <Icon name="ArrowRight" size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer — deliberately simple */}
      <footer className="border-t border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5">
                <Mascot size={40} />
                <span className="text-lg font-bold tracking-tight">Relay</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                The AI Release Manager that turns every merged pull request into a polished
                product release.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              {FOOTER_COLS.map((col) => (
                <div key={col.title}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {col.title}
                  </h4>
                  <ul className="mt-3 space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          target={l.external ? "_blank" : undefined}
                          className="text-sm text-zinc-600 transition hover:text-zinc-900"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-zinc-200/70 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} Relay. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Made with <Icon name="Heart" size={12} className="text-rose-400" /> for teams who ship
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
