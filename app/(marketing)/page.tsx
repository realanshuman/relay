import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/ui";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "Relay — Your AI Release Manager",
  description:
    "Relay turns every merged pull request into a polished release — notes, changelog, announcements and a branded changelog page. Review, publish, done.",
};

/* ------------------------------- primitives ------------------------------- */

function ButtonPrimary({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}

function ButtonGhost({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
    >
      {children}
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-semibold uppercase tracking-wider text-indigo-600">{children}</p>
  );
}

/* ------------------------------- hero shot -------------------------------- */
// Hand-built product frame (pure CSS) — no screenshots, crisp on every screen.

function ProductFrame() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_40px_-12px_rgba(0,0,0,0.18)]">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="ml-2 flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] text-zinc-400">
            <Icon name="Lock" size={10} />
            app.relay.dev/releases/v2.4.0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1.15fr,0.85fr]">
          {/* release */}
          <div className="border-b border-zinc-100 p-5 sm:border-b-0 sm:border-r">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-700">
                v2.4.0
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ready to publish
              </span>
            </div>
            <h4 className="mt-4 text-sm font-semibold text-zinc-900">What&apos;s New</h4>
            <div className="mt-2 space-y-1.5">
              {[92, 74, 62].map((w) => (
                <div key={w} className="h-1.5 rounded-full bg-zinc-100" style={{ width: `${w}%` }} />
              ))}
            </div>
            <h4 className="mt-4 text-sm font-semibold text-zinc-900">Bug Fixes</h4>
            <div className="mt-2 space-y-1.5">
              {[80, 56].map((w) => (
                <div key={w} className="h-1.5 rounded-full bg-zinc-100" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3">
              <span className="text-[11px] font-medium text-zinc-400">AI confidence</span>
              <span className="text-[11px] font-semibold text-zinc-600">92%</span>
            </div>
          </div>

          {/* generated assets */}
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Generated
            </p>
            <div className="mt-3 space-y-1.5">
              {[
                { icon: "FileText", label: "Release notes" },
                { icon: "GitBranch", label: "Changelog entry" },
                { icon: "Twitter", label: "Announcement post" },
                { icon: "Mail", label: "Subscriber email" },
                { icon: "Image", label: "Banner image" },
              ].map((a) => (
                <div key={a.label} className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2 text-[13px] text-zinc-600">
                    <Icon name={a.icon} size={13} className="text-zinc-400" />
                    {a.label}
                  </span>
                  <Icon name="Check" size={13} className="text-emerald-500" />
                </div>
              ))}
            </div>
            <div className="mt-4 w-full rounded-lg bg-zinc-900 py-2 text-center text-xs font-semibold text-white">
              Publish to 6 channels
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- data ---------------------------------- */

const STEPS = [
  {
    n: "01",
    title: "Connect a repository",
    body: "Point Relay at a GitHub repo and pick your release branch. Setup takes about a minute, and your workflow doesn't change.",
  },
  {
    n: "02",
    title: "Merge as usual",
    body: "When a pull request lands, Relay reads the commits, understands what shipped, and drafts the release for you automatically.",
  },
  {
    n: "03",
    title: "Review and publish",
    body: "Edit anything, adjust the tone with one click, and publish to your changelog and every channel from a single screen.",
  },
];

const FEATURES = [
  {
    icon: "GitBranch",
    title: "Automatic release detection",
    body: "Every push to your release branch becomes a draft. No triggers to wire up, no workflows to maintain.",
  },
  {
    icon: "FileText",
    title: "Notes written for customers",
    body: "What's New, Bug Fixes, Performance, Breaking Changes and migration steps — in plain language, not commit-speak.",
  },
  {
    icon: "Megaphone",
    title: "Announcements per channel",
    body: "Twitter, LinkedIn, Discord, Telegram and an email draft, each written in the right voice for the audience.",
  },
  {
    icon: "Image",
    title: "A banner for every version",
    body: "Generated in your brand colors so each release ships with artwork, not just a wall of text.",
  },
  {
    icon: "SlidersHorizontal",
    title: "Refine in one click",
    body: "Shorter. More technical. More customer-friendly. Nudge any draft without opening a settings panel.",
  },
  {
    icon: "Globe",
    title: "A changelog worth sharing",
    body: "Branded, searchable and SEO-friendly, with RSS and email subscriptions — hosted on your own domain.",
  },
];

/* --------------------------------- page ---------------------------------- */

export default function LandingPage() {
  return (
    <div>
      {/* =============================== HERO ============================== */}
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Public beta — free while we&apos;re building
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-900 sm:text-[56px]">
            Every merge deserves
            <br className="hidden sm:block" /> a real release.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-500">
            Relay is your AI Release Manager. It reads what you shipped and writes the release
            notes, changelog, announcements and banner — so you review, publish, and move on.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonPrimary href="/signup">
              Get started free
              <Icon name="ArrowRight" size={15} />
            </ButtonPrimary>
            <ButtonGhost href="/c/acme">
              <Icon name="Globe" size={15} className="text-zinc-400" />
              View a live changelog
            </ButtonGhost>
          </div>
          <p className="mt-4 text-[13px] text-zinc-400">
            No credit card required. Publish your first release in minutes.
          </p>

          <div className="mt-14">
            <ProductFrame />
          </div>
        </div>
      </section>

      {/* ============================== METRICS =========================== */}
      <section className="border-b border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-zinc-200/70 px-6 py-10 sm:grid-cols-4">
          {[
            ["1", "merge to trigger it"],
            ["9", "assets per release"],
            ["6", "channels, one screen"],
            ["0", "workflows to configure"],
          ].map(([big, small]) => (
            <div key={small} className="px-4 text-center first:pl-0 last:pr-0">
              <p className="text-3xl font-semibold tracking-tight text-zinc-900">{big}</p>
              <p className="mt-1 text-[13px] text-zinc-500">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ HOW IT WORKS ======================== */}
      <section id="how" className="scroll-mt-20 border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Your release process, without the busywork
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-500">
              No agent settings and no automation builder. You merge — Relay takes it from
              commits to a published release.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white p-7">
                <span className="font-mono text-sm font-semibold text-indigo-600">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-zinc-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FEATURES ========================== */}
      <section id="product" className="scroll-mt-20 border-b border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>The product</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Everything a release needs, nothing to babysit
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-500">
              Relay does one workflow exceptionally well — and every piece of it is yours to edit
              before it ships.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
                  <Icon name={f.icon} size={17} />
                </span>
                <h3 className="mt-4 font-semibold text-zinc-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== DEEP DIVE: AI ======================== */}
      <section className="border-b border-zinc-100">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2">
          <div>
            <Eyebrow>The intelligence</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Reads commits like an engineer. Writes like your best communicator.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-500">
              Relay parses your commits and pull requests, then turns them into words a customer
              actually wants to read. There&apos;s nothing to configure — no models to pick, no
              prompts to tune.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                "Understands conventional commits, PR titles and plain-English messages",
                "Flags breaking changes and drafts the migration notes",
                "Scores every asset with a confidence rating before you publish",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-zinc-700">
                  <Icon name="Check" size={18} className="mt-0.5 shrink-0 text-indigo-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <Icon name="Twitter" size={15} className="text-zinc-400" />
                  Announcement
                </span>
                <span className="text-xs font-medium text-zinc-400">91% confidence</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Acme v2.4.0 is out. Passkey sign-in means no more passwords, the dashboard loads
                40% faster, and dark mode is now everywhere. Full notes in the thread.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Regenerate", "Shorter", "More technical", "Friendlier"].map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-500"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
              <span className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Icon name="AlertTriangle" size={15} />
                Breaking change detected
              </span>
              <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
                <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-900">
                  feat(api)!: scoped tokens
                </code>{" "}
                — Relay drafted migration notes and marked this release high risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= DEEP DIVE: CHANGELOG ===================== */}
      <section className="border-b border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-2">
          <div className="order-last lg:order-first">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-6 py-4">
                <p className="text-sm font-semibold text-zinc-900">Acme Changelog</p>
                <p className="text-xs text-zinc-400">updates.acme.com · RSS · Subscribe</p>
              </div>
              <div className="divide-y divide-zinc-100">
                {[
                  ["v2.4.0", "Passkeys, dark mode and a faster dashboard", "Today"],
                  ["v2.3.0", "Scoped API tokens with a migration guide", "Last week"],
                  ["v2.2.0", "Usage-based pricing tiers", "3 weeks ago"],
                ].map(([v, t, d]) => (
                  <div key={v} className="flex items-start gap-3 px-6 py-3.5">
                    <span className="mt-0.5 rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-600">
                      {v}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-800">{t}</p>
                      <p className="text-xs text-zinc-400">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Eyebrow>The public changelog</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              A changelog customers actually visit
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-500">
              Every workspace gets a branded release page — searchable, SEO-friendly, with RSS and
              email subscriptions built in. Put it on your own domain and let your shipping speak
              for itself.
            </p>
            <div className="mt-7">
              <ButtonPrimary href="/c/acme">
                See the live demo
                <Icon name="ArrowUpRight" size={15} />
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== STORY ============================= */}
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <LogoMark size={40} invert />
          <h2 className="mt-8 text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
            Shipping is the easy part. Telling people is where releases stall.
          </h2>
          <div className="mt-7 space-y-5 text-lg leading-relaxed text-zinc-400">
            <p>
              Every team we know runs the same ritual. The feature ships, the channel fills with
              emoji, and someone says &ldquo;we should announce this.&rdquo; Then it doesn&apos;t
              happen. The changelog falls behind, the post never goes out, and customers find your
              best work by accident.
            </p>
            <p>
              We built Relay because the work you ship deserves better than silence — and because
              nobody became an engineer to write launch posts. Relay reads what actually changed
              and gives every release the attention it deserves, automatically.
            </p>
          </div>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-zinc-300"
          >
            Read the full story
            <Icon name="ArrowRight" size={15} />
          </Link>
        </div>
      </section>

      {/* =============================== CTA ============================== */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 px-8 py-10 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Turn your next merge into a launch
              </h2>
              <p className="mt-2 text-zinc-500">
                Connect a repository and publish your first release today.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <ButtonPrimary href="/signup">Get started free</ButtonPrimary>
              <ButtonGhost href="/contact">Contact us</ButtonGhost>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
