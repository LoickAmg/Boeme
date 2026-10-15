import type { Metadata, Viewport } from "next";

// Polices auto-hébergées via @fontsource : aucun appel réseau vers Google Fonts, ni au build, ni à l'exécution.
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

import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site, siteUrl } from "@/config/site";
import { getCurrentUser } from "@/server/context";
import { countNewFeedback } from "@/server/feedback";
import { getDb } from "@/db/client";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${site.name} — poésie à lire, à écrire, à partager`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: { type: "website", siteName: site.name, locale: "fr_FR", title: site.name, description: site.description },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
};

export const viewport: Viewport = { themeColor: "#f8f3ec" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  // L'administrateur voit combien de retours l'attendent.
  const newFeedback = user?.role === "admin" ? await countNewFeedback(await getDb()) : 0;

  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">
        <SiteHeader user={user} newFeedback={newFeedback} />
        <main id="contenu" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
        <FeedbackButton signedIn={Boolean(user)} />
      </body>
    </html>
  );
}
