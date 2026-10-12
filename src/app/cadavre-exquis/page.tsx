import type { Metadata } from "next";
import Link from "next/link";

import { StartCorpseForm } from "@/components/CorpseForms";
import { getDb } from "@/db/client";
import { themeLabel } from "@/lib/themes";
import { getCurrentUser } from "@/server/context";
import { listCorpses } from "@/server/corpses";
import type { CorpseSummary } from "@/server/corpses";

export const metadata: Metadata = {
  title: "Cadavre exquis",
  description: "Écrire un poème à plusieurs, vers par vers, sans voir ce que les autres ont écrit avant — puis le découvrir en entier.",
  alternates: { canonical: "/cadavre-exquis" },
};
export const dynamic = "force-dynamic";

function Progress({ corpse }: { corpse: CorpseSummary }) {
  const ratio = corpse.lineCount / corpse.targetLines;
  return (
    <div className="mt-4">
      <div className="h-1.5 overflow-hidden rounded-full bg-linen">
        <div className="h-full rounded-full bg-rose-deep" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-ink-soft">
        {corpse.lineCount} / {corpse.targetLines} vers · {corpse.contributors} plume{corpse.contributors > 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default async function CorpsesPage() {
  const db = await getDb();
  const [user, open, done] = await Promise.all([getCurrentUser(), listCorpses(db, "open"), listCorpses(db, "complete", 12)]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 py-12 sm:px-8 sm:py-16">
      <header className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">Jeu d&apos;écriture</p>
          <h1 className="mt-2 font-serif text-5xl italic text-ink sm:text-6xl">Cadavre exquis</h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            Le jeu des surréalistes, depuis 1925 : un poème écrit à plusieurs, vers par vers. Chacun ne voit que le dernier vers écrit, puis ajoute le sien. Quand le poème atteint sa
            longueur, il se révèle en entier — et personne ne sait vraiment ce qui va en sortir.
          </p>
        </div>
        <blockquote className="rounded-3xl bg-ink px-7 py-6 font-serif text-2xl italic leading-snug text-ivory">
          « Le cadavre exquis boira le vin nouveau. »
          <footer className="mt-2 font-sans text-xs not-italic uppercase tracking-[0.2em] text-rose-soft">Premier cadavre exquis, 1925</footer>
        </blockquote>
      </header>

      <section aria-labelledby="en-cours" className="flex flex-col gap-5">
        <h2 id="en-cours" className="font-serif text-3xl text-ink">
          En cours d&apos;écriture
        </h2>
        {open.length === 0 ? (
          <p className="text-ink-soft">Aucun pour l&apos;instant. Lancez le premier !</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {open.map((c) => (
              <li key={c.id}>
                <Link href={`/cadavre-exquis/${c.slug}`} className="flex h-full flex-col rounded-2xl border border-linen-deep/60 bg-ivory-soft/60 px-5 py-5 transition-colors hover:border-rose">
                  <span className="font-serif text-2xl text-ink">{c.title}</span>
                  {c.theme && <span className="text-xs text-ink-soft">{themeLabel(c.theme)}</span>}
                  <span className="mt-3 font-serif text-lg italic text-ink-soft">« {c.lastLine} »</span>
                  <Progress corpse={c} />
                  <span className="mt-3 text-sm font-semibold text-rose-deep">Écrire la suite →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="lancer" className="rounded-3xl border border-linen-deep/60 bg-ivory-soft/50 px-6 py-8 sm:px-10">
        <h2 id="lancer" className="font-serif text-3xl text-ink">
          Lancer un cadavre exquis
        </h2>
        <p className="mt-1 mb-6 text-sm text-ink-soft">Vous écrivez le premier vers ; les autres membres continuent. Pour que le poème reste collectif, chacun écrit au plus un quart des vers, jamais deux d&apos;affilée.</p>
        {user ? (
          <StartCorpseForm />
        ) : (
          <Link href="/compte/connexion?retour=/cadavre-exquis" className="inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory hover:bg-rose-deep">
            Se connecter pour jouer
          </Link>
        )}
      </section>

      {done.length > 0 && (
        <section aria-labelledby="reveles" className="flex flex-col gap-5">
          <h2 id="reveles" className="font-serif text-3xl text-ink">
            Révélés
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {done.map((c) => (
              <li key={c.id}>
                <Link href={`/cadavre-exquis/${c.slug}`} className="flex h-full flex-col rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 px-5 py-5 transition-colors hover:border-rose">
                  <span className="font-serif text-2xl italic text-ink">{c.title}</span>
                  <span className="mt-3 whitespace-pre-line font-serif text-lg leading-relaxed text-ink">{c.opening.join("\n")}…</span>
                  <span className="mt-3 text-xs text-ink-soft">
                    {c.targetLines} vers · {c.contributors} plumes
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
