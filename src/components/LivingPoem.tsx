"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AMBIENCES, startAmbience } from "@/lib/ambience";
import type { Ambience } from "@/lib/ambience";

type Speed = "lent" | "normal" | "rapide";
const CHAR_MS: Record<Speed, number> = { lent: 70, normal: 45, rapide: 28 };
const RATE: Record<Speed, number> = { lent: 0.8, normal: 0.95, rapide: 1.15 };

/** Voix française de l'appareil, s'il en a une (la plus naturelle d'abord). */
function frenchVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const fr = voices.filter((v) => v.lang.toLowerCase().startsWith("fr"));
  return fr.find((v) => /natural|neural|google|amélie|audrey|thomas/i.test(v.name)) ?? fr[0];
}

/**
 * « Poème vivant » : le poème s'écrit à l'écran vers après vers, comme à l'encre, lu à voix
 * haute si on le souhaite, sur une ambiance sonore au choix. Plein écran, Échap pour sortir.
 */
export function LivingPoem({ title, author, body, lang = "fr" }: { title: string; author: string; body: string; lang?: string }) {
  const lines = useMemo(() => body.split("\n").map((l) => l.trim()), [body]);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(0); // vers déjà apparus (le dernier est en cours d'écriture)
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState(true);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [ambience, setAmbience] = useState<Ambience>("aucune");
  const [volume, setVolume] = useState(0.5);
  const ambienceRef = useRef<ReturnType<typeof startAmbience>>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stage = useRef<HTMLDivElement>(null);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const finished = shown >= lines.length;

  const stopSpeech = useCallback(() => {
    clearTimeout(timer.current);
    if (canSpeak) window.speechSynthesis.cancel();
  }, [canSpeak]);

  // Avance d'un vers : lu à voix haute (le vers suivant vient à la fin de la lecture), ou
  // minuté d'après sa longueur. Une ligne vide marque une pause entre deux strophes.
  useEffect(() => {
    if (!open || !playing || shown >= lines.length) return;
    const line = lines[shown];
    const next = () => setShown((n) => n + 1);
    if (!line) {
      timer.current = setTimeout(next, 900);
      return () => clearTimeout(timer.current);
    }
    const writing = line.length * CHAR_MS[speed];
    if (voice && canSpeak) {
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.lang = lang === "en" ? "en-GB" : "fr-FR";
      const v = lang === "fr" ? frenchVoice() : undefined;
      if (v) utterance.voice = v;
      utterance.rate = RATE[speed];
      let done = false;
      const after = () => {
        if (done) return;
        done = true;
        timer.current = setTimeout(next, 350);
      };
      utterance.onend = after;
      utterance.onerror = after;
      window.speechSynthesis.speak(utterance);
      // Garde-fou : certaines voix n'envoient jamais « fin de lecture ».
      timer.current = setTimeout(after, writing + line.length * 90 + 4000);
      return () => {
        done = true;
        clearTimeout(timer.current);
      };
    }
    timer.current = setTimeout(next, writing + 900);
    return () => clearTimeout(timer.current);
  }, [open, playing, shown, lines, voice, speed, canSpeak, lang]);

  // Le vers en cours reste visible.
  useEffect(() => {
    stage.current?.querySelector("[data-current]")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [shown]);

  // Ambiance : relancée quand on en change, coupée en sortant.
  useEffect(() => {
    if (!open) return;
    ambienceRef.current = startAmbience(ambience, volume);
    return () => {
      ambienceRef.current?.stop();
      ambienceRef.current = null;
    };
    // Le volume se règle à part, sans relancer l'ambiance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ambience]);
  useEffect(() => ambienceRef.current?.setVolume(volume), [volume]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });

  function start() {
    setShown(0);
    setOpen(true);
    setPlaying(true);
  }
  function close() {
    stopSpeech();
    setPlaying(false);
    setOpen(false);
  }
  function toggle() {
    if (finished) {
      stopSpeech();
      setShown(0);
      setPlaying(true);
      return;
    }
    if (playing) stopSpeech();
    setPlaying((p) => !p);
  }

  return (
    <>
      <button type="button" onClick={start} className="rounded-full bg-ink px-4 py-2 font-semibold text-ivory transition-colors hover:bg-rose-deep">
        ✦ Poème vivant
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={`Poème vivant : ${title}`} className="living fixed inset-0 z-50 flex flex-col text-ivory">
          <div aria-hidden className="living-glow" />
          <div className="relative flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.25em] text-rose-soft">Poème vivant</p>
            <button type="button" onClick={close} className="rounded-full border border-ivory/30 px-4 py-1.5 text-sm hover:bg-ivory/10">
              Fermer
            </button>
          </div>

          <div ref={stage} className="relative flex-1 overflow-y-auto px-6 pb-40 sm:px-10">
            <div className="mx-auto max-w-2xl pt-[18vh]">
              <h2 className="living-title font-serif text-5xl italic sm:text-6xl">{title}</h2>
              <p className="living-author mt-3 text-sm uppercase tracking-[0.2em] text-rose-soft">{author}</p>
              <div className="mt-12 space-y-2 font-serif text-[1.65rem] leading-snug sm:text-4xl" lang={lang}>
                {lines.slice(0, Math.min(shown + 1, lines.length)).map((line, i) =>
                  line ? (
                    <p key={i} data-current={i === shown ? "" : undefined} className={i < shown ? "living-line done" : "living-line"}>
                      {i === shown
                        ? [...line].map((ch, j) => (
                            <span key={j} className="ink" style={{ animationDelay: `${j * CHAR_MS[speed]}ms` }}>
                              {ch}
                            </span>
                          ))
                        : line}
                    </p>
                  ) : (
                    <div key={i} aria-hidden className="h-6" />
                  ),
                )}
              </div>
              {finished && (
                <p className="mt-14 text-center text-sm uppercase tracking-[0.25em] text-rose-soft">
                  — fin —
                </p>
              )}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-3 border-t border-ivory/10 bg-[#1e1a17]/80 px-4 py-4 text-sm backdrop-blur-md">
            <button type="button" onClick={toggle} className="min-w-28 rounded-full bg-rose px-5 py-2 font-semibold text-ink hover:bg-rose-soft">
              {finished ? "↺ Rejouer" : playing ? "❚❚ Pause" : "▶ Reprendre"}
            </button>
            {canSpeak && (
              <label className="flex items-center gap-2 rounded-full border border-ivory/20 px-3 py-1.5">
                <input type="checkbox" checked={voice} onChange={(e) => (setVoice(e.target.checked), stopSpeech())} className="accent-[var(--color-rose)]" />
                Voix
              </label>
            )}
            <label className="flex items-center gap-2 rounded-full border border-ivory/20 px-3 py-1.5">
              Rythme
              <select value={speed} onChange={(e) => setSpeed(e.target.value as Speed)} className="bg-transparent text-ivory">
                <option className="text-ink" value="lent">lent</option>
                <option className="text-ink" value="normal">normal</option>
                <option className="text-ink" value="rapide">rapide</option>
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-full border border-ivory/20 px-3 py-1.5">
              Ambiance
              <select value={ambience} onChange={(e) => setAmbience(e.target.value as Ambience)} className="bg-transparent text-ivory">
                {AMBIENCES.map((a) => (
                  <option key={a.id} className="text-ink" value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            {ambience !== "aucune" && (
              <label className="flex items-center gap-2 rounded-full border border-ivory/20 px-3 py-1.5">
                Volume
                <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-24 accent-[var(--color-rose)]" />
              </label>
            )}
          </div>
        </div>
      )}
    </>
  );
}
