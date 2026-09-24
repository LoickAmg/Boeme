/** Minuscules, sans accents ni ligatures : forme commune de comparaison pour la recherche. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[’‘]/g, "'");
}

/** Transforme un libellé en identifiant d'URL : « Le Lac » → « le-lac ». */
export function slugify(value: string): string {
  return normalizeForSearch(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildSearchText(...parts: Array<string | null | undefined>): string {
  return normalizeForSearch(parts.filter(Boolean).join(" "));
}
