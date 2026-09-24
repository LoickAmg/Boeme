import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center sm:px-8">
      <p className="font-serif text-6xl italic text-rose sm:text-7xl">404</p>
      <h1 className="font-serif text-3xl text-ink sm:text-4xl">Cette page s&apos;est perdue en chemin</h1>
      <p className="max-w-xl text-sm text-ink-soft">Le poème ou la page que vous cherchez n&apos;existe pas, ou n&apos;est plus visible.</p>
      <Link href="/bibliotheque" className="mt-4 rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90">
        Parcourir la bibliothèque
      </Link>
    </div>
  );
}
