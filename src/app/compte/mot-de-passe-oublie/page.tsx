import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/PasswordForms";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-5xl italic text-ink">Mot de passe oublié</h1>
      <p className="mt-4 mb-8 max-w-md text-ink-soft">
        Indiquez l&apos;adresse e-mail de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe. Il est valable une heure.
      </p>
      <ForgotPasswordForm />
      <p className="mt-8 text-sm text-ink-soft">
        <Link href="/compte/connexion" className="underline underline-offset-4 hover:text-ink">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
