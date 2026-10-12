"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { loginAction, registerAction } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";
import { Field, FormErrorSummary, inputClass } from "@/components/Field";
import { PASSWORD_MIN, PasswordInput } from "@/components/PasswordInput";

const INITIAL: AuthState = {};

function without(errors: Record<string, string>, key: string): Record<string, string> {
  return Object.fromEntries(Object.entries(errors).filter(([name]) => name !== key));
}

export function AuthForm({ mode, returnTo }: { mode: "login" | "register"; returnTo: string }) {
  const [state, action, pending] = useActionState(mode === "login" ? loginAction : registerAction, INITIAL);
  // Erreurs repérées avant l'envoi (mot de passe trop court, charte non cochée) : affichées tout de suite.
  const [local, setLocal] = useState<Record<string, string>>({});
  const errors = { ...(state.errors ?? {}), ...local };
  const values = state.values ?? {};
  const register = mode === "register";
  const suffix = returnTo !== "/compte" ? `?retour=${encodeURIComponent(returnTo)}` : "";

  function check(event: React.FormEvent<HTMLFormElement>) {
    if (!register) return;
    const form = event.currentTarget;
    const found: Record<string, string> = {};
    const password = (form.elements.namedItem("password") as HTMLInputElement | null)?.value ?? "";
    if (password.length < PASSWORD_MIN) found.password = `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères (il en a ${password.length}).`;
    if (!(form.elements.namedItem("charter") as HTMLInputElement | null)?.checked) found.charter = "Cochez la case pour accepter la charte de publication.";
    setLocal(found);
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      form.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
    }
  }

  return (
    <form action={action} onSubmit={check} className="flex w-full flex-col gap-5" noValidate>
      <FormErrorSummary message={state.message} errors={errors} />
      <input type="hidden" name="retour" value={returnTo} />

      {register && (
        <Field id="name" label="Nom d'auteur" error={errors.name} hint="Affiché publiquement sur vos poèmes. Ce n'est pas votre adresse e-mail.">
          {(props) => <input {...props} name="name" autoComplete="nickname" defaultValue={values.name} required className={inputClass} />}
        </Field>
      )}

      <Field id="email" label="Adresse e-mail" error={errors.email} hint={register ? "Jamais affichée ni partagée." : undefined}>
        {(props) => <input {...props} name="email" type="email" autoComplete="email" defaultValue={values.email} required className={inputClass} />}
      </Field>

      <Field id="password" label="Mot de passe" error={errors.password}>
        {(props) => (
          <PasswordInput
            {...props}
            name="password"
            autoComplete={register ? "new-password" : "current-password"}
            withRules={register}
            onValue={() => local.password && setLocal((current) => without(current, "password"))}
          />
        )}
      </Field>

      {register && (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-start gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="charter"
              required
              defaultChecked={values.charter === "on"}
              onChange={() => local.charter && setLocal((current) => without(current, "charter"))}
              aria-invalid={Boolean(errors.charter)}
              className="mt-1 h-4 w-4 accent-[var(--color-rose-deep)]"
            />
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
          {errors.charter && (
            <p className="flex items-start gap-1.5 text-sm font-medium text-rose-deep">
              <span aria-hidden>⚠</span>
              {errors.charter}
            </p>
          )}
        </div>
      )}

      <button type="submit" disabled={pending} className="mt-1 w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60">
        {pending ? "Un instant…" : register ? "Créer mon compte" : "Me connecter"}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <Link href={register ? `/compte/connexion${suffix}` : `/compte/inscription${suffix}`} className="text-ink-soft underline underline-offset-4 hover:text-ink">
          {register ? "J'ai déjà un compte" : "Créer un compte"}
        </Link>
        {!register && (
          <Link href="/compte/mot-de-passe-oublie" className="text-ink-soft underline underline-offset-4 hover:text-ink">
            Mot de passe oublié ?
          </Link>
        )}
      </div>
    </form>
  );
}
