/**
 * Lecture défensive de paramètres de pagination depuis une URLSearchParams :
 * valeurs absentes, non numériques ou hors bornes retombent silencieusement
 * sur des valeurs sûres plutôt que de faire échouer la requête.
 */
export function parsePaginationLimit(
  searchParams: URLSearchParams,
  { defaultLimit, maxLimit }: { defaultLimit: number; maxLimit: number },
): number {
  const raw = searchParams.get("limit");
  const parsed = raw ? Number.parseInt(raw, 10) : defaultLimit;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultLimit;
  }
  return Math.min(parsed, maxLimit);
}

export function parsePaginationOffset(searchParams: URLSearchParams): number {
  const raw = searchParams.get("offset");
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}
