import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { enabledSocialProviders } from "@/lib/auth";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Create your account</h1>
      <p className="mt-1.5 text-sm text-zinc-500">
        Start turning merges into polished releases.
      </p>

      <div className="mt-8">
        <AuthForm mode="signup" providers={enabledSocialProviders()} />
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-zinc-400">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="text-zinc-600 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-zinc-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
