"use client";

import React, { useState, useEffect } from "react";
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
    // Collect all available images for slideshow
    const slideshowImages = React.useMemo(() => {
        const urls: string[] = [];
        if (property.main_image_url) urls.push(property.main_image_url);
        if (property.images && property.images.length > 0) {
            property.images.forEach(img => {
                if (img.url !== property.main_image_url) {
                    urls.push(img.url);
                }
            });
        }
        return urls;
    }, [property.main_image_url, property.images]);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    useEffect(() => {
        if (slideshowImages.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % slideshowImages.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [slideshowImages]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        // Swipe Left (Next)
        if (diff > 50) {
            setCurrentIdx((prev) => (prev + 1) % slideshowImages.length);
        } 
        // Swipe Right (Prev)
        else if (diff < -50) {
            setCurrentIdx((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
        }
        setTouchStartX(null);
    };

    return (
        <div
            className="group overflow-hidden transition-all duration-500 hover:-translate-y-1.5"
            style={{
                backgroundColor: '#f4f2eb',  /* brand-cream */
                borderRadius: '2px',          /* rounded-sm — architectural logo style */
                boxShadow: '0 4px 20px rgba(75, 61, 28, 0.08)',
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
            {/* Clickable Area: Image + Info */}
            <Link href={`/${lang}/property/${property.slug}`} className="block">
                {/* Image — with forest tint overlay on hover and slideshow */}
                <div 
                    className="relative h-64 w-full overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {slideshowImages.length > 0 ? (
                        <>
                            {slideshowImages.map((url, index) => (
                                <div 
                                    key={url}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIdx ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <Image
                                        src={getMediaUrl(url)}
                                        alt={`${property.name} - ${index}`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        priority={index === 0}
                                    />
                                </div>
                            ))}
                            {/* Forest tint overlay — 20% on hover */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{ backgroundColor: 'rgba(38,81,64,0.20)' }}
                            />
                            
                            {/* Slideshow indicators (optional, but good for UX) */}
                            {slideshowImages.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                    {slideshowImages.map((_, i) => (
                                        <div 
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                                            style={{ 
                                                backgroundColor: i === currentIdx ? '#cfbb9b' : 'rgba(230,227,215,0.5)',
                                                width: i === currentIdx ? '12px' : '6px'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center italic text-sm"
                            style={{ backgroundColor: '#e6e3d7', color: 'rgba(75, 61, 28, 0.40)' }}
                        >
                            No image available
                        </div>
                    )}
                    {/* Featured Badge */}
                    {property.featured && (
                        <div
                            className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm z-10"
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

                {/* Card Body (Info) */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex flex-col mb-4">
                    <h3
                        className="text-xl font-bold mb-1"
                        style={{ color: '#4b3d1c', fontFamily: "'Berlin Sans', sans-serif" }}
                    >
                        {property.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                        <span
                            className="text-lg font-bold"
                            style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}
                        >
                            {formatCOP(property.nightly_price)}
                        </span>
                        <span
                            className="text-xs"
                            style={{ color: 'rgba(75, 61, 28, 0.50)', fontFamily: "'MegantZ', serif" }}
                        >
                            / {dict.night}
                        </span>
                    </div>
                </div>

                {/* Location */}
                <p
                    className="text-sm mb-4 flex items-center gap-1.5"
                    style={{ color: 'rgba(75, 61, 28, 0.60)', fontFamily: "'MegantZ', serif" }}
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
                        <span style={{ color: 'rgba(75, 61, 28, 0.70)' }}>
                            {dict.guests.replace("{count}", property.max_guests.toString())}
                        </span>
                    </span>
                </div>
                </div>
            </Link>

            {/* Actions */}
            <div className="px-6 pb-6 mt-1">
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

