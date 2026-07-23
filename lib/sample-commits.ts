import type { RawCommit } from "./commits";

// Pools of realistic conventional commits used to simulate a merged batch when a user
// clicks "New release" without a live GitHub webhook. Keeps the demo fully functional.
const POOL: string[] = [
  "feat(editor): add real-time collaborative cursors",
  "feat(auth): support passkey sign-in",
  "feat(dashboard): add customizable widget layout",
  "feat(api): expose bulk export endpoint",
  "feat(search): fuzzy matching across all entities",
  "feat(billing): usage-based pricing tiers",
  "feat(notifications): digest emails with smart batching",
  "feat(mobile): offline mode for cached documents",
  "feat(integrations): native Slack notifications",
  "feat: dark mode across the entire app",
  "fix(upload): handle files larger than 100MB",
  "fix(auth): resolve session expiry race condition",
  "fix(billing): correct proration on mid-cycle upgrades",
  "fix(ui): dropdown clipping inside modals",
  "fix(export): escape special characters in CSV output",
  "fix(search): stale results after rapid queries",
  "fix: timezone drift on scheduled tasks",
  "perf(api): cache workspace metadata, 40% faster loads",
  "perf(db): add composite index on activity feed",
  "perf(render): virtualize long lists",
  "refactor(core): extract shared validation layer",
  "refactor(api): consolidate error handling",
  "docs(readme): document webhook setup",
  "chore(deps): bump framework to latest LTS",
];

const BREAKING: string[] = [
  "feat(api)!: v2 authentication requires scoped tokens",
  "refactor(config)!: rename `apiKey` to `secretKey` in config",
];

const AUTHORS = ["Ada Lovelace", "Grace Hopper", "Linus T.", "Margaret H.", "Ken T."];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(Math.floor(seed)) % arr.length];
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(seed + i) * 10000) % (i + 1));
    const k = Math.abs(j) % (i + 1);
    [copy[i], copy[k]] = [copy[k], copy[i]];
  }
  return copy;
}

let counter = 0;

/** Generate a believable batch of merged commits. Optionally force a breaking change. */
export function sampleCommits(opts: { count?: number; breaking?: boolean } = {}): RawCommit[] {
  const seed = Date.now() + counter++;
  const count = opts.count ?? 4 + (Math.abs(Math.floor(seed / 7)) % 6); // 4..9
  const messages = shuffle(POOL, seed).slice(0, count);
  if (opts.breaking) messages.unshift(pick(BREAKING, seed));

  return messages.map((message, i) => ({
    sha: Math.abs((seed * (i + 3)) ^ (i * 2654435761))
      .toString(16)
      .padStart(7, "0")
      .slice(0, 7),
    message,
    author: pick(AUTHORS, seed + i),
  }));
}
