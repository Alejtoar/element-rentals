"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const GlobalBackground: React.FC = () => {
    const pathname = usePathname();
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentStage, setCurrentStage] = useState<0 | 1 | 2 | 3>(0);

    useEffect(() => {
        let newStage: 0 | 1 | 2 | 3 = 1;
        const segments = pathname.split('/').filter(Boolean);
        const relativePath = segments.slice(1).join('/');

        if (relativePath === "" || relativePath === "/") {
            newStage = 1;
        } else if (relativePath.startsWith('property/')) {
            newStage = 2;
        } else if (relativePath.startsWith('admin')) {
            newStage = 0; // flat for admin
        } else if (relativePath.startsWith('partners') || relativePath.startsWith('owner')) {
            newStage = 3;
        } else {
            newStage = 1;
        }

        if (newStage !== currentStage) {
            setIsLoaded(false);
            setCurrentStage(newStage);
        }
    }, [pathname, currentStage]);

    const hasImage = currentStage > 0;
    const desktopSrc = hasImage ? `/bg-s${currentStage}-desktop.webp` : "";
    const mobileSrc = hasImage ? `/bg-s${currentStage}-mob.webp` : "";

    // For admin: dark base. For all public pages: brand-bone base.
    const isAdmin = currentStage === 0;

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {/* Base color layer */}
            <div
                className="absolute inset-0 transition-colors duration-700"
                style={{ backgroundColor: isAdmin ? '#020617' : '#e6e3d7' }}
            />

            {/* Background image (when available) */}
            {hasImage && (
                <div
                    className={`relative w-full h-full transition-all duration-1000 ease-in-out ${isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-2xl"}`}
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

            {/* Overlay gradient — warm organic for public, dark for admin */}
            <div
                className="absolute inset-0 z-10 transition-colors duration-700"
                style={isAdmin
                    ? { background: 'linear-gradient(to bottom, rgba(2,6,23,0.2), rgba(2,6,23,0.6))' }
                    : {
                        background: hasImage
                            ? 'linear-gradient(to bottom, rgba(38,81,64,0.15), rgba(230,227,215,0.70))'
                            : 'rgba(230,227,215,0.0)'
                    }
                }
            />

            {/* Subtle olive-tinted ambient glows (public only) */}
            {!isAdmin && (
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                    <div
                        className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full animate-pulse"
                        style={{
                            backgroundColor: 'rgba(82, 120, 88, 0.06)',
                            filter: 'blur(100px)',
                            animationDuration: '10s',
                        }}
                    />
                    <div
                        className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full animate-pulse"
                        style={{
                            backgroundColor: 'rgba(207, 187, 155, 0.08)',
                            filter: 'blur(100px)',
                            animationDuration: '14s',
                            animationDelay: '3s',
                        }}
                    />
                </div>
            )}

            {/* Admin glow accents (dark mode) */}
            {isAdmin && (
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[10%] -right-[10%] w-[70%] h-[70%] bg-primary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute -bottom-[10%] -left-[10%] w-[70%] h-[70%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
                </div>
            )}
        </div>
    );
};
