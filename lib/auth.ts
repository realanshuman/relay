import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./db";
import { createWorkspaceForUser } from "./workspace";
import { sendEmail, passwordResetEmail } from "./email";

// NOTE: this module must stay free of `next/headers` so it can be imported outside a
// request (e.g. scripts). Request-scoped helpers live in lib/session.ts.

const appUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type Provider = { clientId: string; clientSecret: string };
const socialProviders: Record<string, Provider> = {};
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  };
}
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

/** Which social sign-in buttons to show (based on configured env vars). */
export function enabledSocialProviders() {
  return { github: "github" in socialProviders, google: "google" in socialProviders };
}

export const auth = betterAuth({
  appName: "Relay",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, token }) => {
      const link = `${appUrl}/reset-password?token=${token}`;
      await sendEmail({ to: user.email, ...passwordResetEmail(link) });
    },
  },
  socialProviders,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Every new account gets its own fresh, empty workspace.
          await createWorkspaceForUser(user.id, user.name || user.email);
        },
      },
    },
  },
  // nextCookies() must be last so cookies set inside server actions are forwarded.
  plugins: [nextCookies()],
});
