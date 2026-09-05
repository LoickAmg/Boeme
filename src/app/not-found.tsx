import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUiLocale } from "@/lib/i18n/server";

export default async function GlobalNotFound() {
  const locale = await getUiLocale();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center sm:px-8">
      <p className="font-serif text-6xl italic text-rose sm:text-7xl">404</p>
      <h1 className="font-serif text-3xl text-ink sm:text-4xl">{dict.notFound.title}</h1>
      <p className="max-w-xl text-sm text-ink-soft">{dict.notFound.body}</p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-ivory transition-opacity hover:opacity-90"
      >
        {dict.notFound.back}
      </Link>
    </main>
  );
}
