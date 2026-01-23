import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/lib/i18n-config";
import Link from "next/link";

interface Props {
    params: Promise<{
        lang: Locale;
    }>;
}

export default async function PartnersPage({ params }: Props) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const partners = dict.partners;

    return (
        <main className="min-h-screen pt-20 pb-12">
            <div className="container mx-auto px-6">
                {/* Hero Section */}
                <section className="text-center mb-20 animate-fade-in">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                        {partners.hero_title}
                    </h1>
                    <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
                        {partners.hero_subtitle}
                    </p>
                </section>

                <div className="max-w-5xl mx-auto space-y-12">
                    {/* How It Works */}
                    <section className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">{partners.how_it_works_title}</h2>
                                <p className="text-foreground/70 leading-relaxed">
                                    {partners.how_it_works_desc}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Management Fee */}
                    <section className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">{partners.management_fee_title}</h2>
                                <p className="text-foreground/70 leading-relaxed mb-4">
                                    {partners.management_fee_desc}
                                </p>
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                    <p className="text-sm text-foreground/60 italic flex items-start gap-2">
                                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        {partners.management_fee_note}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* What's Included */}
                    <section className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold mb-6">{partners.whats_included_title}</h2>
                                <ul className="space-y-3">
                                    {partners.whats_included_items.map((item: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-foreground/70">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Expenses & Transparency */}
                    <section className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">{partners.expenses_title}</h2>
                                <p className="text-foreground/70 leading-relaxed mb-4">
                                    {partners.expenses_desc}
                                </p>
                                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                                    <p className="text-sm text-foreground/60">
                                        {partners.expenses_note}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Owner Usage */}
                    <section className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">{partners.owner_usage_title}</h2>
                                <p className="text-foreground/70 leading-relaxed">
                                    {partners.owner_usage_desc}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Payments & Reporting */}
                    <section className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">{partners.payments_title}</h2>
                                <p className="text-foreground/70 leading-relaxed">
                                    {partners.payments_desc}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Flexibility */}
                    <section className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">{partners.flexibility_title}</h2>
                                <p className="text-foreground/70 leading-relaxed mb-4">
                                    {partners.flexibility_desc}
                                </p>
                                <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-2xl">
                                    <p className="text-sm text-foreground/60 italic flex items-start gap-2">
                                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                        </svg>
                                        {partners.flexibility_note}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="glass p-12 md:p-16 rounded-[2.5rem] shadow-2xl text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/10">
                        <h2 className="text-4xl font-bold mb-4">{partners.cta_title}</h2>
                        <p className="text-foreground/70 leading-relaxed mb-8 max-w-2xl mx-auto">
                            {partners.cta_desc}
                        </p>
                        <Link
                            href={`/${lang}#owner-lead-form`}
                            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {partners.cta_button}
                        </Link>
                    </section>
                </div>
            </div>
        </main>
    );
}
