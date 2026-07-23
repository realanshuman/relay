"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Icon } from "./ui";

type Providers = { github: boolean; google: boolean };

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5";

function SocialButtons({ providers }: { providers: Providers }) {
  const [loading, setLoading] = useState<string | null>(null);
  if (!providers.github && !providers.google) return null;

  async function social(provider: "github" | "google") {
    setLoading(provider);
    await authClient.signIn.social({ provider, callbackURL: "/app" });
  }

  return (
    <>
      <div className="grid gap-2">
        {providers.github && (
          <button
            type="button"
            onClick={() => social("github")}
            disabled={!!loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
          >
            <Icon name={loading === "github" ? "Loader2" : "Github"} size={16} className={loading === "github" ? "animate-spin" : ""} />
            Continue with GitHub
          </button>
        )}
        {providers.google && (
          <button
            type="button"
            onClick={() => social("google")}
            disabled={!!loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
          >
            <Icon name={loading === "google" ? "Loader2" : "Chrome"} size={16} className={loading === "google" ? "animate-spin" : ""} />
            Continue with Google
          </button>
        )}
      </div>
      <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        or
        <span className="h-px flex-1 bg-zinc-200" />
      </div>
    </>
  );
}

export function AuthForm({
  mode,
  providers = { github: false, google: false },
}: {
  mode: "login" | "signup";
  providers?: Providers;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const name = String(fd.get("name") || "").trim();

    const res =
      mode === "signup"
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password });

    if (res.error) {
      setError(res.error.message || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <div>
      <SocialButtons providers={providers} />

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <Icon name="AlertCircle" size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Full name
            </label>
            <input id="name" name="name" autoComplete="name" required placeholder="Ada Lovelace" className={inputCls} />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Work email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={inputCls} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            {mode === "login" && (
              <Link href="/forgot-password" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
              aria-label={show ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              <Icon name={show ? "EyeOff" : "Eye"} size={16} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <p className="text-center text-sm text-zinc-500">
          {mode === "login" ? (
            <>
              New to Relay?{" "}
              <Link href="/signup" className="font-semibold text-zinc-900 hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
