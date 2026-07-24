// Turns a generated `changelog` (or `release_notes`) markdown block into structured,
// tagged line items for the public changelog timeline. Framework-free so it can be
// unit-tested and reused. The generator emits sections like **Added** / **Fixed** /
// **Performance** / **Changed** / **Breaking** (see lib/ai.ts buildChangelog), and
// release notes use `## ✨ What's New` etc. — both are mapped here.

export type ChangeTag = "new" | "improved" | "performance" | "fixed" | "changed" | "breaking";
export type ChangeTone = "brand" | "violet" | "blue" | "zinc" | "amber" | "red";

export interface ChangeItem {
  tag: ChangeTag;
  /** Optional bold lead (e.g. a scope like "auth"); may be empty. */
  label: string;
  text: string;
}

export const TAG_META: Record<ChangeTag, { label: string; tone: ChangeTone }> = {
  new: { label: "New", tone: "brand" },
  improved: { label: "Improved", tone: "violet" },
  performance: { label: "Faster", tone: "blue" },
  fixed: { label: "Fixed", tone: "zinc" },
  changed: { label: "Changed", tone: "amber" },
  breaking: { label: "Breaking", tone: "red" },
};

const SECTION_TAG: Record<string, ChangeTag> = {
  added: "new",
  new: "new",
  "whats new": "new",
  "what's new": "new",
  feature: "new",
  features: "new",
  fixed: "fixed",
  fixes: "fixed",
  "bug fixes": "fixed",
  bugfixes: "fixed",
  security: "fixed",
  performance: "performance",
  improved: "improved",
  improvements: "improved",
  enhancements: "improved",
  changed: "changed",
  changes: "changed",
  "migration notes": "changed",
  migration: "changed",
  breaking: "breaking",
  "breaking changes": "breaking",
};

function normalizeSection(raw: string): ChangeTag | null {
  const key = raw
    .toLowerCase()
    .replace(/[^a-z' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return SECTION_TAG[key] ?? null;
}

function clean(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

/** "**scope:** summary" → { label: "scope", text: "summary" }; plain text → { label: "", text }. */
function splitLabel(s: string): { label: string; text: string } {
  const m = s.match(/^\*\*(.+?)\*\*[:\-–]?\s*(.*)$/);
  if (m) {
    const lead = clean(m[1].replace(/:$/, ""));
    const rest = clean(m[2]);
    return rest ? { label: lead, text: rest } : { label: "", text: lead };
  }
  return { label: "", text: clean(s) };
}

function extractItems(md: string): ChangeItem[] {
  if (!md.trim()) return [];
  const items: ChangeItem[] = [];
  let current: ChangeTag | null = null;

  for (const rawLine of md.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    // Markdown heading (## / ### …) — a section header or the version line.
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      const tag = normalizeSection(heading[1]);
      if (tag) current = tag;
      continue;
    }

    // Bold-only line used as a section header, e.g. **Added**.
    const boldHeader = line.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (boldHeader) {
      const tag = normalizeSection(boldHeader[1]);
      if (tag) {
        current = tag;
        continue;
      }
    }

    // Bullet item.
    const bullet = line.match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      const { label, text } = splitLabel(bullet[1]);
      if (text) items.push({ tag: current ?? "changed", label, text });
    }
    // Non-bullet paragraphs (e.g. migration prose) are intentionally skipped to keep
    // the timeline scannable.
  }
  return items;
}

/**
 * Parse tagged change items — preferring the terse `changelog`, falling back to
 * `release_notes`. Returns [] when neither yields structured items (caller can then
 * render the raw notes instead).
 */
export function parseChanges(changelog?: string | null, releaseNotes?: string | null): ChangeItem[] {
  const primary = extractItems(changelog ?? "");
  if (primary.length) return primary;
  return extractItems(releaseNotes ?? "");
}
