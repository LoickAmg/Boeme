"use client";

import { useActionState } from "react";

import { deleteAccountAction, saveBioAction } from "@/app/actions/profile";
import type { ProfileState } from "@/app/actions/profile";
import { Field, inputClass } from "@/components/Field";

const INITIAL: ProfileState = {};

export function BioForm({ bio }: { bio: string }) {
  const [state, action, pending] = useActionState(saveBioAction, INITIAL);
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Field id="bio" label="Présentation" hint="Affichée sur votre page de membre. 500 caractères au plus.">
        {(props) => <textarea {...props} name="bio" defaultValue={bio} rows={4} maxLength={500} className={inputClass} />}
      </Field>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60">
          Enregistrer
        </button>
        {state.message && (
          <p role="status" className="text-sm text-ink-soft">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccountAction, INITIAL);
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink-soft">
        La suppression efface votre compte, tous vos poèmes (publiés et brouillons) et vos favoris. Elle est définitive.
      </p>
      <Field id="confirm" label="Pour confirmer, tapez SUPPRIMER" error={state.error}>
        {(props) => <input {...props} name="confirm" autoComplete="off" className={inputClass} />}
      </Field>
      <button type="submit" disabled={pending} className="self-start rounded-full border border-rose-deep px-5 py-2.5 text-sm font-semibold text-rose-deep transition-colors hover:bg-rose-soft/40 disabled:opacity-60">
        Supprimer mon compte
      </button>
    </form>
  );
}
