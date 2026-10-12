import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ReactNode } from "react";

import { ImageResponse } from "next/og";

/** Format recommandé par Facebook, LinkedIn, WhatsApp, X… */
export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  ivory: "#f8f3ec",
  ivorySoft: "#f2ead9",
  linenDeep: "#ddccae",
  rose: "#c9a4a1",
  roseDeep: "#7f5551",
  ink: "#3a332d",
  inkSoft: "#675e58",
};

let fonts: Promise<Array<{ name: string; data: Buffer; style: "normal" | "italic"; weight: 500 | 600 }>> | undefined;

/** Polices de l'image (lues une fois par instance). Sources : assets/og (licence OFL). */
export function ogFonts() {
  const file = (name: string) => readFile(join(process.cwd(), "assets/og", name));
  fonts ??= Promise.all([
    file("cormorant-garamond-latin-500-italic.woff"),
    file("cormorant-garamond-latin-500-normal.woff"),
    file("manrope-latin-600-normal.woff"),
  ]).then(([italic, normal, sans]) => [
    { name: "Cormorant", data: italic, style: "italic", weight: 500 },
    { name: "Cormorant", data: normal, style: "normal", weight: 500 },
    { name: "Manrope", data: sans, style: "normal", weight: 600 },
  ]);
  return fonts;
}

/** « Boème » avec son accent en coup de pinceau rose, comme sur l'accueil. */
export function OgWordmark({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", fontFamily: "Cormorant", fontStyle: "italic", fontSize: size, color: OG_COLORS.ink, lineHeight: 1 }}>
      <span>Bo</span>
      <span style={{ display: "flex", position: "relative" }}>
        e
        <svg
          viewBox="0 0 40 40"
          width={size * 0.24}
          height={size * 0.24}
          style={{ position: "absolute", left: size * 0.17, top: size * 0.02 }}
        >
          <path d="M6 4c3-2 7-1 9 2 4 6 9 14 15 26 1 2-1 4-3 3C19 28 12 19 6 12 3 9 3 6 6 4Z" fill={OG_COLORS.roseDeep} />
        </svg>
      </span>
      <span>me</span>
    </div>
  );
}

/** Fond commun : papier ivoire, halo rose, filets de cahier discrets. */
export function OgPaper({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: `radial-gradient(circle at 12% 0%, #efe2d6 0%, ${OG_COLORS.ivorySoft} 40%, ${OG_COLORS.ivory} 100%)`,
        fontFamily: "Manrope",
        color: OG_COLORS.ink,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: OG_COLORS.roseDeep, display: "flex" }} />
      {children}
    </div>
  );
}

/** Icône d'onglet : un « B » italique sur papier ivoire, avec l'accent rose de « Boème ». */
export function renderMark(px: number, fonts: Awaited<ReturnType<typeof ogFonts>>) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: OG_COLORS.ivory,
          borderRadius: px * 0.22,
          border: `${Math.max(1, px * 0.03)}px solid ${OG_COLORS.linenDeep}`,
        }}
      >
        <span style={{ display: "flex", fontFamily: "Cormorant", fontStyle: "italic", fontSize: px * 0.86, color: OG_COLORS.ink, lineHeight: 1, marginTop: -px * 0.06 }}>B</span>
        <svg viewBox="0 0 40 40" width={px * 0.3} height={px * 0.3} style={{ position: "absolute", right: px * 0.1, top: px * 0.08 }}>
          <path d="M6 4c3-2 7-1 9 2 4 6 9 14 15 26 1 2-1 4-3 3C19 28 12 19 6 12 3 9 3 6 6 4Z" fill={OG_COLORS.roseDeep} />
        </svg>
      </div>
    ),
    { width: px, height: px, fonts },
  );
}
