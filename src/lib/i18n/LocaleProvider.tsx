"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { getDictionary } from "./dictionary";
import type { Dictionary } from "./dictionary";
import { UI_LANG_COOKIE } from "./locale";
import type { UiLocale } from "./locale";

interface LocaleContextValue {
  locale: UiLocale;
  dict: Dictionary;
  setLocale: (locale: UiLocale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  initialLocale: UiLocale;
  children: ReactNode;
}

/**
 * Initialisé côté serveur (voir src/lib/i18n/server.ts) pour éviter le
 * flash de mauvaise langue au premier rendu. Le changement de langue met
 * à jour le cookie puis rafraîchit les Server Components (router.refresh)
 * pour que le texte rendu côté serveur (titres de page, etc.) reste
 * synchronisé avec les composants client.
 */
export function LocaleProvider({ initialLocale, children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<UiLocale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: UiLocale) => {
      setLocaleState(next);
      document.cookie = `${UI_LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, dict: getDictionary(locale), setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale() doit être appelé sous <LocaleProvider>.");
  }
  return ctx;
}
