import type { Metadata } from "next";

// Polices auto-hébergées via @fontsource (fichiers embarqués dans le
// bundle, aucun appel réseau vers Google Fonts — ni au build, ni au runtime).
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";

import { SiteHeader } from "@/components/SiteHeader";
import { getDictionary } from "@/lib/i18n/dictionary";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getUiLocale } from "@/lib/i18n/server";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getUiLocale();
  const dict = getDictionary(locale);
  return {
    title: dict.metaTitle,
    description: dict.metaDescription,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getUiLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ivory font-sans text-ink">
        <LocaleProvider initialLocale={locale}>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="border-t border-linen-deep/60 px-6 py-6 text-center text-xs text-ink-faint sm:px-8">
            {dict.footer}
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
