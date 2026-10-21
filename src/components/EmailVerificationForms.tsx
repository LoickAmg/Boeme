"use client";

import { useActionState } from "react";

import { resendVerificationAction, verifyEmailAction } from "@/app/actions/email-verification";
import type { VerificationState } from "@/app/actions/email-verification";

const INITIAL: VerificationState = {};

function Notice({ state }: { state: VerificationState }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`rounded-xl border px-4 py-3 text-sm text-ink ${state.ok ? "border-linen-deep bg-linen/50" : "border-rose bg-rose-soft/40"}`}>
      {state.message}
    </p>
  );
}

const button = "self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60";

export function ConfirmEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(verifyEmailAction, INITIAL);
  if (state.ok) return <Notice state={state} />;
  return (
    <form action={action} className="flex w-full flex-col items-center gap-5" noValidate>
      <Notice state={state} />
      <input type="hidden" name="token" value={token} />
      <button type="submit" disabled={pending} className={button}>
        {pending ? "Un instant…" : "Confirmer mon adresse"}
      </button>
    </form>
  );
}

/** Bouton « renvoyer » affiché dans Mon espace tant que l'adresse n'est pas confirmée. */
export function ResendVerificationForm() {
  const [state, action, pending] = useActionState(resendVerificationAction, INITIAL);
  return (
    <form action={action} className="flex flex-col items-start gap-3">
      <Notice state={state} />
      {!state.ok && (
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-linen disabled:opacity-60"
        >
          {pending ? "Envoi…" : "Renvoyer l'e-mail de confirmation"}
        </button>
      )}
    </form>
  );
}
