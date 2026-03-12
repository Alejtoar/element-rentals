"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/api/client";
import { Property } from "@/types";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ReportsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [dict, setDict] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [selectedProperty, setSelectedProperty] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportLang, setReportLang] = useState(lang); // Default to current admin lang

    useEffect(() => {
        const load = async () => {
            try {
                const [p, d] = await Promise.all([
                    api.properties.getAll(),
                    getDictionary(lang as Locale)
                ]);
                setProperties(p);
                setDict(d);
            } catch (e) {
                console.error(e);
                setError("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [lang]);

    const setDateRange = (type: 'this_month' | 'last_month' | 'ytd') => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (type === 'this_month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (type === 'last_month') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (type === 'ytd') {
            start = new Date(now.getFullYear(), 0, 1);
            end = now;
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProperty || !startDate || !endDate) {
            setError("Please select all fields");
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            const blob = await api.finance.downloadStatement({
                property_id: selectedProperty,
                start_date: startDate,
                end_date: endDate,
                lang: reportLang
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `statement_${selectedProperty}_${startDate}_${endDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err: any) {
            console.error(err);
            setError(err.message || dict?.admin?.common?.error || "Failed to generate report");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reports?.title || "Financial Reports"}</h1>
            <p className="mb-8 text-sm font-medium" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.reports?.subtitle || "Generate owner statements"}</p>

            <div className="rounded-sm p-8 shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                {error && (
                    <div className="mb-6 p-4 rounded-sm text-sm font-medium" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleGenerate} className="space-y-8">
                    {/* Property Selector */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-bold mb-2 ml-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reports?.select_property || "Select Property"}</label>
                        <select
                            value={selectedProperty}
                            onChange={(e) => setSelectedProperty(e.target.value)}
                            className="w-full px-4 py-3 rounded-sm transition-all outline-none cursor-pointer"
                            style={{
                                backgroundColor: '#e6e3d7',
                                border: '1px solid rgba(82,120,88,0.3)',
                                color: '#4b3d1c',
                                fontFamily: "'MegantZ', serif",
                                boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)'
                            }}
                            required
                        >
                            <option value="">-- {dict?.admin?.reports?.select_property || "Select Property"} --</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-xs uppercase tracking-widest font-bold" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reports?.date_range || "Date Range"}</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDateRange('this_month')}
                                    className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors hover:bg-black/5"
                                    style={{ color: '#265140', border: '1px solid rgba(38,81,64,0.2)' }}
                                >
                                    {dict?.admin?.reports?.this_month || "This Month"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDateRange('last_month')}
                                    className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors hover:bg-black/5"
                                    style={{ color: '#265140', border: '1px solid rgba(38,81,64,0.2)' }}
                                >
                                    {dict?.admin?.reports?.last_month || "Last Month"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDateRange('ytd')}
                                    className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors hover:bg-black/5"
                                    style={{ color: '#265140', border: '1px solid rgba(38,81,64,0.2)' }}
                                >
                                    {dict?.admin?.reports?.ytd || "YTD"}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Report Language */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-bold mb-2 ml-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reports?.language || "Report Language"}</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="lang"
                                    value="en"
                                    checked={reportLang === 'en'}
                                    onChange={() => setReportLang('en')}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#4b3d1c' }}>{dict?.admin?.reports?.english || "English"}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="lang"
                                    value="es"
                                    checked={reportLang === 'es'}
                                    onChange={() => setReportLang('es')}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#4b3d1c' }}>{dict?.admin?.reports?.spanish || "Spanish"}</span>
                            </label>
                        </div>
                    </div>

                    {/* Action */}
                    <Button
                        type="submit"
                        isLoading={submitting}
                        className="w-full py-4 uppercase tracking-widest font-bold text-lg"
                        variant="sand"
                    >
                        {dict?.admin?.reports?.generate_pdf || "Generate Statement (PDF)"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
