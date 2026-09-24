"use client";

import { useActionState } from "react";

import { savePoemAction } from "@/app/actions/poems";
import type { PoemFormState } from "@/app/actions/poems";
import { Field, inputClass } from "@/components/Field";
import { THEMES } from "@/lib/themes";

const INITIAL: PoemFormState = {};

export interface PoemFormValues {
  id?: number;
  title: string;
  body: string;
  theme: string;
  language: string;
  generated: boolean;
  published: boolean;
}

export function PoemForm({ initial }: { initial: PoemFormValues }) {
  const [state, action, pending] = useActionState(savePoemAction, INITIAL);
  const errors = state.errors ?? {};
  const values = { ...initial, ...state.values };

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {state.message && (
        <p role="alert" className="rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          {state.message}
        </p>
      )}
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      {initial.generated ? <input type="hidden" name="generated" value="1" /> : null}

      <Field id="title" label="Titre" error={errors.title}>
        {(props) => <input {...props} name="title" defaultValue={values.title} maxLength={120} required className={`${inputClass} font-serif text-2xl`} />}
      </Field>

      <Field
        id="body"
        label="Poème"
        error={errors.body}
        hint="Un vers par ligne ; laissez une ligne vide entre deux strophes. 6 000 caractères au plus."
      >
        {(props) => (
          <textarea
            {...props}
            name="body"
            defaultValue={values.body}
            rows={16}
            maxLength={6000}
            required
            spellCheck
            className={`${inputClass} font-serif text-xl leading-relaxed`}
          />
        )}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="theme" label="Thème" error={errors.theme}>
          {(props) => (
            <select {...props} name="theme" defaultValue={values.theme} className={inputClass}>
              <option value="">Aucun thème</option>
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="language" label="Langue du poème">
          {(props) => (
            <select {...props} name="language" defaultValue={values.language} className={inputClass}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          )}
        </Field>
      </div>

      {initial.generated && (
        <p className="text-sm text-ink-soft">
          Ce poème est parti d&apos;une proposition du générateur ; il sera signalé comme tel s&apos;il est publié. Retravaillez-le librement.
        </p>
      )}

      <p className="text-sm text-ink-soft">
        En publiant, vous confirmez être l&apos;auteur de ce poème, ou avoir le droit de le diffuser, et respecter la charte de publication.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60"
        >
          {initial.published ? "Mettre à jour" : "Publier"}
        </button>
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="rounded-full border border-linen-deep bg-ivory-soft px-6 py-3 text-sm font-semibold text-ink-soft transition-colors hover:border-rose hover:text-ink disabled:opacity-60"
        >
          {initial.published ? "Repasser en brouillon" : "Enregistrer en brouillon"}
        </button>
      </div>
    </form>
  );
}
