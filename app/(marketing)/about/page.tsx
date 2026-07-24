import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why we built Relay: every release deserves a launch, and no engineer should have to write the announcement.",
};

const PRINCIPLES = [
  {
    title: "Automatic by default",
    body: "If software can notice it, draft it, or format it, a person shouldn't have to. Relay does the work before you ask.",
  },
  {
    title: "AI you don't manage",
    body: "No model pickers, no agent builder, no prompt library. The most advanced control in Relay is a button that says Generate.",
  },
  {
    title: "People hit publish",
    body: "Relay writes the draft; you own the words. Every asset is editable, and nothing goes out without your review.",
  },
  {
    title: "Releases are worth celebrating",
    body: "A changelog isn't paperwork. It's the record of a team getting better every week — it should read like one.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Story */}
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-zinc-700"
          >
            <Icon name="ArrowLeft" size={14} />
            Back home
          </Link>
          <p className="mt-8 text-[13px] font-semibold uppercase tracking-wider text-indigo-600">
            Our story
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            The release notes never happen.
          </h1>

          <div className="mt-8 space-y-6 text-lg leading-relaxed text-zinc-600">
            <p>
              Here&apos;s a scene from every product team we&apos;ve worked on. It&apos;s Thursday
              evening. The feature everyone&apos;s been grinding on finally merges, the channel
              fills with congratulations, and someone says <em>we should announce this.</em>{" "}
              Everyone quietly agrees that someone else will.
            </p>
            <p>
              Three weeks later a customer asks whether the product is still being worked on. You
              shipped eleven times that month — but the changelog says otherwise. The work was
              real. The silence was the bug.
            </p>
            <p>
              We kept running into the same failure: writing release notes is nobody&apos;s job,
              so it becomes nobody&apos;s job. Engineers dislike marketing copy, marketers
              can&apos;t read diffs, and the tools that promised to help asked you to wire up a
              dozen integrations first.
            </p>
            <p>
              So we built the tool we wanted to use — one that watches the repository, understands
              what actually changed, and arrives with the release notes, the changelog entry, the
              announcement and the banner already written, waiting for your edits.
            </p>
          </div>
        </div>
      </section>

      {/* Thesis */}
      <section className="border-b border-zinc-100 bg-zinc-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-2xl font-medium leading-snug tracking-tight sm:text-[28px]">
            &ldquo;We named it Relay because that&apos;s the job: take the signal from your
            codebase and carry it the last mile to the people who care.&rdquo;
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-indigo-600">
              What we believe
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Four principles we won&apos;t trade away
            </h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="bg-white p-7">
                <span className="font-mono text-sm font-semibold text-indigo-600">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-semibold text-zinc-900">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where we're headed */}
      <section className="border-b border-zinc-100 bg-zinc-50/60">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-indigo-600">
            Where we&apos;re headed
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Start with the release. Grow into everything after it.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600">
            Today Relay does one thing well: it turns a merge into a polished release. Next comes
            documentation that updates itself, deeper customer communication, and support for more
            of the places your team already works. We&apos;re early, we build in the open, and the
            roadmap is shaped by the teams using it.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            If this resonates, we&apos;d love to hear from you
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-zinc-500">
            Try Relay, or tell us the one thing your team needs. We read every message.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Open the dashboard
              <Icon name="ArrowRight" size={15} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
