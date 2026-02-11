"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/api/client";
import { Owner, Property } from "@/types";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerDetailsPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = use(params);
    const router = useRouter();
    const [dict, setDict] = useState<any>(null);
    const [owner, setOwner] = useState<Owner | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Quick Report State
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [reportMonth, setReportMonth] = useState("");
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        // Init report month to current month
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        setReportMonth(`${yyyy}-${mm}`);

        const loadInit = async () => {
            if (lang) {
                const d = await getDictionary(lang as Locale);
                setDict(d);
            }
        };
        loadInit();
        loadData();
    }, [lang, id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ownerData, propertiesData] = await Promise.all([
                api.owners.getById(id),
                api.properties.getAll({ owner_id: id })
            ]);
            setOwner(ownerData);
            setProperties(propertiesData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openReportModal = (propertyId: string) => {
        setSelectedPropertyId(propertyId);
        setReportModalOpen(true);
    };

    const handleQuickReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPropertyId || !reportMonth) return;

        setGenerating(true);
        try {
            const [year, month] = reportMonth.split('-').map(Number);
            const startDate = new Date(year, month - 1, 1).toLocaleDateString('en-CA');
            const endDate = new Date(year, month, 0).toLocaleDateString('en-CA');

            const blob = await api.finance.downloadStatement({
                property_id: selectedPropertyId,
                start_date: startDate,
                end_date: endDate,
                lang: lang
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `statement_${selectedPropertyId}_${reportMonth}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setReportModalOpen(false);
        } catch (err: any) {
            alert(err.message || dict?.admin?.common?.error || "Failed to generate report");
        } finally {
            setGenerating(false);
        }
    };

    if (loading && !dict) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!owner && !loading) {
        return (
            <div className="p-8 text-center text-slate-400">
                {dict?.admin?.common?.error || "Owner not found"}
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="secondary" onClick={() => router.back()} className="mb-4">
                        ← {dict?.admin?.common?.back || "Back"}
                    </Button>
                    <h1 className="text-3xl font-bold text-white mb-2">{owner?.full_name}</h1>
                    <div className="flex gap-4 text-slate-400">
                        <span>{owner?.email}</span>
                        <span>•</span>
                        <span>{owner?.phone}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-8">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">{dict?.admin?.owners?.bank_details || "Bank Details"}</h2>
                        <div className="text-slate-300 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 min-h-[100px] whitespace-pre-wrap">
                            {owner?.bank_details || <span className="text-slate-500 italic">{dict?.admin?.common?.not_provided || "Not provided"}</span>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Properties */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                {dict?.admin?.properties?.title || "Properties"}
                                <span className="ml-2 text-sm font-normal text-slate-500">({properties.length})</span>
                            </h2>
                            <div className="flex gap-2">
                                <Link href={`/${lang}/admin/accounting/reports`}>
                                    <Button variant="secondary" size="sm">
                                        {dict?.admin?.reports?.title || "Reports Center"}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {properties.map((property) => (
                                    <div key={property.id} className="group relative block rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 hover:border-purple-500/50 transition-all duration-300">
                                        <Link href={`/${lang}/admin/properties/${property.id}`} className="block h-full">
                                            <div className="aspect-video relative overflow-hidden bg-slate-800">
                                                {property.images && property.images.length > 0 ? (
                                                    <img
                                                        src={property.images.find(i => i.is_main)?.url || property.images[0].url}
                                                        alt={property.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                        No Image
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                                    <div className="font-semibold text-white truncate max-w-[70%]">{property.name}</div>
                                                    <div className="text-sm text-green-400 font-mono">
                                                        ${property.nightly_price}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="absolute top-2 right-2 z-20">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openReportModal(property.id);
                                                }}
                                                className="p-2 bg-slate-800/90 backdrop-blur rounded-full text-white hover:bg-purple-600 transition-colors shadow-lg border border-slate-600 hover:border-purple-500"
                                                title={dict?.admin?.reports?.quick_report || "Quick Report"}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
                                {dict?.admin?.properties?.no_properties || "No properties found"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Report Modal */}
            {reportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {dict?.admin?.reports?.quick_report || "Quick Report"}
                        </h3>
                        <form onSubmit={handleQuickReport}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {dict?.admin?.table?.date || "Month"}
                                </label>
                                <input
                                    type="month"
                                    value={reportMonth}
                                    onChange={(e) => setReportMonth(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button type="submit" className="flex-1" isLoading={generating}>
                                    {dict?.admin?.common?.view || "Generate"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setReportModalOpen(false)}
                                    className="flex-1"
                                >
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
