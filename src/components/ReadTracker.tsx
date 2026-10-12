"use client";

import { useEffect } from "react";

/** Signale une lecture après quelques secondes passées sur la page, onglet visible. */
export function ReadTracker({ poemId, delayMs = 4000 }: { poemId: number; delayMs?: number }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let sent = false;
    const send = () => {
      if (sent) return;
      sent = true;
      fetch(`/api/poemes/${poemId}/lecture`, { method: "POST", keepalive: true }).catch(() => undefined);
    };
    const arm = () => {
      clearTimeout(timer);
      if (document.visibilityState === "visible") timer = setTimeout(send, delayMs);
    };
    arm();
    document.addEventListener("visibilitychange", arm);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", arm);
    };
  }, [poemId, delayMs]);
  return null;
}
