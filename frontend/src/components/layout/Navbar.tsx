"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavbarProps {
    lang: string;
    dict?: {
        nav_home?: string;
        nav_properties?: string;
        nav_partners?: string;
    };
}

export const Navbar: React.FC<NavbarProps> = ({ lang, dict }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Check if on admin page — don't render Navbar at all
    if (pathname.includes('/admin')) return null;

    const navLinks = [
        { href: `/${lang}`, label: dict?.nav_home || (lang === 'es' ? 'Inicio' : 'Home') },
        { href: `/${lang}#property-catalog`, label: dict?.nav_properties || (lang === 'es' ? 'Propiedades' : 'Properties') },
        { href: `/${lang}/partners`, label: dict?.nav_partners || (lang === 'es' ? 'Socios' : 'Partners') },
    ];

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
            style={{
                backgroundColor: scrolled ? '#265140' : 'rgba(38, 81, 64, 0.0)',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                boxShadow: scrolled ? '0 4px 20px rgba(75,61,28,0.20)' : 'none',
            }}
        >
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href={`/${lang}`} className="flex items-center gap-3 group" id="navbar-logo-link">
                    <div className="relative h-10 w-40 transition-transform duration-300 group-hover:scale-105">
                        <Image
                            src="/images/brand/Logo_principal_blanco.png"
                            alt="Elemnt Rentals"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium tracking-wider uppercase transition-colors duration-200"
                            style={{
                                color: '#e6e3d7',           /* brand-bone */
                                fontFamily: 'Berlin Sans, sans-serif',
                            }}
                            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#cfbb9b'; }}
                            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#e6e3d7'; }}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Language Switcher */}
                    <div className="flex items-center gap-2">
                        <Link
                            href={pathname.replace(/^\/(en|es)/, '/es')}
                            className={`text-xs font-bold tracking-widest uppercase transition-colors duration-200 px-2 py-1 rounded ${lang === 'es' ? 'text-brand-sand border border-brand-sand/40' : 'text-brand-bone/60 hover:text-brand-sand'}`}
                            style={{ color: lang === 'es' ? '#cfbb9b' : 'rgba(230,227,215,0.6)', fontFamily: 'Berlin Sans, sans-serif' }}
                        >
                            ES
                        </Link>
                        <span style={{ color: 'rgba(207,187,155,0.4)' }}>|</span>
                        <Link
                            href={pathname.replace(/^\/(en|es)/, '/en')}
                            className="text-xs font-bold tracking-widest uppercase transition-colors duration-200 px-2 py-1 rounded"
                            style={{ color: lang === 'en' ? '#cfbb9b' : 'rgba(230,227,215,0.6)', fontFamily: 'Berlin Sans, sans-serif' }}
                        >
                            EN
                        </Link>
                    </div>
                </nav>

                {/* Mobile: Hamburger */}
                <button
                    id="navbar-mobile-toggle"
                    className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors duration-200"
                    style={{ color: '#cfbb9b' }}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div
                    className="md:hidden px-6 pb-6 pt-2 space-y-4"
                    style={{ backgroundColor: '#265140' }}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-base font-medium tracking-wider uppercase transition-colors duration-200 py-2"
                            style={{ color: '#e6e3d7', fontFamily: 'Berlin Sans, sans-serif' }}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: 'rgba(207,187,155,0.2)' }}>
                        <Link href={pathname.replace(/^\/(en|es)/, '/es')} onClick={() => setMenuOpen(false)}
                            style={{ color: lang === 'es' ? '#cfbb9b' : 'rgba(230,227,215,0.6)', fontFamily: 'Berlin Sans, sans-serif' }}
                            className="text-xs font-bold tracking-widest uppercase">ES</Link>
                        <span style={{ color: 'rgba(207,187,155,0.4)' }}>|</span>
                        <Link href={pathname.replace(/^\/(en|es)/, '/en')} onClick={() => setMenuOpen(false)}
                            style={{ color: lang === 'en' ? '#cfbb9b' : 'rgba(230,227,215,0.6)', fontFamily: 'Berlin Sans, sans-serif' }}
                            className="text-xs font-bold tracking-widest uppercase">EN</Link>
                    </div>
                </div>
            )}
        </header>
    );
};
