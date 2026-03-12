"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/api/client";
import { User } from "@/types";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

interface SettingsPageProps {
    params: Promise<{ lang: string }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
    const { lang } = use(params);
    const [dict, setDict] = useState<any>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const loadDictionary = async () => {
            const dictionary = await getDictionary(lang as Locale);
            setDict(dictionary);
        };
        loadDictionary();
    }, [lang]);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const currentUser = await api.auth.getCurrentUser();
            setUser(currentUser);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError(dict?.admin?.common?.error || "All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long");
            return;
        }

        try {
            setLoading(true);
            await api.users.updateOwnPassword({
                old_password: oldPassword,
                new_password: newPassword,
            });
            setSuccess(dict?.admin?.common?.success || "Password updated successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!dict) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict.admin.settings.title}</h1>
                <p className="text-sm font-medium" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>Manage your account and preferences</p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* Quick Links Section */}
                {user && (user.role === 'admin' || user.role === 'finance') && (
                    <div className="rounded-sm p-6" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>Quick Links</h2>
                        <div className="space-y-2">
                            <Link
                                href={`/${lang}/admin/settings/financial`}
                                className="block px-4 py-3 rounded-sm transition-all duration-200"
                                style={{ backgroundColor: 'rgba(38,81,64,0.05)', border: '1px solid rgba(82,120,88,0.1)' }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict.admin.settings.financial}</div>
                                        <div className="text-sm font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{dict.admin.payment_methods.title}</div>
                                    </div>
                                    <svg className="w-5 h-5" style={{ color: '#527858' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Profile Information */}
                {user && (
                    <div className="rounded-sm p-6" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict.admin.settings.profile}</h2>
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict.admin.table.name}</div>
                                <div className="font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{user.full_name}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict.admin.table.email}</div>
                                <div className="font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{user.email}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict.admin.users.role}</div>
                                <span className="inline-block px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest"
                                    style={{
                                        color: user.role === 'admin' ? '#4b3d1c' : user.role === 'finance' ? '#527858' : '#265140',
                                        backgroundColor: user.role === 'admin' ? 'rgba(207,187,155,0.2)' : user.role === 'finance' ? 'rgba(82,120,88,0.1)' : 'rgba(38,81,64,0.05)',
                                        border: `1px solid ${user.role === 'admin' ? '#cfbb9b' : user.role === 'finance' ? '#527858' : '#265140'}`
                                    }}>
                                    {dict.admin.users[user.role] || user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Password */}
                <div className="rounded-sm p-6" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                    <h2 className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict.admin.settings.change_password}</h2>

                    {error && (
                        <div className="mb-4 p-4 rounded-sm text-sm font-medium" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 rounded-sm text-sm font-medium" style={{ backgroundColor: 'rgba(82,120,88,0.1)', border: '1px solid rgba(82,120,88,0.2)', color: '#527858' }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
                                {dict.admin.settings.old_password} *
                            </label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-sm outline-none"
                                style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                placeholder="Enter your current password"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
                                {dict.admin.users.new_password} *
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-sm outline-none"
                                style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                placeholder="Enter new password (min. 8 characters)"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
                                Confirm {dict.admin.users.new_password} *
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-sm outline-none"
                                style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                placeholder="Confirm your new password"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading} variant="sand">
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Security Tips */}
                <div className="rounded-sm p-6" style={{ backgroundColor: 'rgba(82,120,88,0.05)', border: '1px solid rgba(82,120,88,0.2)' }}>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>Security Tips</h3>
                    <ul className="space-y-2 text-sm font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                        <li>• Use a strong password with at least 8 characters</li>
                        <li>• Include uppercase, lowercase, numbers, and symbols</li>
                        <li>• Do not reuse passwords from other accounts</li>
                        <li>• Change your password regularly</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
