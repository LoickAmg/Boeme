/** Filet doré et fleuron ❦ : séparateur de sections, à la manière des livres anciens. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-4 text-gold ${className}`}>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/70 sm:w-28" />
      <span className="font-serif text-2xl leading-none">❦</span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/70 sm:w-28" />
    </div>
  );
}
