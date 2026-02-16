import React from "react";
import Link from "next/link";
import { Property } from "@/types";
import { Button } from "./Button";
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
        <div className="premium-card bg-background/40 glass">
            <div className="relative h-64 w-full">
                {property.main_image_url ? (
                    <Image
                        src={getMediaUrl(property.main_image_url)}
                        alt={property.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                        <span className="text-foreground/20 italic">No image available</span>
                    </div>
                )}
                {property.featured && (
                    <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                        Featured
                    </div>
                )}
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{property.name}</h3>
                    <span className="text-primary font-bold text-lg">
                        {formatCOP(property.nightly_price)} <span className="text-xs text-foreground/60 font-medium">/ {dict.night}</span>
                    </span>
                </div>
                <p className="text-foreground/60 text-sm mb-4 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.city}, {property.country}
                </p>
                <div className="flex items-center gap-4 text-sm text-foreground/80 mb-6">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {dict.guests.replace("{count}", property.max_guests.toString())}
                    </span>
                </div>
                <div className="flex gap-2">
                    <Link href={`/${lang}/property/${property.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-full">{dict.view_details}</Button>
                    </Link>
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600 shadow-green-500/20"
                        onClick={() => onWhatsAppClick(property.id)}
                    >
                        {dict.whatsapp}
                    </Button>
                </div>
            </div>
        </div>
    );
};

