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
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Legal</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-zinc-900">{title}</h1>
      <p className="mt-2 text-sm text-zinc-400">Last updated: {updated}</p>
      <div className="prose mt-10 [&_h2]:mt-10 [&_h2]:text-xl">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
