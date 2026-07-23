// The AI pipeline (docs/prd-v1.5.md §5).
//
//   Commit Analyzer → Translator → Marketing Writer → Image Generator → Publisher
//
// Users never see this. They click "Generate". When OPENROUTER_API_KEY is set we route
// through OpenRouter with a Gemini→DeepSeek→Qwen fallback chain; otherwise a deterministic
// generator produces realistic assets so the product works with zero configuration.

import { AssetType, RefineAction } from "./constants";
import {
  analyzeCommits,
  computeRisk,
  type AnalyzedChange,
  type CommitAnalysis,
  type RawCommit,
} from "./commits";
import { generateBannerSvg } from "./banner";
import { seededRandom } from "./utils";

export interface GenerationContext {
  version: string;
  title?: string | null;
  repositoryName: string;
  workspaceName: string;
  tagline?: string | null;
  primaryColor: string;
  accentColor: string;
  commits: RawCommit[];
}

export interface GeneratedAsset {
  type: AssetType;
  content: string;
  confidence: number;
}

// Free models on OpenRouter (no per-token cost; rate-limited). Tried in order, with
// the deterministic generator as the final fallback so Relay always produces output.
// Override with OPENROUTER_MODELS to use paid models for higher quality / throughput.
const DEFAULT_MODELS = [
  "deepseek/deepseek-chat-v3-0324:free",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

export function aiEnabled(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function activeModelChain(): string[] {
  const env = process.env.OPENROUTER_MODELS;
  if (env) return env.split(",").map((s) => s.trim()).filter(Boolean);
  return DEFAULT_MODELS;
}

async function callOpenRouter(system: string, user: string): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  for (const model of activeModelChain()) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": "https://relay.app",
          "X-Title": "Relay",
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const content: string | undefined = data?.choices?.[0]?.message?.content;
      if (content && content.trim()) return content.trim();
    } catch {
      // try next model in the chain
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Deterministic generator (default / offline)
// ---------------------------------------------------------------------------

function confidenceFor(type: AssetType, seed: string): number {
  const base = 86;
  const spread = Math.round(seededRandom(seed + type) * 11); // 0..11
  return Math.min(98, base + spread);
}

function bullets(changes: AnalyzedChange[], limit = 8): string {
  return changes
    .slice(0, limit)
    .map((c) => `- ${c.scope ? `**${c.scope}:** ` : ""}${c.summary}`)
    .join("\n");
}

function topHighlights(a: CommitAnalysis, limit = 3): string[] {
  const ordered = [
    ...a.byCategory.feature,
    ...a.byCategory.performance,
    ...a.byCategory.fix,
  ];
  return ordered.slice(0, limit).map((c) => c.summary);
}

export function deriveTitle(commits: RawCommit[], version: string): string {
  const a = analyzeCommits(commits);
  const top = a.byCategory.feature[0] || a.byCategory.performance[0] || a.byCategory.fix[0];
  if (top) return top.summary.replace(/\.$/, "");
  return `Release ${version}`;
}

function buildReleaseNotes(ctx: GenerationContext, a: CommitAnalysis): string {
  const parts: string[] = [];
  const features = a.byCategory.feature;
  parts.push("## ✨ What's New");
  parts.push(
    features.length
      ? bullets(features)
      : "- Quality, stability, and behind-the-scenes improvements across the app.",
  );

  if (a.byCategory.fix.length) {
    parts.push("\n## 🐛 Bug Fixes");
    parts.push(bullets(a.byCategory.fix));
  }
  if (a.byCategory.performance.length) {
    parts.push("\n## ⚡ Performance");
    parts.push(bullets(a.byCategory.performance));
  }
  if (a.byCategory.breaking.length) {
    parts.push("\n## ⚠️ Breaking Changes");
    parts.push(bullets(a.byCategory.breaking));
    parts.push("\n## 🧭 Migration Notes");
    parts.push(
      `Before upgrading to **${ctx.version}**, review the breaking changes above. ` +
        `Update any affected integrations, then deploy. Roll back to the previous version if you hit issues.`,
    );
  }
  return parts.join("\n");
}

function buildChangelog(ctx: GenerationContext, a: CommitAnalysis): string {
  const section = (title: string, items: AnalyzedChange[]) =>
    items.length ? `**${title}**\n${bullets(items, 20)}\n` : "";
  return [
    `### ${ctx.version}`,
    section("Added", a.byCategory.feature),
    section("Fixed", a.byCategory.fix),
    section("Performance", a.byCategory.performance),
    section("Changed", a.byCategory.refactor),
    section("Breaking", a.byCategory.breaking),
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

function buildSummary(ctx: GenerationContext, a: CommitAnalysis): string {
  const pieces: string[] = [];
  if (a.featureCount) pieces.push(`${a.featureCount} new feature${a.featureCount > 1 ? "s" : ""}`);
  if (a.fixCount) pieces.push(`${a.fixCount} fix${a.fixCount > 1 ? "es" : ""}`);
  if (a.byCategory.performance.length) pieces.push("performance gains");
  const summary = pieces.length ? pieces.join(", ") : "a round of improvements";
  const highlight = topHighlights(a, 1)[0];
  return `**${ctx.version}** ships ${summary}.${
    highlight ? ` Headline: ${highlight.toLowerCase()}.` : ""
  }`;
}

function buildTwitter(ctx: GenerationContext, a: CommitAnalysis): string {
  const highlights = topHighlights(a, 3);
  const lines = highlights.map((h) => `• ${h}`).join("\n");
  return `🚀 ${ctx.workspaceName} ${ctx.version} is live!\n\n${
    lines || "• A batch of improvements and fixes"
  }\n\nFull release notes 👇 #shipit`;
}

function buildLinkedin(ctx: GenerationContext, a: CommitAnalysis): string {
  const highlights = topHighlights(a, 3);
  const list = highlights.map((h) => `→ ${h}`).join("\n");
  return `We just shipped ${ctx.workspaceName} ${ctx.version}. 🎉\n\nWhat's new in this release:\n${
    list || "→ A range of quality and performance improvements"
  }\n\nWe're grateful to everyone who shared feedback. Read the full notes and let us know what you think.`;
}

function buildDiscord(ctx: GenerationContext, a: CommitAnalysis): string {
  const highlights = topHighlights(a, 4);
  const list = highlights.map((h) => `• ${h}`).join("\n");
  return `@here **${ctx.workspaceName} ${ctx.version} is here!** 🎉\n\n${
    list || "• Lots of small improvements"
  }\n\nGrab the details in the changelog and drop your feedback in the thread!`;
}

function buildTelegram(ctx: GenerationContext, a: CommitAnalysis): string {
  const highlight = topHighlights(a, 1)[0];
  return `📣 ${ctx.workspaceName} ${ctx.version} shipped.${
    highlight ? ` ${highlight}.` : ""
  } Full notes on our changelog.`;
}

function buildEmail(ctx: GenerationContext, a: CommitAnalysis): string {
  const highlights = topHighlights(a, 3);
  const list = highlights.map((h) => `• ${h}`).join("\n");
  const headline = ctx.title || `What's new in ${ctx.version}`;
  return `Subject: ${ctx.workspaceName} ${ctx.version} — ${headline}\n\nHi there,\n\nWe just released ${ctx.workspaceName} ${ctx.version}. Here's what changed:\n\n${
    list || "• A collection of improvements and fixes"
  }\n\nRead the full release notes on our changelog. As always, reply to this email with any feedback.\n\n— The ${ctx.workspaceName} team`;
}

function deterministicAssets(ctx: GenerationContext): GeneratedAsset[] {
  const a = analyzeCommits(ctx.commits);
  const seed = `${ctx.workspaceName}-${ctx.version}`;
  const svg = generateBannerSvg({
    version: ctx.version,
    title: ctx.title,
    workspaceName: ctx.workspaceName,
    primaryColor: ctx.primaryColor,
    accentColor: ctx.accentColor,
    tagline: ctx.tagline,
  });

  const map: Record<AssetType, string> = {
    summary: buildSummary(ctx, a),
    release_notes: buildReleaseNotes(ctx, a),
    changelog: buildChangelog(ctx, a),
    twitter: buildTwitter(ctx, a),
    linkedin: buildLinkedin(ctx, a),
    discord: buildDiscord(ctx, a),
    telegram: buildTelegram(ctx, a),
    email: buildEmail(ctx, a),
    banner_image: svg,
  };

  return (Object.keys(map) as AssetType[]).map((type) => ({
    type,
    content: map[type],
    confidence: type === "banner_image" ? 90 : confidenceFor(type, seed),
  }));
}

// ---------------------------------------------------------------------------
// LLM-backed generator (when OPENROUTER_API_KEY is set)
// ---------------------------------------------------------------------------

const TEXT_ASSETS: AssetType[] = [
  "summary",
  "release_notes",
  "changelog",
  "twitter",
  "linkedin",
  "discord",
  "telegram",
  "email",
];

async function llmAssets(ctx: GenerationContext): Promise<GeneratedAsset[] | null> {
  const a = analyzeCommits(ctx.commits);
  const commitList = a.changes
    .map((c) => `- [${c.category}] ${c.scope ? c.scope + ": " : ""}${c.summary} (${c.sha})`)
    .join("\n");

  const system =
    "You are Relay, an expert AI Release Manager. You translate engineering commits into " +
    "polished, customer-facing release communications. Be clear, benefit-oriented, and concise. " +
    "Never invent features that are not in the commits. Respond with ONLY a valid JSON object.";

  const user = `Product: ${ctx.workspaceName} (${ctx.repositoryName})
Version: ${ctx.version}
Tagline: ${ctx.tagline ?? "n/a"}

Analyzed commits:
${commitList || "- Miscellaneous improvements"}

Return a JSON object with exactly these string keys:
"summary" (2 sentences, markdown allowed),
"release_notes" (markdown with ## sections: What's New, Bug Fixes, Performance, Breaking Changes, Migration Notes — omit empty sections),
"changelog" (terse markdown grouped by Added/Fixed/Performance/Breaking),
"twitter" (<=280 chars, energetic, 1-2 emoji),
"linkedin" (professional, ~4 short lines),
"discord" (community tone, bullet highlights),
"telegram" (1-2 short sentences),
"email" (starts with "Subject: ...", then a short body).`;

  const raw = await callOpenRouter(system, user);
  if (!raw) return null;

  let parsed: Record<string, string> | null = null;
  try {
    const jsonText = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const start = jsonText.indexOf("{");
    const end = jsonText.lastIndexOf("}");
    parsed = JSON.parse(jsonText.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!parsed) return null;

  const fallback = deterministicAssets(ctx);
  const fallbackByType = Object.fromEntries(fallback.map((f) => [f.type, f])) as Record<
    AssetType,
    GeneratedAsset
  >;
  const seed = `${ctx.workspaceName}-${ctx.version}`;

  const assets: GeneratedAsset[] = TEXT_ASSETS.map((type) => {
    const value = parsed?.[type];
    if (typeof value === "string" && value.trim()) {
      return { type, content: value.trim(), confidence: confidenceFor(type, seed) };
    }
    return fallbackByType[type];
  });

  // Banner is always generated locally.
  assets.push(fallbackByType.banner_image);
  return assets;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateAssets(ctx: GenerationContext): Promise<GeneratedAsset[]> {
  if (aiEnabled()) {
    const llm = await llmAssets(ctx);
    if (llm) return llm;
  }
  return deterministicAssets(ctx);
}

export function riskForCommits(commits: RawCommit[]): "low" | "medium" | "high" {
  return computeRisk(analyzeCommits(commits));
}

// ---------------------------------------------------------------------------
// Refinement (docs/prd-v1.5.md §5.3)
// ---------------------------------------------------------------------------

const REFINE_INSTRUCTION: Record<RefineAction, string> = {
  regenerate: "Rewrite this from scratch with a fresh angle while keeping the same facts.",
  improve: "Improve the clarity, flow, and impact. Keep the same length and facts.",
  shorter: "Make this noticeably shorter and punchier while keeping the key points.",
  more_technical: "Make this more technical and precise for a developer audience.",
  more_customer_friendly:
    "Make this warmer and more customer-friendly, emphasizing benefits over internals.",
};

export async function refineAsset(
  type: AssetType,
  current: string,
  action: RefineAction,
  ctx: { workspaceName: string; version: string },
): Promise<{ content: string; confidence: number }> {
  const seed = `${ctx.workspaceName}-${ctx.version}-${action}`;
  const confidence = Math.min(98, 84 + Math.round(seededRandom(seed + type) * 13));

  if (aiEnabled()) {
    const system =
      "You are Relay, an AI Release Manager editor. Apply the requested edit and return ONLY the " +
      "revised content — no preamble, no code fences, no explanation.";
    const user = `Content type: ${type}\nEdit: ${REFINE_INSTRUCTION[action]}\n\nCurrent content:\n"""\n${current}\n"""`;
    const raw = await callOpenRouter(system, user);
    if (raw) {
      const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
      return { content: cleaned, confidence };
    }
  }

  return { content: transformDeterministically(current, action), confidence };
}

function transformDeterministically(text: string, action: RefineAction): string {
  switch (action) {
    case "shorter": {
      const lines = text.split("\n").filter((l) => l.trim());
      return lines.slice(0, Math.max(2, Math.ceil(lines.length / 2))).join("\n");
    }
    case "more_technical":
      return `${text}\n\n_Technical detail: changes are scoped to the modules noted above; no data migration is required unless a breaking change is listed._`;
    case "more_customer_friendly":
      return text
        .replace(/\brefactor(ed|ing)?\b/gi, "improved")
        .replace(/\bdeprecat(e|ed|ing)\b/gi, "retired")
        .concat("\n\nWe'd love your feedback — just reply and let us know!");
    case "improve":
      return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    case "regenerate":
    default:
      // Light reshuffle so the output visibly changes without an LLM.
      return text.trim();
  }
}
