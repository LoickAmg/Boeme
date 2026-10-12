import Link from "next/link";

import { Ornament } from "@/components/regency/Ornament";
import { WaxSeal } from "@/components/regency/WaxSeal";
import type { Gazette as GazetteData, GazettePoem } from "@/server/gazette";

const EDITION_DATE = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Numéro de l'édition : une par semaine depuis l'ouverture du site. */
function editionNumber(now: Date): number {
  return Math.max(1, Math.floor((now.getTime() - Date.UTC(2026, 8, 1)) / (7 * 86_400_000)) + 1);
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n > 1 ? many : one}`;
}

function PoemLink({ poem }: { poem: GazettePoem }) {
  return (
    <>
      «&nbsp;
      <Link href={`/poemes/${poem.slug}`} className="font-semibold italic text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-rose-deep">
        {poem.title}
      </Link>
      &nbsp;», de{" "}
      {poem.userId ? (
        <Link href={`/membres/${poem.userId}`} className="underline decoration-gold/60 underline-offset-4 hover:decoration-rose-deep">
          {poem.authorName}
        </Link>
      ) : (
        poem.authorName
      )}
    </>
  );
}

function Column({ title, dropCap = false, children }: { title: string; dropCap?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-1 md:px-6">
      <h3 className="text-center font-serif text-xl tracking-[0.12em] text-ink uppercase">{title}</h3>
      <span aria-hidden className="mx-auto h-px w-10 bg-gold/70" />
      <div
        className={`font-serif text-lg leading-relaxed text-ink-soft ${
          // Lettrine à l'ancienne, sur la première colonne seulement.
          dropCap ? "first-letter:float-left first-letter:mr-1.5 first-letter:text-5xl first-letter:leading-[0.85] first-letter:text-rose-deep" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * « La Gazette de Boème » : une feuille de chronique mondaine façon Régence (papier, filets
 * gravés, lettrines, cachet de cire), mais nourrie des vraies nouvelles de la semaine.
 */
export function Gazette({ data, now = new Date() }: { data: GazetteData; now?: Date }) {
  return (
    <section aria-labelledby="gazette" className="gazette-paper relative rounded-sm border border-ink/25 p-2 shadow-[0_24px_60px_rgba(58,51,45,0.10)]">
      <div className="rounded-sm border-[3px] border-double border-ink/30 px-5 py-8 sm:px-10 sm:py-10">
        {/* En-tête du journal */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/25 pb-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
          <span>Édition n° {editionNumber(now)}</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-ivory normal-case tracking-normal">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-70 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
            </span>
            Les chiffres de la semaine, en direct
          </span>
          <span className="first-letter:uppercase">{EDITION_DATE.format(now)}</span>
        </div>

        <h2 id="gazette" className="mt-6 text-center font-serif text-5xl italic text-ink sm:text-7xl">
          La Gazette de Boème
        </h2>
        <p className="mx-auto mt-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-gold">Chronique mondaine des lettres</p>
        <Ornament className="mt-5" />

        <p className="mx-auto mt-6 max-w-2xl text-center font-serif text-xl italic leading-relaxed text-ink">
          Chers lecteurs, il se murmure dans les salons de Boème que la semaine fut riche en vers, en soupirs et en cœurs battants. Votre chroniqueuse, toujours
          indiscrète, vous dit tout.
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-ink/15">
          <Column title="La plume de la semaine" dropCap>
            {data.mostLoved ? (
              <p>
                Tous les regards se tournent vers <PoemLink poem={data.mostLoved} />, qui a fait battre {plural(data.mostLoved.count, "cœur", "cœurs")} en sept jours. On
                n&apos;avait rien lu de si touchant depuis longtemps.
              </p>
            ) : (
              <p>
                Aucun cœur n&apos;a encore battu cette semaine pour un poème de la communauté. La place de la plume la plus aimée est à prendre : à vos{" "}
                <Link href="/ecrire" className="underline decoration-gold/60 underline-offset-4">
                  encriers
                </Link>
                .
              </p>
            )}
          </Column>

          <Column title="On murmure que…">
            {data.whisper ? (
              <p>
                …ce vers circule de salon en salon&nbsp;:{" "}
                <Link href={`/poemes/${data.whisper.slug}`} className="italic text-ink hover:text-rose-deep">
                  «&nbsp;{data.whisper.verse}&nbsp;»
                </Link>{" "}
                — signé {data.whisper.authorName}.
                {data.mostRead ? (
                  <>
                    {" "}
                    Et l&apos;on s&apos;arrache <PoemLink poem={data.mostRead} />, lu par {plural(data.mostRead.count, "personne", "personnes")} cette semaine.
                  </>
                ) : null}
              </p>
            ) : (
              <p>…les plumes de Boème se taisent encore. Le silence, dit-on, précède toujours les plus beaux poèmes.</p>
            )}
          </Column>

          <Column title="Les nouvelles du salon">
            <ul className="space-y-2">
              <li>
                <strong className="font-semibold text-ink">{plural(data.newPoems, "nouveau poème", "nouveaux poèmes")}</strong> publié{data.newPoems > 1 ? "s" : ""} cette semaine,
              </li>
              <li>
                <strong className="font-semibold text-ink">{plural(data.newMembers, "nouvelle plume", "nouvelles plumes")}</strong> reçue{data.newMembers > 1 ? "s" : ""} dans le
                salon,
              </li>
              <li>
                et{" "}
                <Link href="/cadavre-exquis" className="font-semibold text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-rose-deep">
                  {plural(data.openCorpses, "cadavre exquis", "cadavres exquis")}
                </Link>{" "}
                qui attend{data.openCorpses > 1 ? "ent" : ""} vos vers.
              </li>
            </ul>
          </Column>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-end gap-4 border-t border-ink/20 pt-6">
          <p className="text-right font-serif text-lg italic text-ink-soft">
            Votre toute dévouée,
            <br />
            <span className="text-2xl text-ink">Madame de Plume</span>
          </p>
          <WaxSeal size={68} label="Cachet de Boème" />
        </div>
      </div>
    </section>
  );
}
