"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Icon } from "./ui";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5";

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setLoading(true);
    const res = await authClient.changePassword({
      currentPassword: String(fd.get("current") || ""),
      newPassword: String(fd.get("next") || ""),
      revokeOtherSessions: false,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error.message || "Couldn't update your password.");
      return;
    }
    setOk(true);
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <Icon name="AlertCircle" size={14} /> {error}
        </div>
      )}
      {ok && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <Icon name="CheckCircle2" size={14} /> Password updated.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Current password</label>
          <input name="current" type="password" autoComplete="current-password" required className={inputCls} />
        </div>
        <div>
          <label className="label">New password</label>
          <input name="next" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" className={inputCls} />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-brand w-fit disabled:opacity-60">
        {loading ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Lock" size={15} />}
        Update password
      </button>
    </form>
  );
}
