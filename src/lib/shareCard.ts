// Carte-poème : quelques vers dessinés en image (story, carré, aperçu de lien), aux couleurs
// de Boème, pour partager un poème sur Instagram, WhatsApp, TikTok… Tout est dessiné dans le
// navigateur (canvas) : aucune image n'est produite côté serveur.

export type CardFormat = "story" | "square" | "wide";
export type CardStyle = "ivoire" | "encre" | "rose" | "nuit";

export const CARD_FORMATS: Record<CardFormat, { label: string; width: number; height: number }> = {
  story: { label: "Story (9:16)", width: 1080, height: 1920 },
  square: { label: "Carré", width: 1080, height: 1080 },
  wide: { label: "Paysage", width: 1200, height: 630 },
};

export const CARD_STYLES: Record<CardStyle, { label: string; bg: [string, string]; ink: string; soft: string; accent: string; stars?: boolean }> = {
  ivoire: { label: "Ivoire", bg: ["#f8f3ec", "#ece0cd"], ink: "#3a332d", soft: "#675e58", accent: "#7f5551" },
  encre: { label: "Encre", bg: ["#2b2621", "#3a332d"], ink: "#f8f3ec", soft: "#ddccae", accent: "#ddc0bd" },
  rose: { label: "Rose poudré", bg: ["#ddc0bd", "#c9a4a1"], ink: "#3a332d", soft: "#5a4b46", accent: "#f8f3ec" },
  nuit: { label: "Nuit étoilée", bg: ["#141026", "#2a1f3d"], ink: "#f2ead9", soft: "#c9b8d8", accent: "#ddc0bd", stars: true },
};

export interface CardContent {
  title: string;
  author: string;
  verses: string[];
}

const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS = 'Manrope, system-ui, sans-serif';

/** Polices du site prêtes avant de dessiner (sinon le canvas prend une police de secours). */
export async function loadCardFonts(): Promise<void> {
  if (!("fonts" in document)) return;
  await Promise.all([
    document.fonts.load(`italic 500 64px ${SERIF}`),
    document.fonts.load(`500 48px ${SERIF}`),
    document.fonts.load(`600 24px ${SANS}`),
  ]).catch(() => undefined);
}

/** Coupe un vers trop long pour la largeur, entre deux mots. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [""];
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      out.push(line);
      line = `  ${word}`;
    } else {
      line = candidate;
    }
  }
  out.push(line);
  return out;
}

/** Étoiles à positions fixes (même carte à chaque rendu). */
function stars(ctx: CanvasRenderingContext2D, w: number, h: number) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = 0; i < 140; i++) {
    ctx.globalAlpha = 0.25 + rnd() * 0.75;
    ctx.beginPath();
    ctx.arc(rnd() * w, rnd() * h, 0.6 + rnd() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Dessine la carte sur un canvas déjà dimensionné au format. */
export function drawCard(canvas: HTMLCanvasElement, content: CardContent, format: CardFormat, style: CardStyle) {
  const { width: w, height: h } = CARD_FORMATS[format];
  const s = CARD_STYLES[style];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Fond : dégradé doux, halo, grain léger.
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, s.bg[0]);
  grad.addColorStop(1, s.bg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const halo = ctx.createRadialGradient(w * 0.85, h * 0.1, 0, w * 0.85, h * 0.1, Math.max(w, h) * 0.7);
  halo.addColorStop(0, "rgba(255,255,255,0.18)");
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);
  if (s.stars) {
    ctx.fillStyle = "#ffffff";
    stars(ctx, w, h);
  }

  const margin = Math.round(Math.min(w, h) * 0.09);
  const maxWidth = w - margin * 2;
  const footer = Math.round(h * (format === "wide" ? 0.14 : 0.1));

  // Taille des vers : la plus grande qui fait tout tenir.
  const title = content.title;
  const verses = content.verses.length ? content.verses : [""];
  let size = format === "story" ? 64 : format === "square" ? 54 : 40;
  let lines: string[] = [];
  let titleLines: string[] = [];
  for (; size > 20; size -= 2) {
    ctx.font = `500 ${size}px ${SERIF}`;
    lines = verses.flatMap((v) => wrap(ctx, v, maxWidth));
    ctx.font = `italic 500 ${Math.round(size * 1.15)}px ${SERIF}`;
    titleLines = wrap(ctx, title, maxWidth);
    const total = titleLines.length * size * 1.3 + size * 0.9 + lines.length * size * 1.45;
    if (total < h - margin * 2 - footer) break;
  }
  const titleSize = Math.round(size * 1.15);
  const blockHeight = titleLines.length * titleSize * 1.15 + size * 0.9 + lines.length * size * 1.45;
  let y = Math.max(margin, (h - footer - blockHeight) / 2);

  ctx.textBaseline = "top";
  ctx.fillStyle = s.ink;
  ctx.font = `italic 500 ${titleSize}px ${SERIF}`;
  for (const t of titleLines) {
    ctx.fillText(t, margin, y);
    y += titleSize * 1.15;
  }
  // Trait rose sous le titre.
  ctx.fillStyle = s.accent;
  ctx.fillRect(margin, y + size * 0.25, Math.round(size * 1.6), Math.max(2, Math.round(size * 0.06)));
  y += size * 0.9;

  ctx.fillStyle = s.ink;
  ctx.font = `500 ${size}px ${SERIF}`;
  for (const line of lines) {
    ctx.fillText(line, margin, y);
    y += size * 1.45;
  }

  // Pied : auteur, et la signature du site.
  const small = Math.max(16, Math.round(Math.min(w, h) * 0.024));
  ctx.font = `600 ${small}px ${SANS}`;
  ctx.fillStyle = s.soft;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(content.author.toUpperCase(), margin, h - margin * 0.75);
  ctx.font = `italic 500 ${Math.round(small * 1.8)}px ${SERIF}`;
  ctx.fillStyle = s.ink;
  const brand = "Boème";
  ctx.fillText(brand, w - margin - ctx.measureText(brand).width, h - margin * 0.75);
}

export function cardBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
