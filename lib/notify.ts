// Delivering a published release to its subscribers.
//
// Server-only. Called from the publish flow when the "email" channel is selected;
// it is never triggered implicitly, so nobody's list gets mailed by accident.
import crypto from "node:crypto";
import { prisma } from "./db";
import { parseChanges, TAG_META } from "./changelog";
import {
  emailConfigured,
  sendEmailBatch,
  releaseAnnouncementEmail,
  type ReleaseEmailInput,
} from "./email";

/**
 * Signed unsubscribe token. Keyed to the workspace + address so a link can't be
 * used to remove somebody else, and needs no extra table.
 */
export function unsubscribeToken(workspaceId: string, email: string): string {
  const secret = process.env.BETTER_AUTH_SECRET || "relay-dev-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${workspaceId}:${email.toLowerCase()}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyUnsubscribeToken(
  workspaceId: string,
  email: string,
  token: string,
): boolean {
  const expected = unsubscribeToken(workspaceId, email);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export type NotifyResult = {
  sent: number;
  total: number;
  skipped?: "no_email_provider" | "no_subscribers" | "not_found";
};

/**
 * Email every subscriber of the release's workspace. Returns how many were sent so
 * the UI can report it honestly rather than claiming success.
 */
export async function sendReleaseToSubscribers(
  releaseId: string,
  baseUrl: string,
): Promise<NotifyResult> {
  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: { workspace: true, assets: true },
  });
  if (!release) return { sent: 0, total: 0, skipped: "not_found" };

  const subscribers = await prisma.subscriber.findMany({
    where: { workspaceId: release.workspaceId },
    select: { email: true },
  });
  if (subscribers.length === 0) return { sent: 0, total: 0, skipped: "no_subscribers" };
  if (!emailConfigured()) {
    return { sent: 0, total: subscribers.length, skipped: "no_email_provider" };
  }

  const asset = (type: string) => release.assets.find((a) => a.type === type)?.content;
  const items = parseChanges(asset("changelog"), asset("release_notes"))
    .slice(0, 12)
    .map((i) => ({ tag: TAG_META[i.tag].label, label: i.label, text: i.text }));

  const origin = baseUrl.replace(/\/$/, "");
  const changelogUrl = `${origin}/c/${release.workspace.slug}`;

  const base: Omit<ReleaseEmailInput, "unsubscribeUrl"> = {
    workspaceName: release.workspace.name,
    version: release.version,
    title: release.title,
    summary: asset("summary")?.replace(/\*\*/g, "").trim() || null,
    items,
    changelogUrl,
  };

  const messages = subscribers.map((s) => {
    const token = unsubscribeToken(release.workspaceId, s.email);
    const unsubscribeUrl = `${origin}/api/unsubscribe?w=${release.workspaceId}&e=${encodeURIComponent(
      s.email,
    )}&t=${token}`;
    return { to: s.email, ...releaseAnnouncementEmail({ ...base, unsubscribeUrl }) };
  });

  const sent = await sendEmailBatch(messages);
  return { sent, total: subscribers.length };
}
