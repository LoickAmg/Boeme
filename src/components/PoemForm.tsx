"use client";

import { useActionState, useRef, useState } from "react";

import { savePoemAction } from "@/app/actions/poems";
import type { PoemFormState } from "@/app/actions/poems";
import { CoverPicker } from "@/components/CoverPicker";
import { Field, FormErrorSummary, inputClass } from "@/components/Field";
import { ImportPoem } from "@/components/ImportPoem";
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
  /** Adresse de la couverture actuelle (modification d'un poème qui en a une). */
  coverUrl?: string | null;
}

export function PoemForm({ initial }: { initial: PoemFormValues }) {
  const [cover, setCover] = useState<string | null>(null);
  const [state, action, pending] = useActionState(savePoemAction, INITIAL);
  const errors = state.errors ?? {};
  const values = { ...initial, ...state.values };
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  /** Texte importé : placé dans l'éditeur (le titre seulement s'il est encore vide). */
  function placeImported(text: { title: string; body: string }, fromImage: boolean, file: File) {
    // La photo du poème devient sa couverture (si aucune n'est encore choisie).
    if (fromImage && !cover && file.type.startsWith("image/")) {
      import("@/lib/import/coverImage")
        .then(({ coverFromFile }) => coverFromFile(file))
        .then(setCover)
        .catch(() => undefined);
    }
    const body = bodyRef.current;
    if (body) {
      const current = body.value.trim();
      if (current && !window.confirm("Remplacer le texte déjà saisi par le texte importé ?")) return;
      body.value = text.body.slice(0, 6000);
      body.focus();
      body.setSelectionRange(0, 0);
      body.scrollTop = 0;
    }
    if (text.title && titleRef.current && !titleRef.current.value.trim()) titleRef.current.value = text.title.slice(0, 120);
  }

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormErrorSummary message={state.message} errors={errors} />
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      {!initial.id && <ImportPoem onText={placeImported} />}
      {initial.generated ? <input type="hidden" name="generated" value="1" /> : null}

      <Field id="title" label="Titre" error={errors.title}>
        {(props) => <input {...props} ref={titleRef} name="title" defaultValue={values.title} maxLength={120} required className={`${inputClass} font-serif text-2xl`} />}
      </Field>

      <Field
        id="body"
        label="Poème"
        error={errors.body}
        hint="Un vers = une ligne. Pour séparer deux strophes (les « paragraphes » du poème), laissez une ligne vide entre elles. 6 000 caractères au plus."
      >
        {(props) => (
          <textarea
            {...props}
            ref={bodyRef}
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

      <CoverPicker existing={initial.coverUrl ?? null} value={cover} onChange={setCover} error={errors.cover} />

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
