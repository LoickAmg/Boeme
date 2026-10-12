import type { Metadata } from "next";

import { LivingPoem } from "@/components/LivingPoem";
import { TryPoems } from "@/components/TryPoems";
import { getDb } from "@/db/client";
import { pickTextPoems, poemsOfTheDay } from "@/server/poems";

export const metadata: Metadata = {
  title: "Le poème vivant",
  description: "Un poème qui s'écrit sous vos yeux, comme à l'encre, lu à voix haute, sur une pluie ou un feu de cheminée.",
  alternates: { canonical: "/poeme-vivant" },
};
export const dynamic = "force-dynamic";

export default async function LivingPoemPage({ searchParams }: PageProps<"/poeme-vivant">) {
  const query = await searchParams;
  const q = (typeof query.q === "string" ? query.q : "").trim().slice(0, 100);
  const db = await getDb();
  const [day, poems] = await Promise.all([poemsOfTheDay(db), pickTextPoems(db, { q })]);
  const today = [day.classic, day.community].filter((p): p is NonNullable<typeof p> => Boolean(p?.body));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 sm:px-8 sm:py-16">
      <header className="rounded-[2rem] bg-[radial-gradient(120%_100%_at_20%_0%,#3b2f3f_0%,#1d1720_70%)] px-7 py-10 text-ivory sm:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-soft">Un grain de folie</p>
        <h1 className="mt-2 font-serif text-5xl italic sm:text-6xl">Le poème vivant</h1>
        <p className="mt-4 max-w-xl leading-relaxed text-ivory/80">
          Choisissez un poème : il s&apos;écrit sous vos yeux, vers après vers, comme à l&apos;encre. Une voix peut le lire à haute voix, sur une ambiance de pluie, de vent ou de feu de
          cheminée. Montez le son.
        </p>
      </header>
      <TryPoems
        path="/poeme-vivant"
        q={q}
        today={today}
        poems={poems}
        action={(poem) => <LivingPoem title={poem.title} author={poem.authorName} body={poem.body} lang={poem.language} label="✦ Le rendre vivant" />}
      />
    </div>
  );
}
