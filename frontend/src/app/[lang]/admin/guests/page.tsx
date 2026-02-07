"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Guest, GuestCreate, GuestUpdate } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function GuestsPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [error, setError] = useState("");

    const [createForm, setCreateForm] = useState<GuestCreate>({
        full_name: "",
        email: "",
        phone: "",
    });

    const [editForm, setEditForm] = useState<GuestUpdate>({});

    useEffect(() => {
        loadGuests();
    }, []);

    const loadGuests = async () => {
        try {
            setLoading(true);
            const data = await api.guests.getAll();
            setGuests(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.guests.create(createForm);
            setShowCreateModal(false);
            setCreateForm({ full_name: "", email: "", phone: "" });
            loadGuests();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGuest) return;

        try {
            await api.guests.update(selectedGuest.id, editForm);
            setShowEditModal(false);
            setSelectedGuest(null);
            loadGuests();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this guest?")) return;

        try {
            await api.guests.delete(id);
            loadGuests();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const openEditModal = (guest: Guest) => {
        setSelectedGuest(guest);
        setEditForm({
            full_name: guest.full_name,
            email: guest.email,
            phone: guest.phone,
        });
        setShowEditModal(true);
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
                    <h1 className="text-3xl font-bold text-white">Guests</h1>
                    <p className="text-slate-400 mt-1">Manage guest records for reservations</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    Create Guest
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Guests Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-700/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Phone</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Created</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {guests.map((guest) => (
                            <tr key={guest.id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4 text-white">{guest.full_name}</td>
                                <td className="px-6 py-4 text-slate-300">{guest.email || "—"}</td>
                                <td className="px-6 py-4 text-slate-300">{guest.phone}</td>
                                <td className="px-6 py-4 text-slate-400 text-sm">
                                    {new Date(guest.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openEditModal(guest)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(guest.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Delete
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
                        <h2 className="text-2xl font-bold text-white mb-6">Create Guest</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={createForm.full_name}
                                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                required
                            />
                            <Input
                                label="Email (optional)"
                                type="email"
                                value={createForm.email || ""}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            />
                            <Input
                                label="Phone"
                                value={createForm.phone}
                                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                required
                            />
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
            {showEditModal && selectedGuest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-6">Edit Guest</h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <Input
                                label="Full Name"
                                value={editForm.full_name || ""}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            />
                            <Input
                                label="Email (optional)"
                                type="email"
                                value={editForm.email || ""}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                            <Input
                                label="Phone"
                                value={editForm.phone || ""}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
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
        </div>
    );
}
