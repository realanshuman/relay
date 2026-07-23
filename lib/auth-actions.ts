"use server";

import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getCurrentWorkspace } from "./workspace";
import { hashPassword, verifyPassword, createSession, destroySession } from "./auth";

export interface AuthState {
  error?: string;
}

function normalizeEmail(v: FormDataEntryValue | null): string {
  return String(v || "").trim().toLowerCase();
}

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

  const ws = await getCurrentWorkspace();
  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });
  await prisma.membership.create({
    data: { userId: user.id, workspaceId: ws.id, role: "member" },
  });

  await createSession(user.id);
  redirect("/app");
}

export async function signOut() {
  await destroySession();
  redirect("/login");
}
