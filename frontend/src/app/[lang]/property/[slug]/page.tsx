import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api } from "@/api/client";
import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/lib/i18n-config";
import PropertyDetailContent from "@/components/features/PropertyDetail";

interface Props {
    params: Promise<{
        lang: Locale;
        slug: string;
    }>;
}

export default async function PropertyPage({ params }: Props) {
    const { lang, slug } = await params;
    const dict = await getDictionary(lang);

    try {
        const property = await api.properties.getBySlug(slug);

        if (!property) {
            return notFound();
        }

        return (
            <main className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <Suspense fallback={<div className="animate-pulse h-96 bg-foreground/5 rounded-3xl" />}>
                    <PropertyDetailContent
                        property={property}
                        dict={dict}
                        lang={lang}
                    />
                </Suspense>
            </main>
        );
    } catch (error) {
        console.error("Error fetching property:", error);
        return notFound();
    }
}
