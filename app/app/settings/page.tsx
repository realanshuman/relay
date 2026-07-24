import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentWorkspace, getCurrentUser } from "@/lib/session";
import { getBaseUrl } from "@/lib/base-url";
import { aiEnabled, activeModelChain } from "@/lib/ai";
import { emailConfigured, emailFrom } from "@/lib/email";
import { EmailSettings } from "@/components/email-settings";
import { initials, cn } from "@/lib/utils";
import { PageHeader, Card, Icon, Badge } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { CopyButton } from "@/components/copy-button";
import { ChangePasswordForm } from "@/components/change-password-form";
import { updateBranding, updateWorkspaceSlug, inviteMember, removeMember } from "@/lib/actions";

export const metadata = { title: "Settings" };

const TABS = [
  { key: "general", label: "General", icon: "User" },
  { key: "branding", label: "Branding", icon: "Palette" },
  { key: "team", label: "Team", icon: "Users" },
  { key: "billing", label: "Billing", icon: "CreditCard" },
  { key: "developers", label: "Developers", icon: "Code2" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
          <Icon name={icon} size={16} />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          {description && <p className="text-xs text-zinc-500">{description}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const [ws, user] = await Promise.all([getCurrentWorkspace(), getCurrentUser()]);
  const active: TabKey = (TABS.find((t) => t.key === searchParams.tab)?.key ?? "general") as TabKey;

  const baseUrl = getBaseUrl();
  const webhookUrl = `${baseUrl}/api/webhooks/github`;
  const members =
    active === "team"
      ? await prisma.membership.findMany({
          where: { workspaceId: ws.id },
          include: { user: true },
          orderBy: { createdAt: "asc" },
        })
      : [];

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your account, workspace, team, and billing."
        icon="Settings"
      />

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/app/settings?tab=${t.key}`}
              scroll={false}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active === t.key
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-zinc-500 hover:text-zinc-800",
              )}
            >
              <Icon name={t.icon} size={15} />
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {/* ---------------------------- General --------------------------- */}
        {active === "general" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Section title="Account" description="Your personal profile and password." icon="UserCircle">
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {initials(user?.name ?? "?")}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900">{user?.name}</div>
                  <div className="truncate text-xs text-zinc-500">{user?.email}</div>
                </div>
              </div>
              <ChangePasswordForm />
            </Section>

            <Section title="Workspace" description="Your public changelog URL." icon="Building2">
              <form action={updateWorkspaceSlug} className="space-y-3">
                <div>
                  <label className="label">Public URL</label>
                  <div className="flex items-center overflow-hidden rounded-lg border border-zinc-200">
                    <span className="shrink-0 border-r border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-400">
                      {baseUrl.replace(/^https?:\/\//, "")}/c/
                    </span>
                    <input name="slug" defaultValue={ws.slug} className="min-w-0 flex-1 px-3 py-2 text-sm outline-none" />
                  </div>
                </div>
                <SubmitButton icon="Check">Save URL</SubmitButton>
              </form>
            </Section>
          </div>
        )}

        {/* ---------------------------- Branding -------------------------- */}
        {active === "branding" && (
          <div className="max-w-2xl">
            <Section title="Branding" description="Logo, colors, and custom domain for your changelog." icon="Palette">
              <form action={updateBranding} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Workspace name</label>
                    <input name="name" defaultValue={ws.name} className="input" />
                  </div>
                  <div>
                    <label className="label">Favicon emoji</label>
                    <input name="faviconEmoji" defaultValue={ws.faviconEmoji} maxLength={4} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Tagline</label>
                  <input name="tagline" defaultValue={ws.tagline ?? ""} className="input" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Primary color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" name="primaryColor" defaultValue={ws.primaryColor} className="h-9 w-12 cursor-pointer rounded border border-zinc-200 bg-white" />
                      <span className="font-mono text-xs text-zinc-500">{ws.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="label">Accent color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" name="accentColor" defaultValue={ws.accentColor} className="h-9 w-12 cursor-pointer rounded border border-zinc-200 bg-white" />
                      <span className="font-mono text-xs text-zinc-500">{ws.accentColor}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label">Custom domain</label>
                  <input name="customDomain" defaultValue={ws.customDomain ?? ""} placeholder="updates.yourcompany.com" className="input" />
                </div>
                <SubmitButton icon="Check">Save branding</SubmitButton>
              </form>
            </Section>
          </div>
        )}

        {/* ------------------------------ Team ---------------------------- */}
        {active === "team" && (
          <div className="max-w-2xl">
            <Section title="Team" description="People with access to this workspace." icon="Users">
              <div className="mb-4 divide-y divide-zinc-100">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-xs font-semibold text-[var(--brand)]">
                        {initials(m.user.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-zinc-800">{m.user.name}</div>
                        <div className="truncate text-xs text-zinc-400">{m.user.email}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge tone={m.role === "owner" ? "brand" : "zinc"}>{m.role}</Badge>
                      {m.role !== "owner" && (
                        <form action={removeMember.bind(null, m.id)}>
                          <button className="btn-subtle text-zinc-400 hover:text-red-600" title="Remove">
                            <Icon name="X" size={14} />
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <form action={inviteMember} className="flex flex-col gap-2 border-t border-zinc-100 pt-3 sm:flex-row">
                <input name="email" type="email" placeholder="teammate@company.com" required className="input flex-1" />
                <select name="role" className="input sm:w-32" defaultValue="member">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <SubmitButton icon="UserPlus">Invite</SubmitButton>
              </form>
            </Section>
          </div>
        )}

        {/* ----------------------------- Billing -------------------------- */}
        {active === "billing" && (
          <div className="max-w-2xl space-y-5">
            <Section title="Plan" description="Your current plan and usage." icon="CreditCard">
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900">Pro</span>
                    <Badge tone="green">Active</Badge>
                  </div>
                  <div className="text-xs text-zinc-500">Unlimited repositories and releases</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-zinc-900">{ws.aiCredits}</div>
                  <div className="text-xs text-zinc-400">AI credits left</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                Free while Relay is in public beta. Paid plans and metered AI credits are coming soon.
              </p>
            </Section>
          </div>
        )}

        {/* --------------------------- Developers ------------------------- */}
        {active === "developers" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Section title="GitHub webhook" description="Auto-detect releases from pushes and merged PRs." icon="Github">
              <label className="label">Webhook URL</label>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1 truncate rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600">
                  {webhookUrl}
                </div>
                <CopyButton text={webhookUrl} className="btn-ghost shrink-0" />
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Most users connect GitHub on the{" "}
                <Link href="/app/integrations" className="font-medium text-[var(--brand)] hover:underline">
                  Integrations
                </Link>{" "}
                page instead, which wires this webhook automatically.
              </p>
            </Section>

            <Section title="Email sender" description="Password resets and subscriber notifications." icon="Mail">
              <EmailSettings configured={emailConfigured()} from={emailFrom()} />
            </Section>

            <Section title="AI engine" description="How Relay generates your releases." icon="Sparkles">
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${aiEnabled() ? "bg-emerald-500" : "bg-zinc-300"}`} />
                  <span className="text-sm font-medium text-zinc-700">
                    {aiEnabled() ? "Live AI via OpenRouter" : "Built-in generator"}
                  </span>
                </div>
                <Badge tone={aiEnabled() ? "green" : "zinc"}>{aiEnabled() ? "Connected" : "Offline mode"}</Badge>
              </div>
              <div className="mt-3">
                <label className="label">Model fallback chain</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeModelChain().map((model, i) => (
                    <span key={model} className="flex items-center gap-1.5">
                      {i > 0 && <Icon name="ChevronRight" size={12} className="text-zinc-300" />}
                      <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600">{model}</code>
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Set <code className="rounded bg-zinc-100 px-1 py-0.5">OPENROUTER_API_KEY</code> for live
                  generation. Without it, Relay uses a deterministic offline generator.
                </p>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
