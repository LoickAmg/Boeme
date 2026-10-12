import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/AuthCard";
import { ResetPasswordForm } from "@/components/PasswordForms";
import { getDb } from "@/db/client";
import { resetTokenIsValid } from "@/server/password";

// Le jeton est dans l'adresse : aucune page ne doit le transmettre ailleurs (en-tête Referer).
export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/compte/nouveau-mot-de-passe">) {
  const query = await searchParams;
  const token = typeof query.jeton === "string" ? query.jeton : "";
  const valid = await resetTokenIsValid(await getDb(), token);

  return (
    <AuthCard title="Nouveau mot de passe" intro={valid ? "Choisissez votre nouveau mot de passe. Vous serez déconnecté de vos autres appareils." : undefined}>
      {valid ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="flex flex-col items-center gap-6">
          <p role="alert" className="w-full rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
            Ce lien a expiré ou a déjà servi.
          </p>
          <Link href="/compte/mot-de-passe-oublie" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory hover:bg-rose-deep">
            Demander un nouveau lien
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
