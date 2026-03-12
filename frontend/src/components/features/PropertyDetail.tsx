"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Property } from "@/types";
import { api } from "@/api/client";
import { getMediaUrl } from "@/lib/media";
import { formatCOP } from "@/lib/currency";
import AvailabilityCalendar from "./AvailabilityCalendar";

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

    const availabilityDict = {
        availability_title: dict.property_detail?.availability_title || "Availability Calendar",
        availability_subtitle: dict.property_detail?.availability_subtitle || "Red dates are unavailable. Green dates are open.",
        availability_loading: dict.property_detail?.availability_loading || "Loading availability...",
        availability_error: dict.property_detail?.availability_error || "Could not load availability.",
        booked: dict.property_detail?.booked || "Booked",
        available: dict.property_detail?.available || "Available",
    };

    return (
        <div
            className="max-w-7xl mx-auto animate-fade-in"
            style={{ backgroundColor: 'transparent' }}
        >
            {/* Breadcrumb Navigation */}
            <nav className="mb-8">
                <Link
                    href={`/${lang}`}
                    className="flex items-center gap-2 font-medium text-sm uppercase tracking-wider transition-colors duration-200 w-fit"
                    style={{ color: '#527858', fontFamily: "'Berlin Sans', sans-serif" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#265140'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#527858'; }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {dict.property_detail.back_to_catalog}
                </Link>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Gallery + Availability */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Main Image — rounded-sm with forest hover overlay */}
                    <div
                        className="relative aspect-video rounded-sm overflow-hidden group"
                        style={{ boxShadow: '0 4px 20px rgba(75,61,28,0.12)' }}
                    >
                        {selectedImage ? (
                            <>
                                <Image
                                    src={selectedImage}
                                    alt={property.name}
                                    fill
                                    className="object-cover transition-all duration-500 group-hover:scale-[1.02]"
                                    priority
                                />
                                {/* Forest overlay on hover */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ backgroundColor: 'rgba(38,81,64,0.20)' }}
                                />
                            </>
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-sm italic"
                                style={{ backgroundColor: '#e6e3d7', color: 'rgba(75,61,28,0.40)' }}
                            >
                                No image available
                            </div>
                        )}
                        {property.featured && (
                            <div
                                className="absolute top-6 left-6 px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider"
                                style={{
                                    backgroundColor: '#cfbb9b',
                                    color: '#4b3d1c',
                                    fontFamily: "'Berlin Sans', sans-serif",
                                }}
                            >
                                {dict.catalog.featured_title}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                            {images.sort((a, b) => a.order - b.order).map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => setSelectedImage(getMediaUrl(img.url))}
                                    className="relative aspect-square rounded-sm overflow-hidden transition-all duration-200"
                                    style={{
                                        border: selectedImage === getMediaUrl(img.url)
                                            ? '2px solid #265140'
                                            : '2px solid transparent',
                                        opacity: selectedImage === getMediaUrl(img.url) ? 1 : 0.65,
                                        boxShadow: '0 2px 8px rgba(75,61,28,0.08)',
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                                    onMouseLeave={(e) => {
                                        if (selectedImage !== getMediaUrl(img.url)) {
                                            (e.currentTarget as HTMLElement).style.opacity = '0.65';
                                        }
                                    }}
                                >
                                    <Image
                                        src={getMediaUrl(img.url)}
                                        alt={`${property.name} thumbnail`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Description — MegantZ magazine style */}
                    <div
                        className="rounded-sm p-8 mt-6"
                        style={{
                            backgroundColor: '#f4f2eb',
                            border: '1px solid rgba(82,120,88,0.15)',
                            boxShadow: '0 4px 20px rgba(75,61,28,0.06)',
                        }}
                    >
                        <h2
                            className="text-xl font-bold mb-4"
                            style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif", letterSpacing: '-0.01em' }}
                        >
                            {lang === 'es' ? 'Descripción' : 'Description'}
                        </h2>
                        <p
                            className="leading-loose"
                            style={{
                                fontFamily: "'MegantZ', serif",
                                lineHeight: '1.8',       /* magazine feel */
                                color: 'rgba(75,61,28,0.75)',
                                fontSize: '1.0625rem',
                            }}
                        >
                            {property.description}
                        </p>
                    </div>

                    {/* Availability Calendar */}
                    <div className="mt-6">
                        <AvailabilityCalendar
                            propertyId={property.id}
                            dict={availabilityDict}
                        />
                    </div>
                </div>

                {/* Right Column: Sticky Booking Widget */}
                <div className="lg:col-span-1">
                    <div
                        className="sticky top-24 rounded-sm overflow-hidden"
                        style={{
                            backgroundColor: '#265140',  /* brand-forest */
                            boxShadow: '0 8px 30px rgba(38,81,64,0.30)',
                        }}
                    >
                        {/* Widget Header */}
                        <div className="p-6 pb-4">
                            {/* Location tag */}
                            <span
                                className="text-xs font-bold tracking-widest uppercase block mb-3"
                                style={{ color: 'rgba(207,187,155,0.70)', fontFamily: "'Berlin Sans', sans-serif" }}
                            >
                                {property.city}, {property.country}
                            </span>

                            {/* Property Name */}
                            <h1
                                className="text-2xl font-bold mb-5"
                                style={{ color: '#e6e3d7', fontFamily: "'Berlin Sans', sans-serif", letterSpacing: '-0.01em' }}
                            >
                                {property.name}
                            </h1>

                            {/* Price Highlight — Sand colored, Berlin Sans */}
                            <div
                                className="p-4 rounded-sm mb-5"
                                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(207,187,155,0.15)' }}
                            >
                                <span
                                    className="text-sm block mb-1"
                                    style={{ color: 'rgba(230,227,215,0.60)', fontFamily: "'MegantZ', serif" }}
                                >
                                    {dict.property_detail.price_label}
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className="text-3xl font-bold"
                                        style={{ color: '#cfbb9b', fontFamily: "'Berlin Sans', sans-serif" }}  /* brand-sand */
                                    >
                                        {formatCOP(property.nightly_price)}
                                    </span>
                                    <span
                                        className="text-sm"
                                        style={{ color: 'rgba(230,227,215,0.50)', fontFamily: "'MegantZ', serif" }}
                                    >
                                        / {dict.property_card.night}
                                    </span>
                                </div>
                            </div>

                            {/* Guests */}
                            <div
                                className="p-4 rounded-sm"
                                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(207,187,155,0.10)' }}
                            >
                                <span
                                    className="text-sm block mb-1"
                                    style={{ color: 'rgba(230,227,215,0.60)', fontFamily: "'MegantZ', serif" }}
                                >
                                    {dict.property_detail.guests_label}
                                </span>
                                <span
                                    className="text-xl font-bold"
                                    style={{ color: '#e6e3d7', fontFamily: "'Berlin Sans', sans-serif" }}
                                >
                                    {property.max_guests} {dict.property_card.guests.split('{count}')[1].trim()}
                                </span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="p-6 pt-4 space-y-3">
                            {/* WhatsApp — Sand background with olive text */}
                            {whatsappUrl && (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    id="property-book-whatsapp"
                                    className="w-full py-4 px-6 rounded-sm font-bold uppercase tracking-wider text-center flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] block"
                                    style={{
                                        backgroundColor: '#cfbb9b',  /* brand-sand */
                                        color: '#4b3d1c',             /* brand-olive */
                                        fontFamily: "'Berlin Sans', sans-serif",
                                        boxShadow: '0 4px 16px rgba(207,187,155,0.25)',
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#baa786'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#cfbb9b'; }}
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    {dict.property_detail.book_whatsapp}
                                </a>
                            )}

                            {/* Inquire — ghost button */}
                            <button
                                id="property-inquire-btn"
                                className="w-full py-4 px-6 rounded-sm font-bold uppercase tracking-wider text-center transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                    backgroundColor: 'transparent',
                                    border: '1.5px solid rgba(207,187,155,0.40)',
                                    color: '#e6e3d7',
                                    fontFamily: "'Berlin Sans', sans-serif",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#cfbb9b';
                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(207,187,155,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(207,187,155,0.40)';
                                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                }}
                            >
                                {dict.property_detail.inquire_now}
                            </button>
                        </div>

                        {/* Amenities note */}
                        <div
                            className="px-6 pb-6 pt-2"
                            style={{ borderTop: '1px solid rgba(207,187,155,0.10)' }}
                        >
                            <p
                                className="text-xs text-center leading-relaxed mt-4"
                                style={{ color: 'rgba(230,227,215,0.40)', fontFamily: "'MegantZ', serif" }}
                            >
                                {lang === 'es' ? 'Comunícate para confirmar disponibilidad' : 'Contact us to confirm availability'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
