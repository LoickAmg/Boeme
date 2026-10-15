"use client";

// Remplace tout le site (y compris l'en-tête) quand la mise en page elle-même échoue, par exemple si
// la base de données ne répond plus : aucune donnée n'est lue ici, seulement les styles et polices.
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "./globals.css";

import { WaxSeal } from "@/components/regency/WaxSeal";
import { site } from "@/config/site";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center bg-ivory px-4 py-12 font-sans text-ink">
        <title>{`${site.name} fait une pause`}</title>
        <main className="relative w-full max-w-xl rounded-[2rem] border border-linen-deep/70 bg-ivory-soft/60 px-6 pt-14 pb-10 text-center shadow-[0_18px_40px_rgba(58,51,45,0.08)] sm:px-12">
          <span aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.6rem] border border-gold/30" />
          <WaxSeal size={72} broken className="absolute -top-9 left-1/2 -ml-9" tilt={-6} />

          <p className="font-serif text-3xl italic text-ink">{site.name}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold">Panne momentanée</p>
          <h1 className="mt-3 font-serif text-4xl italic text-ink sm:text-5xl">Le salon est fermé un instant</h1>
          <p className="mx-auto mt-5 max-w-md leading-relaxed text-ink-soft">
            Boème ne répond pas pour le moment : une petite panne de notre côté, sans doute passagère. Vos poèmes, brouillons et favoris sont en sécurité.
            Réessayez dans quelques instants.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => retry()} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep">
              Réessayer
            </button>
            {/* Rechargement complet (pas de navigation interne) : repart de zéro si le site est revenu. */}
            <button
              type="button"
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- rechargement complet voulu : le routeur peut lui-même être en panne
              onClick={() => window.location.assign("/")}
              className="rounded-full border border-linen-deep bg-ivory px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-rose"
            >
              Recharger l&apos;accueil
            </button>
          </div>

          <p className="mt-8 text-xs text-ink-faint">
            Le problème dure ?{" "}
            <a href={`mailto:${site.contactEmail}?subject=${encodeURIComponent("Boème est en panne")}`} className="underline underline-offset-2 hover:text-ink">
              Écrivez-nous
            </a>
            {error.digest ? (
              <>
                {" "}
                en indiquant la référence <span className="font-mono">{error.digest}</span>
              </>
            ) : null}
            .
          </p>
        </main>
      </body>
    </html>
  );
}
