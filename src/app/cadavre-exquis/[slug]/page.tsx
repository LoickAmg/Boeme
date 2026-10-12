import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { moderateCorpseAction } from "@/app/actions/corpses";
import { AddLineForm } from "@/components/CorpseForms";
import { getDb } from "@/db/client";
import { themeLabel } from "@/lib/themes";
import { getCurrentUser } from "@/server/context";
import { canContribute, corpseSummary, getCorpseBySlug, visibleLines } from "@/server/corpses";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/cadavre-exquis/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const corpse = await getCorpseBySlug(await getDb(), slug);
  if (!corpse) return { title: "Cadavre exquis introuvable", robots: { index: false } };
  return {
    title: `${corpse.title} — cadavre exquis`,
    description: corpse.status === "complete" ? "Un poème écrit à plusieurs mains, vers par vers, sur Boème." : "Un poème collectif en cours d'écriture : ajoutez le vers suivant.",
    alternates: { canonical: `/cadavre-exquis/${corpse.slug}` },
  };
}

export default async function CorpsePage({ params, searchParams }: PageProps<"/cadavre-exquis/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const [user, corpse] = await Promise.all([getCurrentUser(), getCorpseBySlug(db, slug)]);
  if (!corpse) notFound();

  const [lines, summary, contribution] = await Promise.all([visibleLines(db, corpse), corpseSummary(db, corpse), canContribute(db, corpse, user)]);
  const isAdmin = user?.role === "admin";
  const complete = corpse.status === "complete";
  const authors = [...new Map(lines.map((l) => [l.userId ?? l.authorName, l])).values()];

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <Link href="/cadavre-exquis" className="text-sm font-medium text-ink-soft hover:text-ink">
        ← Tous les cadavres exquis
      </Link>
      {query.ecrit && (
        <p role="status" className="mt-6 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          Votre vers est ajouté. Le prochain membre ne verra que lui… Revenez voir le poème se révéler.
        </p>
      )}
      {query.lance && (
        <p role="status" className="mt-6 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          C&apos;est parti ! Partagez cette page pour que d&apos;autres continuent votre poème.
        </p>
      )}

      <header className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">
          Cadavre exquis{corpse.theme ? ` · ${themeLabel(corpse.theme)}` : ""} · {summary.lineCount} / {corpse.targetLines} vers
        </p>
        <h1 className="mt-3 font-serif text-5xl italic leading-tight text-ink sm:text-6xl">{corpse.title}</h1>
      </header>

      {complete ? (
        <>
          {query.revele && (
            <p role="status" className="mt-8 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
              Vous avez écrit le dernier vers : le poème se révèle !
            </p>
          )}
          <div className="mt-10 font-serif text-2xl leading-[1.8] text-ink sm:text-[1.75rem]">
            {lines.map((l, i) => (
              <p key={l.position} className="fade-up group" style={{ animationDelay: `${i * 0.35}s` }}>
                {l.line}
                <span className="ml-3 align-middle font-sans text-xs text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">— {l.authorName}</span>
                {isAdmin && (
                  <form action={moderateCorpseAction} className="ml-2 inline">
                    <input type="hidden" name="corpseId" value={corpse.id} />
                    <input type="hidden" name="slug" value={corpse.slug} />
                    <input type="hidden" name="position" value={l.position} />
                    <button className="font-sans text-xs text-rose-deep underline">retirer</button>
                  </form>
                )}
              </p>
            ))}
          </div>
          <p className="mt-10 text-sm text-ink-soft">
            Écrit à {authors.length} mains :{" "}
            {authors.map((a, i) => (
              <span key={a.userId ?? a.authorName}>
                {i > 0 ? ", " : ""}
                {a.userId ? (
                  <Link href={`/membres/${a.userId}`} className="underline underline-offset-4">
                    {a.authorName}
                  </Link>
                ) : (
                  a.authorName
                )}
              </span>
            ))}
            .
          </p>
        </>
      ) : (
        <>
          <div className="relative mt-10 overflow-hidden rounded-3xl border border-linen-deep/70 bg-ivory-soft px-7 pt-16 pb-8 shadow-[0_18px_40px_rgba(58,51,45,0.08)]">
            {/* Les vers précédents, repliés comme sur la feuille du jeu. */}
            <div aria-hidden className="absolute inset-x-0 top-0 h-12 bg-[repeating-linear-gradient(180deg,#ddccae_0_1px,transparent_1px_7px)] opacity-60" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
              {summary.lineCount > 1 ? `${summary.lineCount - 1} vers cachés au-dessus…` : "Le premier vers"}
            </p>
            <p className="mt-3 font-serif text-3xl italic leading-snug text-ink">{lines[0]?.line}</p>
            {isAdmin && lines[0] && (
              <form action={moderateCorpseAction} className="mt-3">
                <input type="hidden" name="corpseId" value={corpse.id} />
                <input type="hidden" name="slug" value={corpse.slug} />
                <input type="hidden" name="position" value={lines[0].position} />
                <button className="text-xs text-rose-deep underline">Retirer ce vers (administration)</button>
              </form>
            )}
          </div>

          <div className="mt-8">
            {contribution.allowed ? (
              <AddLineForm corpseId={corpse.id} slug={corpse.slug} />
            ) : user ? (
              <p className="rounded-xl border border-linen-deep bg-linen/50 px-4 py-3 text-sm text-ink">{contribution.reason}</p>
            ) : (
              <Link
                href={`/compte/connexion?retour=${encodeURIComponent(`/cadavre-exquis/${corpse.slug}`)}`}
                className="inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory hover:bg-rose-deep"
              >
                Se connecter pour écrire le vers suivant
              </Link>
            )}
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Encore {corpse.targetLines - summary.lineCount} vers avant la révélation · {summary.contributors} plume{summary.contributors > 1 ? "s" : ""} pour l&apos;instant.
          </p>
        </>
      )}

      {isAdmin && (
        <form action={moderateCorpseAction} className="mt-12 border-t border-linen-deep/50 pt-6">
          <input type="hidden" name="corpseId" value={corpse.id} />
          <input type="hidden" name="slug" value={corpse.slug} />
          <button name="action" value="delete" className="rounded-full border border-rose-deep px-4 py-2 text-sm font-semibold text-rose-deep hover:bg-rose-soft/40">
            Supprimer ce cadavre exquis (administration)
          </button>
        </form>
      )}
    </article>
  );
}
