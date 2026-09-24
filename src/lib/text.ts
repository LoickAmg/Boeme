/** Premiers vers d'un poème, pour les aperçus : au plus `lines` lignes non vides, « … » si le poème continue. */
export function excerpt(body: string, lines = 4): string {
  const verses = body.split("\n").filter((line) => line.trim() !== "");
  if (verses.length <= lines) return verses.join("\n");
  return `${verses.slice(0, lines).join("\n")}\n…`;
}

/** Nombre de vers (lignes non vides) d'un poème. */
export function verseCount(body: string): number {
  return body.split("\n").filter((line) => line.trim() !== "").length;
}

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export function formatDate(date: Date): string {
  return DATE_FORMAT.format(date);
}

/** « 1821 – 1867 », « 1821 – », ou chaîne vide. */
export function lifespan(born: number | null, died: number | null): string {
  if (born == null && died == null) return "";
  return `${born ?? "?"} – ${died ?? ""}`.trim();
}
