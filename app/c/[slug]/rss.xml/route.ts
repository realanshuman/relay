import { prisma } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/workspace";

export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const ws = await getWorkspaceBySlug(params.slug);
  if (!ws) return new Response("Not found", { status: 404 });

  const releases = await prisma.release.findMany({
    where: {
      workspaceId: ws.id,
      publishStatus: "published",
      publishTargets: { some: { channel: "website" } },
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { assets: true, repository: true },
  });

  const origin = new URL(req.url).origin;
  const feedUrl = `${origin}/c/${ws.slug}`;

  const items = releases
    .map((r) => {
      const summary = r.assets.find((a) => a.type === "summary")?.content ?? r.title ?? "";
      const pubDate = (r.publishedAt ?? r.releaseDate).toUTCString();
      return `    <item>
      <title>${escapeXml(`${r.version} — ${r.title ?? ws.name}`)}</title>
      <link>${feedUrl}#${escapeXml(r.version)}</link>
      <guid isPermaLink="false">${r.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(r.repository.name)}</category>
      <description><![CDATA[${summary}]]></description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(ws.name)} Changelog</title>
    <link>${feedUrl}</link>
    <atom:link href="${feedUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(ws.tagline ?? `Latest releases from ${ws.name}.`)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
