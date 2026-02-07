"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { User, UserCreate, UserUpdate } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function UsersPage() {
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
        loadUsers();
    }, []);

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
            setError("Passwords do not match");
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

    if (loading) {
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
                    <h1 className="text-3xl font-bold text-white">Users</h1>
                    <p className="text-slate-400 mt-1">Manage system users and permissions</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    Create User
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-700/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4 text-white">{user.full_name}</td>
                                <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                                            user.role === 'staff' ? 'bg-blue-500/20 text-blue-300' :
                                                'bg-green-500/20 text-green-300'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openPasswordModal(user)}
                                        className="text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        Reset Password
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-6">Create User</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={createForm.full_name}
                                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={createForm.password}
                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                required
                            />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-300">Role</label>
                                <select
                                    value={createForm.role}
                                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                                    className="px-4 py-3 rounded-2xl bg-slate-700/50 border border-slate-600 text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="finance">Finance</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">Create</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-6">Edit User</h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={editForm.full_name || ""}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={editForm.email || ""}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-300">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                                    className="px-4 py-3 rounded-2xl bg-slate-700/50 border border-slate-600 text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="finance">Finance</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">Update</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-slate-400 mb-6">for {selectedUser.full_name}</p>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <Input
                                label="New Password"
                                type="password"
                                value={passwordForm.new_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                value={passwordForm.confirm_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                required
                            />
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">Reset Password</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
