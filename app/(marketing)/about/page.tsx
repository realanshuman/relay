import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/ui";
import { Container, Eyebrow, SectionHead, ButtonPrimary, ButtonGhost } from "@/components/marketing";

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
    body: "A changelog isn't paperwork. It's the record of a team getting better every week, and it should read like one.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Story */}
      <section className="relative overflow-hidden border-b border-zinc-100">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(24,24,27,0.05)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_45%,transparent_100%)]" />
        </div>
        <Container className="max-w-3xl py-20 sm:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-zinc-700"
          >
            <Icon name="ArrowLeft" size={14} />
            Back home
          </Link>
          <div className="mt-8">
            <Eyebrow>Our story</Eyebrow>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
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
              shipped eleven times that month, but the changelog says otherwise. The work was
              real. The silence was the bug.
            </p>
            <p>
              We kept running into the same failure: writing release notes is nobody&apos;s job,
              so it becomes nobody&apos;s job. Engineers dislike marketing copy, marketers
              can&apos;t read diffs, and the tools that promised to help asked you to wire up a
              dozen integrations first.
            </p>
            <p>
              So we built the tool we wanted to use. One that watches the repository, understands
              what actually changed, and arrives with the release notes, the changelog entry, the
              announcement, and the banner already written, waiting for your edits.
            </p>
          </div>
        </Container>
      </section>

      {/* Thesis */}
      <section className="border-b border-zinc-100 bg-zinc-950 text-white">
        <Container className="max-w-3xl py-20 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
            Why &ldquo;Relay&rdquo;
          </span>
          <p className="mt-5 text-2xl font-medium leading-snug tracking-tight sm:text-[28px]">
            &ldquo;That&apos;s the job: take the signal from your codebase and carry it the last
            mile to the people who care.&rdquo;
          </p>
        </Container>
      </section>

      {/* Principles */}
      <section className="border-b border-zinc-100">
        <Container className="py-20 sm:py-24">
          <SectionHead eyebrow="What we believe" title="Four principles we won't trade away" />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="bg-white p-7 transition-colors hover:bg-zinc-50/70">
                <span className="font-mono text-xs font-semibold text-indigo-600">0{i + 1}</span>
                <h3 className="mt-3 font-semibold text-zinc-950">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Where we're headed */}
      <section className="border-b border-zinc-100 bg-zinc-50/50">
        <Container className="max-w-3xl py-20">
          <SectionHead
            eyebrow="Where we're headed"
            title="Start with the release. Grow into everything after it."
            lede="Today Relay does one thing well: it turns a merge into a polished release. Next comes documentation that updates itself, deeper customer communication, and support for more of the places your team already works. We're early, we build in the open, and the roadmap is shaped by the teams using it."
          />
        </Container>
      </section>

      {/* CTA */}
      <section>
        <Container className="max-w-3xl py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
            If this resonates, we&apos;d love to hear from you
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-zinc-500">
            Try Relay, or tell us the one thing your team needs. We read every message.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonPrimary href="/signup">
              Get started free
              <Icon name="ArrowRight" size={15} />
            </ButtonPrimary>
            <ButtonGhost href="/contact">Contact us</ButtonGhost>
          </div>
        </Container>
      </section>
    </div>
  );
}
