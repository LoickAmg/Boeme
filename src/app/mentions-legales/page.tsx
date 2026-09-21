import { LegalLayout, LegalSection } from "@/components/LegalPage";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUiLocale } from "@/lib/i18n/server";

export default async function MentionsLegalesPage() {
  const locale = await getUiLocale();
  const dict = getDictionary(locale);
  const { mentions } = dict.legal;

  return (
    <LegalLayout title={mentions.title} updatedLabel={dict.legal.updatedLabel}>
      <LegalSection heading={mentions.publisherTitle}>
        <p>{mentions.intro}</p>
        <p>{mentions.publisherName}</p>
        <p>{mentions.addressNote}</p>
      </LegalSection>
      <LegalSection heading={mentions.directorTitle}>
        <p>{mentions.directorName}</p>
      </LegalSection>
      <LegalSection heading={mentions.hostingTitle}>
        <p>{mentions.hostText}</p>
      </LegalSection>
      <LegalSection heading={mentions.ipTitle}>
        <p>{mentions.ipBody1}</p>
        <p>{mentions.ipBody2}</p>
      </LegalSection>
      <LegalSection heading={mentions.dataTitle}>
        <p>{mentions.dataBody}</p>
      </LegalSection>
    </LegalLayout>
  );
}
