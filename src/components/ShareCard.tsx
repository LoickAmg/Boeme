"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { CARD_FORMATS, CARD_STYLES, cardBlob, drawCard, loadCardFonts } from "@/lib/shareCard";
import type { CardFormat, CardStyle } from "@/lib/shareCard";

const MAX_VERSES = 14;

function slug(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/**
 * « Partager en image » : choisir ses vers, un format et un style ; l'image est dessinée
 * dans le navigateur, puis téléchargée ou envoyée directement (partage du téléphone).
 */
export function ShareCard({ title, author, body }: { title: string; author: string; body: string }) {
  const lines = useMemo(() => body.split("\n").map((l) => l.trim()), [body]);
  // Par défaut : la première strophe (au plus 8 vers).
  const firstStanza = useMemo(() => {
    const picked: number[] = [];
    for (let i = 0; i < lines.length && picked.length < 8; i++) {
      if (!lines[i]) {
        if (picked.length) break;
        continue;
      }
      picked.push(i);
    }
    return picked;
  }, [lines]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>(firstStanza);
  const [format, setFormat] = useState<CardFormat>("story");
  const [style, setStyle] = useState<CardStyle>("ivoire");
  const [fontsReady, setFontsReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const canShare = typeof navigator !== "undefined" && "canShare" in navigator;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void loadCardFonts().then(() => !cancelled && setFontsReady(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !fontsReady || !canvas.current) return;
    const verses = [...selected].sort((a, b) => a - b).map((i) => lines[i]);
    drawCard(canvas.current, { title, author, verses }, format, style);
  }, [open, fontsReady, selected, format, style, lines, title, author]);

  function toggle(i: number) {
    setMessage(null);
    setSelected((cur) => {
      if (cur.includes(i)) return cur.filter((x) => x !== i);
      if (cur.length >= MAX_VERSES) {
        setMessage(`${MAX_VERSES} vers au plus sur une image.`);
        return cur;
      }
      return [...cur, i];
    });
  }

  async function download() {
    if (!canvas.current) return;
    const blob = await cardBlob(canvas.current);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boeme-${slug(title) || "poeme"}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function share() {
    if (!canvas.current) return;
    const blob = await cardBlob(canvas.current);
    if (!blob) return;
    const file = new File([blob], `boeme-${slug(title) || "poeme"}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title, text: `${title} — ${author}` });
      } catch {
        // partage annulé par l'utilisateur
      }
    } else {
      await download();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-linen-deep bg-ivory-soft px-4 py-2 font-medium transition-colors hover:border-rose hover:text-ink"
      >
        Partager en image
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-3 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Partager en image" className="flex max-h-full w-full max-w-5xl flex-col gap-5 overflow-y-auto rounded-3xl bg-ivory p-5 shadow-2xl sm:p-7 md:flex-row">
            <div className="flex flex-1 items-start justify-center rounded-2xl bg-linen/50 p-4">
              <canvas
                ref={canvas}
                aria-label="Aperçu de l'image"
                className="h-auto max-h-[60vh] w-auto max-w-full rounded-lg shadow-[0_12px_30px_rgba(58,51,45,0.2)] md:max-h-[72vh]"
              />
            </div>
            <div className="flex w-full flex-col gap-5 md:w-80">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-3xl italic text-ink">Partager en image</h2>
                <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="rounded-full px-3 py-1 text-xl text-ink-soft hover:bg-linen">
                  ×
                </button>
              </div>

              <fieldset>
                <legend className="text-sm font-semibold text-ink">Format</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Object.keys(CARD_FORMATS) as CardFormat[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={format === f}
                      onClick={() => setFormat(f)}
                      className={`rounded-full px-3 py-1.5 text-sm ${format === f ? "bg-ink text-ivory" : "border border-linen-deep bg-ivory-soft text-ink-soft"}`}
                    >
                      {CARD_FORMATS[f].label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-ink">Style</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Object.keys(CARD_STYLES) as CardStyle[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      aria-pressed={style === st}
                      onClick={() => setStyle(st)}
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${style === st ? "ring-2 ring-rose-deep" : "border border-linen-deep"}`}
                    >
                      <span aria-hidden className="h-4 w-4 rounded-full border border-ink/20" style={{ background: `linear-gradient(135deg, ${CARD_STYLES[st].bg[0]}, ${CARD_STYLES[st].bg[1]})` }} />
                      {CARD_STYLES[st].label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-ink">Vers ({selected.length})</legend>
                <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-linen-deep/60 bg-ivory-soft/50 p-2">
                  {lines.map((line, i) =>
                    line ? (
                      <li key={i}>
                        <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1 font-serif text-lg leading-snug text-ink hover:bg-linen/60">
                          <input type="checkbox" checked={selected.includes(i)} onChange={() => toggle(i)} className="mt-1.5 accent-[var(--color-rose-deep)]" />
                          <span>{line}</span>
                        </label>
                      </li>
                    ) : (
                      <li key={i} aria-hidden className="my-1 border-t border-dashed border-linen-deep/70" />
                    ),
                  )}
                </ul>
                {message && <p className="mt-2 text-sm text-rose-deep">{message}</p>}
              </fieldset>

              <div className="mt-auto flex flex-wrap gap-3">
                {canShare && (
                  <button type="button" onClick={share} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep">
                    Partager…
                  </button>
                )}
                <button
                  type="button"
                  onClick={download}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${canShare ? "border border-linen-deep bg-ivory-soft text-ink hover:border-rose" : "bg-ink text-ivory hover:bg-rose-deep"}`}
                >
                  Télécharger l&apos;image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
