import React from "react";
import Link from "next/link";
import { Property } from "@/types";
import { getMediaUrl } from "@/lib/media";
import { formatCOP } from "@/lib/currency";
import Image from "next/image";

interface PropertyCardProps {
    property: Property;
    onWhatsAppClick: (id: string) => void;
    lang: string;
    dict: {
        night: string;
        guests: string;
        view_details: string;
        whatsapp: string;
    };
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onWhatsAppClick, dict, lang }) => {
    return (
        <div
            className="group overflow-hidden transition-all duration-500 hover:-translate-y-1.5"
            style={{
                backgroundColor: '#f4f2eb',  /* brand-cream */
                borderRadius: '2px',          /* rounded-sm — architectural logo style */
                boxShadow: '0 4px 20px rgba(75,61,28,0.08)',
                border: '1px solid rgba(82,120,88,0.12)',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#cfbb9b';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(75,61,28,0.16)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(82,120,88,0.12)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(75,61,28,0.08)';
            }}
        >
            {/* Image — with forest tint overlay on hover */}
            <div className="relative h-64 w-full overflow-hidden">
                {property.main_image_url ? (
                    <>
                        <Image
                            src={getMediaUrl(property.main_image_url)}
                            alt={property.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Forest tint overlay — 20% on hover */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ backgroundColor: 'rgba(38,81,64,0.20)' }}
                        />
                    </>
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center italic text-sm"
                        style={{ backgroundColor: '#e6e3d7', color: 'rgba(75,61,28,0.40)' }}
                    >
                        No image available
                    </div>
                )}
                {/* Featured Badge */}
                {property.featured && (
                    <div
                        className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm"
                        style={{
                            backgroundColor: '#cfbb9b',
                            color: '#4b3d1c',
                            fontFamily: "'Berlin Sans', sans-serif",
                        }}
                    >
                        Featured
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3
                        className="text-xl font-bold"
                        style={{ color: '#4b3d1c', fontFamily: "'Berlin Sans', sans-serif" }}
                    >
                        {property.name}
                    </h3>
                    <span className="text-right ml-2 flex-shrink-0">
                        <span
                            className="text-lg font-bold block"
                            style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}
                        >
                            {formatCOP(property.nightly_price)}
                        </span>
                        <span
                            className="text-xs"
                            style={{ color: 'rgba(75,61,28,0.50)', fontFamily: "'MegantZ', serif" }}
                        >
                            / {dict.night}
                        </span>
                    </span>
                </div>

                {/* Location */}
                <p
                    className="text-sm mb-4 flex items-center gap-1.5"
                    style={{ color: 'rgba(75,61,28,0.60)', fontFamily: "'MegantZ', serif" }}
                >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#527858' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.city}, {property.country}
                </p>

                {/* Guests */}
                <div className="flex items-center gap-4 text-sm mb-6">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#527858' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span style={{ color: 'rgba(75,61,28,0.70)' }}>
                            {dict.guests.replace("{count}", property.max_guests.toString())}
                        </span>
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {/* View Details — forest outline */}
                    <Link href={`/${lang}/property/${property.slug}`} className="flex-1" id={`card-view-${property.id}`}>
                        <button
                            className="w-full py-2.5 px-4 rounded-sm text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
                            style={{
                                border: '1.5px solid #265140',
                                color: '#265140',
                                backgroundColor: 'transparent',
                                fontFamily: "'Berlin Sans', sans-serif",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = '#265140';
                                (e.currentTarget as HTMLElement).style.color = '#e6e3d7';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = '#265140';
                            }}
                        >
                            {dict.view_details}
                        </button>
                    </Link>

                    {/* WhatsApp — sand button */}
                    <button
                        className="flex-1 py-2.5 px-4 rounded-sm text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
                        style={{
                            backgroundColor: '#25D366',
                            color: '#ffffff',
                            fontFamily: "'Berlin Sans', sans-serif",
                        }}
                        onClick={() => onWhatsAppClick(property.id)}
                        id={`card-whatsapp-${property.id}`}
                    >
                        {dict.whatsapp}
                    </button>
                </div>
            </div>
        </div>
    );
};
