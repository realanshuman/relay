"use client";

import { useState, useTransition } from "react";
import { Icon } from "./ui";
import { subscribeToChangelog } from "@/lib/actions";

export function SubscribeForm({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
        <Icon name="CheckCircle2" size={16} />
        You're subscribed. We'll email you on every release.
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-sm items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.set("slug", slug);
        fd.set("email", email);
        startTransition(async () => {
          await subscribeToChangelog(fd);
          setDone(true);
        });
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="input"
      />
      <button type="submit" disabled={pending} className="btn-brand shrink-0">
        {pending ? <Icon name="Loader2" size={15} className="animate-spin" /> : "Subscribe"}
      </button>
    </form>
  );
}
