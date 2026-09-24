import type { Metadata } from "next";

import { LegalLayout, LegalSection } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalNoticePage() {
  return (
    <LegalLayout title="Mentions légales" updatedLabel="Dernière mise à jour : septembre 2026">
      <LegalSection heading="Éditeur du site">
        <p>{site.name} est édité par {site.publisher}, particulier (éditeur non professionnel).</p>
        <p>
          Conformément à l&apos;article 6, III, 2° de la loi n° 2004-575 du 21 juin 2004, l&apos;adresse postale de l&apos;éditeur n&apos;est pas publiée ; elle est communiquée à l&apos;hébergeur, qui la tient à la disposition des autorités.
        </p>
        <p>Directeur de la publication : {site.publisher}. Contact : <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p>
      </LegalSection>

      <LegalSection heading="Hébergement">
        <p>Le nom et les coordonnées de l&apos;hébergeur du service en ligne seront indiqués ici dès sa mise en production.</p>
      </LegalSection>

      <LegalSection heading="Contenus de la bibliothèque">
        <p>
          Les poèmes de la bibliothèque sont des œuvres du domaine public (auteurs décédés depuis plus de soixante-dix ans), dont le texte est repris de Wikisource. La mise en page éditoriale de Wikisource est placée sous licence Creative Commons Attribution – Partage dans les mêmes conditions (CC BY-SA) ; chaque poème renvoie vers sa page source. Les poèmes encore protégés ne sont pas reproduits : seuls leur titre, leur auteur et un lien vers une source sont indiqués.
        </p>
      </LegalSection>

      <LegalSection heading="Contenus publiés par les membres">
        <p>
          Les poèmes de la communauté sont publiés par les membres, sous leur seule responsabilité, sans relecture préalable. L&apos;éditeur agit comme hébergeur de ces contenus : il ne peut être tenu responsable d&apos;un contenu illicite dont il n&apos;a pas eu connaissance, et le retire promptement dès qu&apos;il lui est signalé (voir la <a href="/charte">charte de publication</a>).
        </p>
        <p>Chaque auteur reste titulaire des droits sur ses poèmes.</p>
      </LegalSection>

      <LegalSection heading="Propriété intellectuelle">
        <p>Le code, la mise en forme et les textes éditoriaux de {site.name} sont protégés par le droit d&apos;auteur. Toute reproduction sans autorisation est interdite, hors les contenus placés sous licence libre mentionnés ci-dessus.</p>
      </LegalSection>
    </LegalLayout>
  );
}
