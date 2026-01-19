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
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero dict={dict.hero} />
        <PropertyListing dict={dict.catalog} lang={lang} propertyDict={dict.property_card} />
        <LeadForms dict={dict.leads} lang={lang} />
      </main>

      <footer className="py-12 border-t border-foreground/5 bg-background">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-black tracking-tighter">
            ELEMNT<span className="text-primary">.</span>
          </div>
          <div className="text-sm text-foreground/40">
            © 2026 Elemnt Rentals. All rights reserved. Premium hospitality.
          </div>
          <div className="flex gap-8 text-sm font-medium text-foreground/60">
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
