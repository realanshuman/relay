# Deploying Relay to Vercel

Relay is a standard Next.js app, so Vercel is the natural host. The only requirement beyond
the defaults is a **Postgres database** (Vercel's serverless filesystem can't persist the
local SQLite file, so the app uses Postgres in the cloud).

The build is already wired for this: Vercel runs the `vercel-build` script, which pushes the
schema and seeds demo data automatically on the first deploy.

```
prisma generate  →  prisma db push  →  seed (once, idempotent)  →  next build
```

## Steps

1. **Import the repo.**
   Vercel → **Add New… → Project** → import `realanshuman/relay`. Vercel detects Next.js —
   leave the build/output settings at their defaults (it will use `vercel-build`).

2. **Create a Postgres database.**
   In the Vercel dashboard → **Storage → Create Database → Postgres** (Neon-backed), and
   **connect it to this project**. This adds the connection env vars to the project.

3. **Make sure `DATABASE_URL` is set.**
   Project → **Settings → Environment Variables**. The integration usually sets `DATABASE_URL`
   automatically. For the smoothest first deploy, set it to the **Direct / unpooled**
   connection string (Neon labels it "Direct connection"; Vercel exposes it as
   `POSTGRES_URL_NON_POOLING` / `DATABASE_URL_UNPOOLED`). If only `POSTGRES_*` vars were
   created, add a `DATABASE_URL` variable with that value.

   > The database must exist and `DATABASE_URL` must be set **before** the build runs — the
   > build pushes the schema. If your very first deploy ran before you added the DB, just add
   > it and **Redeploy**.

4. **(Optional) Enable live AI.**
   Add `OPENROUTER_API_KEY` to use live LLM generation. Without it, Relay uses its built-in
   deterministic generator — the app is fully functional either way.

5. **Deploy.** The first build creates the schema and seeds the demo workspace.

6. **Open it.**
   - App: `https://<your-app>.vercel.app`
   - Public changelog: `https://<your-app>.vercel.app/c/acme`

## After deploy

- **Real release detection:** add a GitHub webhook pointing at
  `https://<your-app>.vercel.app/api/webhooks/github` (events: `push`, `pull_request`). Set
  `GITHUB_WEBHOOK_SECRET` in both GitHub and Vercel to verify signatures.
- **Reset demo data:** set `SEED_FORCE=1` and redeploy, then remove it. (Seeding is otherwise
  idempotent and runs only when the database is empty.)

## Notes

- **Pooling:** for production traffic, switch `DATABASE_URL` to the **pooled** connection
  string with `?pgbouncer=true` (or use Prisma Accelerate). The direct URL recommended above is
  ideal for a preview and for running schema pushes.
- **Prisma runtime engine:** `prisma/schema.prisma` already includes the
  `rhel-openssl-3.0.x` binary target Vercel's runtime needs.
- **Local development** uses Postgres via `docker compose up -d` — see the README.
