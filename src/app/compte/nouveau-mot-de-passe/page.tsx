import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Nouveau mot de passe</h1>
      {valid ? (
        <>
          <p className="mt-4 mb-8 max-w-md text-ink-soft">Choisissez votre nouveau mot de passe. Vous serez déconnecté de tous vos autres appareils.</p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <div className="mt-6 max-w-md">
          <p role="alert" className="rounded-xl border border-rose bg-rose-soft/40 px-4 py-3 text-sm text-ink">
            Ce lien a expiré ou a déjà servi.
          </p>
          <Link href="/compte/mot-de-passe-oublie" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory hover:bg-rose-deep">
            Demander un nouveau lien
          </Link>
        </div>
      )}
    </div>
  );
}
