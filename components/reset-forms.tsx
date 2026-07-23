"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useState } from "react";
import {
  requestPasswordReset,
  resetPassword,
  type ResetRequestState,
  type ResetState,
} from "@/lib/auth-actions";
import { Icon } from "./ui";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
    >
      {pending && <Icon name="Loader2" size={16} className="animate-spin" />}
      {pending ? "Please wait…" : label}
    </button>
  );
}

function ErrorBox({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      <Icon name="AlertCircle" size={15} className="mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState<ResetRequestState, FormData>(requestPasswordReset, {});

  if (state?.sent) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
          <Icon name="MailCheck" size={18} className="mt-0.5 shrink-0" />
          <span>
            If an account exists for that email, we&apos;ve sent a link to reset your password.
            The link is valid for one hour.
          </span>
        </div>
        {state.devLink && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <p className="font-semibold">No email provider configured (demo mode)</p>
            <p className="mt-1">Use this link to continue:</p>
            <Link
              href={state.devLink.replace(/^https?:\/\/[^/]+/, "")}
              className="mt-1 block break-all font-medium text-amber-900 underline"
            >
              {state.devLink}
            </Link>
          </div>
        )}
        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <Icon name="ArrowLeft" size={14} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBox error={state?.error} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={inputCls} />
      </div>
      <Submit label="Send reset link" />
      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        <Icon name="ArrowLeft" size={14} />
        Back to sign in
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState<ResetState, FormData>(resetPassword, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBox error={state?.error} />
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
          New password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className={`${inputCls} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
          >
            <Icon name={show ? "EyeOff" : "Eye"} size={16} />
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Re-enter your password"
          className={inputCls}
        />
      </div>
      <Submit label="Set new password" />
    </form>
  );
}
