"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Icon } from "./ui";

type Providers = { github: boolean; google: boolean };
type Step = "email" | "otp" | "password";

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

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      <Icon name="AlertCircle" size={15} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
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
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  function done() {
    router.push("/app");
    router.refresh();
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "sign-in",
    });
    setLoading(false);
    if (error) {
      setError(error.message || "Couldn't send the code. Please try again.");
      return;
    }
    setOtp("");
    setStep("otp");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await authClient.signIn.emailOtp({ email: email.trim(), otp: otp.trim() });
    setLoading(false);
    if (error) {
      setError(error.message || "That code is invalid or expired.");
      return;
    }
    done();
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res =
      mode === "signup"
        ? await authClient.signUp.email({ email: email.trim(), password, name: name.trim() || email.trim() })
        : await authClient.signIn.email({ email: email.trim(), password });
    if (res.error) {
      setError(res.error.message || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    done();
  }

  async function resend() {
    setResent(false);
    setError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "sign-in",
    });
    if (error) setError(error.message || "Couldn't resend the code.");
    else setResent(true);
  }

  const switchLink = (
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
  );

  // ---------------------------------------------------------------- OTP step
  if (step === "otp") {
    return (
      <form onSubmit={verifyCode} className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-600">
          We emailed a 6-digit code to <span className="font-semibold text-zinc-900">{email}</span>.
        </div>
        {error && <ErrorBanner message={error} />}
        <div>
          <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Verification code
          </label>
          <input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className={`${inputCls} text-center text-lg font-semibold tracking-[0.5em]`}
          />
        </div>
        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading && <Icon name="Loader2" size={16} className="animate-spin" />}
          {loading ? "Verifying…" : "Verify and continue"}
        </button>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
              setError(null);
            }}
            className="flex items-center gap-1 text-zinc-500 transition hover:text-zinc-900"
          >
            <Icon name="ArrowLeft" size={14} /> Different email
          </button>
          <button
            type="button"
            onClick={resend}
            className="font-medium text-zinc-600 transition hover:text-zinc-900"
          >
            {resent ? "Code resent ✓" : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  // ----------------------------------------------------------- Password step
  if (step === "password") {
    return (
      <div>
        <SocialButtons providers={providers} />
        <form onSubmit={submitPassword} className="space-y-4">
          {error && <ErrorBanner message={error} />}
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Full name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                placeholder="Ada Lovelace"
                className={inputCls}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Work email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="you@company.com"
              className={inputCls}
            />
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
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
            className="w-full text-center text-sm text-zinc-500 transition hover:text-zinc-900"
          >
            Email me a code instead
          </button>
          {switchLink}
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------- Email step
  return (
    <div>
      <SocialButtons providers={providers} />
      <form onSubmit={sendCode} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Work email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="you@company.com"
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Mail" size={16} />}
          {loading ? "Sending code…" : "Email me a code"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("password");
            setError(null);
          }}
          className="w-full text-center text-sm text-zinc-500 transition hover:text-zinc-900"
        >
          Prefer a password? <span className="font-semibold text-zinc-900">Use password</span>
        </button>
        {switchLink}
      </form>
    </div>
  );
}
