import { Hero } from "@/components/features/Hero";
import { PropertyListing } from "@/components/features/PropertyListing";
import { LeadForms } from "@/components/features/LeadForms";
import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/lib/i18n-config";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero dict={dict.hero} />
      <PropertyListing dict={dict.catalog} lang={lang} propertyDict={dict.property_card} />
      <LeadForms dict={dict.leads} lang={lang} />
    </>
  );
}
