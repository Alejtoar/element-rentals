"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { api, getAuthToken } from "@/api/client";
import { User } from "@/types";

interface AdminLayoutProps {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
    const { lang } = use(params);
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = getAuthToken();

            // If no token and not on login page, redirect to login
            if (!token && !pathname.includes('/admin/login')) {
                router.push(`/${lang}/admin/login`);
                return;
            }

            // If on login page and has token, redirect to properties
            if (token && pathname.includes('/admin/login')) {
                router.push(`/${lang}/admin/properties`);
                return;
            }

            // If has token and not on login page, verify it
            if (token && !pathname.includes('/admin/login')) {
                try {
                    const currentUser = await api.auth.getCurrentUser();
                    setUser(currentUser);
                } catch (error) {
                    // Token is invalid, redirect to login
                    api.auth.logout();
                    router.push(`/${lang}/admin/login`);
                    return;
                }
            }

            setIsLoading(false);
        };

        checkAuth();
    }, [pathname, lang, router]);

    const handleLogout = () => {
        api.auth.logout();
        router.push(`/${lang}/admin/login`);
    };

    // Don't show sidebar on login page
    if (pathname.includes('/admin/login')) {
        return <>{children}</>;
    }

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const navItems = [
        {
            name: "Properties",
            href: `/${lang}/admin/properties`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: "Leads",
            href: `/${lang}/admin/leads`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            name: "Settings",
            href: `/${lang}/admin/settings`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-700/50">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Elemnt
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Admin Portal</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-slate-700/50">
                    {user && (
                        <div className="mb-3 px-4 py-2 bg-slate-700/30 rounded-lg">
                            <p className="text-sm font-medium text-slate-200">{user.full_name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                            <p className="text-xs text-purple-400 mt-1 capitalize">{user.role}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
