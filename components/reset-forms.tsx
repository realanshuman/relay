"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Icon } from "./ui";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5";

function ErrorBox({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      <Icon name="AlertCircle" size={15} className="mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email") || "").trim();
    const res = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setLoading(false);
    if (res.error) {
      setError(res.error.message || "Couldn't send the reset link. Try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
          <Icon name="MailCheck" size={18} className="mt-0.5 shrink-0" />
          <span>
            If an account exists for that email, we&apos;ve sent a link to reset your password.
            The link is valid for one hour.
          </span>
        </div>
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900">
          <Icon name="ArrowLeft" size={14} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBox error={error} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
        {loading ? "Sending…" : "Send reset link"}
      </button>
      <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900">
        <Icon name="ArrowLeft" size={14} />
        Back to sign in
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");
    if (password !== confirm) {
      setError("The passwords don't match.");
      return;
    }
    setLoading(true);
    const res = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);
    if (res.error) {
      setError(res.error.message || "This reset link is invalid or has expired.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Icon name="CheckCircle2" size={16} /> Your password has been updated.
        </div>
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBox error={error} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
          New password
        </label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" className={`${inputCls} pr-10`} />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" tabIndex={-1} aria-label={show ? "Hide password" : "Show password"}>
            <Icon name={show ? "EyeOff" : "Eye"} size={16} />
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Confirm password
        </label>
        <input id="confirm" name="confirm" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} placeholder="Re-enter your password" className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
        {loading ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}
