import Link from "next/link";
import type { Metadata } from "next";
import { Mascot } from "@/components/mascot";
import { Icon } from "@/components/ui";

export const metadata: Metadata = {
  title: "Relay — Your AI Release Manager",
  description:
    "Merge a PR. Relay writes the release notes, changelog, social posts and banner — you review, hit publish, and your changelog goes live. The AI Release Manager for teams who ship.",
};

/* ---------------------------------- bits ---------------------------------- */

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600">
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-zinc-500">{subtitle}</p>}
    </div>
  );
}

function Stars() {
  return (
    <span className="inline-flex text-amber-400">
      {[...Array(4)].map((_, i) => (
        <Icon key={i} name="Star" size={11} className="fill-amber-400" />
      ))}
      <Icon name="Star" size={11} className="text-zinc-200" />
    </span>
  );
}

/* ------------------------------ hero mockup ------------------------------ */
// A hand-built product shot (pure CSS) so it stays crisp on every screen.

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {/* glow */}
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-indigo-200/60 via-violet-200/50 to-cyan-100/60 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-indigo-500/10">
        {/* window bar */}
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 hidden rounded-md bg-white px-3 py-1 text-[11px] text-zinc-400 ring-1 ring-zinc-200 sm:block">
            relay.app / releases / v2.4.0
          </span>
        </div>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-[1.1fr,0.9fr]">
          {/* left: the release */}
          <div className="border-b border-zinc-100 p-5 sm:border-b-0 sm:border-r">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-600">
                v2.4.0
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                <span className="h-1 w-1 rounded-full bg-emerald-500" /> Ready
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-zinc-800">
              ✨ What&apos;s New
            </p>
            <div className="mt-2 space-y-1.5">
              {[86, 72, 64].map((w) => (
                <div key={w} className="h-2 rounded-full bg-zinc-100" style={{ width: `${w}%` }} />
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-800">🐛 Bug Fixes</p>
            <div className="mt-2 space-y-1.5">
              {[78, 58].map((w) => (
                <div key={w} className="h-2 rounded-full bg-zinc-100" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                <Icon name="Sparkles" size={12} className="text-indigo-500" /> AI confidence
              </span>
              <span className="flex items-center gap-1.5">
                <Stars />
                <span className="text-[11px] font-bold text-zinc-600">92%</span>
              </span>
            </div>
          </div>

          {/* right: generated assets */}
          <div className="space-y-2.5 bg-zinc-50/50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Generated for you
            </p>
            {[
              { icon: "FileText", label: "Release notes", state: "Ready" },
              { icon: "Twitter", label: "Announcement thread", state: "Ready" },
              { icon: "Linkedin", label: "LinkedIn post", state: "Ready" },
              { icon: "Mail", label: "Subscriber email", state: "Ready" },
              { icon: "Image", label: "Banner image", state: "Ready" },
            ].map((a) => (
              <div
                key={a.label}
                className="flex items-center justify-between rounded-lg border border-zinc-200/80 bg-white px-3 py-2"
              >
                <span className="flex items-center gap-2 text-xs font-medium text-zinc-700">
                  <Icon name={a.icon} size={13} className="text-zinc-400" />
                  {a.label}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <Icon name="Check" size={11} /> {a.state}
                </span>
              </div>
            ))}
            <button className="mt-1 w-full rounded-lg bg-indigo-500 py-2 text-xs font-bold text-white shadow-sm">
              Publish to 6 channels →
            </button>
          </div>
        </div>
      </div>

      {/* mascot peeking */}
      <div className="absolute -right-4 -top-12 hidden sm:block md:-right-10">
        <Mascot size={92} />
      </div>
      {/* webhook toast */}
      <div className="absolute -left-3 -bottom-5 hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 shadow-lg sm:flex md:-left-8">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white">
          <Icon name="GitMerge" size={14} />
        </span>
        <div className="text-left">
          <p className="text-[11px] font-bold text-zinc-800">PR #482 merged</p>
          <p className="text-[10px] text-zinc-400">Relay is drafting your release…</p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- page ---------------------------------- */

const STEPS = [
  {
    n: "01",
    icon: "GitMerge",
    title: "Merge like you always do",
    body: "Connect a GitHub repo once. When a PR lands on your release branch, Relay quietly drafts a release — no forms, no ceremony.",
  },
  {
    n: "02",
    icon: "Sparkles",
    title: "Relay writes everything",
    body: "One click turns raw commits into release notes, a changelog, social posts, a subscriber email, and a branded banner. Nine assets, ready at once.",
  },
  {
    n: "03",
    icon: "Send",
    title: "Review, then publish",
    body: "Edit anything, nudge the tone with one-tap refinements, and ship to your public changelog and every channel from a single screen.",
  },
];

const FEATURES = [
  {
    icon: "GitBranch",
    title: "Automatic release detection",
    body: "Every push to your target branch becomes a draft release. Your process doesn't change — Relay just notices.",
  },
  {
    icon: "FileText",
    title: "Release notes that read well",
    body: "What's New, Bug Fixes, Performance, Breaking Changes, Migration Notes — written for customers, not committers.",
  },
  {
    icon: "Megaphone",
    title: "Announcements for every channel",
    body: "Twitter, LinkedIn, Discord, Telegram, and an email draft — each in the right voice for the room.",
  },
  {
    icon: "Image",
    title: "A banner for every release",
    body: "Auto-generated in your brand colors. Every version ships with artwork, not just text.",
  },
  {
    icon: "SlidersHorizontal",
    title: "One-tap refinements",
    body: "Shorter. More technical. More customer-friendly. Adjust the tone without touching a settings page.",
  },
  {
    icon: "Globe",
    title: "A changelog worth linking to",
    body: "Branded, searchable, SEO-friendly, with RSS and email subscribers — on your own domain.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* ================================ HERO ================================ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.10),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center sm:pt-28">
          <Pill>
            <Icon name="Sparkles" size={12} />
            Now in public beta — free while we learn
          </Pill>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-zinc-900 sm:text-6xl">
            Merge the PR.
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Relay does the rest.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500 sm:text-xl">
            Relay is your AI Release Manager. It watches your repos, understands what you
            shipped, and writes the release notes, changelog, social posts and banner —
            so every release looks like you have a full-time launch team.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600 sm:w-auto"
            >
              Start shipping releases
              <Icon name="ArrowRight" size={16} />
            </Link>
            <Link
              href="/c/acme"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-sm font-bold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 sm:w-auto"
            >
              <Icon name="Globe" size={16} className="text-zinc-400" />
              See a live changelog
            </Link>
          </div>

          <p className="mt-4 text-xs text-zinc-400">
            No credit card. Connect a repo and publish your first release in minutes.
          </p>

          <div className="mt-16 sm:mt-20">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ============================ RECEIPT STRIP =========================== */}
      <section className="border-y border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 text-center sm:grid-cols-4">
          {[
            ["1 merge", "is all it takes"],
            ["9 assets", "generated per release"],
            ["6 channels", "from one publish screen"],
            ["0 workflows", "to configure — ever"],
          ].map(([big, small]) => (
            <div key={big}>
              <p className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">{big}</p>
              <p className="mt-1 text-sm text-zinc-500">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================= HOW IT WORKS =========================== */}
      <section id="how" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="How it works"
            title="Your release process, minus the release work"
            subtitle="No agent settings. No drag-and-drop automations. You merge — Relay handles the storytelling."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-zinc-100 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="absolute right-6 top-6 text-4xl font-extrabold text-zinc-100">
                  {s.n}
                </span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                  <Icon name={s.icon} size={20} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-zinc-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FEATURES ============================= */}
      <section id="product" className="scroll-mt-20 border-t border-zinc-100 bg-zinc-50/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            eyebrow="The product"
            title="Everything a release needs, nothing you have to babysit"
            subtitle="Relay does one workflow exceptionally well — and every piece of it is editable before it ships."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                  <Icon name={f.icon} size={18} />
                </span>
                <h3 className="mt-4 font-bold text-zinc-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== DEEP DIVE: AI =========================== */}
      <section className="py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
              AI you don&apos;t have to manage
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              It reads your commits like an engineer. It writes like your best marketer.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-500">
              Under the hood, a pipeline of specialists — commit analyzer, translator,
              marketing writer, image generator — turns <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm">fix(auth): resolve session race</code> into
              words a customer actually wants to read. You never configure any of it.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Understands conventional commits, PR titles, and plain-English messages",
                "Flags breaking changes and writes the migration notes for you",
                "Every asset scored with a confidence rating before you publish",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-zinc-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <Icon name="Check" size={12} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* mock: generated tweet card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-100/70 to-cyan-100/50 blur-xl" />
            <div className="relative space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-zinc-800">
                    <Icon name="Twitter" size={15} className="text-sky-400" /> Announcement
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Stars />
                    <span className="text-xs font-bold text-zinc-500">91%</span>
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  🚀 Acme v2.4.0 is live!
                  <br />• Passkey sign-in, no more passwords
                  <br />• 40% faster dashboard loads
                  <br />• Dark mode, everywhere
                  <br />
                  Full notes 👇 #shipit
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Regenerate", "Shorter", "More technical", "More friendly"].map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold text-zinc-500"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg">
                <span className="flex items-center gap-2 text-sm font-bold text-zinc-800">
                  <Icon name="AlertTriangle" size={15} className="text-amber-500" /> Breaking change
                  detected
                </span>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">
                    feat(api)!: scoped tokens
                  </code>{" "}
                  → Relay drafted migration notes and marked this release{" "}
                  <span className="font-semibold text-amber-600">high&nbsp;risk</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= DEEP DIVE: CHANGELOG ======================== */}
      <section className="border-t border-zinc-100 bg-zinc-50/50 py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
          {/* mock mini changelog */}
          <div className="relative order-last lg:order-first">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-violet-100/70 to-indigo-100/50 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
              <div className="border-b border-zinc-100 bg-gradient-to-b from-indigo-50/70 to-white px-6 py-5">
                <p className="text-sm font-extrabold text-zinc-900">🚀 Acme Changelog</p>
                <p className="text-xs text-zinc-400">updates.acme.com · RSS · Subscribe</p>
              </div>
              <div className="space-y-5 p-6">
                {[
                  ["v2.4.0", "Passkeys, dark mode & a faster dashboard", "Today"],
                  ["v2.3.0", "Scoped API tokens with migration guide", "Last week"],
                  ["v2.2.0", "Usage-based pricing tiers", "3 weeks ago"],
                ].map(([v, t, d]) => (
                  <div key={v} className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-600">
                      {v}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-800">{t}</p>
                      <p className="text-xs text-zinc-400">{d}</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-lg bg-zinc-50 px-3 py-2 text-center text-[11px] font-medium text-zinc-400">
                  Search · RSS · 1,248 subscribers
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
              The public changelog
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Your changelog becomes a place customers actually visit
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-500">
              Every workspace gets a beautiful, branded release page — searchable,
              SEO-optimized, with RSS and email subscriptions built in. Put it on your own
              domain and let your shipping velocity market itself.
            </p>
            <Link
              href="/c/acme"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-700"
            >
              Visit the live demo
              <Icon name="ExternalLink" size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================ STORYTELLING =========================== */}
      <section className="bg-zinc-950 py-24 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Mascot size={80} className="mx-auto" />
          <h2 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
            Shipping is the easy part.
            <br />
            <span className="text-zinc-400">Telling the world is where releases go to die.</span>
          </h2>
          <div className="mx-auto mt-8 space-y-5 text-left text-lg leading-relaxed text-zinc-300">
            <p>
              Every team we know has the same ritual: the feature ships, everyone celebrates in
              Slack… and the release notes never happen. The changelog is six versions behind.
              The tweet is a guilty afterthought. Customers find out about your best work by
              accident.
            </p>
            <p>
              We built Relay because the work you shipped deserves better than silence — and
              because nobody became an engineer to write LinkedIn posts. Relay reads what
              actually changed and gives every release the launch it deserves, automatically.
            </p>
            <p className="font-semibold text-white">
              Merge the PR. Relay does the rest. That&apos;s the whole product.
            </p>
          </div>
          <Link
            href="/about"
            className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-indigo-400 transition hover:text-indigo-300"
          >
            Read our story
            <Icon name="ArrowRight" size={15} />
          </Link>
        </div>
      </section>

      {/* ============================== FINAL CTA ============================ */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-indigo-400 px-8 py-16 text-center text-white sm:px-16">
            <div className="pointer-events-none absolute -right-10 -top-14 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your next merge could be your best launch yet
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-indigo-100">
              Connect a repository, merge something, and watch Relay turn it into a release
              your customers will actually read.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/app"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-indigo-600 shadow-lg transition hover:bg-indigo-50 sm:w-auto"
              >
                Open the dashboard
                <Icon name="ArrowRight" size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
