"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { User } from "@/types";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
            setError("All fields are required");
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
            setSuccess("Password updated successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-slate-400">Manage your account and preferences</p>
            </div>

            <div className="max-w-2xl space-y-6">
                {user && (
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                        <div className="space-y-3">
                            <div>
                                <div className="text-slate-400 text-sm">Full Name</div>
                                <div className="text-white font-medium">{user.full_name}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Email</div>
                                <div className="text-white font-medium">{user.email}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Role</div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                                        user.role === 'finance' ? 'bg-green-500/20 text-green-300' :
                                            'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>

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
                            <label className="block text-sm font-medium text-slate-300 mb-2">Current Password *</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                placeholder="Enter your current password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">New Password *</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                placeholder="Enter new password (min. 8 characters)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password *</label>
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
