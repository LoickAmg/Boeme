import type { ReactNode } from "react";

/** Champ de formulaire étiqueté, avec aide et erreur reliées au champ pour les lecteurs d'écran. */
export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-rose-deep">
          <span aria-hidden>⚠</span>
          {error}
        </p>
      )}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * Bandeau en tête de formulaire : le message général, ou le rappel qu'un ou plusieurs champs sont
 * à corriger (avec leurs messages), pour qu'aucune erreur ne passe inaperçue.
 */
export function FormErrorSummary({ message, errors }: { message?: string; errors?: Record<string, string> }) {
  const list = Object.values(errors ?? {}).filter(Boolean);
  if (!message && list.length === 0) return null;
  return (
    <div role="alert" className="rounded-xl border border-rose-deep/60 bg-rose-soft/40 px-4 py-3 text-sm text-ink">
      {message ? (
        <p className="font-medium">{message}</p>
      ) : (
        <>
          <p className="font-semibold">
            {list.length > 1 ? `${list.length} points à corriger` : "Un point à corriger"} avant de continuer :
          </p>
          <ul className="mt-1 list-disc pl-5">
            {list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-linen-deep bg-ivory px-4 py-2.5 text-base text-ink placeholder:text-ink-faint aria-[invalid=true]:border-rose-deep aria-[invalid=true]:bg-rose-soft/15";
