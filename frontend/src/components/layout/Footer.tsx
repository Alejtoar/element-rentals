import React from "react";
import Link from "next/link";

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
    return (
        <footer className="relative mt-20 pb-12 pt-20 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="glass rounded-[40px] p-8 md:p-12 border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Background Glows */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] -z-10" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        {/* Brand Section */}
                        <div className="lg:col-span-2">
                            <Link href={`/${lang}`} className="text-3xl font-black tracking-tighter mb-4 block">
                                ELEMNT<span className="text-primary">.</span>
                            </Link>
                            <p className="text-foreground/60 max-w-sm mb-6">
                                {dict.tagline}
                            </p>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-foreground/80">Social</h4>
                            <ul className="space-y-4 text-foreground/60">
                                <li>
                                    <a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-primary/0 group-hover:bg-primary rounded-full transition-all" />
                                        {dict.social.instagram}
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-primary/0 group-hover:bg-primary rounded-full transition-all" />
                                        {dict.social.facebook}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Portal & Legal */}
                        <div>
                            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-foreground/80">Portal</h4>
                            <ul className="space-y-4 text-foreground/60">
                                <li>
                                    <a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-primary/0 group-hover:bg-primary rounded-full transition-all" />
                                        {dict.social.privacy}
                                    </a>
                                </li>
                                <li>
                                    <Link href={`/${lang}/admin/login`} className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-all text-sm font-bold shadow-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        {dict.admin_login}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-sm text-foreground/40">
                            {dict.rights}
                        </div>
                        <div className="flex gap-4 opacity-30">
                            <div className="w-10 h-6 bg-foreground/20 rounded-md" />
                            <div className="w-10 h-6 bg-foreground/20 rounded-md" />
                            <div className="w-10 h-6 bg-foreground/20 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
