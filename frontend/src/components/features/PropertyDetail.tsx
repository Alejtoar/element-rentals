"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Property } from "@/types";
import { api } from "@/api/client";
import { getMediaUrl } from "@/lib/media";

interface PropertyDetailProps {
    property: Property;
    dict: any;
    lang: "en" | "es";
}

export default function PropertyDetail({ property, dict, lang }: PropertyDetailProps) {
    const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>(getMediaUrl(property.main_image_url));

    useEffect(() => {
        if (property.main_image_url) {
            setSelectedImage(getMediaUrl(property.main_image_url));
        }
    }, [property.main_image_url]);

    useEffect(() => {
        const fetchWhatsapp = async () => {
            try {
                const response = await api.whatsapp.getPropertyLink(property.id, lang, "PropertyDetail");
                setWhatsappUrl(response.url);
            } catch (error) {
                console.error("Error fetching WhatsApp link:", error);
            }
        };
        fetchWhatsapp();
    }, [property.id, lang]);

    const images = property.images || [];

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            {/* Navigation */}
            <nav className="mb-8">
                <Link
                    href={`/${lang}`}
                    className="text-primary hover:text-primary-dark transition-colors flex items-center gap-2 font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {dict.property_detail.back_to_catalog}
                </Link>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-video lg:aspect-square rounded-3xl overflow-hidden glass shadow-premium">
                        {selectedImage ? (
                            <Image
                                src={selectedImage}
                                alt={property.name}
                                fill
                                className="object-cover transition-all duration-500"
                                priority
                                unoptimized={true}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                <span className="text-slate-400">No image available</span>
                            </div>
                        )}
                        {property.featured && (
                            <div className="absolute top-6 left-6 px-4 py-2 rounded-full glass backdrop-blur-md border-white/20 text-sm font-semibold text-primary">
                                {dict.catalog.featured_title}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                            {images.sort((a, b) => a.order - b.order).map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => setSelectedImage(getMediaUrl(img.url))}
                                    className={`relative aspect-square rounded-xl overflow-hidden glass border-2 transition-all ${selectedImage === getMediaUrl(img.url) ? "border-primary scale-95" : "border-transparent opacity-70 hover:opacity-100"
                                        }`}
                                >
                                    <Image
                                        src={getMediaUrl(img.url)}
                                        alt={`${property.name} thumbnail`}
                                        fill
                                        className="object-cover"
                                        unoptimized={true}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="flex flex-col justify-between">
                    <div>
                        <div className="mb-6">
                            <span className="text-primary font-bold tracking-widest uppercase text-sm">
                                {property.city}, {property.country}
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-bold mt-2 text-foreground">
                                {property.name}
                            </h1>
                        </div>

                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                            {property.description}
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="p-4 rounded-2xl glass border-border/50">
                                <span className="text-sm text-slate-500 block mb-1">{dict.property_detail.guests_label}</span>
                                <span className="text-xl font-semibold">{property.max_guests} {dict.property_card.guests.split('{count}')[1].trim()}</span>
                            </div>
                            <div className="p-4 rounded-2xl glass border-border/50 text-gradient font-bold">
                                <span className="text-sm text-slate-500 block mb-1">{dict.property_detail.price_label}</span>
                                <span className="text-xl">${property.nightly_price} / {dict.property_card.night}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {whatsappUrl && (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#25D366] hover:bg-[#20bd5c] text-white py-5 px-8 rounded-2xl font-bold text-center flex items-center justify-center gap-3 transition-all duration-300 shadow-xl hover:shadow-[#25D366]/20 transform hover:-translate-y-1"
                            >
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                {dict.property_detail.book_whatsapp}
                            </a>
                        )}

                        <button className="w-full bg-white dark:bg-slate-900 border-2 border-primary text-primary hover:bg-primary/5 py-5 px-8 rounded-2xl font-bold transition-all duration-300">
                            {dict.property_detail.inquire_now}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
