"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export const GlobalBackground: React.FC = () => {
    const pathname = usePathname();
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentStage, setCurrentStage] = useState<0 | 1 | 2 | 3>(0); // Start at 0 to force first load detection

    // Determine stage based on route
    useEffect(() => {
        let newStage: 0 | 1 | 2 | 3 = 1;

        // Pathname parsing (friendly with i18n)
        const segments = pathname.split('/').filter(Boolean);
        const relativePath = segments.slice(1).join('/');

        if (relativePath === "" || relativePath === "/") {
            newStage = 1; // Stage 1 for Landing Page
        } else if (relativePath.startsWith('property/')) {
            newStage = 2; // Stage 2 for Property Details
        } else if (relativePath.startsWith('admin')) {
            newStage = 0; // Stage 0 (flat dark) for Admin Portal
        } else if (relativePath.startsWith('partners') || relativePath.startsWith('owner')) {
            newStage = 3; // Stage 3 for Future Partner pages
        } else {
            newStage = 1; // Default fallback
        }

        if (newStage !== currentStage) {
            setIsLoaded(false);
            setCurrentStage(newStage);
        }
    }, [pathname, currentStage]);

    // Construct image sources
    const hasImage = currentStage > 0;
    const desktopSrc = hasImage ? `/bg-s${currentStage}-desktop.webp` : "";
    const mobileSrc = hasImage ? `/bg-s${currentStage}-mob.webp` : "";

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {/* Base color / Admin Background */}
            <div className="absolute inset-0 bg-[#020617]" />

            {/* Background Image Layer */}
            {hasImage && (
                <div
                    className={`relative w-full h-full transition-all duration-1000 ease-in-out ${isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-2xl"
                        }`}
                >
                    <picture>
                        <source media="(max-width: 768px)" srcSet={mobileSrc} />
                        <img
                            src={desktopSrc}
                            alt=""
                            className="w-full h-full object-cover"
                            onLoad={() => setIsLoaded(true)}
                        />
                    </picture>
                </div>
            )}

            {/* Premium Overlays */}
            {/* 1. Darkening Gradient - Stronger on non-image pages */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${hasImage
                    ? "bg-gradient-to-b from-black/20 via-black/40 to-[#020617]/80"
                    : "bg-[#020617]/40"
                } z-10`} />

            {/* 2. Animated Glow Accents */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -right-[10%] w-[70%] h-[70%] bg-primary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute -bottom-[10%] -left-[10%] w-[70%] h-[70%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
            </div>

            {/* 3. Subtle Grain Texture */}
            <div className="absolute inset-0 z-30 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};
