import { ImageResponse } from "next/og";

import { site } from "@/config/site";
import { OG_COLORS, OG_SIZE, OgPaper, OgWordmark, ogFonts } from "@/lib/og";

export const alt = `${site.name} — poésie à lire, à écrire, à partager`;
export const size = OG_SIZE;
export const contentType = "image/png";

const VERSES = ["Les sanglots longs", "Des violons", "De l'automne", "Blessent mon cœur", "D'une langueur", "Monotone."];

/** Aperçu du site quand on partage un lien (WhatsApp, Instagram, X, LinkedIn, Discord…). */
export default async function Image() {
  return new ImageResponse(
    (
      <OgPaper>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "70px 80px 64px 100px", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <OgWordmark size={190} />
            <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontFamily: "Cormorant", fontStyle: "italic", fontSize: 54, lineHeight: 1.15, color: OG_COLORS.inkSoft }}>
              <span>Lire, écrire et partager</span>
              <span>de la poésie.</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 14 }}>
              {["Bibliothèque", "Communauté", "Cadavre exquis", "Constellation"].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    padding: "10px 22px",
                    borderRadius: 999,
                    border: `2px solid ${OG_COLORS.linenDeep}`,
                    background: "rgba(255,255,255,0.55)",
                    fontSize: 24,
                    color: OG_COLORS.ink,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feuillet incliné avec deux vers, comme posé sur un bureau. */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 60,
            width: 330,
            display: "flex",
            flexDirection: "column",
            padding: "34px 36px",
            background: "#fffaf2",
            border: `2px solid ${OG_COLORS.linenDeep}`,
            boxShadow: "0 24px 50px rgba(58,51,45,0.16)",
            transform: "rotate(4deg)",
          }}
        >
          <div style={{ display: "flex", fontFamily: "Cormorant", fontStyle: "italic", fontSize: 36 }}>Chanson d&apos;automne</div>
          <div style={{ display: "flex", marginTop: 4, fontSize: 15, letterSpacing: 3, color: OG_COLORS.inkSoft }}>PAUL VERLAINE</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 20, fontFamily: "Cormorant", fontSize: 29, lineHeight: 1.3, color: OG_COLORS.inkSoft }}>
            {VERSES.map((verse) => (
              <span key={verse}>{verse}</span>
            ))}
          </div>
        </div>
      </OgPaper>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
