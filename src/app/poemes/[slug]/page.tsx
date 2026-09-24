import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FavoriteButton } from "@/components/FavoriteButton";
import { ReportForm } from "@/components/ReportForm";
import { getDb } from "@/db/client";
import { excerpt, formatDate } from "@/lib/text";
import { themeLabel } from "@/lib/themes";
import { getCurrentUser } from "@/server/context";
import { favoriteIds, getPoemBySlug } from "@/server/poems";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/poemes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const poem = await getPoemBySlug(await getDb(), slug);
  if (!poem) return { title: "Poème introuvable", robots: { index: false } };

  const description = poem.body ? excerpt(poem.body, 3).replace(/\n/g, " / ") : `${poem.title}, de ${poem.authorName} : notice et lien vers la source.`;
  return {
    title: `${poem.title} — ${poem.authorName}`,
    description,
    alternates: { canonical: `/poemes/${poem.slug}` },
    openGraph: { type: "article", title: `${poem.title} — ${poem.authorName}`, description },
  };
}

export default async function PoemPage({ params, searchParams }: PageProps<"/poemes/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const user = await getCurrentUser();
  const poem = await getPoemBySlug(db, slug, user);
  if (!poem) notFound();

  const favorites = await favoriteIds(db, user, [poem.id]);
  const path = `/poemes/${poem.slug}`;
  const isOwner = Boolean(user && poem.userId === user.id);
  const theme = themeLabel(poem.theme);

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      {query.publie && (
        <p role="status" className="mb-8 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          Votre poème est publié. Merci de le partager.
        </p>
      )}
      {poem.status === "draft" && (
        <p role="status" className="mb-8 rounded-xl border border-linen-deep bg-linen/50 px-4 py-3 text-sm text-ink">
          Brouillon : ce poème n&apos;est visible que de vous.
        </p>
      )}
      {poem.status === "hidden" && (
        <p role="status" className="mb-8 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          Ce poème est masqué par la modération à la suite de signalements. Il n&apos;est visible que de son auteur et des administrateurs.
        </p>
      )}

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {poem.origin === "classic" ? "Bibliothèque" : poem.origin === "reference" ? "À découvrir" : "Communauté"}
          {theme ? ` · ${theme}` : ""}
        </p>
        <h1 className="mt-3 font-serif text-5xl italic leading-tight text-ink sm:text-6xl">{poem.title}</h1>
        <p className="mt-3 text-lg text-ink-soft">
          {poem.authorSlug ? (
            <Link href={`/poetes/${poem.authorSlug}`} className="underline underline-offset-4">
              {poem.authorName}
            </Link>
          ) : poem.userId ? (
            <Link href={`/membres/${poem.userId}`} className="underline underline-offset-4">
              {poem.authorName}
            </Link>
          ) : (
            poem.authorName
          )}
          {poem.year ? ` · ${poem.year}` : ""}
          {poem.collection ? <span className="italic"> · {poem.collection}</span> : null}
        </p>
      </header>

      {poem.body ? (
        <div className="mt-10 whitespace-pre-line font-serif text-2xl leading-[1.8] text-ink sm:text-[1.75rem]" lang={poem.language}>
          {poem.body}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-linen-deep/60 bg-ivory-soft/60 px-6 py-6">
          <p className="text-ink-soft">
            Ce poème est encore protégé par le droit d&apos;auteur : Boème ne reproduit pas son texte. Vous pouvez le lire à sa source.
          </p>
          {poem.sourceUrl && (
            <a
              href={poem.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep"
            >
              Lire à la source ↗
            </a>
          )}
        </div>
      )}

      <footer className="mt-12 flex flex-col gap-6 border-t border-linen-deep/50 pt-6 text-sm text-ink-soft">
        {poem.origin === "classic" && poem.sourceUrl && (
          <p>
            Texte du domaine public, d&apos;après{" "}
            <a href={poem.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Wikisource ↗
            </a>
            . Mise en page éditoriale sous licence CC BY-SA.
          </p>
        )}
        {poem.origin === "member" && (
          <p>
            Poème publié par un membre{poem.publishedAt ? ` le ${formatDate(poem.publishedAt)}` : ""}, sous sa responsabilité.
            {poem.generated ? " Point de départ proposé par le générateur, retravaillé par l'auteur." : ""}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {poem.status === "published" &&
            (user ? (
              <FavoriteButton poemId={poem.id} active={favorites.has(poem.id)} count={poem.favoriteCount} returnTo={path} />
            ) : (
              <Link
                href={`/compte/connexion?retour=${encodeURIComponent(path)}`}
                className="rounded-full border border-linen-deep bg-ivory-soft px-4 py-2 font-medium transition-colors hover:border-rose hover:text-ink"
              >
                ♡ Connectez-vous pour l&apos;ajouter aux favoris ({poem.favoriteCount})
              </Link>
            ))}
          {isOwner && poem.status !== "hidden" && (
            <Link href={`/ecrire/${poem.id}`} className="rounded-full border border-linen-deep bg-ivory-soft px-4 py-2 font-medium transition-colors hover:border-rose hover:text-ink">
              Modifier
            </Link>
          )}
        </div>

        {poem.status === "published" && !isOwner && (user ? <ReportForm poemId={poem.id} returnTo={path} /> : null)}
      </footer>
    </article>
  );
}
