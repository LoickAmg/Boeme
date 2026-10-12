/**
 * « Boème » en grand : l'accent grave de Cormorant Garamond est presque vertical à cette
 * taille ; il est remplacé par un coup de pinceau rose poudré, signature du site. Le texte
 * réel reste lisible par les lecteurs d'écran et les moteurs (aria-label).
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <h1 aria-label="Boème" className={`font-serif italic leading-[0.9] text-ink ${className}`}>
      <span aria-hidden>
        Bo
        <span className="relative inline-block">
          e
          <svg viewBox="0 0 40 40" className="absolute left-[0.17em] top-[0.02em] w-[0.24em] text-rose-deep" fill="currentColor">
            <path d="M6 4c3-2 7-1 9 2 4 6 9 14 15 26 1 2-1 4-3 3C19 28 12 19 6 12 3 9 3 6 6 4Z" />
          </svg>
        </span>
        me
      </span>
    </h1>
  );
}
