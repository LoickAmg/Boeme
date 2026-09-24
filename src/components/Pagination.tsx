import Link from "next/link";

/** Pagination par liens (fonctionne sans JavaScript) : conserve les autres paramètres de l'adresse. */
export function Pagination({
  basePath,
  params,
  page,
  pageCount,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  function hrefFor(target: number): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
    if (target > 1) query.set("page", String(target));
    const text = query.toString();
    return text ? `${basePath}?${text}` : basePath;
  }

  const linkClass = "rounded-full border border-linen-deep bg-ivory-soft px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-rose hover:text-ink";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          ← Précédent
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-ink-soft" aria-current="page">
        Page {page} sur {pageCount}
      </p>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          Suivant →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
