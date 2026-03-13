"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface HeroProps {
    dict: {
        badge: string;
        title1: string;
        title2: string;
        subtitle: string;
        cta_browse: string;
        cta_list: string;
    };
    catalogDict?: {
        filter_check_in: string;
        filter_check_out: string;
        filter_search: string;
        filter_dates?: string;
    };
    lang: string;
    onSearch?: (checkIn: string, checkOut: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ dict, catalogDict, lang, onSearch }) => {
    const router = useRouter();
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const handleBrowseCatalog = () => {
        const catalogSection = document.getElementById('property-catalog');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleListProperty = () => {
        router.push(`/${lang}/partners`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(checkIn, checkOut);
        }
        const catalogSection = document.getElementById('property-catalog');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <section
            className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20"
            style={{ backgroundColor: 'rgba(38,81,64,0.03)' }}
        >
            {/* Ambient nature glows */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div
                    className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full"
                    style={{ backgroundColor: 'rgba(82,120,88,0.08)', filter: 'blur(100px)' }}
                />
                <div
                    className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full"
                    style={{ backgroundColor: 'rgba(207,187,155,0.10)', filter: 'blur(100px)' }}
                />
            </div>

            <div className="container mx-auto px-6 text-center">
                <div className="animate-fade-in opacity-0">
                    {/* Badge */}
                    <span
                        className="inline-block px-5 py-2 mb-8 text-xs font-bold tracking-widest uppercase rounded-full"
                        style={{
                            backgroundColor: 'rgba(38,81,64,0.10)',
                            border: '1px solid rgba(38,81,64,0.20)',
                            color: '#265140',
                            fontFamily: "'Berlin Sans', sans-serif",
                        }}
                    >
                        {dict.badge}
                    </span>

                    {/* Main Headline — Berlin Sans */}
                    <h1
                        className="text-3xl sm:text-4xl md:text-7xl font-extrabold mb-6"
                        style={{
                            fontFamily: "'Berlin Sans', sans-serif",
                            color: '#4b3d1c',       /* brand-olive (consistent with ELEMNT color) */
                            letterSpacing: '-0.02em',
                            lineHeight: 1.05,
                        }}
                    >
                        {dict.title1}{' '}
                        <br />
                        {dict.title2}
                    </h1>

                    {/* Subtitle — MegantZ */}
                    <p
                        className="max-w-4xl mx-auto mb-12"
                        style={{
                            // color: 'rgba(75,61,28,0.75)',  /* brand-olive 75% */
                            // color: '#4b3d1c',               /* brand-olive solid */
                            color: '#265140',               /* brand-forest (Verde Selva) */
                            fontWeight: 'bold',
                            fontFamily: "'MegantZ', serif",
                            fontSize: '1.65rem',            /* Increased another 2pt */
                            lineHeight: 1.8,                /* Slightly adjusted for bold text strength */
                        }}
                    >
                        {dict.subtitle}
                    </p>

                    {/* Date Range Search Card */}
                    {catalogDict && (
                        <form
                            onSubmit={handleSearch}
                            className="max-w-2xl mx-auto mb-12 rounded-sm p-6 shadow-brand"
                            style={{
                                backgroundColor: '#f4f2eb',   /* brand-cream */
                                border: '1px solid rgba(82,120,88,0.20)',
                                boxShadow: '0 4px 20px rgba(75,61,28,0.08)',
                            }}
                        >
                            <p
                                className="text-xs font-bold uppercase tracking-widest mb-5"
                                style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}
                            >
                                {catalogDict.filter_dates || (lang === 'es' ? 'Fechas de viaje' : 'Travel Dates')}
                            </p>
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Check-in */}
                                <div className="flex-1 relative">
                                    <label
                                        className="block text-xs mb-1.5 text-left pl-1"
                                        style={{ color: 'rgba(75,61,28,0.60)', fontFamily: "'Berlin Sans', sans-serif" }}
                                    >
                                        {catalogDict.filter_check_in}
                                    </label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#527858' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            type="date"
                                            id="hero-check-in"
                                            value={checkIn}
                                            min={today}
                                            onChange={(e) => {
                                                setCheckIn(e.target.value);
                                                if (checkOut && e.target.value >= checkOut) setCheckOut("");
                                            }}
                                            className="w-full pl-10 pr-3 py-3 rounded-sm text-sm transition-all"
                                            style={{
                                                backgroundColor: '#e6e3d7',
                                                border: '1px solid rgba(82,120,88,0.25)',
                                                color: '#4b3d1c',
                                                outline: 'none',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; e.target.style.boxShadow = '0 0 0 3px rgba(207,187,155,0.25)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                </div>

                                <div className="hidden md:flex items-end pb-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(75,61,28,0.30)' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>

                                {/* Check-out */}
                                <div className="flex-1 relative">
                                    <label
                                        className="block text-xs mb-1.5 text-left pl-1"
                                        style={{ color: 'rgba(75,61,28,0.60)', fontFamily: "'Berlin Sans', sans-serif" }}
                                    >
                                        {catalogDict.filter_check_out}
                                    </label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#527858' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            type="date"
                                            id="hero-check-out"
                                            value={checkOut}
                                            min={checkIn || today}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 rounded-sm text-sm transition-all"
                                            style={{
                                                backgroundColor: '#e6e3d7',
                                                border: '1px solid rgba(82,120,88,0.25)',
                                                color: '#4b3d1c',
                                                outline: 'none',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; e.target.style.boxShadow = '0 0 0 3px rgba(207,187,155,0.25)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                </div>

                                {/* Search Button */}
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        id="hero-search-btn"
                                        className="w-full md:w-auto px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-300 hover:scale-[1.02]"
                                        style={{
                                            backgroundColor: '#265140',  /* brand-forest */
                                            color: '#e6e3d7',             /* brand-bone */
                                            fontFamily: "'Berlin Sans', sans-serif",
                                            boxShadow: '0 4px 16px rgba(38,81,64,0.25)',
                                        }}
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a3a2d'; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#265140'; }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {catalogDict.filter_search}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/* Primary: Browse Catalog */}
                        <button
                            onClick={handleBrowseCatalog}
                            id="hero-browse-btn"
                            className="min-w-[200px] px-8 py-4 rounded-sm font-bold uppercase tracking-wider text-base transition-all duration-300 hover:scale-105"
                            style={{
                                backgroundColor: '#265140',
                                color: '#e6e3d7',
                                fontFamily: "'Berlin Sans', sans-serif",
                                boxShadow: '0 4px 16px rgba(38,81,64,0.25)',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#1a3a2d'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#265140'; }}
                        >
                            {dict.cta_browse}
                        </button>

                        {/* Secondary: List Property */}
                        <button
                            onClick={handleListProperty}
                            id="hero-list-btn"
                            className="min-w-[200px] px-8 py-4 rounded-sm font-bold uppercase tracking-wider text-base transition-all duration-300 hover:scale-105"
                            style={{
                                backgroundColor: '#cfbb9b',   /* brand-sand */
                                color: '#4b3d1c',              /* brand-olive */
                                fontFamily: "'Berlin Sans', sans-serif",
                                boxShadow: '0 4px 16px rgba(207,187,155,0.30)',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#baa786'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#cfbb9b'; }}
                        >
                            {dict.cta_list}
                        </button>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#265140' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
};
