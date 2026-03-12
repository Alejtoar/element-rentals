"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/api/client";
import { Guest, GuestCreate, GuestUpdate } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

export default function GuestsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params || {});
    const [dict, setDict] = useState<any>(null);
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
        const loadInit = async () => {
            if (lang) {
                const d = await getDictionary(lang as Locale);
                setDict(d);
            }
        };
        loadInit();
        loadGuests();
    }, [lang]);

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
        if (!confirm(dict?.admin?.common?.delete_confirm || "Are you sure you want to delete this guest?")) return;

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
                    <h1 className="text-3xl font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.guests?.title || "Guests"}</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.guests?.subtitle || "Manage guest records for reservations"}</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} variant="sand">
                    {dict?.admin?.guests?.add_guest || "Create Guest"}
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-sm text-sm font-medium" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            {/* Guests Table */}
            <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
                <table className="w-full">
                    <thead style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                        <tr style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.name || "Name"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.email || "Email"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.phone || "Phone"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.created_at || "Created"}</th>
                            <th className="px-6 py-4 text-right text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.actions || "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>
                                    {dict?.admin?.common?.no_data || "No guests found"}
                                </td>
                            </tr>
                        ) : (
                            guests.map((guest) => (
                                <tr key={guest.id} className="transition-colors hover:bg-black/5" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                                    <td className="px-6 py-4 font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{guest.full_name}</td>
                                    <td className="px-6 py-4 font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{guest.email || "—"}</td>
                                    <td className="px-6 py-4 font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{guest.phone}</td>
                                    <td className="px-6 py-4 text-sm" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>
                                        {new Date(guest.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => openEditModal(guest)}
                                            className="uppercase tracking-widest font-bold transition-colors hover:text-[#527858]" style={{ color: '#265140', fontSize: '10px' }}
                                        >
                                            {dict?.admin?.common?.edit || "Edit"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(guest.id)}
                                            className="uppercase tracking-widest font-bold transition-colors" style={{ color: '#cc4444', fontSize: '10px' }}
                                        >
                                            {dict?.admin?.common?.delete || "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm p-8 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-6" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.guests?.add_guest || "Create Guest"}</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                label={dict?.admin?.guests?.full_name || "Full Name"}
                                value={createForm.full_name}
                                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                required
                            />
                            <Input
                                label={dict?.admin?.table?.email || "Email (optional)"}
                                type="email"
                                value={createForm.email || ""}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                            />
                            <Input
                                label={dict?.admin?.table?.phone || "Phone"}
                                value={createForm.phone}
                                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                required
                            />
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1" variant="sand">{dict?.admin?.common?.add || "Create"}</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedGuest && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm p-8 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-6" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.guests?.edit_guest || "Edit Guest"}</h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <Input
                                label={dict?.admin?.guests?.full_name || "Full Name"}
                                value={editForm.full_name || ""}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            />
                            <Input
                                label={dict?.admin?.table?.email || "Email (optional)"}
                                type="email"
                                value={editForm.email || ""}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                            <Input
                                label={dict?.admin?.table?.phone || "Phone"}
                                value={editForm.phone || ""}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1" variant="sand">{dict?.admin?.common?.save || "Update"}</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1"
                                >
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
