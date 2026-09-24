import type { Metadata } from "next";
import Link from "next/link";

import { deletePoemAction } from "@/app/actions/poems";
import { BioForm, DeleteAccountForm } from "@/components/ProfileForms";
import { PoemCard } from "@/components/PoemCard";
import { getDb } from "@/db/client";
import { formatDate, verseCount } from "@/lib/text";
import { requireUser } from "@/server/guard";
import { listFavorites, listOwnPoems } from "@/server/poems";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS_LABEL = { published: "Publié", draft: "Brouillon", hidden: "Masqué par la modération" } as const;

export default async function AccountPage({ searchParams }: PageProps<"/compte">) {
  const [user, query] = await Promise.all([requireUser("/compte"), searchParams]);
  const db = await getDb();
  const [own, favorites] = await Promise.all([listOwnPoems(db, user), listFavorites(db, user)]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Bonjour, {user.name}</h1>
      <p className="mt-2 text-sm text-ink-soft">{user.email}</p>

      {(query.brouillon || query.supprime) && (
        <p role="status" className="mt-6 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          {query.brouillon ? "Brouillon enregistré." : "Poème supprimé."}
        </p>
      )}

      <section aria-labelledby="mes-poemes" className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="mes-poemes" className="font-serif text-3xl text-ink">
            Mes poèmes
          </h2>
          <Link href="/ecrire" className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-rose-soft">
            Écrire un poème
          </Link>
        </div>

        {own.length === 0 ? (
          <p className="mt-4 text-ink-soft">
            Vous n&apos;avez encore rien écrit. Commencez par un{" "}
            <Link href="/ecrire" className="underline underline-offset-4">
              poème
            </Link>{" "}
            ou par une proposition du{" "}
            <Link href="/generateur" className="underline underline-offset-4">
              générateur
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {own.map((poem) => (
              <li key={poem.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 px-5 py-4">
                <div>
                  <p className="font-serif text-xl text-ink">
                    {poem.status === "hidden" ? (
                      poem.title
                    ) : (
                      <Link href={poem.status === "published" ? `/poemes/${poem.slug}` : `/ecrire/${poem.id}`} className="underline-offset-4 hover:underline">
                        {poem.title}
                      </Link>
                    )}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {STATUS_LABEL[poem.status]} · {verseCount(poem.body)} vers · {formatDate(poem.publishedAt ?? poem.createdAt)}
                    {poem.status === "published" ? ` · ${poem.favoriteCount} favori${poem.favoriteCount > 1 ? "s" : ""}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {poem.status !== "hidden" && (
                    <Link href={`/ecrire/${poem.id}`} className="font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                      Modifier
                    </Link>
                  )}
                  <form action={deletePoemAction}>
                    <input type="hidden" name="id" value={poem.id} />
                    <button type="submit" className="font-medium text-rose-deep underline-offset-4 hover:underline">
                      Supprimer
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="mes-favoris" className="mt-16">
        <h2 id="mes-favoris" className="font-serif text-3xl text-ink">
          Mes favoris
        </h2>
        {favorites.length === 0 ? (
          <p className="mt-4 text-ink-soft">
            Aucun favori pour l&apos;instant : ajoutez-en depuis la{" "}
            <Link href="/bibliotheque" className="underline underline-offset-4">
              bibliothèque
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {favorites.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="profil" className="mt-16">
        <h2 id="profil" className="font-serif text-3xl text-ink">
          Ma présentation
        </h2>
        <div className="mt-4">
          <BioForm bio={user.bio} />
        </div>
      </section>

      <section aria-labelledby="supprimer" className="mt-16 border-t border-linen-deep/60 pt-10">
        <h2 id="supprimer" className="font-serif text-3xl text-ink">
          Supprimer mon compte
        </h2>
        <div className="mt-4">
          <DeleteAccountForm />
        </div>
      </section>
    </div>
  );
}
