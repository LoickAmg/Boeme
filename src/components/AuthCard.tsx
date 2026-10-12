import type { ReactNode } from "react";

import { WaxSeal } from "@/components/regency/WaxSeal";

/** Mise en page des pages de compte (connexion, inscription, mot de passe) : une carte centrée. */
export function AuthCard({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex w-full flex-1 items-start justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="fade-up relative w-full max-w-md rounded-[2rem] border border-linen-deep/70 bg-ivory-soft/60 px-6 pt-12 pb-8 shadow-[0_18px_40px_rgba(58,51,45,0.07)] sm:px-9 sm:pb-10">
        {/* Une lettre scellée : le cachet de Boème sur le haut de la carte. */}
        <span aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.6rem] border border-gold/30" />
        <WaxSeal size={60} className="absolute -top-7 left-1/2 -ml-[30px]" tilt={-4} />
        <h1 className="text-center font-serif text-4xl italic text-ink sm:text-5xl">{title}</h1>
        {intro ? <div className="mt-3 text-center text-sm leading-relaxed text-ink-soft">{intro}</div> : null}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
