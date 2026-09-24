"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

import { startFromGeneratedAction } from "@/app/actions/poems";
import {
  GENERATOR_LANGUAGES,
  GENERATOR_LENGTHS,
  GENERATOR_STRUCTURES,
  GENERATOR_THEMES,
} from "@/lib/poetry/labels";
import { LANGUAGES, LENGTH_IDS, STRUCTURE_IDS, THEME_IDS } from "@/lib/poetry/types";
import type { Language, LengthId, StructureId, ThemeId } from "@/lib/poetry/types";

interface Generated {
  content: string;
  source: "maison" | "llm";
  language: Language;
  theme: ThemeId;
}

function OptionPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active ? "border-rose bg-rose text-ink" : "border-linen-deep bg-ivory-soft text-ink-soft hover:border-rose hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function GeneratorForm({ signedIn }: { signedIn: boolean }) {
  const [language, setLanguage] = useState<Language>("fr");
  const [theme, setTheme] = useState<ThemeId>("tendre");
  const [structure, setStructure] = useState<StructureId>("vers_libre");
  const [length, setLength] = useState<LengthId>("moyen");

  const [poem, setPoem] = useState<Generated | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleGenerate() {
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, theme, structure, length }),
      });
      const payload = (await response.json()) as { poem?: Generated; error?: string };
      if (!response.ok || !payload.poem) throw new Error(payload.error ?? "La génération a échoué.");
      setPoem(payload.poem);
      setStatus("idle");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La génération a échoué.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <Group legend="Langue du poème">
          {LANGUAGES.map((id) => (
            <OptionPill key={id} active={language === id} onClick={() => setLanguage(id)}>
              {GENERATOR_LANGUAGES[id]}
            </OptionPill>
          ))}
        </Group>
        <Group legend="Ambiance">
          {THEME_IDS.map((id) => (
            <OptionPill key={id} active={theme === id} onClick={() => setTheme(id)}>
              {GENERATOR_THEMES[id].label}
            </OptionPill>
          ))}
        </Group>
        <Group legend="Structure">
          {STRUCTURE_IDS.map((id) => (
            <OptionPill key={id} active={structure === id} onClick={() => setStructure(id)}>
              {GENERATOR_STRUCTURES[id].label}
            </OptionPill>
          ))}
        </Group>
        <Group legend="Longueur">
          {LENGTH_IDS.map((id) => (
            <OptionPill key={id} active={length === id} onClick={() => setLength(id)}>
              {GENERATOR_LENGTHS[id]}
            </OptionPill>
          ))}
        </Group>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Génération…" : poem ? "Proposer un autre poème" : "Générer un poème"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-sm text-rose-deep">
            {error}
          </p>
        )}
      </div>

      {poem && (
        <div className="flex flex-col gap-5 rounded-2xl border border-linen-deep/60 bg-ivory-soft/60 px-6 py-6 sm:px-8 sm:py-8" aria-live="polite">
          <p className="whitespace-pre-line font-serif text-2xl leading-relaxed text-ink">{poem.content}</p>
          <p className="border-t border-linen-deep/50 pt-4 text-xs text-ink-soft">
            Poème généré automatiquement ({poem.source === "llm" ? "modèle de langage" : "vers recombinés à la main"}). Il n&apos;est pas enregistré tant que vous ne le gardez pas.
          </p>
          {signedIn ? (
            <form action={startFromGeneratedAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input type="hidden" name="content" value={poem.content} />
              <input type="hidden" name="theme" value={poem.theme} />
              <input type="hidden" name="language" value={poem.language} />
              <button type="submit" className="rounded-full bg-rose px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-rose-soft">
                En faire mon brouillon et le retravailler
              </button>
            </form>
          ) : (
            <p className="text-sm text-ink-soft">
              <Link href="/compte/connexion?retour=/generateur" className="underline underline-offset-4">
                Connectez-vous
              </Link>{" "}
              pour garder ce poème comme brouillon et le retravailler.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
