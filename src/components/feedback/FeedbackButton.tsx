"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { Overlay } from "@/components/Overlay";

import { FeedbackForm } from "./FeedbackForm";

/** Bouton flottant « Un avis ? », sur toutes les pages : ouvre le formulaire de retour sans quitter la page. */
export function FeedbackButton({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Pas de doublon sur la page dédiée, ni dans l'administration des retours.
  if (pathname === "/avis" || pathname.startsWith("/admin")) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-rose-deep/40 bg-ivory/95 px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_10px_24px_rgba(58,51,45,0.16)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-rose-deep print:hidden sm:bottom-6 sm:right-6"
      >
        <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 text-rose-deep" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.5 2.5c-4 0-8 3.5-9 9l-1 2" />
          <path d="M13.5 2.5c0 4-3 7.5-7.5 8" />
        </svg>
        Un avis ?
      </button>

      {open && (
        <Overlay onClose={() => setOpen(false)}>
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 backdrop-blur-sm sm:items-center"
            onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <div role="dialog" aria-modal="true" aria-labelledby="avis-titre" className="relative max-h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-ivory p-6 shadow-2xl sm:p-8">
              <span aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.4rem] border border-gold/30" />
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">Votre avis compte</p>
                  <h2 id="avis-titre" className="mt-1 font-serif text-3xl italic text-ink">
                    Un retour, une idée ?
                  </h2>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-linen-deep px-3 py-1 text-sm font-semibold text-ink-soft hover:text-ink">
                  Fermer
                </button>
              </div>
              <FeedbackForm signedIn={signedIn} />
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}
