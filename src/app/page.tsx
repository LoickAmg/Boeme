import Link from "next/link";

import { PoemCard } from "@/components/PoemCard";
import { site } from "@/config/site";
import { getDb } from "@/db/client";
import { lifespan } from "@/lib/text";
import { THEMES } from "@/lib/themes";
import { listAuthors, listPoems, poemOfTheDay } from "@/server/poems";

// Le poème du jour et les publications changent sans redéploiement.
export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await getDb();
  const [today, community, authors] = await Promise.all([
    poemOfTheDay(db),
    listPoems(db, { origin: "member", pageSize: 3 }),
    listAuthors(db),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-6 py-14 sm:px-8 sm:py-20">
      <section className="flex flex-col gap-6">
        <h1 className="font-serif text-6xl italic leading-none text-ink sm:text-8xl">{site.name}</h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
          Un lieu pour lire les plus beaux poèmes, avec leurs sources, écrire les vôtres et découvrir ceux des autres.
        </p>
        <form action="/bibliotheque" role="search" className="flex max-w-xl flex-col gap-3 sm:flex-row">
          <label htmlFor="home-search" className="sr-only">
            Rechercher un poème, un poète, un vers
          </label>
          <input
            id="home-search"
            name="q"
            type="search"
            placeholder="Un poème, un poète, un vers…"
            className="w-full rounded-full border border-linen-deep bg-ivory-soft px-5 py-3 text-base placeholder:text-ink-faint"
          />
          <button type="submit" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep">
            Rechercher
          </button>
        </form>
      </section>

      {today && (
        <section aria-labelledby="poeme-du-jour" className="flex flex-col gap-5">
          <h2 id="poeme-du-jour" className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Le poème du jour
          </h2>
          <div className="rounded-3xl border border-linen-deep/60 bg-ivory-soft/60 px-6 py-8 sm:px-12 sm:py-12">
            <h3 className="font-serif text-4xl italic text-ink">
              <Link href={`/poemes/${today.slug}`} className="underline-offset-8 hover:underline">
                {today.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              {today.authorName}
              {today.year ? ` · ${today.year}` : ""}
              {today.collection ? ` · ${today.collection}` : ""}
            </p>
            <p className="mt-6 line-clamp-[12] whitespace-pre-line font-serif text-2xl leading-relaxed text-ink">{today.body}</p>
            <Link href={`/poemes/${today.slug}`} className="mt-6 inline-block text-sm font-semibold text-rose-deep underline underline-offset-4">
              Lire le poème en entier →
            </Link>
          </div>
        </section>
      )}

      <section aria-labelledby="themes" className="flex flex-col gap-5">
        <h2 id="themes" className="font-serif text-3xl text-ink">
          Explorer par thème
        </h2>
        <ul className="flex flex-wrap gap-2">
          {THEMES.map((theme) => (
            <li key={theme.id}>
              <Link
                href={`/bibliotheque?theme=${theme.id}`}
                className="inline-block rounded-full border border-linen-deep bg-ivory-soft px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-rose hover:text-ink"
              >
                {theme.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="poetes" className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="poetes" className="font-serif text-3xl text-ink">
            Des poètes à lire
          </h2>
          <Link href="/poetes" className="text-sm font-medium text-ink-soft hover:text-ink">
            Tous les poètes →
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors
            .filter((author) => author.poemCount > 0)
            .slice(0, 6)
            .map((author) => (
              <li key={author.id}>
                <Link
                  href={`/poetes/${author.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 px-5 py-4 transition-colors hover:border-rose"
                >
                  <span className="font-serif text-xl text-ink">{author.name}</span>
                  <span className="text-xs text-ink-soft">
                    {lifespan(author.bornYear, author.diedYear)} · {author.poemCount} poème{author.poemCount > 1 ? "s" : ""}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section aria-labelledby="communaute" className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="communaute" className="font-serif text-3xl text-ink">
            Écrits par la communauté
          </h2>
          <Link href="/communaute" className="text-sm font-medium text-ink-soft hover:text-ink">
            Tout lire →
          </Link>
        </div>
        {community.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {community.items.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">
            Aucun poème de la communauté pour l&apos;instant.{" "}
            <Link href="/ecrire" className="underline underline-offset-4">
              Soyez le premier à publier le vôtre.
            </Link>
          </p>
        )}
      </section>

      <section className="grid gap-6 rounded-3xl bg-linen/60 px-6 py-10 sm:grid-cols-3 sm:px-10">
        <div>
          <h2 className="font-serif text-2xl text-ink">Lire</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Des poèmes du domaine public, du XVe siècle à Apollinaire, chacun avec son recueil et un lien vers sa source.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-ink">Écrire</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Un compte, un éditeur, des brouillons privés. Vous décidez quand publier, et vous restez propriétaire de vos textes.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-ink">S&apos;amorcer</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Une page blanche ? Le{" "}
            <Link href="/generateur" className="underline underline-offset-4">
              générateur
            </Link>{" "}
            propose un premier jet que vous retravaillez.
          </p>
        </div>
      </section>
    </div>
  );
}
