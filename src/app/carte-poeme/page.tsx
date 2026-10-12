import type { Metadata } from "next";

import { ShareCard } from "@/components/ShareCard";
import { TryPoems } from "@/components/TryPoems";
import { getDb } from "@/db/client";
import { pickTextPoems, poemsOfTheDay } from "@/server/poems";

export const metadata: Metadata = {
  title: "La carte-poème",
  description: "Vos vers préférés en image, prêts pour une story Instagram, WhatsApp ou TikTok.",
  alternates: { canonical: "/carte-poeme" },
};
export const dynamic = "force-dynamic";

export default async function ShareCardPage({ searchParams }: PageProps<"/carte-poeme">) {
  const query = await searchParams;
  const q = (typeof query.q === "string" ? query.q : "").trim().slice(0, 100);
  const db = await getDb();
  const [day, poems] = await Promise.all([poemsOfTheDay(db), pickTextPoems(db, { q })]);
  const today = [day.classic, day.community].filter((p): p is NonNullable<typeof p> => Boolean(p?.body));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 sm:px-8 sm:py-16">
      <header className="rounded-[2rem] bg-[linear-gradient(135deg,#ddc0bd,#c9a4a1)] px-7 py-10 sm:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/70">Un grain de folie</p>
        <h1 className="mt-2 font-serif text-5xl italic text-ink sm:text-6xl">La carte-poème</h1>
        <p className="mt-4 max-w-xl leading-relaxed text-ink/80">
          Choisissez un poème, gardez les vers qui vous parlent, puis un format (story, carré) et un style : l&apos;image est prête à partager sur Instagram, WhatsApp ou TikTok, ou à
          enregistrer.
        </p>
      </header>
      <TryPoems
        path="/carte-poeme"
        q={q}
        today={today}
        poems={poems}
        action={(poem) => <ShareCard title={poem.title} author={poem.authorName} body={poem.body} label="Créer la carte" />}
      />
    </div>
  );
}
