import Link from "next/link";
import type { Metadata } from "next";
import { Mascot } from "@/components/mascot";
import { Icon } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why we built Relay: every release deserves a launch, and no engineer should have to write the LinkedIn post.",
};

const PRINCIPLES = [
  {
    icon: "Zap",
    title: "Automatic by default",
    body: "If a machine can notice it, draft it, or format it, a human shouldn't have to. Relay works before you ask.",
  },
  {
    icon: "EyeOff",
    title: "AI without the dashboard",
    body: "No model pickers, no agent builders, no prompt settings. The most advanced thing in Relay is a button that says Generate.",
  },
  {
    icon: "PenLine",
    title: "Humans hit publish",
    body: "Relay writes the draft; you own the words. Everything is editable, and nothing ships without your say-so.",
  },
  {
    icon: "Heart",
    title: "Releases are celebrations",
    body: "A changelog isn't compliance paperwork. It's the story of a team getting better every week — it should look like one.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Story */}
      <section className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Our story</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          The release notes never happen.
        </h1>

        <div className="mt-8 space-y-6 text-lg leading-relaxed text-zinc-600">
          <p>
            Here&apos;s a scene from every product team we&apos;ve ever been on. It&apos;s Thursday
            evening. The feature everyone&apos;s been grinding on finally merges. Slack fills with
            🎉. Somebody says <em>&ldquo;we should announce this&rdquo;</em> — and everybody
            silently agrees that somebody else will do it.
          </p>
          <p>
            Three weeks later, a customer asks if you&apos;re still working on the product.
            <strong className="text-zinc-900"> You shipped eleven times that month.</strong> The
            changelog says otherwise. The work was real; the silence was the bug.
          </p>
          <p>
            We kept seeing the same failure everywhere: writing release notes is nobody&apos;s
            job, so it becomes nobody&apos;s job. Engineers hate marketing-speak, marketers
            can&apos;t read diffs, and the tools that promised to help wanted you to configure
            twelve integrations and a workflow builder first.
          </p>
          <p>
            So we built the tool we wished existed: one that watches the repo, understands what
            actually changed, and shows up with the release notes, the changelog entry, the
            announcement thread, the email, and the banner —{" "}
            <strong className="text-zinc-900">already written, waiting for your edits.</strong>
          </p>
          <p>
            We call it Relay, because that&apos;s what it does: it takes the signal from your
            codebase and carries it the last mile to the people who care.
          </p>
        </div>
      </section>

      {/* Mascot */}
      <section className="border-y border-zinc-100 bg-zinc-50/60 py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-10 px-6 sm:grid-cols-[auto,1fr]">
          <div className="mx-auto">
            <Mascot size={170} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
              Meet Piko
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Our little relay-bot
            </h2>
            <p className="mt-4 leading-relaxed text-zinc-600">
              Piko is the character behind Relay — a small courier robot whose antenna picks up
              every merge and whose mouth is, quite literally, a soundwave. When your release
              goes out, that&apos;s Piko doing what Piko loves most: telling everyone about the
              cool thing you just built. If you see the waves, something good just shipped.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
            What we believe
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
            Four principles we won&apos;t trade away
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-2xl border border-zinc-100 bg-white p-7 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                <Icon name={p.icon} size={18} />
              </span>
              <h3 className="mt-4 font-bold text-zinc-900">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            We&apos;re early, and we build in the open
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-500">
            Relay is a young product with strong opinions. If it resonates — or if it&apos;s
            missing the one thing your team needs — we genuinely want to hear it.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
            >
              Try Relay
              <Icon name="ArrowRight" size={15} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-6 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
            >
              Say hello
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
