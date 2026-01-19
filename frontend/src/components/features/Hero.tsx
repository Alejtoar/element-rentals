import React from "react";
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
}

export const Hero: React.FC<HeroProps> = ({ dict }) => {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 text-center">
                <div className="animate-fade-in opacity-0">
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-primary/10 text-primary rounded-full">
                        {dict.badge}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter">
                        {dict.title1} <br />
                        <span className="text-gradient">{dict.title2}</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-foreground/60 mb-10">
                        {dict.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="min-w-[200px]">{dict.cta_browse}</Button>
                        <Button variant="outline" size="lg" className="min-w-[200px]">{dict.cta_list}</Button>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
};
