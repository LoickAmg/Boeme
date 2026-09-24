"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, registerAction } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";
import { Field, inputClass } from "@/components/Field";

const INITIAL: AuthState = {};

export function AuthForm({ mode, returnTo }: { mode: "login" | "register"; returnTo: string }) {
  const [state, action, pending] = useActionState(mode === "login" ? loginAction : registerAction, INITIAL);
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const register = mode === "register";
  const suffix = returnTo !== "/compte" ? `?retour=${encodeURIComponent(returnTo)}` : "";

  return (
    <form action={action} className="flex max-w-md flex-col gap-5" noValidate>
      {state.message && (
        <p role="alert" className="rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
          {state.message}
        </p>
      )}
      <input type="hidden" name="retour" value={returnTo} />

      {register && (
        <Field id="name" label="Nom d'auteur" error={errors.name} hint="Affiché publiquement sur vos poèmes. Ce n'est pas votre adresse e-mail.">
          {(props) => <input {...props} name="name" autoComplete="nickname" defaultValue={values.name} required className={inputClass} />}
        </Field>
      )}

      <Field id="email" label="Adresse e-mail" error={errors.email} hint={register ? "Jamais affichée ni partagée." : undefined}>
        {(props) => <input {...props} name="email" type="email" autoComplete="email" defaultValue={values.email} required className={inputClass} />}
      </Field>

      <Field id="password" label="Mot de passe" error={errors.password} hint={register ? "10 caractères au minimum." : undefined}>
        {(props) => (
          <input {...props} name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required className={inputClass} />
        )}
      </Field>

      {register && (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="charter" required aria-invalid={Boolean(errors.charter)} className="mt-1 h-4 w-4 accent-[var(--color-rose-deep)]" />
            <span>
              J&apos;ai lu et j&apos;accepte la{" "}
              <Link href="/charte" className="underline underline-offset-2" target="_blank">
                charte de publication
              </Link>{" "}
              et la{" "}
              <Link href="/confidentialite" className="underline underline-offset-2" target="_blank">
                politique de confidentialité
              </Link>
              .
            </span>
          </label>
          {errors.charter && <p className="text-sm text-rose-deep">{errors.charter}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60">
          {pending ? "Un instant…" : register ? "Créer mon compte" : "Me connecter"}
        </button>
        <Link href={register ? `/compte/connexion${suffix}` : `/compte/inscription${suffix}`} className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
          {register ? "J'ai déjà un compte" : "Créer un compte"}
        </Link>
      </div>
    </form>
  );
}
