"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use, useEffect, useState } from "react";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

export default function PropertyLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string; id: string }>;
}) {
    const { lang, id } = use(params);
    const pathname = usePathname();
    const [dict, setDict] = useState<any>(null);

    useEffect(() => {
        const loadDict = async () => {
            const d = await getDictionary(lang as Locale);
            setDict(d);
        };
        loadDict();
    }, [lang]);

    const isContracts = pathname.endsWith("/contracts");
    const isDetails = !isContracts;

    return (
        <div className="p-8">
            <div className="mb-8">
                <Link
                    href={`/${lang}/admin/properties`}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {dict?.admin?.property_detail?.back_to_catalog || "Back to Properties"}
                </Link>
            </div>

            <div className="flex gap-6 border-b border-slate-700 mb-8">
                <Link
                    href={`/${lang}/admin/properties/${id}`}
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative ${isDetails
                            ? "text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                >
                    {dict?.admin?.common?.view || "Details"}
                    {isDetails && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
                    )}
                </Link>
                <Link
                    href={`/${lang}/admin/properties/${id}/contracts`}
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative ${isContracts
                            ? "text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                >
                    {dict?.admin?.contracts?.title || "Contracts"}
                    {isContracts && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
                    )}
                </Link>
            </div>

            {children}
        </div>
    );
}
