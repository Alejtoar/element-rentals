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
            case 'admin': return 'border border-[#cfbb9b] text-[#4b3d1c] bg-[rgba(207,187,155,0.2)]';
            case 'finance': return 'border border-[#527858] text-[#527858] bg-[rgba(82,120,88,0.1)]';
            case 'staff': return 'border border-[#265140] text-[#265140] bg-[rgba(38,81,64,0.05)]';
            default: return 'border border-[rgba(75,61,28,0.2)] text-[rgba(75,61,28,0.7)] bg-[rgba(244,242,235,0.5)]';
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.users?.title || "Users"}</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.users?.subtitle || "Manage system users and permissions"}</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} variant="sand">
                    {dict?.admin?.users?.add_user || "Create User"}
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-sm text-sm font-medium" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            {/* Users Table */}
            <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
                <table className="w-full">
                    <thead style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                        <tr style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.name || "Name"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.email || "Email"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.users?.role || "Role"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.created_at || "Created"}</th>
                            <th className="px-6 py-4 text-right text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.actions || "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="transition-colors hover:bg-black/5" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                                <td className="px-6 py-4 font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{user.full_name}</td>
                                <td className="px-6 py-4 font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest ${getRoleBadgeColor(user.role)}`}>
                                        {dict?.admin?.users?.[`role_${user.role}`] || user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="uppercase tracking-widest font-bold transition-colors hover:text-[#527858]" style={{ color: '#265140', fontSize: '10px' }}
                                    >
                                        {dict?.admin?.common?.edit || "Edit"}
                                    </button>
                                    <button
                                        onClick={() => openPasswordModal(user)}
                                        className="uppercase tracking-widest font-bold transition-colors" style={{ color: '#cfbb9b', fontSize: '10px' }}
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm max-w-md w-full shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <div className="p-6" style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                            <h2 className="text-xl font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.users?.add_user || "Create User"}</h2>
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
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.users?.role || "Role"}</label>
                                <select
                                    value={createForm.role}
                                    onChange={(e: any) => setCreateForm({ ...createForm, role: e.target.value })}
                                    className="w-full px-4 py-3 rounded-sm outline-none cursor-pointer"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                >
                                    <option value="admin">{dict?.admin?.users?.role_admin || "Admin"}</option>
                                    <option value="finance">{dict?.admin?.users?.role_finance || "Finance"}</option>
                                    <option value="staff">{dict?.admin?.users?.role_staff || "Staff"}</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                                <Button type="submit" variant="sand">
                                    {dict?.admin?.common?.add || "Create"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm max-w-md w-full shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <div className="p-6" style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                            <h2 className="text-xl font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.users?.edit_user || "Edit User"}</h2>
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
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.users?.role || "Role"}</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e: any) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-4 py-3 rounded-sm outline-none cursor-pointer"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                >
                                    <option value="admin">{dict?.admin?.users?.role_admin || "Admin"}</option>
                                    <option value="finance">{dict?.admin?.users?.role_finance || "Finance"}</option>
                                    <option value="staff">{dict?.admin?.users?.role_staff || "Staff"}</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                                <Button type="submit" variant="sand">
                                    {dict?.admin?.common?.save || "Update"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm max-w-md w-full shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <div className="p-6" style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                            <h2 className="text-xl font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.users?.reset_password || "Reset Password"}</h2>
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
                                <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                                <Button type="submit" variant="sand">
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
