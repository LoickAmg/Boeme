import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/AuthCard";
import { ForgotPasswordForm } from "@/components/PasswordForms";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Mot de passe oublié" intro="Indiquez l'adresse e-mail de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe, valable une heure.">
      <ForgotPasswordForm />
      <p className="mt-8 text-center text-sm text-ink-soft">
        <Link href="/compte/connexion" className="underline underline-offset-4 hover:text-ink">
          ← Retour à la connexion
        </Link>
      </p>
    </AuthCard>
  );
}
