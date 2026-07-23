# Relay

**Relay is the AI Release Manager that turns every merged pull request into a polished product release.**

You merge a PR. Relay understands your release. You review it. You publish it.

```
Developer merges PR → Relay detects release → AI understands commits
   → AI generates release assets → You review → Publish → Public changelog page
```

This repository contains the **V1.5** product: a complete, working app built around that single
workflow. See [`docs/prd-v1.5.md`](docs/prd-v1.5.md) for the full product spec.

---

## Quick start

```bash
npm install          # install dependencies
npm run setup        # generate Prisma client, create the SQLite db, and seed demo data
npm run dev          # start the app at http://localhost:3000
```

Then open:

- **App** — http://localhost:3000 (dashboard, releases, repositories, changelog admin, settings)
- **Public changelog** — http://localhost:3000/c/acme

> Relay runs **fully offline with zero configuration**. AI generation uses a built-in
> deterministic generator by default. Add an `OPENROUTER_API_KEY` (see below) to upgrade to
> live LLM output — nothing else changes.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run start` | Start the production server |
| `npm run setup` | Generate client + create db + seed |
| `npm run db:seed` | Re-seed the database |
| `npm run db:reset` | Wipe and re-seed |

## What's built (V1.5)

Every feature from the PRD's "features to build" list is functional:

1. **GitHub connection** — connect repos; a webhook endpoint detects merges.
2. **Automatic release detection** — a push to a repo's target branch drafts a release.
3. **AI release generation** — one **Generate** click produces 9 assets: AI summary, release
   notes, changelog, Twitter/LinkedIn/Discord/Telegram posts, an email draft, and a banner image.
4. **Release editor** — review and edit every section, with per-asset confidence and inline
   refinements (Regenerate · Improve · Shorter · More Technical · More Customer Friendly).
5. **Public changelog** — a branded, SEO-friendly page per workspace with search, an RSS feed,
   and email subscribe.
6. **Publishing** — publish to the changelog and get ready-to-copy / API-ready content per channel.
7. **Release history** — a searchable timeline of every release.
8. **Branding** — workspace name, colors, favicon emoji, and custom domain.

### The AI pipeline

Users never see it — they click **Generate**. Internally:

```
Commit Analyzer → Translator → Marketing Writer → Image Generator → Publisher
```

When `OPENROUTER_API_KEY` is set, text generation routes through OpenRouter with a
Gemini → DeepSeek → Qwen fallback chain (`lib/ai.ts`). The banner is always a locally
generated, brand-colored SVG (`lib/banner.ts`).

### Try release detection (webhook)

```bash
curl -X POST http://localhost:3000/api/webhooks/github \
  -H 'x-github-event: push' -H 'Content-Type: application/json' \
  -d '{"ref":"refs/heads/main","repository":{"full_name":"acme/website"},
       "commits":[{"id":"abc1234","message":"feat(search): add filters","author":{"name":"Ada"}}]}'
```

`acme/website` has **Auto Publish** on, so this drafts, generates, and publishes in one call —
then appears on `/c/acme`. Repos with Auto Publish off create a draft for review.

Or just click **New Release** in the app to simulate a merged PR batch.

## Configuration

Copy `.env.example` → `.env.local` for secrets (all optional):

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY` | Enables live AI generation via OpenRouter |
| `OPENROUTER_MODELS` | Override the model fallback chain |
| `GITHUB_WEBHOOK_SECRET` | Verify `X-Hub-Signature-256` on the webhook |
| `DATABASE_URL` | SQLite path (defaults to `file:./dev.db` in `.env`) |

## Tech & structure

Next.js 14 (App Router) · TypeScript · Tailwind · Prisma + SQLite · React Server Components
with Server Actions for all mutations.

```
app/
  (app)/            Authenticated app shell + pages (dashboard, releases, repositories, …)
  c/[slug]/         Public changelog + RSS feed
  api/webhooks/     GitHub webhook (release detection)
components/         UI: sidebar, tables, asset editor, publish panel, generate panel, …
lib/
  ai.ts             Generation pipeline (OpenRouter + deterministic fallback)
  commits.ts        Commit Analyzer (conventional-commit parsing + risk)
  banner.ts         SVG banner generator
  actions.ts        Server actions (generate, refine, publish, branding, …)
  releases.ts       Release creation service (shared by webhook + UI)
prisma/             Schema + seed
```

## Documentation

- [**Product Requirements — V1.5**](docs/prd-v1.5.md) — scope, screens, data model, and what's intentionally left out.

## Positioning

Not a "changelog generator." An **AI Release Manager** — room to grow into documentation,
customer communication, and release operations without overwhelming V1.5.
