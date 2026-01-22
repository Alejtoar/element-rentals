"use client";

import React, { useEffect, useState } from "react";
import { Property } from "@/types";
import { api } from "@/api/client";
import { PropertyCard } from "../ui/PropertyCard";
import { Input } from "../ui/Input";

interface PropertyListingProps {
    dict: {
        featured_title: string;
        featured_subtitle: string;
        catalog_title: string;
        catalog_subtitle: string;
        filter_city: string;
        filter_guests: string;
        filter_featured: string;
        no_properties: string;
    };
    propertyDict: any;
    lang: "en" | "es";
}

export const PropertyListing: React.FC<PropertyListingProps> = ({ dict, propertyDict, lang }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ city: "", guests: 0, featured: false });

    useEffect(() => {
        loadProperties();
    }, [filters]);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const data = await api.properties.getPublic({
                city: filters.city || undefined,
                max_guests: filters.guests || undefined,
                featured: filters.featured || undefined,
            });
            setProperties(data);
        } catch (error) {
            console.error("Failed to load properties", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = async (id: string) => {
        try {
            const { url } = await api.whatsapp.getPropertyLink(id, lang, "Catalog");
            window.open(url, "_blank");
        } catch (error) {
            console.error("Failed to generate WhatsApp link", error);
        }
    };

    const featured = filters.featured ? [] : properties.filter(p => p.featured);
    const catalogResults = filters.featured ? properties : properties.filter(p => !p.featured);

    return (
        <section className="py-24 container mx-auto px-6" id="catalog">
            {/* Featured Section (only shown when not explicitly filtering by featured) */}
            {featured.length > 0 && (
                <div className="mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <h2 className="text-4xl font-bold mb-4">{dict.featured_title}</h2>
                            <p className="text-foreground/60 max-w-xl">
                                {dict.featured_subtitle}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featured.map(property => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onWhatsAppClick={handleWhatsApp}
                                dict={propertyDict}
                                lang={lang}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Catalog Section */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h2 className="text-4xl font-bold mb-4">
                            {filters.featured ? dict.featured_title : dict.catalog_title}
                        </h2>
                        <p className="text-foreground/60 max-w-xl">
                            {filters.featured ? dict.featured_subtitle : dict.catalog_subtitle}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center glass p-4 rounded-3xl">
                        <Input
                            placeholder={dict.filter_city}
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            className="w-48"
                        />
                        <Input
                            type="number"
                            placeholder={dict.filter_guests}
                            value={filters.guests || ""}
                            onChange={(e) => setFilters({ ...filters, guests: parseInt(e.target.value) || 0 })}
                            className="w-24"
                        />
                        <button
                            onClick={() => setFilters({ ...filters, featured: !filters.featured })}
                            className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-medium transition-all ${filters.featured
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-foreground/5 hover:bg-foreground/10 text-foreground/60"
                                }`}
                        >
                            <svg className="w-4 h-4" fill={filters.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {dict.filter_featured}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-foreground/5 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : catalogResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {catalogResults.map(property => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onWhatsAppClick={handleWhatsApp}
                                dict={propertyDict}
                                lang={lang}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 glass rounded-3xl">
                        <p className="text-xl text-foreground/40 italic">{dict.no_properties}</p>
                    </div>
                )}
            </div>
        </section>
    );
};
