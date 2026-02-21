"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

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
        // Smooth scroll to catalog
        const catalogSection = document.getElementById('property-catalog');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Animated gradient accents */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 text-center">
                <div className="animate-fade-in opacity-0">
                    {/* Glassmorphism badge */}
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg">
                        {dict.badge}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter text-white drop-shadow-2xl">
                        {dict.title1} <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                            {dict.title2}
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-white/90 mb-10 drop-shadow-lg">
                        {dict.subtitle}
                    </p>

                    {/* Date Range Search Card */}
                    {catalogDict && (
                        <form
                            onSubmit={handleSearch}
                            className="max-w-2xl mx-auto mb-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl"
                        >
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-4">
                                {catalogDict.filter_dates || "Travel Dates"}
                            </p>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative group">
                                    <label className="block text-white/60 text-xs mb-1 text-left pl-1">
                                        {catalogDict.filter_check_in}
                                    </label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                            className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all [color-scheme:dark] text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="hidden md:flex items-end pb-3">
                                    <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                                <div className="flex-1 relative group">
                                    <label className="block text-white/60 text-xs mb-1 text-left pl-1">
                                        {catalogDict.filter_check_out}
                                    </label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            type="date"
                                            id="hero-check-out"
                                            value={checkOut}
                                            min={checkIn || today}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all [color-scheme:dark] text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        id="hero-search-btn"
                                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-pink-500/25 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm whitespace-nowrap flex-shrink-0"
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

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="min-w-[200px] bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 shadow-xl"
                            onClick={handleBrowseCatalog}
                        >
                            {dict.cta_browse}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="min-w-[200px] bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/15 shadow-xl"
                            onClick={handleListProperty}
                        >
                            {dict.cta_list}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-60">
                <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
};
