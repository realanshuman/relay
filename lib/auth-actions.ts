"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { prisma } from "./db";
import { createWorkspaceForUser } from "./workspace";
import { getBaseUrl } from "./base-url";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getCurrentUser,
} from "./auth";
import { sendEmail, emailConfigured, passwordResetEmail } from "./email";

export interface AuthState {
  error?: string;
}

export interface ResetRequestState {
  sent?: boolean;
  devLink?: string; // shown only when no email provider is configured
  error?: string;
}

export interface ResetState {
  error?: string;
  ok?: boolean;
}

function normalizeEmail(v: FormDataEntryValue | null): string {
  return String(v || "").trim().toLowerCase();
}

// --- sign in / up / out ---------------------------------------------------

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "That email and password don't match. Try again." };
  }

  await createSession(user.id);
  redirect("/app");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) return { error: "Please fill in every field." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists. Sign in instead." };

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });
  // Every new account gets its own fresh, empty workspace.
  await createWorkspaceForUser(user.id, name);

  await createSession(user.id);
  redirect("/app");
}

export async function signOut() {
  await destroySession();
  redirect("/login");
}

// --- forgot / reset password ---------------------------------------------

export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = normalizeEmail(formData.get("email"));
  if (!email) return { error: "Enter your email address." };

  const user = await prisma.user.findUnique({ where: { email } });

  // Only create a token if the account exists — but always return the same
  // confirmation so we don't reveal which emails are registered.
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const link = `${getBaseUrl()}/reset-password?token=${token}`;
    const mail = passwordResetEmail(link);
    const delivered = await sendEmail({ to: email, ...mail });

    // No email provider configured → surface the link so the flow is usable in demos.
    if (!delivered && !emailConfigured()) {
      return { sent: true, devLink: link };
    }
  }

  return { sent: true };
}

export async function resetPassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!token) return { error: "This reset link is invalid." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (password !== confirm) return { error: "The passwords don't match." };

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash: await hashPassword(password) },
  });
  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  // Invalidate existing sessions for safety, then sign the user in fresh.
  await prisma.session.deleteMany({ where: { userId: record.userId } });
  await createSession(record.userId);
  redirect("/app");
}

// --- change password (signed in) -----------------------------------------

export async function changePassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You're not signed in." };

  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };

  if (!user.passwordHash || !(await verifyPassword(current, user.passwordHash))) {
    return { error: "Your current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });
  return { ok: true };
}
