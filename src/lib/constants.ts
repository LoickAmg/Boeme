/** Nombre de poèmes chargés par page dans la galerie. */
export const GALLERY_PAGE_SIZE = 12;

/** Générations autorisées par adresse IP et par fenêtre de 10 minutes. */
export const GENERATION_LIMIT_PER_IP = 8;
export const GENERATION_WINDOW_MS = 10 * 60 * 1000;

/**
 * Plafond global de poèmes publiés par heure, toutes adresses confondues :
 * borne le coût d'une clé LLM et le volume de la galerie même face à un
 * attaquant qui change d'adresse. Surchargeable via POEM_GLOBAL_HOURLY_LIMIT.
 */
export const DEFAULT_GLOBAL_HOURLY_LIMIT = 120;
