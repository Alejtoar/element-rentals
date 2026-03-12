import type { Metadata } from "next";
import "../globals.css";
import { Locale, i18n } from "@/lib/i18n-config";
import { GlobalBackground } from "@/components/common/GlobalBackground";
import { UTMTracker } from "@/components/common/UTMTracker";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDictionary } from "@/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Elemnt Rentals | Estancias Premium en la Naturaleza",
  description: "Descubre alojamientos exclusivos rodeados de naturaleza. Elemnt Rentals — hospedaje de lujo boutique en Colombia.",
  openGraph: {
    title: "Elemnt Rentals | Premium Nature Stays",
    description: "Luxury boutique rental properties immersed in nature.",
    images: ["/images/brand/Logo_colores_principales.png"],
  },
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className="antialiased"
        style={{
          backgroundColor: '#e6e3d7',  /* brand-bone — global page background */
          color: '#4b3d1c',             /* brand-olive — global text */
          fontFamily: "'MegantZ', serif",
        }}
      >
        <GlobalBackground />
        <UTMTracker />
        <div className="flex flex-col min-h-screen">
          {/* Forest-green navbar sits above all content */}
          <Navbar lang={lang} />
          <main className="flex-grow">
            {children}
          </main>
          <Footer dict={dict.footer} lang={lang} />
        </div>
      </body>
    </html>
  );
}
