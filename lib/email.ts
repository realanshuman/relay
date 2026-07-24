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
