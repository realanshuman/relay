// Image Generator — produces a branded SVG release banner. (docs/prd-v1.5.md §5.1)
// SVG keeps banners crisp, brandable, and dependency-free. When an image model is
// wired up later this is the single function to swap.

import { seededRandom } from "./utils";

export interface BannerInput {
  version: string;
  title?: string | null;
  workspaceName: string;
  primaryColor: string;
  accentColor: string;
  tagline?: string | null;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateBannerSvg(input: BannerInput): string {
  const { version, title, workspaceName, primaryColor, accentColor, tagline } = input;
  const seed = `${workspaceName}-${version}`;
  const r = seededRandom(seed);
  const r2 = seededRandom(seed + "x");
  const angle = Math.round(r * 60) + 30;

  const headline = escapeXml(title || `What's new in ${version}`);
  const ws = escapeXml(workspaceName.toUpperCase());
  const tag = escapeXml(tagline || "Product Release");

  // Decorative blobs positioned deterministically from the seed.
  const bx = 780 + Math.round(r * 220);
  const by = 120 + Math.round(r2 * 160);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 480" width="1200" height="480" role="img" aria-label="${headline}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)">
      <stop offset="0" stop-color="${primaryColor}"/>
      <stop offset="1" stop-color="${accentColor}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="40"/></filter>
  </defs>
  <rect width="1200" height="480" fill="url(#bg)"/>
  <circle cx="${bx}" cy="${by}" r="260" fill="url(#glow)" filter="url(#soft)"/>
  <circle cx="120" cy="430" r="180" fill="#ffffff" opacity="0.08" filter="url(#soft)"/>
  <g fill="#ffffff">
    <text x="80" y="120" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" letter-spacing="4" opacity="0.85" font-weight="600">${ws}</text>
    <rect x="80" y="150" width="112" height="40" rx="20" fill="#ffffff" opacity="0.16"/>
    <text x="100" y="177" font-family="ui-monospace, monospace" font-size="20" font-weight="700">${escapeXml(version)}</text>
    <text x="80" y="290" font-family="ui-sans-serif, system-ui, sans-serif" font-size="64" font-weight="800">${
      headline.length > 34 ? headline.slice(0, 33) + "…" : headline
    }</text>
    <text x="80" y="345" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" opacity="0.9">${tag}</text>
  </g>
</svg>`;
}

export function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml,${encoded}`;
}
