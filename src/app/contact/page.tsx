import { LegalLayout, LegalSection } from "@/components/LegalPage";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getUiLocale } from "@/lib/i18n/server";

export default async function ContactPage() {
  const locale = await getUiLocale();
  const dict = getDictionary(locale);
  const { contactPage } = dict.legal;
  const toFill = dict.legal.mentions.toFill;

  return (
    <LegalLayout title={contactPage.title} updatedLabel={dict.legal.updatedLabel}>
      <LegalSection heading={contactPage.emailTitle}>
        <p>{contactPage.intro}</p>
        <p>
          <a href="mailto:contact@exemple.fr">contact@exemple.fr</a>
        </p>
        <p>{contactPage.emailBody}</p>
      </LegalSection>
      <LegalSection heading={contactPage.title}>
        <p>
          {toFill} — nom ou pseudo · {toFill} — adresse postale.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
