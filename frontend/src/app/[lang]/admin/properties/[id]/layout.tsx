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
    const isSync = pathname.endsWith("/sync");
    const isDetails = !isContracts && !isSync;

    const tabs = [
        {
            href: `/${lang}/admin/properties/${id}`,
            label: dict?.admin?.common?.view || "Details",
            active: isDetails,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            href: `/${lang}/admin/properties/${id}/contracts`,
            label: dict?.admin?.contracts?.title || "Contracts",
            active: isContracts,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            href: `/${lang}/admin/properties/${id}/sync`,
            label: dict?.admin?.ical?.title || "Calendar Sync",
            active: isSync,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            )
        },
    ];

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

            <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-8 max-w-fit">
                {tabs.map(tab => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${tab.active
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </Link>
                ))}
            </div>

            {children}
        </div>
    );
}
