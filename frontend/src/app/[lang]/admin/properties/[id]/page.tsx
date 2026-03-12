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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    if (!property) return <div className="text-white">Property not found</div>;

    return (
        <div className="rounded-sm p-8" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
            <div className="flex flex-col md:flex-row gap-8">
                {property.main_image_url && (
                    <img
                        src={getMediaUrl(property.main_image_url)}
                        alt={property.name}
                        className="w-full md:w-64 h-64 object-cover rounded-sm shadow-md"
                        style={{ border: '1px solid rgba(82,120,88,0.1)' }}
                    />
                )}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-2 tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{property.name}</h2>
                            <p className="mb-6 max-w-2xl font-medium" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif", lineHeight: '1.6' }}>{property.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest`} style={{
                            backgroundColor: property.active ? 'rgba(38,81,64,0.05)' : 'rgba(75,61,28,0.05)',
                            color: property.active ? '#265140' : 'rgba(75,61,28,0.5)',
                            border: property.active ? '1px solid rgba(38,81,64,0.1)' : '1px solid rgba(75,61,28,0.1)',
                            fontFamily: "'Berlin Sans', sans-serif"
                        }}>
                            {property.active ? (dict?.admin?.table?.active || "Active") : (dict?.admin?.table?.inactive || "Inactive")}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm p-6 rounded-sm mt-4" style={{ backgroundColor: 'rgba(38,81,64,0.02)', border: '1px solid rgba(82,120,88,0.1)' }}>
                        <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.properties?.city || "City"}</p>
                            <p className="font-bold text-lg" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{property.city}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.properties?.guests || "Guests"}</p>
                            <p className="font-bold text-lg" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{property.max_guests}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.properties?.price || "Price/Night"}</p>
                            <p className="font-bold text-lg" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{formatCurrency(property.nightly_price)}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.created_at || "Created"}</p>
                            <p className="font-bold text-lg" style={{ color: 'rgba(75,61,28,0.4)', fontFamily: "'MegantZ', serif" }}>
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
