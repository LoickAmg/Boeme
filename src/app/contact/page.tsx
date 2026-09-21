import { LegalLayout, LegalSection } from "@/components/LegalPage";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUiLocale } from "@/lib/i18n/server";

export default async function ContactPage() {
  const locale = await getUiLocale();
  const dict = getDictionary(locale);
  const { contactPage } = dict.legal;

  return (
    <LegalLayout title={contactPage.title} updatedLabel={dict.legal.updatedLabel}>
      <LegalSection heading={contactPage.emailTitle}>
        <p>{contactPage.intro}</p>
        <p>
          <a href={`mailto:${dict.legal.contactEmail}`}>{dict.legal.contactEmail}</a>
        </p>
        <p>{contactPage.emailBody}</p>
      </LegalSection>
      <LegalSection heading={contactPage.title}>
        <p>{dict.legal.mentions.publisherName}</p>
      </LegalSection>
    </LegalLayout>
  );
}
