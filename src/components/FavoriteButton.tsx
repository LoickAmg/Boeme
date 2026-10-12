import { toggleFavoriteAction } from "@/app/actions/poems";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 20s-7.5-4.6-9.2-9.4C1.6 7.3 3.8 4 7.2 4c2 0 3.5 1.1 4.8 2.8C13.3 5.1 14.8 4 16.8 4c3.4 0 5.6 3.3 4.4 6.6C19.5 15.4 12 20 12 20Z" />
    </svg>
  );
}

/** Bouton « J'aime » : un formulaire ordinaire, donc utilisable sans JavaScript. Le poème rejoint « Les poèmes que j'aime ». */
export function FavoriteButton({ poemId, active, count, returnTo }: { poemId: number; active: boolean; count: number; returnTo: string }) {
  return (
    <form action={toggleFavoriteAction}>
      <input type="hidden" name="poemId" value={poemId} />
      <input type="hidden" name="on" value={active ? "0" : "1"} />
      <input type="hidden" name="retour" value={returnTo} />
      <button
        type="submit"
        aria-pressed={active}
        title={active ? "Je n'aime plus" : "J'aime ce poème"}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
          active ? "border-rose-deep bg-rose-deep text-ivory" : "border-linen-deep bg-ivory-soft text-ink hover:border-rose-deep hover:text-rose-deep"
        }`}
      >
        <Heart filled={active} />
        J&apos;aime
        <span className={active ? "text-ivory/80" : "text-ink-soft"}>{count}</span>
      </button>
    </form>
  );
}

/** Pour un visiteur non connecté : même bouton, qui mène à la connexion puis revient au poème. */
export function FavoriteLoginLink({ count, returnTo }: { count: number; returnTo: string }) {
  return (
    <a
      href={`/compte/connexion?retour=${encodeURIComponent(returnTo)}`}
      title="Connectez-vous pour aimer ce poème"
      className="inline-flex items-center gap-2 rounded-full border border-linen-deep bg-ivory-soft px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-rose-deep hover:text-rose-deep"
    >
      <Heart filled={false} />
      J&apos;aime
      <span className="text-ink-soft">{count}</span>
    </a>
  );
}
