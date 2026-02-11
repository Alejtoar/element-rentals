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

    useEffect(() => {
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
                {/* Actions could go here */}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-8">
                    {/* Bank Details Card */}
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
                            <Link href={`/${lang}/admin/properties?owner_id=${id}`}>
                                <Button variant="secondary" size="sm">
                                    {dict?.admin?.common?.view_all || "View All"}
                                </Button>
                            </Link>
                        </div>

                        {properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {properties.map((property) => (
                                    <Link key={property.id} href={`/${lang}/admin/properties/${property.id}`} className="group relative block rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 hover:border-purple-500/50 transition-all duration-300">
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
                                                <div className="font-semibold text-white truncate">{property.name}</div>
                                                <div className="text-sm text-green-400 font-mono">
                                                    ${property.nightly_price}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
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
        </div>
    );
}
