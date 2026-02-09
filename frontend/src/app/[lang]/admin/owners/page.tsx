"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Owner, OwnerCreate, OwnerUpdate } from "@/types";
import { Button } from "@/components/ui/Button";

export default function OwnersPage() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [bankDetails, setBankDetails] = useState("");

    useEffect(() => {
        loadOwners();
    }, []);

    const loadOwners = async () => {
        try {
            setLoading(true);
            const data = await api.owners.getAll();
            setOwners(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingOwner(null);
        setFullName("");
        setEmail("");
        setPhone("");
        setBankDetails("");
        setShowForm(true);
    };

    const handleEdit = (owner: Owner) => {
        setEditingOwner(owner);
        setFullName(owner.full_name);
        setEmail(owner.email);
        setPhone(owner.phone);
        setBankDetails(owner.bank_details || "");
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);
            if (editingOwner) {
                const updateData: OwnerUpdate = {
                    full_name: fullName,
                    email,
                    phone,
                    bank_details: bankDetails || undefined,
                };
                await api.owners.update(editingOwner.id, updateData);
            } else {
                const createData: OwnerCreate = {
                    full_name: fullName,
                    email,
                    phone,
                    bank_details: bankDetails || undefined,
                };
                await api.owners.create(createData);
            }
            setShowForm(false);
            await loadOwners();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will fail if the owner has properties.")) return;

        try {
            setLoading(true);
            await api.owners.delete(id);
            await loadOwners();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && owners.length === 0) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Property Owners</h1>
                    <p className="text-slate-400 mt-1">Manage owner information and bank details</p>
                </div>
                <Button onClick={handleAdd}>Add Owner</Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full">
                        <div className="p-6 border-b border-slate-700/50">
                            <h2 className="text-2xl font-bold text-white">
                                {editingOwner ? 'Edit Owner' : 'Add New Owner'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Phone *</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Bank Details (Optional)</label>
                                <textarea
                                    value={bankDetails}
                                    onChange={(e) => setBankDetails(e.target.value)}
                                    rows={3}
                                    placeholder="e.g., Bancolombia Ahorros 123456789"
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : editingOwner ? 'Update Owner' : 'Create Owner'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-700/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Contact</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Bank Details</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {owners.map((owner) => (
                            <tr key={owner.id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{owner.full_name}</td>
                                <td className="px-6 py-4 text-slate-300">
                                    <div className="text-sm">{owner.email}</div>
                                    <div className="text-sm text-slate-400">{owner.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-300 text-sm">
                                    {owner.bank_details || <span className="text-slate-500 italic">Not provided</span>}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(owner)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(owner.id)}
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

            {owners.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    No owners found. Create one to get started.
                </div>
            )}
        </div>
    );
}
