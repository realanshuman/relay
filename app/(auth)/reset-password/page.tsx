import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-forms";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Icon name="Unlink" size={20} />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-zinc-900">
          Invalid reset link
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          This link is missing its token. Request a fresh one to continue.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Choose a new password
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500">
        Pick a strong password you don&apos;t use anywhere else.
      </p>
      <div className="mt-8">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
