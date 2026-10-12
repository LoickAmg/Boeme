import type { PoemOrigin } from "@/server/poems";

/** Nom lisible de la source externe d'un poème (« Wikisource », « Wikipédia »…). */
export function sourceName(url: string | null): string {
  if (!url) return "source externe";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.endsWith("wikisource.org")) return "Wikisource";
    if (host.endsWith("wikipedia.org")) return "Wikipédia";
    if (host.endsWith("gutenberg.org")) return "Projet Gutenberg";
    return host;
  } catch {
    return "source externe";
  }
}

/** Libellés de provenance, partout les mêmes : un membre écrit « sur Boème », le reste vient d'ailleurs. */
export function provenanceLabel(origin: PoemOrigin, sourceUrl: string | null): string {
  if (origin === "member") return "Écrit sur Boème";
  if (origin === "classic") return `Domaine public · ${sourceName(sourceUrl)}`;
  return `Lien externe · ${sourceName(sourceUrl)}`;
}

function Quill() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 2.5c-4 0-8 3.5-9 9l-1 2" />
      <path d="M13.5 2.5c0 4-3 7.5-7.5 8" />
    </svg>
  );
}

function Book() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M2.5 3.5c2-1 4-1 5.5.5 1.5-1.5 3.5-1.5 5.5-.5v9c-2-1-4-1-5.5.5-1.5-1.5-3.5-1.5-5.5-.5z" />
      <path d="M8 4v9" />
    </svg>
  );
}

/**
 * Pastille de provenance : rose pleine pour un poème écrit par un membre sur Boème ; contour
 * encre pour un texte venu d'une source externe (domaine public ou simple lien).
 */
export function ProvenanceBadge({ origin, sourceUrl, className = "" }: { origin: PoemOrigin; sourceUrl: string | null; className?: string }) {
  const member = origin === "member";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider ${
        member ? "bg-rose-deep text-ivory" : origin === "classic" ? "border border-ink/30 text-ink" : "border border-dashed border-ink/40 text-ink-soft"
      } ${className}`}
    >
      {member ? <Quill /> : origin === "classic" ? <Book /> : <span aria-hidden>↗</span>}
      {provenanceLabel(origin, sourceUrl)}
    </span>
  );
}

/** « 128 lectures · 74 lecteurs » (rien tant que personne n'a lu). */
export function readsLabel(views: number, readers: number): string | null {
  if (views <= 0) return null;
  return `${views} lecture${views > 1 ? "s" : ""} · ${readers} lecteur${readers > 1 ? "s" : ""}`;
}
