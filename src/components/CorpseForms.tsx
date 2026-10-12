"use client";

import { useActionState } from "react";

import { addLineAction, startCorpseAction } from "@/app/actions/corpses";
import type { CorpseFormState } from "@/app/actions/corpses";
import { Field, inputClass } from "@/components/Field";
import { THEMES } from "@/lib/themes";

const INITIAL: CorpseFormState = {};

export function StartCorpseForm() {
  const [state, action, pending] = useActionState(startCorpseAction, INITIAL);
  const errors = state.errors ?? {};
  const values = { title: "", theme: "", targetLines: "12", firstLine: "", ...state.values };

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.message && (
        <p role="alert" className="rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          {state.message}
        </p>
      )}
      <Field id="corpse-title" label="Titre du poème" error={errors.title}>
        {(props) => <input {...props} name="title" defaultValue={values.title} maxLength={80} required placeholder="La nuit des lampions" className={`${inputClass} font-serif text-xl`} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="corpse-theme" label="Thème (facultatif)">
          {(props) => (
            <select {...props} name="theme" defaultValue={values.theme} className={inputClass}>
              <option value="">Libre</option>
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="corpse-length" label="Longueur">
          {(props) => (
            <select {...props} name="targetLines" defaultValue={values.targetLines} className={inputClass}>
              {[8, 12, 16, 20].map((n) => (
                <option key={n} value={n}>
                  {n} vers
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Field id="corpse-first" label="Le premier vers" error={errors.firstLine} hint="Les suivants ne verront que ce vers-là : donnez-leur de quoi rebondir.">
        {(props) => <input {...props} name="firstLine" defaultValue={values.firstLine} maxLength={140} required className={`${inputClass} font-serif text-xl`} />}
      </Field>
      <button type="submit" disabled={pending} className="w-fit rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60">
        Lancer le cadavre exquis
      </button>
    </form>
  );
}

export function AddLineForm({ corpseId, slug }: { corpseId: number; slug: string }) {
  const [state, action, pending] = useActionState(addLineAction, INITIAL);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="corpseId" value={corpseId} />
      <input type="hidden" name="slug" value={slug} />
      {state.message && (
        <p role="alert" className="rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          {state.message}
        </p>
      )}
      <Field id="next-line" label="Votre vers" error={errors.line} hint="Un seul vers, 140 caractères au plus. Les autres ne verront que le vôtre.">
        {(props) => <input {...props} name="line" defaultValue={state.values?.line ?? ""} maxLength={140} required autoComplete="off" className={`${inputClass} font-serif text-2xl`} />}
      </Field>
      <button type="submit" disabled={pending} className="w-fit rounded-full bg-rose px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-rose-soft disabled:opacity-60">
        Ajouter mon vers
      </button>
    </form>
  );
}
