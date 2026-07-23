import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "./db";

export { hashPassword, verifyPassword } from "./password";

const COOKIE = "relay_session";
const SESSION_DAYS = 30;

// --- sessions -------------------------------------------------------------

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const token = cookies().get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    cookies().delete(COOKIE);
  }
}

/** Returns the signed-in user, or null. Clears expired/invalid sessions. */
export async function getCurrentUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}
