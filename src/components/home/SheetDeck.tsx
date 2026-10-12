"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface DeckSheet {
  id: number;
  slug: string;
  title: string;
  authorName: string;
  verses: string[];
  member: boolean;
}

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Délai entre deux feuillets, et durée du glissement. */
const INTERVAL_MS = 5200;
const SLIDE_MS = 900;

/**
 * Place d'un feuillet selon son rang : 0 devant, 1 et 2 derrière (on voit leur titre), les autres
 * cachés au fond de la pile ; « -1 » est le feuillet qui s'en va, glissé de côté comme une page tournée.
 */
function slot(rank: number): { transform: string; opacity: number; z: number } {
  switch (rank) {
    case -1:
      return { transform: "translate(-62%, 18px) rotate(-14deg)", opacity: 0, z: 40 };
    case 0:
      return { transform: "translate(0, 96px) rotate(-1.5deg)", opacity: 1, z: 30 };
    case 1:
      return { transform: "translate(52px, 26px) rotate(6deg)", opacity: 1, z: 20 };
    case 2:
      return { transform: "translate(-58px, 0) rotate(-7deg)", opacity: 1, z: 10 };
    default:
      return { transform: "translate(0, 10px) rotate(0deg) scale(0.96)", opacity: 0, z: 0 };
  }
}

/**
 * Pile de feuillets de l'accueil : elle se rebat doucement toute seule (pause au survol), le curseur
 * l'incline légèrement, et un clic sur un feuillet de derrière l'amène devant. Sans animation si
 * l'appareil demande moins de mouvement.
 */
export function SheetDeck({ sheets }: { sheets: DeckSheet[] }) {
  const [front, setFront] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  // Moins de mouvement demandé par l'appareil : pas de défilement automatique ni d'inclinaison.
  const calm = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  const deck = useRef<HTMLDivElement>(null);
  const count = sheets.length;

  const goTo = useCallback(
    (index: number) => {
      if (count < 2) return;
      const next = ((index % count) + count) % count;
      if (next === front) return;
      setLeaving(front);
      setFront(next);
    },
    [count, front],
  );

  // Le feuillet parti rejoint le fond de la pile une fois son glissement terminé.
  useEffect(() => {
    if (leaving === null) return;
    const timer = window.setTimeout(() => setLeaving(null), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (paused || calm || count < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") goTo(front + 1);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, calm, count, front, goTo]);

  // Inclinaison au curseur : quelques degrés, comme une feuille qu'on tient.
  function tilt(event: React.PointerEvent<HTMLDivElement>) {
    if (calm || event.pointerType !== "mouse" || !deck.current) return;
    const box = deck.current.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    deck.current.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
    deck.current.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`);
  }
  function untilt() {
    deck.current?.style.setProperty("--tilt-x", "0deg");
    deck.current?.style.setProperty("--tilt-y", "0deg");
  }

  if (count === 0) return null;

  return (
    <div
      className="relative mx-auto hidden h-[32rem] w-full max-w-md lg:block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        untilt();
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrousel"
      aria-label="Poèmes à feuilleter"
    >
      <div
        ref={deck}
        onPointerMove={tilt}
        className="deck relative h-[27rem]"
        style={{ transform: "perspective(1200px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))", transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
      >
        {sheets.map((sheet, index) => {
          const rank = index === leaving ? -1 : (index - front + count) % count;
          const place = slot(rank);
          const isFront = rank === 0;
          return (
            <article
              key={sheet.id}
              aria-hidden={!isFront}
              onClick={!isFront && rank > 0 && rank < 3 ? () => goTo(index) : undefined}
              className={`absolute left-1/2 top-0 -ml-40 w-80 rounded-sm border border-linen-deep/70 px-8 py-7 ${
                isFront ? "bg-ivory-soft shadow-[0_24px_50px_rgba(58,51,45,0.16)]" : "cursor-pointer bg-[#efe6d4] shadow-[0_10px_24px_rgba(58,51,45,0.10)] hover:bg-[#f2ead9]"
              }`}
              style={{
                transform: place.transform,
                opacity: place.opacity,
                zIndex: place.z,
                transition: calm ? "none" : `transform ${SLIDE_MS}ms cubic-bezier(0.22, 0.8, 0.2, 1), opacity ${SLIDE_MS * 0.7}ms ease, background-color 0.3s`,
                pointerEvents: place.opacity === 0 ? "none" : undefined,
              }}
            >
              {/* Ruban adhésif : la touche « carnet » d'aujourd'hui sur un papier d'hier. */}
              <span
                className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] rounded-[2px] bg-rose/45 shadow-sm transition-opacity duration-500"
                style={{ opacity: isFront ? 1 : 0 }}
              />
              <p className="font-serif text-2xl italic leading-snug text-ink">
                {isFront ? (
                  <Link href={`/poemes/${sheet.slug}`} className="underline-offset-4 hover:underline" tabIndex={0}>
                    {sheet.title}
                  </Link>
                ) : (
                  sheet.title
                )}
              </p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">
                {sheet.authorName}
                {sheet.member ? " · écrit sur Boème" : ""}
              </p>
              <div className={`mt-4 space-y-1 font-serif text-lg leading-snug transition-opacity duration-700 ${isFront ? "text-ink-soft opacity-100" : "text-ink-soft opacity-0"}`}>
                {sheet.verses.map((verse, j) => (
                  <p key={j}>{verse}</p>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => goTo(front - 1)}
            aria-label="Poème précédent"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-linen-deep bg-ivory/80 text-ink-soft transition-colors hover:border-rose hover:text-ink"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            {sheets.map((sheet, index) => (
              <button
                key={sheet.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Afficher « ${sheet.title} »`}
                aria-current={index === front ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === front ? "w-6 bg-rose-deep" : "w-1.5 bg-linen-deep hover:bg-rose"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(front + 1)}
            aria-label="Poème suivant"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-linen-deep bg-ivory/80 text-ink-soft transition-colors hover:border-rose hover:text-ink"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
