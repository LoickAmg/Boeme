/** Pendant qu'une page se prépare : une plume qui écrit, plutôt qu'un écran figé. */
export default function Loading() {
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 py-32 text-rose-deep">
      <svg viewBox="0 0 48 48" aria-hidden className="quill-write h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 6c-12 0-24 10-27 27l-3 6" />
        <path d="M40 6c0 12-9 22-22 24" />
      </svg>
      <span className="ink-line block h-[2px] w-24 rounded-full bg-rose" aria-hidden />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
