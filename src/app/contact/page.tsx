import type { Metadata } from "next";

import { LegalLayout, LegalSection } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <LegalLayout title="Contact" updatedLabel="Dernière mise à jour : septembre 2026">
      <LegalSection heading="Écrire à l'éditeur">
        <p>Une question, une remarque, une suggestion ? Écrivez à l&apos;adresse suivante :</p>
        <p>
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
        </p>
        <p>Nous répondons généralement sous quelques jours ouvrés.</p>
      </LegalSection>
      <LegalSection heading="Signaler un contenu">
        <p>
          Pour un poème qui enfreint la <a href="/charte">charte de publication</a>, utilisez le bouton « Signaler ce poème » sur sa page (compte requis), ou écrivez-nous en indiquant l&apos;adresse du poème et le motif.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
