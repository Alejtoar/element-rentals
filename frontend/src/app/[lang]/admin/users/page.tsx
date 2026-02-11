"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/api/client";
import { User, UserCreate, UserUpdate } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

export default function UsersPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params || {});
    const [dict, setDict] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [error, setError] = useState("");

    // Form states
    const [createForm, setCreateForm] = useState<UserCreate>({
        email: "",
        full_name: "",
        password: "",
        role: "staff",
    });

    const [editForm, setEditForm] = useState<UserUpdate>({
        email: "",
        full_name: "",
        role: "staff",
    });

    const [passwordForm, setPasswordForm] = useState({
        new_password: "",
        confirm_password: "",
    });

    useEffect(() => {
        const loadInit = async () => {
            if (lang) {
                const d = await getDictionary(lang as Locale);
                setDict(d);
            }
        };
        loadInit();
        loadUsers();
    }, [lang]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.users.getAll();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.users.create(createForm);
            setShowCreateModal(false);
            setCreateForm({ email: "", full_name: "", password: "", role: "staff" });
            loadUsers();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            await api.users.update(selectedUser.id, editForm);
            setShowEditModal(false);
            setSelectedUser(null);
            loadUsers();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setError(dict?.admin?.users?.passwords_mismatch || "Passwords do not match");
            return;
        }

        try {
            await api.users.resetPassword(selectedUser.id, {
                new_password: passwordForm.new_password,
            });
            setShowPasswordModal(false);
            setSelectedUser(null);
            setPasswordForm({ new_password: "", confirm_password: "" });
            setError("");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-500/20 text-purple-300';
            case 'finance': return 'bg-blue-500/20 text-blue-300';
            case 'staff': return 'bg-green-500/20 text-green-300';
            default: return 'bg-slate-500/20 text-slate-300';
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            email: user.email,
            full_name: user.full_name,
            role: user.role,
        });
        setShowEditModal(true);
    };

    const openPasswordModal = (user: User) => {
        setSelectedUser(user);
        setPasswordForm({ new_password: "", confirm_password: "" });
        setShowPasswordModal(true);
    };

    if (loading && !dict) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">{dict?.admin?.users?.title || "Users"}</h1>
                    <p className="text-slate-400 mt-1">{dict?.admin?.users?.subtitle || "Manage system users and permissions"}</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    {dict?.admin?.users?.add_user || "Create User"}
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-700/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.table?.name || "Name"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.table?.email || "Email"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.users?.role || "Role"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.table?.created_at || "Created"}</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">{dict?.admin?.table?.actions || "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{user.full_name}</td>
                                <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                        {dict?.admin?.users?.[`role_${user.role}`] || user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        {dict?.admin?.common?.edit || "Edit"}
                                    </button>
                                    <button
                                        onClick={() => openPasswordModal(user)}
                                        className="text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        {dict?.admin?.users?.reset_password || "Reset Password"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-700/50">
                            <h2 className="text-2xl font-bold text-white">{dict?.admin?.users?.add_user || "Create User"}</h2>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <Input
                                label={dict?.admin?.table?.email || "Email"}
                                type="email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                required
                            />
                            <Input
                                label={dict?.admin?.table?.name || "Full Name"}
                                value={createForm.full_name}
                                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                required
                            />
                            <Input
                                label={dict?.admin?.users?.new_password || "Password"}
                                type="password"
                                value={createForm.password}
                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{dict?.admin?.users?.role || "Role"}</label>
                                <select
                                    value={createForm.role}
                                    onChange={(e: any) => setCreateForm({ ...createForm, role: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    <option value="admin">{dict?.admin?.users?.role_admin || "Admin"}</option>
                                    <option value="finance">{dict?.admin?.users?.role_finance || "Finance"}</option>
                                    <option value="staff">{dict?.admin?.users?.role_staff || "Staff"}</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                                <Button type="submit">
                                    {dict?.admin?.common?.add || "Create"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-700/50">
                            <h2 className="text-2xl font-bold text-white">{dict?.admin?.users?.edit_user || "Edit User"}</h2>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <Input
                                label={dict?.admin?.table?.email || "Email"}
                                type="email"
                                value={editForm.email || ""}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                required
                            />
                            <Input
                                label={dict?.admin?.table?.name || "Full Name"}
                                value={editForm.full_name || ""}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{dict?.admin?.users?.role || "Role"}</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e: any) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    <option value="admin">{dict?.admin?.users?.role_admin || "Admin"}</option>
                                    <option value="finance">{dict?.admin?.users?.role_finance || "Finance"}</option>
                                    <option value="staff">{dict?.admin?.users?.role_staff || "Staff"}</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                                <Button type="submit">
                                    {dict?.admin?.common?.save || "Update"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-700/50">
                            <h2 className="text-2xl font-bold text-white">{dict?.admin?.users?.reset_password || "Reset Password"}</h2>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <Input
                                label={dict?.admin?.users?.new_password || "New Password"}
                                type="password"
                                value={passwordForm.new_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                required
                            />
                            <Input
                                label={dict?.admin?.users?.confirm_password || "Confirm Password"}
                                type="password"
                                value={passwordForm.confirm_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                required
                            />

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setShowPasswordModal(false)}>
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                                <Button type="submit">
                                    {dict?.admin?.common?.save || "Update Password"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
