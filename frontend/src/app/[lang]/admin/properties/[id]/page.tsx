"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/api/client";
import { Property } from "@/types";
import { getMediaUrl } from "@/lib/media";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

export default function PropertyDetailsPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = use(params);
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [dict, setDict] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [p, d] = await Promise.all([
                    api.properties.getById(id),
                    getDictionary(lang as Locale)
                ]);
                setProperty(p);
                setDict(d);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, lang]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!property) return <div className="text-white">Property not found</div>;

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
                {property.main_image_url && (
                    <img
                        src={getMediaUrl(property.main_image_url)}
                        alt={property.name}
                        className="w-full md:w-64 h-64 object-cover rounded-xl shadow-lg border border-slate-700"
                    />
                )}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">{property.name}</h2>
                            <p className="text-slate-400 mb-6 max-w-2xl">{property.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${property.active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}>
                            {property.active ? (dict?.admin?.table?.active || "Active") : (dict?.admin?.table?.inactive || "Inactive")}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                        <div>
                            <p className="text-slate-500 mb-1">{dict?.admin?.properties?.city || "City"}</p>
                            <p className="text-white font-medium text-lg">{property.city}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 mb-1">{dict?.admin?.properties?.guests || "Guests"}</p>
                            <p className="text-white font-medium text-lg">{property.max_guests}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 mb-1">{dict?.admin?.properties?.price || "Price/Night"}</p>
                            <p className="text-white font-medium text-lg text-purple-400">{formatCurrency(property.nightly_price)}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 mb-1">{dict?.admin?.table?.created_at || "Created"}</p>
                            <p className="text-white font-medium text-lg">
                                {/* CreateAt might not be detailed on Property type, check if needed */}
                                -
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
