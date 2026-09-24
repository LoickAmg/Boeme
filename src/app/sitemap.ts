import type { MetadataRoute } from "next";

import { siteUrl } from "@/config/site";
import { getDb } from "@/db/client";
import { listAuthors, listPoems } from "@/server/poems";

export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/", "/bibliotheque", "/poetes", "/communaute", "/generateur", "/charte", "/mentions-legales", "/confidentialite", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const db = await getDb();
  const [authors, poems] = await Promise.all([listAuthors(db), listPoems(db, { pageSize: 60, sort: "recent" })]);

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${base}${path}` })),
    ...authors.filter((author) => author.poemCount > 0).map((author) => ({ url: `${base}/poetes/${author.slug}` })),
    ...poems.items.map((poem) => ({ url: `${base}/poemes/${poem.slug}`, lastModified: poem.publishedAt ?? undefined })),
  ];
}
