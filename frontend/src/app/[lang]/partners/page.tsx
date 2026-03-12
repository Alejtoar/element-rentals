import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/lib/i18n-config";
import Link from "next/link";

interface Props {
    params: Promise<{
        lang: Locale;
    }>;
}

// Sage-colored SVG icons for each section
const IconCheck = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#e6e3d7' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const IconCoin = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#e6e3d7' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const IconList = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#e6e3d7' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);
const IconHome = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#e6e3d7' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const IconWallet = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#e6e3d7' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const IconSliders = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#e6e3d7' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
);

const sectionIcons = [IconCheck, IconCoin, IconList, IconHome, IconWallet, IconSliders];

export default async function PartnersPage({ params }: Props) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const partners = dict.partners;

    const sections = [
        { key: 'how_it_works', title: partners.how_it_works_title, desc: partners.how_it_works_desc, icon: IconCheck, steps: partners.steps },
        { key: 'management_fee', title: partners.management_fee_title, desc: partners.management_fee_desc, icon: IconCoin },
        { key: 'whats_included', title: partners.whats_included_title, desc: partners.whats_included_desc, items: partners.whats_included_items, icon: IconList },
        { key: 'expenses', title: partners.expenses_title, desc: partners.expenses_desc, icon: IconHome },
        { key: 'owner_usage', title: partners.owner_usage_title, desc: partners.owner_usage_desc, icon: IconHome },
        { key: 'payments', title: partners.payments_title, desc: partners.payments_desc, icon: IconWallet },
        { key: 'flexibility', title: partners.flexibility_title, desc: partners.flexibility_desc, icon: IconSliders },
    ];

    return (
        <main className="min-h-screen">
            {/* =========================================
                HERO — Full Forest Green Section
                ========================================= */}
            <section
                className="relative pt-36 pb-28 px-6 overflow-hidden"
                style={{ backgroundColor: '#265140' }}
            >
                {/* Ambient forest glows */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute -top-[20%] -right-[10%] w-[55%] h-[55%] rounded-full opacity-40"
                        style={{ backgroundColor: 'rgba(82,120,88,0.30)', filter: 'blur(100px)' }}
                    />
                    <div
                        className="absolute -bottom-[20%] -left-[10%] w-[55%] h-[55%] rounded-full opacity-30"
                        style={{ backgroundColor: 'rgba(207,187,155,0.15)', filter: 'blur(80px)' }}
                    />
                </div>

                <div className="container mx-auto text-center relative z-10">
                    {/* Badge */}
                    <span
                        className="inline-block px-5 py-2 mb-8 text-xs font-bold tracking-widest uppercase rounded-full animate-fade-in opacity-0"
                        style={{
                            backgroundColor: 'rgba(207,187,155,0.15)',
                            border: '1px solid rgba(207,187,155,0.30)',
                            color: '#cfbb9b',
                            fontFamily: "'Berlin Sans', sans-serif",
                        }}
                    >
                        {lang === 'es' ? 'Propietarios' : 'Property Owners'}
                    </span>

                    <h1
                        className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in opacity-0 delay-100"
                        style={{
                            fontFamily: "'Berlin Sans', sans-serif",
                            color: '#e6e3d7',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.05,
                        }}
                    >
                        {partners.hero_title}
                    </h1>

                    <p
                        className="text-lg md:text-xl max-w-3xl mx-auto animate-fade-in opacity-0 delay-200"
                        style={{
                            color: 'rgba(230,227,215,0.80)',
                            fontFamily: "'MegantZ', serif",
                            lineHeight: '2.1',
                        }}
                    >
                        {partners.hero_subtitle}
                    </p>

                    {/* Scroll hint */}
                    <div className="mt-12 animate-bounce opacity-40">
                        <svg className="w-6 h-6 mx-auto" fill="none" stroke="#cfbb9b" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* =========================================
                CONTENT — Cream cards on bone background
                ========================================= */}
            <section
                className="py-20 px-6"
                style={{ backgroundColor: '#e6e3d7' }}
            >
                <div className="max-w-4xl mx-auto space-y-8">
                    {sections.map(({ key, title, desc, items, icon: Icon }, idx) => (
                        <div
                            key={key}
                            className="partner-card rounded-sm p-8 md:p-10 animate-fade-in opacity-0 transition-all duration-300"
                            style={{
                                animationDelay: `${idx * 100}ms`,
                            }}
                        >
                            <div className="flex items-start gap-5">
                                {/* Sage icon container */}
                                <div
                                    className="w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: '#527858' }}
                                >
                                    <Icon />
                                </div>

                                <div className="flex-1">
                                    <h2
                                        className="text-2xl font-bold mb-4"
                                        style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif", letterSpacing: '-0.01em' }}
                                    >
                                        {title}
                                    </h2>

                                    {/* Regular description */}
                                    {desc && (
                                        <p
                                            className="mb-8 whitespace-pre-line"
                                            style={{ color: 'rgba(75,61,28,0.85)', fontFamily: "'MegantZ', serif", lineHeight: '2.1' }}
                                        >
                                            {desc}
                                        </p>
                                    )}

                                    {/* Visual Steps (exclusive to how_it_works section) */}
                                    {key === 'how_it_works' && partners.steps && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8" style={{ borderTop: '1px solid rgba(82,120,88,0.1)' }}>
                                            {partners.steps.map((step: any, i: number) => (
                                                <div key={i} className="space-y-2">
                                                    <h3
                                                        className="text-lg font-bold"
                                                        style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}
                                                    >
                                                        {step.title}
                                                    </h3>
                                                    <p
                                                        className="text-sm"
                                                        style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}
                                                    >
                                                        {step.desc}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Items list (whats_included) */}
                                    {items && (
                                        <ul className="space-y-3">
                                            {items.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <svg
                                                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        style={{ color: '#527858' }}
                                                    >
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span style={{ color: 'rgba(75,61,28,0.70)', fontFamily: "'MegantZ', serif" }}>
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================================
                CTA Section — Forest background
                ========================================= */}
            <section
                className="py-24 px-6 text-center"
                style={{ backgroundColor: '#265140' }}
            >
                <div className="max-w-2xl mx-auto">
                    <h2
                        className="text-4xl md:text-5xl font-extrabold mb-6"
                        style={{ color: '#e6e3d7', fontFamily: "'Berlin Sans', sans-serif", letterSpacing: '-0.02em' }}
                    >
                        {partners.cta_title}
                    </h2>
                    <p
                        className="mb-10 leading-loose"
                        style={{ color: 'rgba(230,227,215,0.75)', fontFamily: "'MegantZ', serif", lineHeight: '1.8' }}
                    >
                        {partners.cta_desc}
                    </p>
                    <Link
                        href={`/${lang}#owner-lead-form`}
                        id="partners-cta-button"
                        className="inline-block px-10 py-5 rounded-sm font-bold uppercase tracking-wider text-lg transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: '#cfbb9b',  /* brand-sand */
                            color: '#4b3d1c',             /* brand-olive */
                            fontFamily: "'Berlin Sans', sans-serif",
                            boxShadow: '0 4px 20px rgba(207,187,155,0.25)',
                        }}
                    >
                        {partners.cta_button}
                    </Link>
                </div>
            </section>
        </main>
    );
}
