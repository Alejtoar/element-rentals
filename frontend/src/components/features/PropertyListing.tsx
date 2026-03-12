"use client";

import React, { useEffect, useState } from "react";
import { Property } from "@/types";
import { api } from "@/api/client";
import { PropertyCard } from "../ui/PropertyCard";

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
        filter_check_in?: string;
        filter_check_out?: string;
        filter_search?: string;
    };
    propertyDict: any;
    lang: "en" | "es";
    initialStartDate?: string;
    initialEndDate?: string;
}

export const PropertyListing: React.FC<PropertyListingProps> = ({
    dict,
    propertyDict,
    lang,
    initialStartDate = "",
    initialEndDate = "",
}) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ city: "", guests: 0, featured: false });
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    useEffect(() => {
        setStartDate(initialStartDate);
        setEndDate(initialEndDate);
    }, [initialStartDate, initialEndDate]);

    useEffect(() => {
        loadProperties();
    }, [filters, startDate, endDate]);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const data = await api.properties.getPublic({
                city: filters.city || undefined,
                max_guests: filters.guests || undefined,
                featured: filters.featured || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
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
    const isFiltered = startDate || endDate || filters.city || filters.guests > 0 || filters.featured;

    const inputStyle: React.CSSProperties = {
        padding: '0.5rem 0.75rem',
        borderRadius: '2px',
        backgroundColor: '#e6e3d7',
        border: '1px solid rgba(82,120,88,0.25)',
        color: '#4b3d1c',
        fontFamily: "'MegantZ', serif",
        fontSize: '0.875rem',
        outline: 'none',
    };

    return (
        <section className="py-24 container mx-auto px-6" id="catalog">
            {/* Featured Section */}
            {featured.length > 0 && !startDate && !endDate && (
                <div className="mb-20 animate-fade-in opacity-0">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            {/* Sand accent line */}
                            <div className="w-10 h-0.5 mb-4 rounded-full" style={{ backgroundColor: '#cfbb9b' }} />
                            <h2
                                className="text-4xl font-bold mb-3"
                                style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif", letterSpacing: '-0.02em' }}
                            >
                                {dict.featured_title}
                            </h2>
                            <p style={{ color: 'rgba(75,61,28,0.65)', fontFamily: "'MegantZ', serif", maxWidth: '28rem' }}>
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
                    <div className="animate-fade-in opacity-0">
                        <div className="w-10 h-0.5 mb-4 rounded-full" style={{ backgroundColor: '#265140' }} />
                        <h2
                            className="text-4xl font-bold mb-3"
                            style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif", letterSpacing: '-0.02em' }}
                        >
                            {isFiltered && (startDate || endDate)
                                ? (lang === 'en' ? 'Available Properties' : 'Propiedades Disponibles')
                                : filters.featured ? dict.featured_title : dict.catalog_title}
                        </h2>
                        <p style={{ color: 'rgba(75,61,28,0.65)', fontFamily: "'MegantZ', serif", maxWidth: '28rem' }}>
                            {startDate && endDate
                                ? `${new Date(startDate + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', { month: 'short', day: 'numeric' })} → ${new Date(endDate + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                : filters.featured ? dict.featured_subtitle : dict.catalog_subtitle}
                        </p>
                    </div>

                    {/* Filter Bar */}
                    <div
                        className="flex flex-wrap gap-3 items-center p-4 rounded-sm"
                        style={{
                            backgroundColor: '#f4f2eb',
                            border: '1px solid rgba(82,120,88,0.18)',
                            boxShadow: '0 4px 20px rgba(75,61,28,0.06)',
                        }}
                    >
                        <input
                            placeholder={dict.filter_city}
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            style={{ ...inputStyle, width: '10rem' }}
                            onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; }}
                        />
                        <input
                            type="number"
                            placeholder={dict.filter_guests}
                            value={filters.guests || ""}
                            onChange={(e) => setFilters({ ...filters, guests: parseInt(e.target.value) || 0 })}
                            style={{ ...inputStyle, width: '6rem' }}
                            onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; }}
                        />
                        {/* Featured Toggle */}
                        <button
                            onClick={() => setFilters({ ...filters, featured: !filters.featured })}
                            className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all duration-200"
                            style={{
                                backgroundColor: filters.featured ? '#265140' : 'transparent',
                                color: filters.featured ? '#e6e3d7' : 'rgba(75,61,28,0.55)',
                                border: `1px solid ${filters.featured ? '#265140' : 'rgba(82,120,88,0.20)'}`,
                                fontFamily: "'Berlin Sans', sans-serif",
                            }}
                        >
                            <svg className="w-4 h-4" fill={filters.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {dict.filter_featured}
                        </button>

                        {/* Clear dates */}
                        {isFiltered && (startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(""); setEndDate(""); }}
                                className="flex items-center gap-1 px-3 py-2 rounded-sm text-xs font-medium transition-all duration-200 hover:opacity-80"
                                style={{
                                    color: 'rgba(75,61,28,0.50)',
                                    border: '1px solid rgba(75,61,28,0.15)',
                                    fontFamily: "'Berlin Sans', sans-serif",
                                }}
                                title={lang === 'en' ? 'Clear date filter' : 'Limpiar fechas'}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="h-96 animate-pulse rounded-sm"
                                style={{ backgroundColor: 'rgba(75,61,28,0.06)' }}
                            />
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
                    <div
                        className="text-center py-20 rounded-sm"
                        style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.15)' }}
                    >
                        <p
                            className="text-xl italic"
                            style={{ color: 'rgba(75,61,28,0.40)', fontFamily: "'MegantZ', serif" }}
                        >
                            {dict.no_properties}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};
