import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
      <p className="mt-1.5 text-sm text-zinc-500">Sign in to your Relay workspace.</p>

      <div className="mt-8">
        <AuthForm mode="login" />
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs text-zinc-500">
        <Icon name="Info" size={14} className="mt-0.5 shrink-0 text-zinc-400" />
        <span>
          Exploring the demo? Sign in with{" "}
          <span className="font-medium text-zinc-700">demo@tryrelay.run</span> /{" "}
          <span className="font-medium text-zinc-700">relaydemo123</span>
        </span>
      </div>
    </div>
  );
}
