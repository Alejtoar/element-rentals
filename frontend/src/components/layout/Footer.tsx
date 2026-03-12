"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface FooterProps {
    dict: {
        rights: string;
        tagline: string;
        admin_login: string;
        social: {
            instagram: string;
            facebook: string;
            privacy: string;
        };
    };
    lang: string;
}

export const Footer: React.FC<FooterProps> = ({ dict, lang }) => {
    const pathname = usePathname();
    if (pathname.includes('/admin')) return null;

    return (
        <footer
            className="relative mt-20 pb-12 pt-20 overflow-hidden"
            style={{ backgroundColor: '#e6e3d7' }} /* brand-bone */
        >
            {/* Subtle top border */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ backgroundColor: 'rgba(75,61,28,0.10)' }}
            />

            <div className="container mx-auto px-6">
                <div
                    className="rounded-sm p-8 md:p-12 relative overflow-hidden"
                    style={{
                        backgroundColor: '#f4f2eb',
                        boxShadow: '0 4px 20px rgba(75,61,28,0.08)',
                        border: '1px solid rgba(82,120,88,0.15)',
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        {/* Brand Section */}
                        <div className="lg:col-span-2">
                            <Link href={`/${lang}`} className="block mb-6 footer-logo-link w-fit" id="footer-logo-link">
                                <div className="relative h-14 w-52">
                                    <Image
                                        src="/images/brand/Logo_colores_principales.png"
                                        alt="Elemnt Rentals"
                                        fill
                                        className="object-contain object-left"
                                    />
                                </div>
                            </Link>
                            <p
                                className="max-w-sm mb-6 leading-relaxed"
                                style={{ color: 'rgba(75,61,28,0.70)', fontFamily: "'MegantZ', serif" }}
                            >
                                {dict.tagline}
                            </p>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h4
                                className="mb-6 text-xs uppercase tracking-widest font-bold"
                                style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}
                            >
                                Social
                            </h4>
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-social-link flex items-center gap-2 transition-colors duration-200"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#cfbb9b' }} />
                                        {dict.social.instagram}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-social-link flex items-center gap-2 transition-colors duration-200"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#cfbb9b' }} />
                                        {dict.social.facebook}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Portal & Legal */}
                        <div>
                            <h4
                                className="mb-6 text-xs uppercase tracking-widest font-bold"
                                style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}
                            >
                                Portal
                            </h4>
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href="#"
                                        className="footer-social-link flex items-center gap-2 transition-colors duration-200"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#cfbb9b' }} />
                                        {dict.social.privacy}
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href={`/${lang}/admin/login`}
                                        id="footer-admin-link"
                                        className="footer-admin-link inline-flex items-center gap-2 py-2 px-4 rounded-sm text-sm font-bold shadow-sm transition-all duration-200"
                                        style={{
                                            backgroundColor: 'rgba(38,81,64,0.08)',
                                            border: '1px solid rgba(38,81,64,0.20)',
                                            color: '#265140',
                                            fontFamily: "'Berlin Sans', sans-serif",
                                        }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        {dict.admin_login}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div
                        className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6"
                        style={{ borderTop: '1px solid rgba(82,120,88,0.15)' }}
                    >
                        <div
                            className="text-sm"
                            style={{ color: 'rgba(75,61,28,0.45)', fontFamily: "'MegantZ', serif" }}
                        >
                            {dict.rights}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#265140' }} />
                            <span
                                className="text-xs tracking-widest uppercase"
                                style={{ color: 'rgba(75,61,28,0.40)', fontFamily: "'Berlin Sans', sans-serif" }}
                            >
                                Elemnt Rentals
                            </span>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#cfbb9b' }} />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
