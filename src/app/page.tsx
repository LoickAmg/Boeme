import Link from "next/link";

import { getRecentPoems } from "@/db/queries";
import { GeneratorForm } from "@/components/GeneratorForm";
import { PoemCard } from "@/components/PoemCard";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUiLocale } from "@/lib/i18n/server";

// La galerie évolue à chaque génération publique : pas de mise en cache statique.
export const dynamic = "force-dynamic";

const PREVIEW_COUNT = 3;

export default async function Home() {
  const [locale, { poems }] = await Promise.all([getUiLocale(), getRecentPoems(PREVIEW_COUNT)]);
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-6 py-12 sm:px-8 sm:py-16">
      <section className="flex flex-col gap-3">
        <h1 className="font-serif text-4xl italic text-ink sm:text-5xl">{dict.home.title}</h1>
        <p className="max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
          {dict.home.subtitle}
        </p>
      </section>

      <section>
        <GeneratorForm />
      </section>

      {poems.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl text-ink">{dict.home.recent}</h2>
            <Link
              href="/galerie"
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {dict.home.viewGallery}
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {poems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
