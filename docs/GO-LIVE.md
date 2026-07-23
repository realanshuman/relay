# Going live: what to connect

Relay runs end-to-end today with **zero external accounts** — a Postgres database is the only
hard requirement, and the app ships a built-in AI generator and a demo-mode password-reset flow
so everything is usable out of the box. This page lists what to connect to make each part
"real" in production, in priority order.

## Required

| # | Service | Why | How | Cost |
| --- | --- | --- | --- | --- |
| 1 | **Postgres database** | Stores accounts, workspaces, releases, sessions | Vercel Postgres / Neon → set `DATABASE_URL`. See [DEPLOY.md](DEPLOY.md) | Free tier available |

That's the only thing you *must* connect. With just this, users can sign up, connect repos
manually, generate releases (built-in generator), publish, and get a public changelog.

## Recommended (to make features "real")

| # | Service | Unlocks | Env var(s) | Free option? |
| --- | --- | --- | --- | --- |
| 2 | **OpenRouter** | Live LLM-written notes/posts instead of the deterministic generator | `OPENROUTER_API_KEY` | **Yes** — free models are the default (see below) |
| 3 | **GitHub App / webhook** | Real automatic release detection on merge (today you add repos by name + can POST the webhook manually) | Point a webhook at `/api/webhooks/github`; set `GITHUB_WEBHOOK_SECRET`. A full GitHub OAuth App is the next step for one-click repo connect | Free |
| 4 | **Resend** (email) | Real password-reset emails + subscriber notifications (without it, reset works in demo mode by showing the link) | `RESEND_API_KEY`, `EMAIL_FROM` | Free tier (3k emails/mo) |
| 5 | **Custom domain** | `updates.tryrelay.run` for the changelog, and correct reset/webhook links | Vercel domain settings; optionally `NEXT_PUBLIC_APP_URL` | Domain cost only |

## Not yet wired (future work)

These are UI-complete or stubbed, and are the honest "not real yet" list:

- **One-click GitHub repo connect** — today repos are added by `owner/name`; a GitHub OAuth App
  would let users pick from their repos and auto-install the webhook.
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
