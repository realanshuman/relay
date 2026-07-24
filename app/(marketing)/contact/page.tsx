import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/ui";
import { Container, Eyebrow } from "@/components/marketing";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, feedback, or a bug to report? Talk to the Relay team.",
};

const CARDS = [
  {
    icon: "MessageCircle",
    title: "Product feedback",
    body: "Missing the one thing your team needs? That's exactly what we want to hear.",
  },
  {
    icon: "Bug",
    title: "Something broke",
    body: "Tell us what happened and what you expected. We read every report.",
  },
  {
    icon: "Newspaper",
    title: "Press and partnerships",
    body: "Writing about release tooling, or want to build with Relay? Let's talk.",
  },
];

export default function ContactPage() {
  return (
    <Container className="max-w-5xl py-20 sm:py-24">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-zinc-700"
        >
          <Icon name="ArrowLeft" size={14} />
          Back home
        </Link>
        <div className="mt-8">
          <Eyebrow>Contact</Eyebrow>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Get in touch
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-500">
          We&apos;re a small team and we answer our own email. Feedback, bugs, ideas, or a
          changelog you&apos;re proud of: we&apos;d like to hear it.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,1.2fr]">
        <div className="space-y-4">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600">
                  <Icon name={c.icon} size={18} />
                </span>
                <div>
                  <h3 className="font-semibold text-zinc-950">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 p-6 text-sm text-zinc-500">
            <span className="font-semibold text-zinc-700">Prefer plain email?</span> Write to{" "}
            <a
              href="mailto:hello@tryrelay.run"
              className="font-semibold text-indigo-600 underline underline-offset-2"
            >
              hello@tryrelay.run
            </a>
            . We typically reply within a couple of days.
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-7">
          <h2 className="mb-5 text-lg font-semibold text-zinc-950">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
