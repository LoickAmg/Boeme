import Link from "next/link";

import { Ornament } from "@/components/regency/Ornament";
import { WaxSeal } from "@/components/regency/WaxSeal";

/** 404 : une lettre égarée, avec de quoi retrouver son chemin (recherche, rubriques, signalement). */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-8 sm:py-24">
      <div className="relative w-full rounded-[2rem] border border-linen-deep/70 bg-ivory-soft/60 px-6 pt-14 pb-10 shadow-[0_18px_40px_rgba(58,51,45,0.07)] sm:px-12">
        <span aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.6rem] border border-gold/30" />
        <WaxSeal size={72} broken className="absolute -top-9 left-1/2 -ml-9" tilt={-8} />

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Erreur 404 · lettre égarée</p>
        <h1 className="mt-3 font-serif text-4xl italic text-ink sm:text-5xl">Cette page s&apos;est perdue en chemin</h1>

        <div className="mx-auto mt-6 max-w-md font-serif text-xl italic leading-relaxed text-ink-soft">
          <p className="mx-auto">On l&apos;a cherchée dans chaque strophe,</p>
          <p className="mx-auto">sous chaque rime, au fond des recueils…</p>
          <p className="mx-auto">Elle a dû partir rêver ailleurs.</p>
        </div>

        <Ornament className="mt-7" />

        <p className="mx-auto mt-6 max-w-lg text-sm text-ink-soft">
          Le lien est peut-être incomplet, ou le poème a été retiré par son auteur. Cherchez-le, ou reprenez la promenade.
        </p>

        <form action="/bibliotheque" role="search" className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
          <label htmlFor="search-404" className="sr-only">
            Chercher un poème, un poète, un vers
          </label>
          <input
            id="search-404"
            name="q"
            type="search"
            placeholder="Un poème, un poète, un vers…"
            className="w-full rounded-full border border-linen-deep bg-ivory px-5 py-3 text-base placeholder:text-ink-faint"
          />
          <button type="submit" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep">
            Chercher
          </button>
        </form>

        <nav aria-label="Reprendre la promenade" className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
          {[
            { href: "/", label: "Accueil" },
            { href: "/bibliotheque", label: "Bibliothèque" },
            { href: "/communaute", label: "Communauté" },
            { href: "/ecrire", label: "Écrire un poème" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full border border-linen-deep bg-ivory px-4 py-2 font-semibold text-ink transition-colors hover:border-rose">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="mt-8 text-xs text-ink-faint">
          Vous êtes arrivé ici par un lien du site ?{" "}
          <Link href="/avis?type=bug" className="underline underline-offset-2 hover:text-ink">
            Signalez-le-nous
          </Link>
          , on le répare.
        </p>
      </div>
    </div>
  );
}
