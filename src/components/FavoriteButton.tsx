import { toggleFavoriteAction } from "@/app/actions/poems";

/** Bouton « favori » : un formulaire ordinaire, donc utilisable sans JavaScript. */
export function FavoriteButton({ poemId, active, count, returnTo }: { poemId: number; active: boolean; count: number; returnTo: string }) {
  return (
    <form action={toggleFavoriteAction}>
      <input type="hidden" name="poemId" value={poemId} />
      <input type="hidden" name="on" value={active ? "0" : "1"} />
      <input type="hidden" name="retour" value={returnTo} />
      <button
        type="submit"
        aria-pressed={active}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          active ? "border-rose bg-rose text-ink" : "border-linen-deep bg-ivory-soft text-ink-soft hover:border-rose hover:text-ink"
        }`}
      >
        <span aria-hidden>{active ? "♥" : "♡"}</span>
        {active ? "Dans mes favoris" : "Ajouter aux favoris"}
        <span className="text-xs text-ink-soft">({count})</span>
      </button>
    </form>
  );
}
