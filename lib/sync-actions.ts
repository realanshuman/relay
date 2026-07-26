"use server";

import { revalidatePath } from "next/cache";
import { getCurrentWorkspace } from "./session";
import { prisma } from "./db";
import { syncRepository, syncWorkspace } from "./sync";

export type SyncSummary = {
  checked: number;
  created: number;
  upToDate: number;
  errors: number;
  /** How to present the result: a win, a problem, or something still to set up. */
  tone: "success" | "neutral" | "warning" | "error";
  /** Short, user-facing sentence describing what happened. */
  message: string;
  /** The first release drafted, so the caller can navigate straight to it. */
  releaseId?: string;
};

function summarize(results: Awaited<ReturnType<typeof syncWorkspace>>): SyncSummary {
  const created = results.filter((r) => r.status === "created");
  const errors = results.filter((r) => r.status === "error");
  const skipped = results.filter((r) => r.status === "skipped");
  const upToDate = results.filter((r) => r.status === "up_to_date");

  let message: string;
  let tone: SyncSummary["tone"];
  if (created.length) {
    const versions = created.map((r) => r.version).filter(Boolean).join(", ");
    message =
      created.length === 1
        ? `New release drafted: ${versions}`
        : `${created.length} new releases drafted: ${versions}`;
    tone = "success";
  } else if (errors.length) {
    message = errors[0].detail || "Could not reach GitHub.";
    tone = "error";
  } else if (skipped.length && !upToDate.length) {
    message = skipped[0].detail || "Nothing to check yet.";
    tone = "warning";
  } else {
    message = "No new commits. You're up to date.";
    tone = "neutral";
  }

  return {
    checked: results.length,
    created: created.length,
    upToDate: upToDate.length,
    errors: errors.length,
    tone,
    message,
    releaseId: created[0]?.releaseId,
  };
}

/** "Check for updates" across every connected repo in the current workspace. */
export async function checkForUpdates(): Promise<SyncSummary> {
  const ws = await getCurrentWorkspace();
  const results = await syncWorkspace(ws.id);
  revalidatePath("/app/repositories");
  revalidatePath("/app/releases");
  revalidatePath("/app");
  return summarize(results);
}

/** "Check for updates" on a single repository (scoped to the caller's workspace). */
export async function checkRepositoryForUpdates(repositoryId: string): Promise<SyncSummary> {
  const ws = await getCurrentWorkspace();
  const owned = await prisma.repository.findFirst({
    where: { id: repositoryId, workspaceId: ws.id },
    select: { id: true },
  });
  if (!owned) {
    return {
      checked: 0,
      created: 0,
      upToDate: 0,
      errors: 1,
      tone: "error",
      message: "Repository not found.",
    };
  }
  const result = await syncRepository(repositoryId);
  revalidatePath("/app/repositories");
  revalidatePath("/app/releases");
  revalidatePath("/app");
  return summarize([result]);
}
