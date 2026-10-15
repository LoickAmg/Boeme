/**
 * Cachet de cire rose frappé d'un « B » : le clin d'œil Régence de Boème. `stamp` le fait
 * s'imprimer (un léger mouvement de tampon) à son apparition.
 */
export function WaxSeal({
  size = 64,
  letter = "B",
  stamp = true,
  tilt = -6,
  broken = false,
  className = "",
  label,
}: {
  size?: number;
  letter?: string;
  stamp?: boolean;
  tilt?: number;
  /** Cachet fendu : pour les pages d'erreur (la lettre n'est pas arrivée). */
  broken?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`seal shrink-0 drop-shadow-[0_6px_10px_rgba(127,85,81,0.35)] ${stamp ? "seal-stamp" : ""} ${className}`}
      style={{ ["--seal-r" as string]: `${tilt}deg` }}
    >
      <defs>
        <radialGradient id="seal-wax" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#b98580" />
          <stop offset="55%" stopColor="#8e5f5a" />
          <stop offset="100%" stopColor="#6a4440" />
        </radialGradient>
      </defs>
      {/* Bord irrégulier de la cire coulée. */}
      <path
        d="M50 3c7 0 9 5 15 6s11-2 15 3 1 10 4 15 9 7 9 13-6 8-6 14 4 11 0 15-10 2-14 6-5 10-11 11-9-4-15-4-10 5-15 2-3-9-7-12-12-2-15-7 2-10 0-15-8-8-6-14 7-7 9-12-1-11 4-15 11 0 15-3 7-9 13-9Z"
        fill="url(#seal-wax)"
      />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#5b3a37" strokeOpacity="0.45" strokeWidth="2" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#e6c7c2" strokeOpacity="0.35" strokeWidth="1" />
      <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontStyle="italic" fontSize="34" fill="#f3e1dd" fillOpacity="0.92">
        {letter}
      </text>
      {broken && (
        <>
          {/* La fêlure : un trait sombre en zigzag, bordé d'un éclat clair. */}
          <path d="M30 6 L44 30 L36 44 L54 58 L46 74 L60 96" fill="none" stroke="#3d2725" strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M32 6 L46 30 L38 44 L56 58 L48 74 L62 96" fill="none" stroke="#e6c7c2" strokeOpacity="0.45" strokeWidth="1" strokeLinejoin="round" />
        </>
      )}
      {/* Reflet : la cire est encore brillante. */}
      <ellipse cx="36" cy="28" rx="11" ry="5" fill="#fff" fillOpacity="0.18" transform="rotate(-25 36 28)" />
    </svg>
  );
}
