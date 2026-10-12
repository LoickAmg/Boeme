"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Fenêtre par-dessus toute la page : rendue directement dans <body> (aucun conteneur animé ou
 * transformé ne peut la décaler), défilement de la page bloqué derrière, fermeture par Échap.
 * Ne s'affiche qu'après une action de l'utilisateur, donc jamais pendant le rendu serveur.
 */
export function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(children, document.body);
}
