/**
 * Langue de l'INTERFACE (menus, boutons, titres) — distincte de la langue
 * du poème généré (qui reste un choix ponctuel dans le formulaire). Stockée
 * en cookie pour rester cohérente entre le rendu serveur (titres de page)
 * et les composants client (formulaire, galerie).
 */
export const UI_LOCALES = ["fr", "en"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

export const UI_LANG_COOKIE = "ui_lang";
export const DEFAULT_UI_LOCALE: UiLocale = "fr";

export function isUiLocale(value: string | undefined): value is UiLocale {
  return value === "fr" || value === "en";
}
