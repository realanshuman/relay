// Minimal transactional email. Uses Resend when RESEND_API_KEY is set; otherwise
// returns delivered:false so callers can surface a dev link (no email provider needed
// to try the flow locally).

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM || "Relay <noreply@tryrelay.run>";
}

export function testEmail() {
  return {
    subject: "Your Relay sender is working ✓",
    text: "This is a test email from Relay. If you received this, your email sender is configured correctly.",
    html: `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#18181b">Your sender is working ✓</h2>
      <p style="color:#52525b;line-height:1.6">This is a test email from Relay. If it reached your inbox, password-reset and subscriber emails will send correctly from your domain.</p>
    </div>`,
  };
}

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = emailFrom();
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Send many emails in one go via Resend's batch endpoint (100 per request).
 * Returns how many were accepted. Each recipient gets their own message, so
 * addresses are never disclosed to each other.
 */
export async function sendEmailBatch(messages: SendArgs[]): Promise<number> {
  const key = process.env.RESEND_API_KEY;
  if (!key || messages.length === 0) return 0;
  const from = emailFrom();
  let sent = 0;

  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify(
          chunk.map((m) => ({ from, to: m.to, subject: m.subject, html: m.html, text: m.text })),
        ),
      });
      if (res.ok) sent += chunk.length;
    } catch {
      // Skip this chunk; the caller reports the shortfall.
    }
  }
  return sent;
}

export interface ReleaseEmailInput {
  workspaceName: string;
  version: string;
  title?: string | null;
  summary?: string | null;
  /** Pre-rendered "<tag> label — text" lines. */
  items: { tag: string; label: string; text: string }[];
  changelogUrl: string;
  unsubscribeUrl: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** The announcement sent to changelog subscribers when a release is published. */
export function releaseAnnouncementEmail(input: ReleaseEmailInput) {
  const { workspaceName, version, title, summary, items, changelogUrl, unsubscribeUrl } = input;
  const headline = title || `What's new in ${version}`;
  const subject = `${workspaceName} ${version}: ${headline}`;

  const textLines = items.map(
    (i) => `- [${i.tag}] ${i.label ? `${i.label}: ` : ""}${i.text}`,
  );
  const text = [
    `${workspaceName} ${version}`,
    headline,
    "",
    summary ? `${summary}\n` : "",
    ...textLines,
    "",
    `Read the full notes: ${changelogUrl}`,
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const itemsHtml = items
    .map(
      (i) => `<tr>
        <td style="padding:0 0 10px 0;vertical-align:top">
          <span style="display:inline-block;background:#f4f4f5;color:#52525b;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.03em">${escapeHtml(i.tag)}</span>
        </td>
        <td style="padding:0 0 10px 10px;color:#3f3f46;font-size:14px;line-height:1.6">
          ${i.label ? `<strong style="color:#18181b">${escapeHtml(i.label)}</strong> ` : ""}${escapeHtml(i.text)}
        </td>
      </tr>`,
    )
    .join("");

  const html = `<div style="font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:8px">
    <p style="font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#71717a;margin:0 0 6px">${escapeHtml(workspaceName)} ${escapeHtml(version)}</p>
    <h1 style="font-size:24px;line-height:1.25;color:#18181b;margin:0 0 12px">${escapeHtml(headline)}</h1>
    ${summary ? `<p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 18px">${escapeHtml(summary)}</p>` : ""}
    ${itemsHtml ? `<table style="width:100%;border-collapse:collapse;margin:0 0 22px">${itemsHtml}</table>` : ""}
    <a href="${changelogUrl}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:14px">Read the full notes</a>
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 12px" />
    <p style="color:#a1a1aa;font-size:12px;line-height:1.6;margin:0">
      You're receiving this because you subscribed to ${escapeHtml(workspaceName)} updates.
      <a href="${unsubscribeUrl}" style="color:#71717a">Unsubscribe</a>.
    </p>
  </div>`;

  return { subject, html, text };
}

export function otpEmail(code: string) {
  return {
    subject: `Your Relay code: ${code}`,
    text: `Your Relay verification code is ${code}. It expires in 5 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#18181b">Your sign-in code</h2>
      <p style="color:#52525b;line-height:1.6">Enter this code to continue. It expires in 5 minutes.</p>
      <div style="font-size:30px;font-weight:700;letter-spacing:8px;color:#18181b;background:#f4f4f5;border-radius:12px;padding:16px 24px;text-align:center;margin:16px 0">${code}</div>
      <p style="color:#a1a1aa;font-size:13px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
    </div>`,
  };
}

export function passwordResetEmail(link: string) {
  return {
    subject: "Reset your Relay password",
    text: `Reset your password using this link (valid for 1 hour):\n\n${link}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#18181b">Reset your password</h2>
      <p style="color:#52525b;line-height:1.6">Click the button below to choose a new password. This link is valid for one hour.</p>
      <a href="${link}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600">Reset password</a>
      <p style="color:#a1a1aa;font-size:13px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
    </div>`,
  };
}
