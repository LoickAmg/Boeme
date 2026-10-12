"use client";

import { useState } from "react";

import { inputClass } from "@/components/Field";

export const PASSWORD_MIN = 10;

/** Note indicative (0 à 4) : longueur d'abord, puis variété des caractères. */
export function passwordScore(password: string): number {
  if (password.length < PASSWORD_MIN) return password.length === 0 ? 0 : 1;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  let score = 2;
  if (password.length >= 14 || kinds >= 3) score = 3;
  if (password.length >= 16 && kinds >= 3) score = 4;
  if (/^(.)\1+$/.test(password)) score = 1;
  return score;
}

const LEVELS = ["", "Trop court", "Correct", "Solide", "Excellent"];
const COLORS = ["bg-linen", "bg-rose-deep", "bg-[#c08a3e]", "bg-[#6f8f6a]", "bg-[#4f7a54]"];

function Eye({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M4 4l16 16" />}
    </svg>
  );
}

/**
 * Champ mot de passe avec un bouton « œil » pour l'afficher ou le masquer et, pour un nouveau mot
 * de passe, les règles vérifiées en direct (longueur minimale, robustesse indicative).
 */
export function PasswordInput({
  name,
  autoComplete,
  withRules = false,
  matchWith,
  onValue,
  ...field
}: {
  id: string;
  name: string;
  autoComplete: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  withRules?: boolean;
  /** Pour une confirmation : la valeur à retrouver. */
  matchWith?: string;
  onValue?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const score = passwordScore(value);
  const long = value.length >= PASSWORD_MIN;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          {...field}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="off"
          spellCheck={false}
          required
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onValue?.(e.target.value);
          }}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-1 my-auto flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-linen hover:text-ink"
        >
          <Eye open={!visible} />
        </button>
      </div>

      {withRules && (
        <div aria-live="polite" className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1" aria-hidden>
              {[1, 2, 3, 4].map((step) => (
                <span key={step} className={`h-1.5 flex-1 rounded-full transition-colors ${score >= step ? COLORS[score] : "bg-linen"}`} />
              ))}
            </div>
            <span className="w-20 text-right font-semibold text-ink-soft">{LEVELS[score]}</span>
          </div>
          <p className={long ? "text-[#4f7a54]" : "text-ink-soft"}>
            {long ? "✓" : "○"} {PASSWORD_MIN} caractères au moins{value.length > 0 && !long ? ` (encore ${PASSWORD_MIN - value.length})` : ""}
          </p>
          <p className="text-ink-faint">Conseil : une petite phrase facile à retenir, avec un chiffre ou un signe, est plus sûre qu&apos;un mot compliqué.</p>
        </div>
      )}

      {matchWith !== undefined && value.length > 0 && (
        <p aria-live="polite" className={`text-xs ${value === matchWith ? "text-[#4f7a54]" : "text-rose-deep"}`}>
          {value === matchWith ? "✓ Les deux mots de passe correspondent." : "Les deux mots de passe ne correspondent pas encore."}
        </p>
      )}
    </div>
  );
}
