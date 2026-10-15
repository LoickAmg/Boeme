"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { WaxSeal } from "@/components/regency/WaxSeal";

/**
 * Erreur dans une page (l'en-tête et le pied de page restent) : on peut réessayer, revenir à
 * l'accueil ou signaler le problème, avec la page et la référence technique jointes.
 */
export default function PageError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const pathname = usePathname();
  const report = `/avis?type=bug&depuis=${encodeURIComponent(pathname)}`;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-8 sm:py-24">
      <div className="relative w-full rounded-[2rem] border border-linen-deep/70 bg-ivory-soft/60 px-6 pt-14 pb-10 shadow-[0_18px_40px_rgba(58,51,45,0.07)] sm:px-12">
        <span aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.6rem] border border-gold/30" />
        <WaxSeal size={72} broken className="absolute -top-9 left-1/2 -ml-9" tilt={6} />

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Un incident</p>
        <h1 className="mt-3 font-serif text-4xl italic text-ink sm:text-5xl">Un vers s&apos;est brisé</h1>
        <p className="mx-auto mt-5 max-w-md text-ink-soft">
          Cette page n&apos;a pas pu s&apos;afficher. Ce n&apos;est pas de votre faute : réessayez, cela suffit souvent. Si le problème revient, dites-le-nous.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => retry()} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep">
            Réessayer
          </button>
          <Link href="/" className="rounded-full border border-linen-deep bg-ivory px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-rose">
            Retour à l&apos;accueil
          </Link>
          <Link href={report} className="rounded-full px-4 py-3 text-sm font-semibold text-rose-deep underline underline-offset-4">
            Signaler le problème
          </Link>
        </div>

        {error.digest && <p className="mt-8 font-mono text-xs text-ink-faint">Référence : {error.digest}</p>}
      </div>
    </div>
  );
}
