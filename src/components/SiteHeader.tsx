"use client";

import Link from "next/link";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { UI_LOCALES } from "@/lib/i18n/locale";

export function SiteHeader() {
  const { locale, dict, setLocale } = useLocale();

  return (
    <header className="border-b border-linen-deep/60">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
        <Link href="/" className="font-serif text-2xl tracking-wide text-ink">
          {dict.nav.brand}
        </Link>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm font-medium text-ink-soft">
            <Link href="/" className="transition-colors hover:text-ink">
              {dict.nav.generator}
            </Link>
            <Link href="/galerie" className="transition-colors hover:text-ink">
              {dict.nav.gallery}
            </Link>
          </nav>
          <div
            className="flex items-center gap-1 rounded-full border border-linen-deep bg-ivory-soft p-1 text-xs font-semibold"
            role="group"
            aria-label="Langue de l'interface / Interface language"
          >
            {UI_LOCALES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setLocale(id)}
                aria-pressed={locale === id}
                className={`rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors ${
                  locale === id
                    ? "bg-rose text-ink"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
