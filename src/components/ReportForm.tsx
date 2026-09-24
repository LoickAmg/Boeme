"use client";

import { useActionState } from "react";

import { reportPoemAction } from "@/app/actions/poems";
import type { ReportState } from "@/app/actions/poems";
import { REPORT_REASON_LABELS } from "@/lib/report";

const INITIAL: ReportState = {};

export function ReportForm({ poemId, returnTo }: { poemId: number; returnTo: string }) {
  const [state, action, pending] = useActionState(reportPoemAction, INITIAL);

  return (
    <details className="rounded-2xl border border-linen-deep/60 bg-ivory-soft/40 px-5 py-4 text-sm">
      <summary className="cursor-pointer font-medium text-ink-soft">Signaler ce poème</summary>
      {state.done ? (
        <p className="mt-3 text-ink-soft" role="status">
          {state.message}
        </p>
      ) : (
        <form action={action} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="poemId" value={poemId} />
          <input type="hidden" name="retour" value={returnTo} />
          <label className="flex flex-col gap-1">
            <span className="font-medium text-ink">Raison</span>
            <select name="reason" required defaultValue="" className="rounded-xl border border-linen-deep bg-ivory px-3 py-2">
              <option value="" disabled>
                Choisir…
              </option>
              {Object.entries(REPORT_REASON_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium text-ink">Précisions (facultatif)</span>
            <textarea name="note" rows={3} maxLength={500} className="rounded-xl border border-linen-deep bg-ivory px-3 py-2" />
          </label>
          {state.message && (
            <p role="alert" className="text-rose-deep">
              {state.message}
            </p>
          )}
          <button type="submit" disabled={pending} className="self-start rounded-full bg-ink px-5 py-2 font-semibold text-ivory transition-colors hover:bg-rose-deep disabled:opacity-60">
            {pending ? "Envoi…" : "Envoyer le signalement"}
          </button>
        </form>
      )}
    </details>
  );
}
