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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{dict.admin.settings.title}</h1>
                <p className="text-slate-400">Manage your account and preferences</p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* Quick Links Section */}
                {user && (user.role === 'admin' || user.role === 'finance') && (
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
                        <div className="space-y-2">
                            <Link
                                href={`/${lang}/admin/settings/financial`}
                                className="block px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white font-medium">{dict.admin.settings.financial}</div>
                                        <div className="text-slate-400 text-sm">{dict.admin.payment_methods.title}</div>
                                    </div>
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Profile Information */}
                {user && (
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">{dict.admin.settings.profile}</h2>
                        <div className="space-y-3">
                            <div>
                                <div className="text-slate-400 text-sm">{dict.admin.table.name}</div>
                                <div className="text-white font-medium">{user.full_name}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">{dict.admin.table.email}</div>
                                <div className="text-white font-medium">{user.email}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">{dict.admin.users.role}</div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                                    user.role === 'finance' ? 'bg-green-500/20 text-green-300' :
                                        'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {dict.admin.users[user.role] || user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Password */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">{dict.admin.settings.change_password}</h2>

                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {dict.admin.settings.old_password} *
                            </label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                placeholder="Enter your current password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {dict.admin.users.new_password} *
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                placeholder="Enter new password (min. 8 characters)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Confirm {dict.admin.users.new_password} *
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                placeholder="Confirm your new password"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Security Tips */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-blue-300 mb-3">Security Tips</h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
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
