// Central definitions for the fixed V1.5 asset & channel set (docs/prd-v1.5.md §5.2, §6)

export type AssetType =
  | "release_notes"
  | "changelog"
  | "summary"
  | "twitter"
  | "linkedin"
  | "discord"
  | "telegram"
  | "email"
  | "banner_image";

export type ChannelType =
  | "website"
  | "twitter"
  | "linkedin"
  | "discord"
  | "telegram"
  | "email";

export interface AssetMeta {
  type: AssetType;
  label: string;
  group: "notes" | "marketing" | "visual";
  icon: string; // lucide icon name
  hint: string;
  multiline: boolean;
}

export const ASSETS: AssetMeta[] = [
  {
    type: "summary",
    label: "AI Summary",
    group: "notes",
    icon: "Sparkles",
    hint: "A two-line overview of the release.",
    multiline: true,
  },
  {
    type: "release_notes",
    label: "Release Notes",
    group: "notes",
    icon: "FileText",
    hint: "Customer-facing notes: What's New, Bug Fixes, Performance, Breaking Changes, Migration.",
    multiline: true,
  },
  {
    type: "changelog",
    label: "Changelog",
    group: "notes",
    icon: "List",
    hint: "Terse, categorized list of changes.",
    multiline: true,
  },
  {
    type: "twitter",
    label: "Twitter / X",
    group: "marketing",
    icon: "Twitter",
    hint: "A punchy announcement thread starter.",
    multiline: true,
  },
  {
    type: "linkedin",
    label: "LinkedIn",
    group: "marketing",
    icon: "Linkedin",
    hint: "A professional announcement post.",
    multiline: true,
  },
  {
    type: "discord",
    label: "Discord",
    group: "marketing",
    icon: "MessageSquare",
    hint: "A community-friendly announcement.",
    multiline: true,
  },
  {
    type: "telegram",
    label: "Telegram",
    group: "marketing",
    icon: "Send",
    hint: "A short broadcast message.",
    multiline: true,
  },
  {
    type: "email",
    label: "Email Draft",
    group: "marketing",
    icon: "Mail",
    hint: "A ready-to-send subscriber email.",
    multiline: true,
  },
  {
    type: "banner_image",
    label: "Banner Image",
    group: "visual",
    icon: "Image",
    hint: "A generated release banner.",
    multiline: false,
  },
];

export const ASSETS_BY_TYPE: Record<AssetType, AssetMeta> = Object.fromEntries(
  ASSETS.map((a) => [a.type, a]),
) as Record<AssetType, AssetMeta>;

export interface ChannelMeta {
  channel: ChannelType;
  label: string;
  icon: string;
  // The asset whose content is delivered/copied for this channel (website uses notes).
  asset?: AssetType;
  autoPublished: boolean; // website is fully published by Relay; others are copy/API-ready
}

export const CHANNELS: ChannelMeta[] = [
  { channel: "website", label: "Website", icon: "Globe", asset: "release_notes", autoPublished: true },
  { channel: "twitter", label: "Twitter / X", icon: "Twitter", asset: "twitter", autoPublished: false },
  { channel: "linkedin", label: "LinkedIn", icon: "Linkedin", asset: "linkedin", autoPublished: false },
  { channel: "discord", label: "Discord", icon: "MessageSquare", asset: "discord", autoPublished: false },
  { channel: "telegram", label: "Telegram", icon: "Send", asset: "telegram", autoPublished: false },
  { channel: "email", label: "Email", icon: "Mail", asset: "email", autoPublished: false },
];

export const CHANNELS_BY_KEY: Record<ChannelType, ChannelMeta> = Object.fromEntries(
  CHANNELS.map((c) => [c.channel, c]),
) as Record<ChannelType, ChannelMeta>;

export type RefineAction =
  | "regenerate"
  | "improve"
  | "shorter"
  | "more_technical"
  | "more_customer_friendly";

export const REFINE_ACTIONS: { action: RefineAction; label: string; icon: string }[] = [
  { action: "regenerate", label: "Regenerate", icon: "RefreshCw" },
  { action: "improve", label: "Improve", icon: "Wand2" },
  { action: "shorter", label: "Shorter", icon: "Minimize2" },
  { action: "more_technical", label: "More Technical", icon: "Code2" },
  { action: "more_customer_friendly", label: "More Customer Friendly", icon: "Smile" },
];

export const RISK_LABELS: Record<string, { label: string; tone: string }> = {
  low: { label: "Low", tone: "green" },
  medium: { label: "Medium", tone: "amber" },
  high: { label: "High", tone: "red" },
};
