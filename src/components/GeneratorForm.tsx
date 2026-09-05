"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { PoemCard } from "@/components/PoemCard";
import type { Poem } from "@/db/schema";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  LANGUAGES,
  LENGTH_IDS,
  STRUCTURE_IDS,
  THEME_IDS,
} from "@/lib/poetry/types";
import type { Language, LengthId, StructureId, ThemeId } from "@/lib/poetry/types";

interface GeneratorFormProps {
  /** Appelé après une génération réussie, pour rafraîchir un flux ailleurs sur la page. */
  onGenerated?: (poem: Poem) => void;
}

function OptionPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-rose bg-rose text-ivory"
          : "border-linen-deep bg-ivory-soft text-ink-soft hover:border-rose hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function GeneratorForm({ onGenerated }: GeneratorFormProps) {
  const { locale, dict } = useLocale();

  const [language, setLanguage] = useState<Language>(locale);
  const [theme, setTheme] = useState<ThemeId>("tendre");
  const [structure, setStructure] = useState<StructureId>("vers_libre");
  const [length, setLength] = useState<LengthId>("moyen");

  const [poem, setPoem] = useState<Poem | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleGenerate() {
    setStatus("loading");
    try {
      const response = await fetch("/api/poems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, theme, structure, length }),
      });

      if (!response.ok) {
        throw new Error("La génération a échoué.");
      }

      const payload = (await response.json()) as { poem: Poem };
      setPoem(payload.poem);
      setStatus("idle");
      onGenerated?.(payload.poem);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {dict.generator.poemLanguage}
          </legend>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((id) => (
              <OptionPill key={id} active={language === id} onClick={() => setLanguage(id)}>
                {dict.languages[id]}
              </OptionPill>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {dict.generator.theme}
          </legend>
          <div className="flex flex-wrap gap-2">
            {THEME_IDS.map((id) => (
              <OptionPill key={id} active={theme === id} onClick={() => setTheme(id)}>
                {dict.themes[id].label}
              </OptionPill>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {dict.generator.structure}
          </legend>
          <div className="flex flex-wrap gap-2">
            {STRUCTURE_IDS.map((id) => (
              <OptionPill key={id} active={structure === id} onClick={() => setStructure(id)}>
                {dict.structures[id].label}
              </OptionPill>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {dict.generator.length}
          </legend>
          <div className="flex flex-wrap gap-2">
            {LENGTH_IDS.map((id) => (
              <OptionPill key={id} active={length === id} onClick={() => setLength(id)}>
                {dict.lengths[id]}
              </OptionPill>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? dict.generator.generating : dict.generator.generate}
        </button>
        {status === "error" && (
          <p className="text-sm text-rose-deep">{dict.generator.genError}</p>
        )}
      </div>

      {poem && (
        <div>
          <PoemCard poem={poem} />
        </div>
      )}
    </div>
  );
}
