# Going live: what to connect

Relay runs end-to-end today with **zero external accounts** — a Postgres database is the only
hard requirement, and the app ships a built-in AI generator and a demo-mode password-reset flow
so everything is usable out of the box. This page lists what to connect to make each part
"real" in production, in priority order.

> ⚠️ **One-time reset when deploying the Better Auth migration.** Auth now runs on Better
> Auth, which changed the database schema (new `account`/`verification` tables, credentials
> moved off `user`). The first deploy of this change cannot migrate the old auth tables in
> place — reset the database once: in Vercel **Storage → your Postgres → delete & recreate**
> (or drop the public schema), then redeploy. The build reseeds the demo data automatically.
> Do this before you have real users; existing test accounts will need to sign up again.

## Required

| # | Service | Why | How | Cost |
| --- | --- | --- | --- | --- |
| 1 | **Postgres database** | Stores accounts, workspaces, releases, sessions | Vercel Postgres / Neon → set `DATABASE_URL`. See [DEPLOY.md](DEPLOY.md) | Free tier available |
| 2 | **Better Auth secret + URL** | Signs sessions & builds auth/reset links | Set `BETTER_AUTH_SECRET` (`openssl rand -hex 32`) and `BETTER_AUTH_URL=https://tryrelay.run` | Free |

With these two, users can sign up (email/password), connect repos manually, generate releases
(built-in generator), publish, and get a public changelog.

## Recommended (to make features "real")

| # | Service | Unlocks | Env var(s) | Free option? |
| --- | --- | --- | --- | --- |
| 2 | **OpenRouter** | Live LLM-written notes/posts instead of the deterministic generator | `OPENROUTER_API_KEY` | **Yes** — free models are the default (see below) |
| 3 | **GitHub App / webhook** | Real automatic release detection on merge (today you add repos by name + can POST the webhook manually) | Point a webhook at `/api/webhooks/github`; set `GITHUB_WEBHOOK_SECRET`. A full GitHub OAuth App is the next step for one-click repo connect | Free |
| 4 | **Resend** (email) | Real password-reset emails + subscriber notifications (without it, reset works in demo mode by showing the link) | `RESEND_API_KEY`, `EMAIL_FROM` | Free tier (3k emails/mo) |
| 5 | **Social login** | Google / GitHub sign-in buttons (appear automatically when configured) | Set `GITHUB_CLIENT_ID`/`SECRET` and/or `GOOGLE_CLIENT_ID`/`SECRET`. Callback: `<BETTER_AUTH_URL>/api/auth/callback/github` | Free |
| 6 | **Custom domain** | `updates.tryrelay.run` for the changelog, and correct reset/webhook links | Vercel domain settings; optionally `NEXT_PUBLIC_APP_URL` | Domain cost only |
| 7 | **Better Auth dashboard** (`@better-auth/infra`) | Auth analytics + the `dash`/`sentinel` plugins you installed | See "Better Auth dashboard" below | Free tier |

## Better Auth dashboard (the `@better-auth/infra` plugin)

The plugin is installed and auth now runs on Better Auth, so it's ready to enable. Because it
needs a project key from the Better Auth dashboard (which only you can create) and adds its own
tables, finish it with these steps:

1. Create a project at the Better Auth dashboard (better-auth.com) and copy its API key.
2. In `lib/auth.ts`, add the server plugin to the `plugins: [...]` array (before `nextCookies()`),
   e.g. `import { dash, sentinel } from "@better-auth/infra"` then `dash({ apiKey: process.env.BETTER_AUTH_INFRA_KEY! })`.
3. Add the matching client plugin from `@better-auth/infra/client` in `lib/auth-client.ts`.
4. Generate its tables: `npx @better-auth/cli generate` (updates `prisma/schema.prisma`), then
   `prisma db push`.
5. Set `BETTER_AUTH_INFRA_KEY` in Vercel and redeploy.

## Not yet wired (future work)

These are UI-complete or stubbed, and are the honest "not real yet" list:

- **One-click GitHub repo connect** — today repos are added by `owner/name`. GitHub *sign-in*
  now works (via Better Auth social login), but a GitHub App is still needed to let users pick
  from their repos and auto-install the webhook.
- **Auto-posting to social channels** — Relay generates ready-to-copy / API-ready content for
  Twitter/LinkedIn/Discord/Telegram; it does not post to them for you yet. The changelog and
  (with Resend) email are the fully-automated channels.
- **Billing** — the Billing panel is display-only; wire Stripe to charge for plans/AI credits.

## The AI: free models

Relay generates through **OpenRouter** with this default fallback chain — all **free**:

1. `deepseek/deepseek-chat-v3-0324:free`
2. `google/gemini-2.0-flash-exp:free`
3. `meta-llama/llama-3.3-70b-instruct:free`

**Will it work?** Yes:

- **No key at all** → the built-in deterministic generator produces every asset. Fully
  functional, just less varied. This is the zero-config default.
- **With `OPENROUTER_API_KEY`** → the free models above are used. Free models are rate-limited
  and occasionally busy; when a call fails, Relay automatically tries the next model, and finally
  falls back to the deterministic generator — so generation never hard-fails.
- **For higher quality/throughput** → set `OPENROUTER_MODELS` to paid models (e.g.
  `anthropic/claude-3.5-haiku`, `openai/gpt-4o-mini`). They're inexpensive per release.

Override the chain any time with a comma-separated `OPENROUTER_MODELS`.
