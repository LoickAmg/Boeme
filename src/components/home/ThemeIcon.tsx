/** Illustrations au trait des thèmes (grille 32 × 32, couleur du texte). */
const PATHS: Record<string, string> = {
  amour: "M16 27s-10-6.2-10-13.2A5.6 5.6 0 0 1 16 10a5.6 5.6 0 0 1 10 3.8C26 20.8 16 27 16 27Z",
  nature: "M7 25C7 14 14 7 26 6c-1 12-8 19-19 19Zm0 0 11-11M13 19h5M17 15v-4",
  melancolie: "M9 17a5 5 0 0 1 1-9.9A7 7 0 0 1 23.6 9 4.5 4.5 0 0 1 23 18H9Zm2 4-1 3m6-3-1 3m6-3-1 3",
  temps: "M9 5h14M9 27h14M10 5c0 6 6 7 6 11s-6 5-6 11M22 5c0 6-6 7-6 11s6 5 6 11M13 24h6",
  mort: "M16 6c-1.6 2-2.4 3.4-2.4 4.6a2.4 2.4 0 0 0 4.8 0C18.4 9.4 17.6 8 16 6Zm-3 8h6v12h-6zM10 26h12",
  liberte: "M4 18c4-1 7-4 9-8 1 3 3 5 6 6l9-5-5 8c-3 4-8 6-13 5l-3 4M19 16c-2 2-5 3-8 3",
  mer: "M3 13c3 0 3-2 6.5-2S13 13 16 13s3-2 6.5-2S26 13 29 13M3 19c3 0 3-2 6.5-2S13 19 16 19s3-2 6.5-2S26 19 29 19M3 25c3 0 3-2 6.5-2S13 25 16 25s3-2 6.5-2S26 25 29 25",
  nuit: "M21 23A10 10 0 0 1 13.5 6a10 10 0 1 0 12 13 9.6 9.6 0 0 1-4.5 4ZM24 5v4m-2-2h4M27 12v2m-1-1h2",
  voyage: "M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5 7-3 7-7 3 3-7 7-3Zm-5 5h.01",
  spiritualite: "M16 4c-2 4-6 6-6 11a6 6 0 0 0 12 0c0-2-1-3.5-2-5 0 2-1 3-2 3 0-4-2-6-2-9ZM12 26h8",
  art: "M25 5C15 7 9 14 8 24l3-2c1-4 4-8 8-10-3 3-5 6-6 9 6-1 11-7 12-16ZM6 27h8",
  sagesse: "M16 9v17M16 9c-3-2-7-2-11-1v17c4-1 8-1 11 1 3-2 7-2 11-1V8c-4-1-8-1-11 1Z",
  reve: "M8 20a4 4 0 0 1 .5-8A6 6 0 0 1 20 10.5a4 4 0 0 1 4 7.5H8Zm3 5h.01M16 24h.01M21 26h.01M25 7l.6 1.4L27 9l-1.4.6L25 11l-.6-1.4L23 9l1.4-.6Z",
  enfance: "M4 20h24l-4 6H8l-4-6Zm12 0V5l8 12h-8Zm0-11-6 9h6",
  exil: "M7 11h18v14H7zM12 11V7h8v4M7 17h18M14 17v3m4-3v3",
};

export function ThemeIcon({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[id] ?? "M8 16h16"} />
    </svg>
  );
}
