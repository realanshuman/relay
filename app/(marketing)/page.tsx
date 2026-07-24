import type { Metadata } from "next";
import { Icon } from "@/components/ui";
import { LogoMark } from "@/components/logo";
import {
  Container,
  Eyebrow,
  SectionHead,
  ButtonPrimary,
  ButtonGhost,
  MonoChip,
  LiveDot,
  HeroProduct,
  Pipeline,
} from "@/components/marketing";

export const metadata: Metadata = {
  title: "Relay: Your AI Release Manager",
  description:
    "Relay turns every merged pull request into a polished release: notes, changelog, announcements, and a branded changelog page. Review, publish, done.",
};

/* --------------------------------- data ---------------------------------- */

const STEPS = [
  {
    n: "01",
    title: "Connect a repository",
    body: "One click with GitHub. Pick the repos Relay should watch. Your workflow doesn't change at all.",
  },
  {
    n: "02",
    title: "Merge like you always do",
    body: "When a pull request lands, Relay reads the commits and drafts the whole release while you're still in the PR thread.",
  },
  {
    n: "03",
    title: "Review and publish",
    body: "Fix a word, adjust the tone, hit publish. Your changelog, subscribers, and announcement drafts update from one screen.",
  },
];

const WORKS_WITH = [
  { icon: "Github", label: "GitHub" },
  { icon: "Sparkles", label: "OpenRouter" },
  { icon: "Mail", label: "Resend" },
  { icon: "Rss", label: "RSS" },
  { icon: "Globe", label: "Your domain" },
];

const FAQS = [
  {
    q: "Do I have to change how my team works?",
    a: "No. Relay watches the branch you already merge to. There are no new commands, no CI steps, and nothing to add to your PR template. Merge as usual; the draft is waiting in Relay.",
  },
  {
    q: "What does the AI actually read?",
    a: "Commit messages and pull request titles on your release branch. It understands conventional commits (feat, fix, perf, breaking) but plain English works too. It never invents features that are not in the commits.",
  },
  {
    q: "Can I edit what it writes?",
    a: "Everything. Each asset is a draft you can edit directly or nudge with one click: shorter, more technical, more customer friendly. Nothing is published until you hit publish.",
  },
  {
    q: "Do I need my own AI key?",
    a: "No. Relay ships with a built-in generator that works with zero configuration. Add an OpenRouter key when you want live LLM writing; free models are the default chain.",
  },
  {
    q: "What does it cost?",
    a: "Relay is free while in public beta. When paid plans arrive, there will always be a way to publish your first releases without a card.",
  },
];

/* --------------------------------- page ---------------------------------- */

