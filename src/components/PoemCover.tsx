/** Teintes des couvertures composées, choisies d'après le titre (stables d'une visite à l'autre). */
const PALETTES = [
  { bg: "linear-gradient(150deg,#efe2d6 0%,#ddc0bd 100%)", ink: "#3a332d", accent: "#7f5551" },
  { bg: "linear-gradient(150deg,#2b2621 0%,#4a3c3a 100%)", ink: "#f8f3ec", accent: "#ddc0bd" },
  { bg: "linear-gradient(150deg,#f2ead9 0%,#ddccae 100%)", ink: "#3a332d", accent: "#7f5551" },
  { bg: "linear-gradient(150deg,#1d1720 0%,#3b2f3f 100%)", ink: "#f8f3ec", accent: "#c9a4a1" },
  { bg: "linear-gradient(150deg,#e8d9d3 0%,#c9a4a1 100%)", ink: "#3a332d", accent: "#3a332d" },
];

function hash(text: string): number {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * Couverture d'un poème : l'image choisie par l'auteur, sinon une couverture composée — grande
 * initiale et premier vers, sur une teinte de la palette du site.
 */
export function PoemCover({
  poem,
  className = "",
  compact = false,
}: {
  poem: { id: number; title: string; body: string; coverVersion: number | null };
  className?: string;
  /** Vignette : l'initiale seule. */
  compact?: boolean;
}) {
  if (poem.coverVersion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- image servie par l'API (déjà réduite)
      <img src={`/api/poemes/${poem.id}/couverture?v=${poem.coverVersion}`} alt="" loading="lazy" className={`object-cover ${className}`} />
    );
  }
  const palette = PALETTES[hash(poem.title) % PALETTES.length];
  const firstVerse = poem.body.split("\n").find((line) => line.trim())?.trim() ?? "";
  if (compact) {
    return (
      <div aria-hidden className={`flex items-center justify-center font-serif text-2xl italic ${className}`} style={{ background: palette.bg, color: palette.accent }}>
        {poem.title.trim().charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <div aria-hidden className={`relative flex flex-col justify-end overflow-hidden p-4 ${className}`} style={{ background: palette.bg, color: palette.ink }}>
      <span className="absolute -top-4 right-2 font-serif text-[7rem] italic leading-none opacity-20" style={{ color: palette.accent }}>
        {poem.title.trim().charAt(0).toUpperCase()}
      </span>
      <span className="mb-2 block h-[2px] w-8 rounded-full" style={{ background: palette.accent }} />
      <span className="line-clamp-3 font-serif text-lg italic leading-snug">{firstVerse}</span>
    </div>
  );
}
