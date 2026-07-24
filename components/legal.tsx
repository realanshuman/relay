import Link from "next/link";
import { Container, Eyebrow } from "./marketing";
import { Icon } from "./ui";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="max-w-3xl py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        <Icon name="ArrowLeft" size={14} />
        Back home
      </Link>
      <div className="mt-8">
        <Eyebrow>Legal</Eyebrow>
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950">{title}</h1>
      <p className="mt-3 font-mono text-xs uppercase tracking-wider text-zinc-400">
        Last updated {updated}
      </p>
      <div className="prose mt-10 border-t border-zinc-100 pt-8 [&_h2]:mt-10 [&_h2]:text-lg [&_section]:scroll-mt-24">
        {children}
      </div>
    </Container>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-baseline gap-3">{title}</h2>
      {children}
    </section>
  );
}
