import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/reset-forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Reset your password</h1>
      <p className="mt-1.5 text-sm text-zinc-500">
        Enter your email and we&apos;ll send you a link to choose a new one.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
