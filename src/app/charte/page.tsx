import type { Metadata } from "next";

import { LegalLayout, LegalSection } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Charte de publication",
  description: "Les règles pour publier un poème sur Boème : originalité, respect, retrait des contenus illicites.",
};

export default function CharterPage() {
  return (
    <LegalLayout title="Charte de publication" updatedLabel="Dernière mise à jour : septembre 2026">
      <LegalSection heading="L'esprit du lieu">
        <p>
          {site.name} est un espace de lecture et d&apos;écriture. Chacun y publie ses poèmes et lit ceux des autres avec bienveillance. La poésie peut être sombre, dérangeante ou politique ; elle n&apos;a pas à être haineuse, illégale ou copiée.
        </p>
      </LegalSection>

      <LegalSection heading="Ce que vous pouvez publier">
        <p>Uniquement des poèmes dont vous êtes l&apos;auteur, ou que vous avez le droit de diffuser. Un poème d&apos;un autre auteur, même cité de mémoire, n&apos;a pas sa place ici s&apos;il est encore protégé par le droit d&apos;auteur.</p>
        <p>Un poème amorcé par le générateur peut être publié après que vous l&apos;avez retravaillé ; il est alors signalé comme tel.</p>
      </LegalSection>

      <LegalSection heading="Ce qui est interdit">
        <ul className="list-disc pl-6">
          <li>le plagiat et la publication d&apos;œuvres protégées sans autorisation ;</li>
          <li>les propos haineux, discriminatoires, l&apos;incitation à la violence, le harcèlement ;</li>
          <li>l&apos;apologie de crimes, les contenus pédopornographiques, tout contenu contraire à la loi ;</li>
          <li>la divulgation de données personnelles d&apos;un tiers (adresse, numéro de téléphone, etc.) ;</li>
          <li>la publicité, le démarchage et les liens promotionnels.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Vos droits sur vos poèmes">
        <p>
          Vous restez seul propriétaire de vos poèmes. En les publiant, vous accordez à {site.name} une licence gratuite, non exclusive, pour les afficher sur le site tant qu&apos;ils y sont publiés. Vous pouvez les modifier, les repasser en brouillon ou les supprimer à tout moment, et supprimer votre compte pour effacer l&apos;ensemble.
        </p>
        <p>Publier un poème engage votre responsabilité d&apos;auteur : l&apos;éditeur ne relit pas les textes avant leur mise en ligne.</p>
      </LegalSection>

      <LegalSection heading="Signaler un contenu">
        <p>
          Tout membre connecté peut signaler un poème depuis sa page. Un poème signalé par plusieurs lecteurs différents est masqué en attendant qu&apos;un modérateur le relise ; il est ensuite rétabli ou supprimé. Un contenu manifestement illicite peut aussi être signalé par e-mail à <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> en indiquant l&apos;adresse du poème et le motif : il sera retiré dans les meilleurs délais.
        </p>
      </LegalSection>

      <LegalSection heading="Sanctions">
        <p>Un poème contraire à cette charte est retiré. En cas de manquement répété ou grave, le compte peut être supprimé, sans préjudice des suites légales.</p>
      </LegalSection>
    </LegalLayout>
  );
}
