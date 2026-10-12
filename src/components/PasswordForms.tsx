"use client";

import { useActionState } from "react";

import { adminResetLinkAction, changePasswordAction, forgotPasswordAction, resetPasswordAction } from "@/app/actions/password";
import type { PasswordState } from "@/app/actions/password";
import { Field, inputClass } from "@/components/Field";

const INITIAL: PasswordState = {};

function Notice({ state }: { state: PasswordState }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`rounded-xl border px-4 py-3 text-sm text-ink ${state.ok ? "border-linen-deep bg-linen/50" : "border-rose bg-rose-soft/40"}`}>
      {state.message}
    </p>
  );
}

const button = "self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, INITIAL);
  const errors = state.errors ?? {};
  return (
    // La clé remet les champs à zéro après un changement réussi.
    <form key={state.ok ? "fait" : "saisie"} action={action} className="flex max-w-md flex-col gap-5" noValidate>
      <Notice state={state} />
      <Field id="current" label="Mot de passe actuel" error={errors.current}>
        {(props) => <input {...props} name="current" type="password" autoComplete="current-password" required className={inputClass} />}
      </Field>
      <Field id="new-password" label="Nouveau mot de passe" error={errors.password} hint="10 caractères au minimum.">
        {(props) => <input {...props} name="password" type="password" autoComplete="new-password" required minLength={10} className={inputClass} />}
      </Field>
      <Field id="confirm-password" label="Confirmez le nouveau mot de passe" error={errors.confirm}>
        {(props) => <input {...props} name="confirm" type="password" autoComplete="new-password" required className={inputClass} />}
      </Field>
      <button type="submit" disabled={pending} className={button}>
        {pending ? "Un instant…" : "Changer mon mot de passe"}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, INITIAL);
  if (state.ok) return <Notice state={state} />;
  return (
    <form action={action} className="flex max-w-md flex-col gap-5" noValidate>
      <Notice state={state} />
      <Field id="email" label="Adresse e-mail du compte" error={state.errors?.email}>
        {(props) => <input {...props} name="email" type="email" autoComplete="email" defaultValue={state.values?.email} required className={inputClass} />}
      </Field>
      <button type="submit" disabled={pending} className={button}>
        {pending ? "Envoi…" : "Recevoir un lien"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, INITIAL);
  const errors = state.errors ?? {};
  return (
    <form action={action} className="flex max-w-md flex-col gap-5" noValidate>
      <Notice state={state} />
      <input type="hidden" name="token" value={token} />
      <Field id="new-password" label="Nouveau mot de passe" error={errors.password} hint="10 caractères au minimum.">
        {(props) => <input {...props} name="password" type="password" autoComplete="new-password" required minLength={10} className={inputClass} />}
      </Field>
      <Field id="confirm-password" label="Confirmez le mot de passe" error={errors.confirm}>
        {(props) => <input {...props} name="confirm" type="password" autoComplete="new-password" required className={inputClass} />}
      </Field>
      <button type="submit" disabled={pending} className={button}>
        {pending ? "Un instant…" : "Enregistrer et me connecter"}
      </button>
    </form>
  );
}

export function AdminResetLinkForm() {
  const [state, action, pending] = useActionState(adminResetLinkAction, INITIAL);
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4" noValidate>
      <Notice state={state} />
      {state.link && (
        <input
          readOnly
          value={state.link}
          onFocus={(event) => event.currentTarget.select()}
          aria-label="Lien de réinitialisation"
          className={`${inputClass} font-mono text-xs`}
        />
      )}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <Field id="reset-email" label="Adresse e-mail du membre" error={state.errors?.email}>
            {(props) => <input {...props} name="email" type="email" autoComplete="off" defaultValue={state.values?.email} required className={inputClass} />}
          </Field>
        </div>
        <button type="submit" disabled={pending} className="rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-linen disabled:opacity-60">
          Créer un lien
        </button>
      </div>
    </form>
  );
}
