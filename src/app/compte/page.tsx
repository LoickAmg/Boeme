import type { Metadata } from "next";
import Link from "next/link";

import { ResendVerificationForm } from "@/components/EmailVerificationForms";
import { ChangePasswordForm } from "@/components/PasswordForms";
import { BioForm, DeleteAccountForm } from "@/components/ProfileForms";
import { PoemCard } from "@/components/PoemCard";
import { OwnPoems } from "@/components/OwnPoems";
import { getDb } from "@/db/client";
import { requireUser } from "@/server/guard";
import { listFavorites, listOwnPoems } from "@/server/poems";
import { authorReadTotals } from "@/server/reads";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Poèmes montrés d'emblée ; les autres sont sur « Tous mes poèmes ». */
const PREVIEW = 6;

export default async function AccountPage({ searchParams }: PageProps<"/compte">) {
  const [user, query] = await Promise.all([requireUser("/compte"), searchParams]);
  const db = await getDb();
  const [own, favorites, totals] = await Promise.all([listOwnPoems(db, user), listFavorites(db, user), authorReadTotals(db, user.id)]);
  const favoriteGroups = [
    { id: "favoris-communaute", title: "Écrits sur Boème", items: favorites.filter((poem) => poem.origin === "member") },
    { id: "favoris-bibliotheque", title: "De la bibliothèque (sources externes)", items: favorites.filter((poem) => poem.origin !== "member") },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Bonjour, {user.name}</h1>
      <p className="mt-2 text-sm text-ink-soft">{user.email}</p>

      {!user.emailVerifiedAt && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          <p>Votre adresse e-mail n&apos;est pas encore confirmée.</p>
          <ResendVerificationForm />
        </div>
      )}

      {(query.brouillon || query.supprime || query["mot-de-passe"]) && (
        <p role="status" className="mt-6 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          {query.brouillon ? "Brouillon enregistré." : query.supprime ? "Poème supprimé." : "Nouveau mot de passe enregistré : vous êtes connecté."}
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

        {totals.views > 0 && (
          <p className="mt-3 text-sm text-ink-soft">
            Au total, vos poèmes ont été lus <strong className="text-ink">{totals.views}</strong> fois par <strong className="text-ink">{totals.readers}</strong> personne
            {totals.readers > 1 ? "s" : ""} différente{totals.readers > 1 ? "s" : ""}.
          </p>
        )}
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
          <>
            <div className="mt-6">
              <OwnPoems poems={own.slice(0, PREVIEW)} layout="grille" />
            </div>
            <p className="mt-6">
              <Link
                href="/compte/poemes"
                className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-ivory"
              >
                {own.length > PREVIEW ? `Voir tous mes poèmes (${own.length})` : "Tous mes poèmes, en grille ou en liste"} →
              </Link>
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="mes-favoris" className="mt-16">
        <h2 id="mes-favoris" className="font-serif text-3xl text-ink">
          Les poèmes que j&apos;aime
        </h2>
        {favorites.length === 0 ? (
          <p className="mt-4 text-ink-soft">
            Aucun pour l&apos;instant : touchez « ♡ J&apos;aime » sous un poème de la{" "}
            <Link href="/bibliotheque" className="underline underline-offset-4">
              bibliothèque
            </Link>
            .
          </p>
        ) : (
          favoriteGroups.map((group) => (
            <div key={group.id} className="mt-6">
              <h3 id={group.id} className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">
                {group.title}
              </h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {group.items.map((poem) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            </div>
          ))
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

      <section aria-labelledby="mot-de-passe" className="mt-16">
        <h2 id="mot-de-passe" className="font-serif text-3xl text-ink">
          Mot de passe
        </h2>
        <div className="mt-4">
          <ChangePasswordForm />
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
