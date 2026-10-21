import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/AuthCard";
import { ConfirmEmailForm } from "@/components/EmailVerificationForms";
import { getDb } from "@/db/client";
import { emailVerificationTokenIsValid } from "@/server/email-verification";

// Le jeton est dans l'adresse : aucune page ne doit le transmettre ailleurs (en-tête Referer).
export const metadata: Metadata = { title: "Confirmer mon adresse e-mail", robots: { index: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({ searchParams }: PageProps<"/compte/verification">) {
  const query = await searchParams;
  const token = typeof query.jeton === "string" ? query.jeton : "";
  const valid = await emailVerificationTokenIsValid(await getDb(), token);

  return (
    <AuthCard title="Confirmer mon adresse e-mail" intro={valid ? "Un dernier clic pour confirmer que cette adresse vous appartient." : undefined}>
      {valid ? (
        <ConfirmEmailForm token={token} />
      ) : (
        <div className="flex flex-col items-center gap-6">
          <p role="alert" className="w-full rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
            Ce lien a expiré ou a déjà servi.
          </p>
          <Link href="/compte" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory hover:bg-rose-deep">
            Demander un nouveau lien depuis Mon espace
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
