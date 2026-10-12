import Link from "next/link";

import { PoemCard } from "@/components/PoemCard";
import { ProvenanceBadge } from "@/components/Provenance";
import { SheetDeck } from "@/components/home/SheetDeck";
import { ThemeIcon } from "@/components/home/ThemeIcon";
import { Wordmark } from "@/components/home/Wordmark";
import { getDb } from "@/db/client";
import { lifespan } from "@/lib/text";
import { THEMES } from "@/lib/themes";
import type { PoemView } from "@/server/poems";
import { listAuthors, listPoems, pickTextPoems, poemsOfTheDay } from "@/server/poems";

// Les poèmes du jour et les publications changent sans redéploiement.
export const dynamic = "force-dynamic";

/** Premiers vers non vides d'un poème. */
function verses(body: string, count: number): string[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, count);
}

function initials(name: string): string {
  const parts = name
    .replace(/^(de|du|d')\s+/i, "")
    .split(/[\s-]+/)
    .filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Poème du jour, en grand (vedette) ou en carte. */
function DailyCard({ poem, kind, featured, large }: { poem: PoemView; kind: "classic" | "community"; featured: boolean; large: boolean }) {
  const label = kind === "classic" ? "Le classique du jour" : "La plume du jour";
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-[2rem] border border-linen-deep/60 ${
        large
          ? "bg-[radial-gradient(120%_90%_at_10%_0%,#efe2d6_0%,#f2ead9_45%,#f8f3ec_100%)] px-7 py-9 sm:px-12 sm:py-12 lg:col-span-3"
          : "bg-ivory-soft/70 px-7 py-8 lg:col-span-2"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-ink px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ivory">{label}</span>
        <ProvenanceBadge origin={poem.origin} sourceUrl={poem.sourceUrl} />
        {kind === "community" && featured && (
          <span className="rounded-full bg-rose/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink">Mis à l&apos;honneur</span>
        )}
      </div>
      <h3 className={`mt-5 font-serif italic leading-tight text-ink ${large ? "text-4xl sm:text-5xl" : "text-3xl"}`}>
        <Link href={`/poemes/${poem.slug}`} className="underline-offset-8 hover:underline">
          {poem.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-ink-soft">
        {poem.authorName}
        {poem.year ? ` · ${poem.year}` : ""}
        {poem.collection ? ` · ${poem.collection}` : ""}
      </p>
      <div
        className={`mt-6 whitespace-pre-line font-serif text-ink ${large ? "line-clamp-[10] text-2xl leading-relaxed sm:text-[1.7rem]" : "line-clamp-[8] text-xl leading-relaxed"}`}
      >
        {poem.body}
      </div>
      <Link
        href={`/poemes/${poem.slug}`}
        className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-rose-deep underline underline-offset-4"
      >
        Lire le poème en entier →
      </Link>
    </article>
  );
}

export default async function Home() {
  const db = await getDb();
  const [today, community, authors, shuffle] = await Promise.all([poemsOfTheDay(db), listPoems(db, { origin: "member", pageSize: 3 }), listAuthors(db), pickTextPoems(db, { limit: 3 })]);

  const daily = [today.spotlight === "classic" ? today.classic : today.community, today.spotlight === "classic" ? today.community : today.classic].filter(
    (p): p is PoemView => Boolean(p),
  );
  // La pile de l'accueil : les poèmes du jour devant, puis la communauté et quelques classiques.
  const sheetPoems = [...daily, ...community.items, ...shuffle].filter((p, i, all) => p.body && all.findIndex((q) => q.id === p.id) === i);

  return (
    <div className="flex w-full flex-col">
      {/* Ouverture */}
      <section className="relative overflow-hidden border-b border-linen-deep/50">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_85%_10%,rgba(201,164,161,0.35),transparent_70%),radial-gradient(50%_60%_at_0%_100%,rgba(221,204,174,0.55),transparent_70%)]"
        />
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full text-rose-deep/25" preserveAspectRatio="none" viewBox="0 0 1200 600">
          <g fill="currentColor">
            {[
              [760, 90, 2.4],
              [840, 150, 3],
              [930, 120, 2],
              [1010, 190, 3.4],
              [1090, 160, 2.2],
              [820, 420, 2.6],
              [900, 470, 2],
              [980, 430, 3],
              [1060, 500, 2.2],
              [120, 80, 1.6],
              [300, 40, 1.2],
              [520, 110, 1.4],
              [640, 300, 1.2],
              [180, 520, 1.6],
              [420, 560, 1.2],
            ].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} className="twinkle" style={{ animationDelay: `${(i % 5) * 0.9}s` }} />
            ))}
          </g>
        </svg>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="fade-up flex flex-col gap-7">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-deep">Poésie · lire · écrire · partager</p>
            <Wordmark className="text-[5.5rem] sm:text-[8.5rem]" />
            <p className="max-w-xl font-serif text-2xl leading-snug text-ink sm:text-3xl">
              Les plus beaux poèmes d&apos;hier, <em className="text-rose-deep">les vôtres</em> aujourd&apos;hui.
            </p>
            <p className="max-w-lg text-base leading-relaxed text-ink-soft">
              Une bibliothèque de classiques avec leurs sources, un atelier pour écrire et publier, une communauté pour se lire les uns les autres.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#aujourdhui" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep">
                Les poèmes du jour
              </Link>
              <Link href="/ecrire" className="rounded-full bg-rose px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-rose-soft">
                Écrire un poème
              </Link>
              <Link
                href="/bibliotheque"
                className="rounded-full border border-linen-deep bg-ivory-soft/80 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-rose"
              >
                Explorer la bibliothèque
              </Link>
            </div>
            <form action="/bibliotheque" role="search" className="flex max-w-xl flex-col gap-3 sm:flex-row">
              <label htmlFor="home-search" className="sr-only">
                Rechercher un poème, un poète, un vers
              </label>
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="Un poème, un poète, un vers…"
                className="w-full rounded-full border border-linen-deep bg-ivory/90 px-5 py-3 text-base placeholder:text-ink-faint"
              />
              <button
                type="submit"
                className="rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-ivory"
              >
                Rechercher
              </button>
            </form>
          </div>
          <SheetDeck
            sheets={sheetPoems.slice(0, 7).map((poem) => ({
              id: poem.id,
              slug: poem.slug,
              title: poem.title,
              authorName: poem.authorName,
              verses: verses(poem.body, 5),
              member: poem.origin === "member",
            }))}
          />
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16 sm:px-8 sm:py-20">
        {/* Poèmes du jour */}
        {daily.length > 0 && (
          <section id="aujourdhui" aria-labelledby="titre-aujourdhui" className="flex scroll-mt-24 flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">Aujourd&apos;hui</p>
                <h2 id="titre-aujourdhui" className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
                  Les poèmes du jour
                </h2>
              </div>
              <p className="max-w-sm text-sm text-ink-soft">
                Chaque jour, un classique et un poème de la communauté. Publiez les vôtres : ils peuvent être les prochains à l&apos;honneur.
              </p>
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-5">
              {daily.map((poem, i) => (
                <DailyCard key={poem.id} poem={poem} kind={poem.origin === "member" ? "community" : "classic"} featured={today.featured} large={i === 0} />
              ))}
            </div>
          </section>
        )}

        {/* Découvrir autrement */}
        <section aria-labelledby="autrement" className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">Un grain de folie</p>
            <h2 id="autrement" className="mt-2 font-serif text-4xl text-ink">
              La poésie autrement
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/cadavre-exquis" className="group relative overflow-hidden rounded-[1.75rem] bg-ink px-7 py-8 text-ivory">
              <div aria-hidden className="absolute inset-x-0 top-0 h-10 bg-[repeating-linear-gradient(180deg,rgba(248,243,236,0.18)_0_1px,transparent_1px_6px)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-soft">Jeu d&apos;écriture à plusieurs</p>
              <h3 className="mt-2 font-serif text-3xl italic">Cadavre exquis</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ivory/75">Chacun écrit un vers en ne voyant que le précédent. Le poème se révèle quand il est complet.</p>
              <span className="mt-4 inline-block text-sm font-semibold text-rose-soft group-hover:underline">Jouer →</span>
            </Link>
            <Link href="/constellation" className="group relative overflow-hidden rounded-[1.75rem] bg-[radial-gradient(120%_90%_at_50%_10%,#2a1f3d_0%,#141026_70%)] px-7 py-8 text-ivory">
              <svg aria-hidden viewBox="0 0 200 80" className="absolute right-4 top-4 h-20 w-48 text-rose-soft/70">
                <path d="M10 60 L50 30 L95 45 L140 15 L185 35" stroke="currentColor" strokeWidth="0.8" fill="none" />
                {[[10, 60], [50, 30], [95, 45], [140, 15], [185, 35]].map(([x, y]) => (
                  <circle key={x} cx={x} cy={y} r="2.4" fill="currentColor" className="twinkle" />
                ))}
              </svg>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-soft">Carte du ciel</p>
              <h3 className="mt-2 font-serif text-3xl italic">La constellation</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ivory/75">Chaque poème est une étoile, chaque thème une constellation. Promenez-vous, cliquez, lisez.</p>
              <span className="mt-4 inline-block text-sm font-semibold text-rose-soft group-hover:underline">S&apos;y perdre →</span>
            </Link>
            <Link href="/poeme-vivant" className="group rounded-[1.75rem] border border-linen-deep/60 bg-ivory-soft/60 px-7 py-8 transition-colors hover:border-rose">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">Sur chaque poème</p>
              <h3 className="mt-2 font-serif text-3xl italic text-ink">Le poème vivant</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">Il s&apos;écrit sous vos yeux, comme à l&apos;encre, lu à voix haute, sur une pluie ou un feu de cheminée.</p>
              <span className="mt-4 inline-block text-sm font-semibold text-rose-deep group-hover:underline">L&apos;essayer →</span>
            </Link>
            <Link href="/carte-poeme" className="group rounded-[1.75rem] border border-linen-deep/60 bg-[linear-gradient(135deg,#ddc0bd,#c9a4a1)] px-7 py-8 transition-shadow hover:shadow-[0_12px_28px_rgba(58,51,45,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/70">Sur chaque poème</p>
              <h3 className="mt-2 font-serif text-3xl italic text-ink">La carte-poème</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/80">Vos vers préférés en image, prêts pour une story Instagram, WhatsApp ou TikTok.</p>
              <span className="mt-4 inline-block text-sm font-semibold text-ink group-hover:underline">Créer ma carte →</span>
            </Link>
          </div>
        </section>

        {/* Thèmes */}
        <section aria-labelledby="themes" className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">Explorer</p>
            <h2 id="themes" className="mt-2 font-serif text-4xl text-ink">
              Par thème
            </h2>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {THEMES.map((theme) => (
              <li key={theme.id}>
                <Link
                  href={`/bibliotheque?theme=${theme.id}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-linen-deep/60 bg-ivory-soft/50 px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-rose hover:bg-ivory-soft hover:shadow-[0_10px_24px_rgba(58,51,45,0.08)]"
                >
                  <ThemeIcon id={theme.id} className="h-9 w-9 text-rose-deep transition-transform group-hover:scale-110" />
                  <span className="font-serif text-xl leading-tight text-ink">{theme.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Poètes */}
        <section aria-labelledby="poetes" className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">Les maîtres</p>
              <h2 id="poetes" className="mt-2 font-serif text-4xl text-ink">
                Des poètes à lire
              </h2>
            </div>
            <Link href="/poetes" className="text-sm font-semibold text-ink-soft underline-offset-4 hover:text-ink hover:underline">
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
                    className="flex h-full items-center gap-4 rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 px-5 py-4 transition-colors hover:border-rose"
                  >
                    <span
                      aria-hidden
                      className="grid h-14 w-14 flex-none place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#ddc0bd,#c9a4a1)] font-serif text-xl italic text-ink"
                    >
                      {initials(author.name)}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-serif text-xl text-ink">{author.name}</span>
                      <span className="text-xs text-ink-soft">
                        {lifespan(author.bornYear, author.diedYear)} · {author.poemCount} poème{author.poemCount > 1 ? "s" : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        {/* Communauté */}
        <section aria-labelledby="communaute" className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">La communauté</p>
              <h2 id="communaute" className="mt-2 font-serif text-4xl text-ink">
                Fraîchement publiés
              </h2>
            </div>
            <Link href="/communaute" className="text-sm font-semibold text-ink-soft underline-offset-4 hover:text-ink hover:underline">
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

        {/* Invitation */}
        <section className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-12 text-ivory sm:px-14 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-rose/30 blur-3xl" />
          <div className="relative grid gap-10 sm:grid-cols-3">
            <div>
              <h2 className="font-serif text-3xl italic">Lire</h2>
              <p className="mt-2 text-sm leading-relaxed text-ivory/75">
                Des poèmes du domaine public, du XVe siècle à Apollinaire, chacun avec son recueil et sa source.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-3xl italic">Écrire</h2>
              <p className="mt-2 text-sm leading-relaxed text-ivory/75">
                Un éditeur, des brouillons privés, l&apos;import d&apos;un poème déjà écrit. Vous restez propriétaire de vos textes.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-3xl italic">S&apos;amorcer</h2>
              <p className="mt-2 text-sm leading-relaxed text-ivory/75">
                Une page blanche ? Le{" "}
                <Link href="/generateur" className="underline underline-offset-4">
                  générateur
                </Link>{" "}
                propose un premier jet à retravailler.
              </p>
            </div>
          </div>
          <Link
            href="/compte/inscription"
            className="relative mt-10 inline-block rounded-full bg-rose px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-rose-soft"
          >
            Rejoindre la communauté
          </Link>
        </section>
      </div>
    </div>
  );
}
