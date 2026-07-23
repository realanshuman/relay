import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { ReleasesTable } from "@/components/releases-table";
import { cn } from "@/lib/utils";

export const metadata = { title: "Releases" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "ready", label: "Ready" },
  { key: "published", label: "Published" },
];

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const ws = await getCurrentWorkspace();
  const status = searchParams.status ?? "all";

  const where: Record<string, unknown> = { workspaceId: ws.id };
  if (status === "published") where.publishStatus = "published";
  else if (status === "ready") {
    where.status = "ready";
    where.publishStatus = "unpublished";
  } else if (status === "draft") where.status = "draft";

  const releases = await prisma.release.findMany({
    where,
    orderBy: { releaseDate: "desc" },
    include: { repository: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Releases"
        subtitle="Every release, from detected draft to published. The core of Relay."
        icon="Rocket"
      />

      <div className="mb-4 flex items-center gap-1.5">
        {FILTERS.map((f) => {
          const active = status === f.key;
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/releases" : `/releases?status=${f.key}`}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                active
                  ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        {releases.length ? (
          <ReleasesTable releases={releases} />
        ) : (
          <div className="p-6">
            <EmptyState
              icon="Rocket"
              title={status === "all" ? "No releases yet" : `No ${status} releases`}
              description="Use “New Release” to detect one from a connected repository."
            />
          </div>
        )}
      </Card>
    </div>
  );
}
