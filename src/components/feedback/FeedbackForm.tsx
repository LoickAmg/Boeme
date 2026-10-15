"use client";

import { usePathname } from "next/navigation";
import { useActionState, useState } from "react";

import { sendFeedbackAction } from "@/app/actions/feedback";
import type { FeedbackState } from "@/app/actions/feedback";
import { Field, FormErrorSummary, inputClass } from "@/components/Field";
import { WaxSeal } from "@/components/regency/WaxSeal";
import { FEEDBACK_KIND_OPTIONS } from "@/lib/feedback";

const INITIAL: FeedbackState = {};
const MAX = 3000;

const KINDS = FEEDBACK_KIND_OPTIONS;

/**
 * Formulaire de retour : type, message, et pour un visiteur non connecté un nom et une adresse
 * facultatifs pour être recontacté. La page d'où il est envoyé est jointe automatiquement.
 */
export function FeedbackForm({ signedIn, defaultKind = "suggestion", from }: { signedIn: boolean; defaultKind?: string; from?: string }) {
  const [state, action, pending] = useActionState(sendFeedbackAction, INITIAL);
  const pathname = usePathname();
  const values = state.values ?? {};
  const errors = state.errors ?? {};
  const [length, setLength] = useState(values.message?.length ?? 0);

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
        <WaxSeal size={64} />
        <p className="font-serif text-3xl italic text-ink">Merci !</p>
        <p className="max-w-sm text-sm leading-relaxed text-ink-soft">{state.message ?? "Votre retour est bien arrivé."} Chaque retour aide Boème à grandir.</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormErrorSummary message={state.message} errors={errors} />
      <input type="hidden" name="page" value={from ?? pathname} />
      {/* Champ piège pour les robots : invisible et ignoré par les lecteurs d'écran. */}
      <input type="text" name="site_web" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />

      <fieldset>
        <legend className="text-sm font-semibold text-ink">C&apos;est plutôt…</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {KINDS.map((kind) => (
            <label
              key={kind.id}
              className="flex cursor-pointer flex-col rounded-xl border border-linen-deep bg-ivory px-3 py-2 text-sm transition-colors has-[:checked]:border-rose-deep has-[:checked]:bg-rose-soft/40 hover:border-rose"
            >
              <span className="flex items-center gap-2 font-semibold text-ink">
                <input type="radio" name="kind" value={kind.id} defaultChecked={(values.kind || defaultKind) === kind.id} className="accent-[var(--color-rose-deep)]" />
                {kind.label}
              </span>
              <span className="pl-5 text-xs text-ink-soft">{kind.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="feedback-message" label="Votre message" error={errors.message}>
        {(props) => (
          <div className="flex flex-col gap-1">
            <textarea
              {...props}
              name="message"
              rows={6}
              maxLength={MAX}
              required
              defaultValue={values.message}
              onChange={(e) => setLength(e.target.value.length)}
              placeholder="Ce qui vous a plu, ce qui vous a gêné, ce qui manque… Pour un problème : ce que vous faisiez, ce qui s'est passé, sur téléphone ou ordinateur."
              className={`${inputClass} leading-relaxed`}
            />
            <span className="self-end text-xs text-ink-faint">
              {length} / {MAX}
            </span>
          </div>
        )}
      </Field>

      {!signedIn && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="feedback-name" label="Votre nom (facultatif)">
            {(props) => <input {...props} name="name" maxLength={60} defaultValue={values.name} autoComplete="name" className={inputClass} />}
          </Field>
          <Field id="feedback-contact" label="E-mail pour une réponse (facultatif)" error={errors.contact}>
            {(props) => <input {...props} name="contact" type="email" maxLength={160} defaultValue={values.contact} autoComplete="email" className={inputClass} />}
          </Field>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-faint">{signedIn ? "Envoyé avec votre nom d'auteur." : "Sans e-mail, votre retour reste anonyme."} La page actuelle est jointe.</p>
        <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60">
          {pending ? "Envoi…" : "Envoyer mon retour"}
        </button>
      </div>
    </form>
  );
}
