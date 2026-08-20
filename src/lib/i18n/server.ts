import { cookies } from "next/headers";

import { DEFAULT_UI_LOCALE, isUiLocale, UI_LANG_COOKIE } from "./locale";
import type { UiLocale } from "./locale";

/** À utiliser uniquement côté serveur (Server Components) — lit le cookie de langue d'interface. */
export async function getUiLocale(): Promise<UiLocale> {
  const store = await cookies();
  const raw = store.get(UI_LANG_COOKIE)?.value;
  return isUiLocale(raw) ? raw : DEFAULT_UI_LOCALE;
}
