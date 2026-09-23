import type { Metadata } from "next";
import Link from "next/link";

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
import { siteUrl } from "@/lib/site";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getUiLocale();
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: dict.metaTitle,
    description: dict.metaDescription,
    openGraph: { type: "website", title: dict.metaTitle, description: dict.metaDescription, locale },
    twitter: { card: "summary", title: dict.metaTitle, description: dict.metaDescription },
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
            <p className="mb-3">{dict.footer}</p>
            <nav className="flex items-center justify-center gap-6" aria-label="Liens légaux">
              <Link href="/mentions-legales/">{dict.footerLinks.mentionsLegales}</Link>
              <Link href="/confidentialite/">{dict.footerLinks.confidentialite}</Link>
              <Link href="/contact/">{dict.footerLinks.contact}</Link>
            </nav>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
