import type { Metadata } from "next";

import { LegalLayout, LegalSection } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité" updatedLabel="Dernière mise à jour : septembre 2026">
      <LegalSection heading="Responsable du traitement">
        <p>
          {site.publisher}, particulier (voir les <a href="/mentions-legales">mentions légales</a>). Contact : <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection heading="Lire sans compte">
        <p>La lecture ne demande aucun compte. Aucun outil de mesure d&apos;audience ni traceur publicitaire n&apos;est utilisé.</p>
      </LegalSection>

      <LegalSection heading="Données d'un compte">
        <p>Quand vous créez un compte, nous enregistrons :</p>
        <ul className="list-disc pl-6">
          <li>votre adresse e-mail (jamais affichée ni partagée), pour la connexion ;</li>
          <li>votre nom d&apos;auteur, affiché publiquement sur vos poèmes ;</li>
          <li>un mot de passe, conservé uniquement sous forme d&apos;empreinte irréversible (scrypt) ;</li>
          <li>votre présentation (facultative), vos poèmes publiés et brouillons, vos favoris, les signalements que vous déposez.</li>
        </ul>
        <p>Base légale : l&apos;exécution du service que vous demandez (compte, publication) ; pour la sécurité, l&apos;intérêt légitime de l&apos;éditeur.</p>
      </LegalSection>

      <LegalSection heading="Cookie">
        <p>
          Un seul cookie est déposé après connexion : il garde votre session ouverte (30 jours au plus). Il est strictement nécessaire au service et ne sert à aucun suivi ; il ne demande donc pas de bandeau de consentement.
        </p>
      </LegalSection>

      <LegalSection heading="Protection contre les abus">
        <p>
          Pour limiter les tentatives de connexion répétées et les générations en masse, le service calcule une empreinte salée et irréversible de l&apos;adresse IP du visiteur. L&apos;adresse IP elle-même n&apos;est jamais enregistrée ; l&apos;empreinte et son compteur disparaissent d&apos;eux-mêmes au bout de quelques minutes à 24 heures selon l&apos;usage.
        </p>
      </LegalSection>

      <LegalSection heading="Générateur">
        <p>Le générateur reçoit vos choix (langue, ambiance, structure, longueur), jamais de texte libre. Si un modèle de langage externe est activé par l&apos;éditeur, ces seuls choix lui sont transmis, sans donnée personnelle.</p>
      </LegalSection>

      <LegalSection heading="Conservation et suppression">
        <p>
          Vos données sont conservées tant que votre compte existe. Vous pouvez le supprimer à tout moment depuis « Mon espace » : votre compte, vos poèmes, vos brouillons, vos favoris et vos sessions sont alors effacés définitivement. Les signalements que vous avez déposés sont conservés sans lien avec votre identité.
        </p>
        <p>Un poème publié est visible de tous, et peut avoir été copié par des tiers avant sa suppression.</p>
      </LegalSection>

      <LegalSection heading="Vos droits">
        <p>
          Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, d&apos;opposition, de limitation et de portabilité de vos données. La suppression du compte et la modification de la présentation se font directement dans « Mon espace » ; pour tout autre droit, écrivez à <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>. En cas de désaccord, vous pouvez saisir la CNIL (cnil.fr).
        </p>
      </LegalSection>

      <LegalSection heading="Sous-traitants">
        <p>Les données sont hébergées chez le prestataire d&apos;hébergement et de base de données indiqué dans les mentions légales dès la mise en production.</p>
      </LegalSection>
    </LegalLayout>
  );
}
