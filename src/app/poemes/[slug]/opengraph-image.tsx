import { ImageResponse } from "next/og";

import { provenanceLabel } from "@/components/Provenance";
import { site, siteUrl } from "@/config/site";
import { getDb } from "@/db/client";
import { OG_COLORS, OG_SIZE, OgPaper, OgWordmark, ogFonts } from "@/lib/og";
import { getPoemBySlug } from "@/server/poems";

export const alt = `Un poème sur ${site.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** Les premiers vers, sans dépasser la place disponible. */
function opening(body: string): string[] {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);
  return lines.map((line) => (line.length > 58 ? `${line.slice(0, 56).trimEnd()}…` : line));
}

/** Aperçu d'un poème : titre, auteur, premiers vers et provenance (écrit sur Boème ou source externe). */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const poem = await getPoemBySlug(await getDb(), slug);
  const fonts = await ogFonts();

  if (!poem) {
    return new ImageResponse(
      (
        <OgPaper>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <OgWordmark size={200} />
          </div>
        </OgPaper>
      ),
      { ...size, fonts },
    );
  }

  const member = poem.origin === "member";
  const title = poem.title.length > 60 ? `${poem.title.slice(0, 58).trimEnd()}…` : poem.title;
  const verses = poem.body ? opening(poem.body) : ["Œuvre encore protégée : à lire à sa source."];

  return new ImageResponse(
    (
      <OgPaper>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "60px 80px 56px 100px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 22,
                letterSpacing: 2,
                textTransform: "uppercase",
                ...(member ? { background: OG_COLORS.roseDeep, color: OG_COLORS.ivory } : { border: `2px solid ${OG_COLORS.ink}`, color: OG_COLORS.ink }),
              }}
            >
              {provenanceLabel(poem.origin, poem.sourceUrl)}
            </div>
            <OgWordmark size={64} />
          </div>

          <div style={{ display: "flex", marginTop: 28, fontFamily: "Cormorant", fontStyle: "italic", fontSize: title.length > 32 ? 70 : 88, lineHeight: 1.05 }}>
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 26, color: OG_COLORS.roseDeep }}>
            {poem.authorName}
            {poem.year ? ` · ${poem.year}` : ""}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 26,
              paddingLeft: 28,
              borderLeft: `3px solid ${OG_COLORS.rose}`,
              fontFamily: "Cormorant",
              fontSize: 32,
              lineHeight: 1.28,
              color: OG_COLORS.inkSoft,
            }}
          >
            {verses.map((verse, i) => (
              <span key={i}>{verse}</span>
            ))}
          </div>

          <div style={{ display: "flex", marginTop: "auto", alignItems: "center", justifyContent: "space-between", fontSize: 22, color: OG_COLORS.inkSoft }}>
            <span>{new URL(siteUrl()).host}</span>
            <span style={{ color: OG_COLORS.roseDeep }}>{member ? "Lire le poème en entier →" : "Lire sur Boème →"}</span>
          </div>
        </div>
      </OgPaper>
    ),
    { ...size, fonts },
  );
}
