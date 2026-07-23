"use client";

// Zero-backend contact form: composes a prefilled email in the visitor's mail app.
// Swap CONTACT_EMAIL for your real inbox (or wire this to a form service later).
import { useState } from "react";
import { Icon } from "./ui";

const CONTACT_EMAIL = "hello@tryrelay.run";

export function ContactForm() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[${topic}] Message from ${name || "the website"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name || "Anonymous"}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="input"
          />
        </div>
        <div>
          <label className="label">Topic</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input">
            {["General", "Product feedback", "Bug report", "Partnership", "Press"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Tell us what's on your mind…"
          className="input resize-y"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
      >
        <Icon name="Send" size={15} />
        Send message
      </button>
      <p className="text-xs text-zinc-400">
        This opens your email app with the message ready to send — no forms lost to the void.
      </p>
    </form>
  );
}
