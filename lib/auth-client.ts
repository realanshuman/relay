"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { sentinelClient } from "@better-auth/infra/client";

// Same-origin: the client infers the base URL from the browser and talks to /api/auth.
//
// sentinelClient() is Better Auth's bot-protection companion to the dash() server
// plugin: on load it fingerprints the browser and pings Better Auth's identify
// service, and it auto-solves any proof-of-work challenge the server returns. If
// that service is unreachable it fails open (a console warning) and never blocks
// sign-in, so it is safe to run alongside email/password + social auth.
export const authClient = createAuthClient({
  plugins: [sentinelClient(), emailOTPClient()],
});

export const { useSession } = authClient;
