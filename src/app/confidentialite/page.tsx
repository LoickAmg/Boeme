import { LegalLayout, LegalSection } from "@/components/LegalPage";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUiLocale } from "@/lib/i18n/server";

export default async function ConfidentialitePage() {
  const locale = await getUiLocale();
  const dict = getDictionary(locale);
  const { privacy } = dict.legal;

  return (
    <LegalLayout title={privacy.title} updatedLabel={dict.legal.updatedLabel}>
      <LegalSection heading={privacy.introTitle}>
        <p>{privacy.introBody}</p>
      </LegalSection>
      <LegalSection heading={privacy.legalBaseTitle}>
        <p>{privacy.legalBaseBody}</p>
      </LegalSection>
      <LegalSection heading={privacy.retentionTitle}>
        <p>{privacy.retentionBody}</p>
      </LegalSection>
      <LegalSection heading={privacy.rightsTitle}>
        <p>{privacy.rightsBody}</p>
        <p>{privacy.contact} <a href="mailto:contact@exemple.fr">contact@exemple.fr</a></p>
      </LegalSection>
      <LegalSection heading={privacy.controllerTitle}>
        <p>{privacy.controllerBody}</p>
      </LegalSection>
    </LegalLayout>
  );
}