export default function LandingPage() {
  return (
    <div>
      {/* =============================== HERO ============================== */}
      <section className="relative overflow-hidden border-b border-zinc-100">
        {/* dotted baseline grid + soft glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(24,24,27,0.05)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_50%,transparent_100%)]" />
          <div className="absolute left-1/2 top-[-10%] h-[420px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-indigo-400/12 blur-[110px]" />
        </div>

        <Container className="pb-24 pt-20 text-center sm:pt-24 lg:pb-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur">
            <LiveDot />
            Free while in public beta
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 sm:text-[56px]">
            You merge the PR.
            <br />
            Relay writes the release.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-500">
            Relay reads what shipped and drafts the release notes, changelog, announcement
            posts, and banner. You review, publish, and get back to building.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonPrimary href="/signup">
              Start shipping releases
              <Icon name="ArrowRight" size={15} />
            </ButtonPrimary>
            <ButtonGhost href="/c/acme">
              <Icon name="Globe" size={15} className="text-zinc-400" />
              See a live changelog
            </ButtonGhost>
          </div>
          <p className="mt-4 text-[13px] text-zinc-400">
            No credit card. First release published in minutes.
          </p>

          <div className="mt-16">
            <HeroProduct />
          </div>
        </Container>
      </section>

      {/* ============================ WORKS WITH =========================== */}
      <section className="border-b border-zinc-100">
        <Container className="flex flex-col items-center gap-5 py-10 sm:flex-row sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-400">
            Plays well with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {WORKS_WITH.map((w) => (
              <span key={w.label} className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-700">
                <Icon name={w.icon} size={16} />
                {w.label}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================ HOW IT WORKS ========================= */}
      <section id="how" className="scroll-mt-20 border-b border-zinc-100">
        <Container className="py-20 sm:py-24">
          <SectionHead
            eyebrow="How it works"
            title="Your release process, minus the busywork"
            lede="No automation builder, no agent settings. You merge, and Relay carries it from commits to a published release."
          />

          <div className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-6 py-8 sm:px-10">
            <Pipeline />
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="group bg-white p-7 transition-colors hover:bg-zinc-50/70">
                <span className="font-mono text-xs font-semibold text-indigo-600">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-zinc-950">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ========================== FEATURES (BENTO) ======================= */}
      <section id="product" className="scroll-mt-20 border-b border-zinc-100 bg-zinc-50/50">
        <Container className="py-20 sm:py-24">
          <SectionHead
            eyebrow="What you get"
            title="Nine assets per release, written for humans"
            lede="Everything a proper release needs, drafted the moment the merge lands. Every piece is yours to edit before it ships."
          />

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6">
            {/* Large: release notes */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 md:col-span-4">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="sm:w-[45%]">
                  <Icon name="FileText" size={18} className="text-indigo-600" />
                  <h3 className="mt-3 font-semibold text-zinc-950">Notes people actually read</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                    What&apos;s New, Bug Fixes, Performance, Breaking Changes, and migration
                    steps. Written in plain language, not commit-speak.
                  </p>
                </div>
                <div className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 text-[12px] leading-relaxed">
                  <p className="font-semibold text-zinc-800">✨ What&apos;s New</p>
                  <p className="mt-1 text-zinc-600">
                    <span className="font-medium text-zinc-800">Passkey sign-in.</span> Skip the
                    password. Works with Face ID and fingerprint.
                  </p>
                  <p className="mt-2.5 font-semibold text-zinc-800">⚡ Performance</p>
                  <p className="mt-1 text-zinc-600">
                    Dashboards load about twice as fast on large workspaces.
                  </p>
                  <p className="mt-2.5 flex items-center justify-between border-t border-zinc-200 pt-2 text-[11px] text-zinc-400">
                    <span>release_notes.md</span>
                    <span className="font-mono">confidence 94%</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Breaking changes */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 md:col-span-2">
              <Icon name="AlertTriangle" size={18} className="text-amber-500" />
              <h3 className="mt-3 font-semibold text-zinc-950">Breaking changes flagged</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                A <span className="font-mono text-[12px] text-zinc-700">feat!:</span> commit marks
                the release high risk and drafts the migration notes for you.
              </p>
              <div className="mt-4 rounded-lg border border-amber-200/70 bg-amber-50/60 px-3 py-2 font-mono text-[11px] text-amber-800">
                feat(api)!: scoped tokens
              </div>
            </div>

            {/* Channels */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 md:col-span-2">
              <Icon name="Megaphone" size={18} className="text-indigo-600" />
              <h3 className="mt-3 font-semibold text-zinc-950">One voice per channel</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                A thread for X, a post for LinkedIn, a note for Discord, an email for
                subscribers. Each written for its audience.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Twitter", "LinkedIn", "Discord", "Telegram", "Email"].map((c) => (
                  <MonoChip key={c}>{c}</MonoChip>
                ))}
              </div>
            </div>

            {/* Refine */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 md:col-span-2">
              <Icon name="SlidersHorizontal" size={18} className="text-indigo-600" />
              <h3 className="mt-3 font-semibold text-zinc-950">Refine with one click</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                Not quite right? Nudge any draft without rewriting it yourself.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Shorter", "More technical", "Friendlier", "Regenerate"].map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Banner */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 md:col-span-2">
              <Icon name="Image" size={18} className="text-indigo-600" />
              <h3 className="mt-3 font-semibold text-zinc-950">A banner for every version</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                Generated in your brand colors, so each release ships with artwork.
              </p>
              <div className="mt-4 flex h-14 flex-col justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-3">
                <span className="font-mono text-[8px] font-semibold uppercase tracking-widest text-white/70">
                  Acme
                </span>
                <span className="text-xs font-bold text-white">What&apos;s new in v2.4.0</span>
              </div>
            </div>

            {/* Auto-detection */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 md:col-span-2">
              <Icon name="GitMerge" size={18} className="text-indigo-600" />
              <h3 className="mt-3 font-semibold text-zinc-950">Detection you don&apos;t configure</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                Every push to your release branch becomes a draft. No triggers, no YAML, no
                workflows to maintain.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                <LiveDot />
                watching <span className="text-zinc-800">acme/web</span> on{" "}
                <MonoChip>main</MonoChip>
              </div>
            </div>

            {/* Changelog */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-7 md:col-span-4">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="sm:w-[45%]">
                  <Icon name="Globe" size={18} className="text-indigo-600" />
                  <h3 className="mt-3 font-semibold text-zinc-950">A changelog worth linking</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                    Branded, searchable, on your own domain. RSS and email subscriptions are
                    built in, so shipping becomes your marketing.
                  </p>
                </div>
                <div className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-zinc-500">
                      updates.<span className="text-zinc-800">yourcompany</span>.com
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                      <Icon name="Rss" size={11} />
                      RSS
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      ["v2.4.0", "Passkeys and a faster dashboard", "Today"],
                      ["v2.3.0", "Scoped API tokens", "Last week"],
                    ].map(([v, t, when]) => (
                      <div key={v} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-zinc-100">
                        <MonoChip>{v}</MonoChip>
                        <span className="truncate text-[12px] font-medium text-zinc-700">{t}</span>
                        <span className="ml-auto shrink-0 text-[10px] text-zinc-400">{when}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================== THE INTELLIGENCE ====================== */}
      <section className="border-b border-zinc-100">
        <Container className="grid grid-cols-1 items-center gap-12 py-20 sm:py-24 lg:grid-cols-2">
          <div>
            <SectionHead
              eyebrow="The intelligence"
              title="Reads commits like an engineer. Writes like your best communicator."
              lede="Relay parses commits and PR titles, then turns them into words a customer wants to read. Nothing to configure: no model pickers, no prompt tuning."
            />
            <ul className="mt-8 space-y-3.5">
              {[
                "Understands conventional commits, PR titles, and plain English",
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
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_12px_40px_-20px_rgba(24,24,27,0.15)]">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <Icon name="Twitter" size={15} className="text-zinc-400" />
                  Announcement
                </span>
                <span className="font-mono text-xs text-zinc-400">91% confidence</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Acme v2.4.0 is out. Passkey sign-in means no more passwords, the dashboard loads
                twice as fast, and API tokens are now scoped. Full notes in the thread.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Regenerate", "Shorter", "More technical", "Friendlier"].map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-800"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
              <span className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Icon name="AlertTriangle" size={15} />
                Breaking change detected
              </span>
              <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
                From{" "}
                <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-900">
                  feat(api)!: scoped tokens
                </code>
                , Relay drafted migration notes and marked this release high risk.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================== STORY ============================= */}
      <section className="bg-zinc-950 text-white">
        <Container className="max-w-3xl py-20 sm:py-28">
          <LogoMark size={40} invert />
          <h2 className="mt-8 text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
            Shipping is the easy part. Telling people is where releases stall.
          </h2>
          <div className="mt-7 space-y-5 text-lg leading-relaxed text-zinc-400">
            <p>
              Every team we know runs the same ritual. The feature ships, the channel fills with
              emoji, and someone says &ldquo;we should announce this.&rdquo; Then it doesn&apos;t
              happen. The changelog falls behind, the post never goes out, and customers find
              your best work by accident.
            </p>
            <p>
              We built Relay because the work you ship deserves better than silence, and because
              nobody became an engineer to write launch posts.
            </p>
          </div>
          <a
            href="/about"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-zinc-300"
          >
            Read the full story
            <Icon name="ArrowRight" size={15} />
          </a>
        </Container>
      </section>

      {/* =============================== FAQ ============================== */}
      <section className="border-b border-zinc-100">
        <Container className="max-w-3xl py-20 sm:py-24">
          <SectionHead eyebrow="Questions" title="Answers, without the sales call" center />
          <div className="mt-10 divide-y divide-zinc-100 border-y border-zinc-100">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition group-open:rotate-45 group-open:border-zinc-300 group-open:text-zinc-700">
                    <Icon name="Plus" size={13} />
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* =============================== CTA ============================== */}
      <section>
        <Container className="py-20 sm:py-24">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 px-8 py-12 text-center sm:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:20px_20px]"
            />
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-40 w-[480px] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-[90px]" />
            <div className="relative">
              <Eyebrow>
                <span className="text-zinc-400">Ship the story too</span>
              </Eyebrow>
              <h2 className="mx-auto mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Turn your next merge into a launch
              </h2>
              <p className="mx-auto mt-3 max-w-md text-zinc-400">
                Connect a repository and publish your first release today. Free in beta.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonPrimary href="/signup" className="bg-white text-zinc-950 hover:bg-zinc-200">
                  Get started free
                  <Icon name="ArrowRight" size={15} />
                </ButtonPrimary>
                <ButtonGhost
                  href="/contact"
                  className="border-zinc-700 bg-transparent text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900"
                >
                  Talk to us
                </ButtonGhost>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
