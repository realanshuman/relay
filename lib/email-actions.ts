"use server";

import { getCurrentUser } from "./session";
import { sendEmail, emailConfigured, testEmail } from "./email";

export interface TestEmailState {
  ok?: boolean;
  error?: string;
  sentTo?: string;
}

export async function sendTestEmail(
  _prev: TestEmailState,
  _formData: FormData,
): Promise<TestEmailState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You're not signed in." };

  if (!emailConfigured()) {
    return {
      error:
        "No email provider is connected. Set RESEND_API_KEY (and EMAIL_FROM) in your environment, then redeploy.",
    };
  }

  const delivered = await sendEmail({ to: user.email, ...testEmail() });
  if (!delivered) {
    return {
      error:
        "Resend rejected the request. Check that RESEND_API_KEY is valid and EMAIL_FROM uses a verified domain.",
    };
  }
  return { ok: true, sentTo: user.email };
}
