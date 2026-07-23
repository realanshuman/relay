import type { Metadata } from "next";
import { Mascot } from "@/components/mascot";
import { Icon } from "@/components/ui";
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
    body: "Tell us what happened and what you expected — we read every report.",
  },
  {
    icon: "Newspaper",
    title: "Press & partnerships",
    body: "Writing about release tooling, or want to build with Relay? Let's talk.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
      <div className="text-center">
        <Mascot size={72} className="mx-auto" />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          Say hello
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-500">
          We&apos;re a small team and we answer our own email. Whatever it is — feedback, bugs,
          ideas, or just a changelog you&apos;re proud of — we&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr,1.2fr]">
        <div className="space-y-4">
          {CARDS.map((c) => (
            <div key={c.title} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                  <Icon name={c.icon} size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-zinc-900">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-6 text-sm text-zinc-500">
            <span className="font-semibold text-zinc-700">Prefer plain email?</span> Write to{" "}
            <a href="mailto:hello@relay.app" className="font-semibold text-indigo-600 underline underline-offset-2">
              hello@relay.app
            </a>{" "}
            — we typically reply within a couple of days.
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-7 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-zinc-900">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
