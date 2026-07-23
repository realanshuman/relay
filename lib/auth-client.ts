"use client";

import { createAuthClient } from "better-auth/react";

// Same-origin: the client infers the base URL from the browser and talks to /api/auth.
export const authClient = createAuthClient();

export const { useSession } = authClient;
