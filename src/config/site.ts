/**
 * Identité du site et de son éditeur. Les valeurs par défaut sont celles de
 * l'éditeur actuel ; elles se remplacent par variables d'environnement sans
 * toucher au code.
 */
export const site = {
  name: "Boème",
  tagline: "Lire, écrire et partager de la poésie.",
  description:
    "Boème réunit des poèmes du domaine public avec leurs sources, un espace pour écrire et publier les vôtres, et un petit générateur pour amorcer une idée.",
  publisher: process.env.SITE_PUBLISHER?.trim() || "Mahouna",
  contactEmail: process.env.CONTACT_EMAIL?.trim() || "mahounaamg@gmail.com",
} as const;

/** Adresse publique du site : SITE_URL, sinon le domaine de production Vercel, sinon le local. */
export function siteUrl(env: Record<string, string | undefined> = process.env): string {
  const explicit = env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
