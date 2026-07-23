"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePassword, type ResetState } from "@/lib/auth-actions";
import { Icon } from "./ui";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-brand w-fit">
      {pending ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Lock" size={15} />}
      Update password
    </button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useFormState<ResetState, FormData>(changePassword, {});

  return (
    <form action={formAction} className="space-y-3" key={state.ok ? "done" : "form"}>
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <Icon name="AlertCircle" size={14} /> {state.error}
        </div>
      )}
      {state.ok && (
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
      <Submit />
    </form>
  );
}
