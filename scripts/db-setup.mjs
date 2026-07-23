// Runs at deploy time (via `vercel-build`): create the schema and seed demo data.
// It prefers a DIRECT (non-pooling) connection for schema changes so it works whether
// Vercel/Neon gave us a pooled or a direct DATABASE_URL — no manual config needed.
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

// Minimal .env loader (Node doesn't auto-load them). Never overrides real env vars,
// so on Vercel the platform-provided DATABASE_URL always wins.
function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    if (process.env[key] !== undefined) continue;
    let val = rawVal;
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  }
}
loadEnv(".env.local");
loadEnv(".env");

const direct =
  process.env.DIRECT_URL ||
  process.env.DIRECT_DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL;

if (!direct) {
  console.error(
    "\n✗ No database found.\n" +
      "  Add a Postgres database to this Vercel project (Storage → Create Database → Postgres),\n" +
      "  connect it, then Redeploy. See docs/DEPLOY.md.\n",
  );
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: direct };
const run = (cmd) => execSync(cmd, { stdio: "inherit", env });

try {
  console.log("→ Applying database schema…");
  run("prisma db push --accept-data-loss --skip-generate");
  console.log("→ Seeding demo data (only if empty)…");
  run("tsx prisma/seed.ts");
  console.log("✓ Database ready.");
} catch (err) {
  const msg = String(err?.message || err);
  if (/foreign key|constraint|migrate|violates/i.test(msg)) {
    console.error(
      "\n✗ Schema migration conflict — the database has incompatible existing tables\n" +
        "  (e.g. an auth-schema change). Reset the schema once, then redeploy:\n" +
        "    In the Neon SQL editor run:  DROP SCHEMA public CASCADE; CREATE SCHEMA public;\n" +
        "  See docs/GO-LIVE.md → 'one-time reset'. Existing data is recreated by the seed.\n",
    );
  } else {
    console.error("\n✗ Database setup failed. Check that your database is reachable.\n");
  }
  process.exit(1);
}
