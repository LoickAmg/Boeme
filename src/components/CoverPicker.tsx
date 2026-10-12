"use client";

import { useRef, useState } from "react";

/**
 * Couverture du poème (facultative) : une image réduite dans le navigateur, envoyée avec le
 * formulaire (champ caché `cover`). `removeCover` retire l'image existante.
 */
export function CoverPicker({ existing, value, onChange, error }: { existing: string | null; value: string | null; onChange: (dataUrl: string | null) => void; error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const shown = value ?? (removed ? null : existing);

  async function pick(file: File | undefined) {
    if (!file) return;
    setProblem(null);
    setBusy(true);
    try {
      const { coverFromFile } = await import("@/lib/import/coverImage");
      onChange(await coverFromFile(file));
      setRemoved(false);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "Image impossible à préparer.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-ink">Image de couverture (facultative)</p>
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-linen-deep/70 bg-ivory-soft/50 p-4">
        <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-linen-deep bg-linen/50">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL) ou image servie par l'API
            <img src={shown} alt="Aperçu de la couverture" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-ink-faint">Pas d&apos;image</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm text-ink-soft">
          <p>Une photo de votre carnet, un dessin, un paysage… Elle illustre le poème dans « Mon espace » et sur sa page. Sans image, une couverture est composée à partir de vos vers.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="rounded-full border border-ink px-4 py-2 font-semibold text-ink transition-colors hover:bg-ink hover:text-ivory disabled:opacity-60"
            >
              {busy ? "Préparation…" : shown ? "Changer l'image" : "Choisir une image"}
            </button>
            {shown && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setRemoved(true);
                }}
                className="rounded-full px-3 py-2 font-medium text-rose-deep underline underline-offset-4"
              >
                Retirer
              </button>
            )}
          </div>
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <input type="hidden" name="cover" value={value ?? ""} />
      <input type="hidden" name="removeCover" value={removed && !value ? "1" : ""} />
      {(problem || error) && (
        <p role="alert" className="flex items-start gap-1.5 text-sm font-medium text-rose-deep">
          <span aria-hidden>⚠</span>
          {problem ?? error}
        </p>
      )}
    </div>
  );
}
