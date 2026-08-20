import { getRecentPoems } from "@/db/queries";
import { GalleryFeed } from "@/components/GalleryFeed";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUiLocale } from "@/lib/i18n/server";

// Contenu public en perpétuelle évolution : jamais mis en cache statiquement.
export const dynamic = "force-dynamic";

export default async function GaleriePage() {
  const [locale, { poems, hasMore }] = await Promise.all([
    getUiLocale(),
    getRecentPoems(GALLERY_PAGE_SIZE),
  ]);
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12 sm:px-8 sm:py-16">
      <section className="flex flex-col gap-3">
        <h1 className="font-serif text-4xl italic text-ink sm:text-5xl">{dict.gallery.title}</h1>
        <p className="max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
          {dict.gallery.subtitle}
        </p>
      </section>

      <GalleryFeed initialPoems={poems} initialHasMore={hasMore} />
    </main>
  );
}
