import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Logo, LogoMark } from "@/components/logo";
import { Icon } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Already signed in? Skip the auth screens.
  const user = await getCurrentUser();
  if (user) redirect("/app");

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-zinc-950 p-12 lg:flex">
        <Link href="/" className="relative">
          <Logo size={30} invert />
        </Link>

        <div className="relative">
          <p className="text-2xl font-medium leading-snug tracking-tight text-white">
            &ldquo;Relay turned our changelog from an afterthought into the page customers check
            first. Every merge ships with a story now.&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
              JR
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Jordan Rivera</p>
              <p className="text-sm text-zinc-400">Head of Product, Northwind</p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Icon name="ShieldCheck" size={13} /> SOC 2 aligned
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="Lock" size={13} /> Encrypted in transit
          </span>
        </div>

        {/* subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* Form area */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="lg:hidden">
            <Logo size={26} />
          </Link>
          <span className="hidden lg:block" />
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"
          >
            <Icon name="ArrowLeft" size={14} />
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex justify-center lg:hidden">
              <LogoMark size={40} />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
