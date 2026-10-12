"use client";

import { useRef, useState } from "react";

import { tidyImportedText } from "@/lib/import/tidy";

/**
 * « Importer un poème déjà écrit » : une photo, une capture d'écran ou un document. Le texte
 * est lu sur l'appareil (rien n'est envoyé tant que le poème n'est pas enregistré), mis en
 * forme, puis placé dans l'éditeur pour être relu.
 */
export function ImportPoem({ onText }: { onText: (text: { title: string; body: string }, fromImage: boolean) => void }) {
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<{ ratio: number; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setError(null);
    setDone(null);
    setBusy({ ratio: 0, label: "Ouverture…" });
    try {
      const { readPoemFile } = await import("@/lib/import/readPoem");
      const raw = await readPoemFile(file, (ratio, label) => setBusy({ ratio, label }));
      const result = tidyImportedText(raw);
      if (result.body.replace(/\s/g, "").length < 10) {
        setError("Aucun texte lisible trouvé. Essayez une photo plus nette, bien éclairée et prise de face, ou une capture d'écran.");
        return;
      }
      const fromImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|heic|heif|bmp|gif|tiff?)$/i.test(file.name);
      onText(result, fromImage);
      setDone(
        fromImage
          ? "Texte reconnu et placé dans l'éditeur. Relisez-le attentivement : la lecture automatique peut se tromper, surtout sur l'écriture manuscrite."
          : "Texte importé et placé dans l'éditeur. Vérifiez les retours à la ligne avant de publier.",
      );
    } catch (e) {
      setError(e instanceof Error && e.name === "ImportError" ? e.message : "Import impossible. Essayez un autre format, ou copiez-collez le texte.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section aria-labelledby="importer" className="rounded-2xl border border-dashed border-rose bg-ivory-soft/60 px-5 py-5">
      <h2 id="importer" className="font-serif text-2xl text-ink">
        Importer un poème déjà écrit
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Une photo de votre carnet, une capture d&apos;écran, ou un document : le texte est lu sur votre appareil et placé dans l&apos;éditeur. Rien
        n&apos;est envoyé avant que vous n&apos;enregistriez.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => imageInput.current?.click()}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60"
        >
          Photo ou capture d&apos;écran
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => fileInput.current?.click()}
          className="rounded-full border border-linen-deep bg-ivory px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-rose disabled:opacity-60"
        >
          Document (.docx, .odt, .pdf, .txt)
        </button>
        <input
          ref={imageInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <input
          ref={fileInput}
          type="file"
          accept=".docx,.odt,.pdf,.txt,.md,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,application/pdf,text/plain"
          hidden
          onChange={(e) => {
            void handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {busy && (
        <div className="mt-4" role="status" aria-live="polite">
          <p className="text-sm text-ink">{busy.label}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-linen">
            <div className="h-full rounded-full bg-rose-deep transition-[width] duration-300" style={{ width: `${Math.round(Math.max(0.05, busy.ratio) * 100)}%` }} />
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-4 rounded-xl border border-linen-deep bg-linen/50 px-4 py-3 text-sm text-ink">
          {done}
        </p>
      )}
    </section>
  );
}
