import { headers } from "next/headers";
import { auth } from "./auth";
import { createWorkspaceForUser, getWorkspaceForUser } from "./workspace";

/** The signed-in user (or null), resolved from the request's session cookie. */
export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: headers() });
  return session?.user ?? null;
}

/** The active workspace for the signed-in user (self-heals if somehow missing). */
export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const ws = await getWorkspaceForUser(user.id);
  return ws ?? (await createWorkspaceForUser(user.id, user.name || user.email));
}
