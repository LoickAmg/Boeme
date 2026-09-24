/** Thèmes de la bibliothèque : identifiant stable (stocké) et libellé affiché. */
export const THEMES = [
  { id: "amour", label: "Amour" },
  { id: "nature", label: "Nature" },
  { id: "melancolie", label: "Mélancolie" },
  { id: "temps", label: "Temps qui passe" },
  { id: "mort", label: "Mort et deuil" },
  { id: "liberte", label: "Liberté" },
  { id: "mer", label: "Mer" },
  { id: "nuit", label: "Nuit" },
  { id: "voyage", label: "Voyage" },
  { id: "spiritualite", label: "Spiritualité" },
  { id: "art", label: "Art et poésie" },
  { id: "sagesse", label: "Sagesse" },
  { id: "reve", label: "Rêve" },
  { id: "enfance", label: "Enfance" },
  { id: "exil", label: "Exil" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_IDS = THEMES.map((theme) => theme.id) as [ThemeId, ...ThemeId[]];

export function themeLabel(id: string | null | undefined): string {
  return THEMES.find((theme) => theme.id === id)?.label ?? "";
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEMES.some((theme) => theme.id === value);
}
