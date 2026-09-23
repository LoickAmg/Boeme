import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

const PATHS = ["/", "/galerie/", "/mentions-legales/", "/confidentialite/", "/contact/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PATHS.map((path) => ({ url: `${base}${path}` }));
}
