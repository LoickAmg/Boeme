/**
 * Mise en forme d'un poème importé (photo, capture, document) avant de le placer dans
 * l'éditeur : fins de ligne unifiées, espaces superflus retirés, mots coupés en fin de
 * ligne recollés, strophes séparées par une seule ligne vide, et titre deviné quand la
 * première ligne en a l'allure (courte, suivie d'une ligne vide).
 */
export interface TidyResult {
  title: string;
  body: string;
}

const TITLE_MAX = 80;

export function tidyImportedText(raw: string): TidyResult {
  const lines = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[   ]/g, " ")
    // Ligatures et caractères que la reconnaissance de texte confond souvent.
    .replace(/ﬁ/g, "fi")
    .replace(/ﬂ/g, "fl")
    .replace(/[‘’]/g, "'")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim());

  // Mot coupé par un trait d'union en fin de ligne (« mélan- / colie ») : recollé, sauf si la
  // ligne suivante commence une nouvelle phrase (majuscule).
  const joined: string[] = [];
  for (const line of lines) {
    const prev = joined[joined.length - 1];
    if (prev && /[a-zà-öø-ÿ]-$/i.test(prev) && /^[a-zà-öø-ÿ]/.test(line)) {
      joined[joined.length - 1] = prev.slice(0, -1) + line;
    } else {
      joined.push(line);
    }
  }

  // Lignes vides consécutives réduites à une ; lignes vides de début et de fin retirées.
  const compact: string[] = [];
  for (const line of joined) {
    if (!line && (!compact.length || !compact[compact.length - 1])) continue;
    compact.push(line);
  }
  while (compact.length && !compact[compact.length - 1]) compact.pop();

  let title = "";
  if (compact.length > 2 && compact[1] === "" && compact[0].length <= TITLE_MAX && !/[,;:]$/.test(compact[0])) {
    title = compact[0].replace(/^[«"]\s*|\s*[»"]$/g, "");
    compact.splice(0, 2);
  }
  return { title, body: compact.join("\n") };
}

export interface PlacedLine {
  text: string;
  /** Haut et bas de la ligne sur l'image, en pixels. */
  top: number;
  bottom: number;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Texte d'une image à partir de la position de chaque ligne reconnue : un écart nettement
 * plus grand que l'interligne habituel sépare deux strophes, et une première ligne plus
 * grande ou détachée est un titre (suivie d'une ligne vide, que tidyImportedText reconnaît).
 */
export function linesToText(lines: PlacedLine[]): string {
  const rows = lines.filter((l) => l.text.trim()).sort((a, b) => a.top - b.top);
  if (rows.length < 2) return rows.map((l) => l.text.trim()).join("\n");
  const heights = rows.map((l) => l.bottom - l.top);
  const gaps = rows.slice(1).map((l, i) => l.top - rows[i].bottom);
  const lineHeight = median(heights);
  // Interligne habituel : un écart du quart le plus serré (sur un poème court, la médiane
  // tomberait déjà sur un écart de strophe).
  const positive = gaps.filter((g) => g > 0).sort((a, b) => a - b);
  const usualGap = positive.length ? positive[Math.floor((positive.length - 1) / 4)] : 0;
  const stanzaGap = Math.max(usualGap * 1.8, lineHeight * 0.6);
  const titleLike = rows.length > 2 && (heights[0] >= lineHeight * 1.15 || gaps[0] > stanzaGap);

  const out: string[] = [rows[0].text.trim()];
  for (let i = 1; i < rows.length; i++) {
    if ((i === 1 && titleLike) || (i > 1 && gaps[i - 1] > stanzaGap)) out.push("");
    out.push(rows[i].text.trim());
  }
  return out.join("\n");
}

/** Formats acceptés pour l'import, par extension. */
export const IMPORT_EXTENSIONS = ["txt", "md", "docx", "odt", "pdf"] as const;

export type ImportKind = "image" | (typeof IMPORT_EXTENSIONS)[number] | "doc" | "unknown";

export function importKind(file: { name: string; type: string }): ImportKind {
  if (file.type.startsWith("image/")) return "image";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "doc") return "doc";
  if (["png", "jpg", "jpeg", "webp", "heic", "heif", "bmp", "gif", "tif", "tiff"].includes(ext)) return "image";
  return (IMPORT_EXTENSIONS as readonly string[]).includes(ext) ? (ext as ImportKind) : "unknown";
}
