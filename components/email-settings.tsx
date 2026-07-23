"use client";

import { useFormState, useFormStatus } from "react-dom";
import { sendTestEmail, type TestEmailState } from "@/lib/email-actions";
import { Badge, Icon } from "./ui";

function TestButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} className="btn-ghost w-fit disabled:opacity-50">
      {pending ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Send" size={15} />}
      Send test email
    </button>
  );
}

export function EmailSettings({ configured, from }: { configured: boolean; from: string }) {
  const [state, formAction] = useFormState<TestEmailState, FormData>(sendTestEmail, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${configured ? "bg-emerald-500" : "bg-zinc-300"}`} />
          <span className="text-sm font-medium text-zinc-700">
            {configured ? "Email sender connected" : "No email provider"}
          </span>
        </div>
        <Badge tone={configured ? "green" : "zinc"}>{configured ? "Resend" : "Demo mode"}</Badge>
      </div>

      <div>
        <label className="label">Sends from</label>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600">
          {from}
        </div>
        {!configured && (
          <p className="mt-2 text-xs text-zinc-400">
            Without a provider, password-reset links are shown on screen instead of emailed. Set{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5">RESEND_API_KEY</code> and{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5">EMAIL_FROM</code> to send real email.
          </p>
        )}
      </div>

      <form action={formAction} className="space-y-2">
        <TestButton disabled={!configured} />
        {state.ok && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600">
            <Icon name="CheckCircle2" size={14} /> Sent to {state.sentTo}. Check your inbox.
          </p>
        )}
        {state.error && (
          <p className="flex items-start gap-1.5 text-sm text-red-600">
            <Icon name="AlertCircle" size={14} className="mt-0.5 shrink-0" /> {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
