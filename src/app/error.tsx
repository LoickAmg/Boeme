"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center sm:px-8">
      <h1 className="font-serif text-4xl italic text-ink">Un vers s&apos;est brisé</h1>
      <p className="max-w-xl text-sm text-ink-soft">Une erreur est survenue. Vous pouvez réessayer ; si elle persiste, revenez un peu plus tard.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90">
        Réessayer
      </button>
    </div>
  );
}
