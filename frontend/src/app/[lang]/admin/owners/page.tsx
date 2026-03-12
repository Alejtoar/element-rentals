"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/api/client";
import { Owner, OwnerCreate, OwnerUpdate } from "@/types";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";
import Link from "next/link";

export default function OwnersPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params || {});
    const [dict, setDict] = useState<any>(null);
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
        const loadInit = async () => {
            if (lang) {
                const d = await getDictionary(lang as Locale);
                setDict(d);
            }
        };
        loadInit();
        loadOwners();
    }, [lang]);

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
        if (!confirm(dict?.admin?.common?.delete_confirm_owner || "Are you sure? This will fail if the owner has properties.")) return;

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

    if (loading && owners.length === 0 && !dict) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.owners?.title || "Property Owners"}</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.owners?.subtitle || "Manage owner information and bank details"}</p>
                </div>
                <Button onClick={handleAdd} variant="sand">{dict?.admin?.owners?.add_owner || "Add Owner"}</Button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-sm text-sm font-medium" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm max-w-2xl w-full shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <div className="p-6" style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                            <h2 className="text-xl font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                                {editingOwner ? (dict?.admin?.owners?.edit_owner || "Edit Owner") : (dict?.admin?.owners?.add_owner || "Add New Owner")}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.name || "Full Name"} *</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-sm outline-none"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.email || "Email"} *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-sm outline-none"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.phone || "Phone"} *</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-sm outline-none"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.owners?.bank_details || "Bank Details (Optional)"}</label>
                                <textarea
                                    value={bankDetails}
                                    onChange={(e) => setBankDetails(e.target.value)}
                                    rows={3}
                                    placeholder="e.g., Bancolombia Ahorros 123456789"
                                    className="w-full px-4 py-3 rounded-sm outline-none resize-none"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                                <Button type="submit" disabled={loading} variant="sand">
                                    {loading ? (dict?.admin?.common?.save_loading || "Saving...") : editingOwner ? (dict?.admin?.common?.save || "Update Owner") : (dict?.admin?.common?.add || "Create Owner")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
                <table className="w-full">
                    <thead style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                        <tr style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.name || "Name"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.contact || "Contact"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.owners?.bank_details || "Bank Details"}</th>
                            <th className="px-6 py-4 text-right text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.actions || "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {owners.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>
                                    {dict?.admin?.common?.no_data || "No owners found. Create one to get started."}
                                </td>
                            </tr>
                        ) : (
                            owners.map((owner) => (
                                <tr key={owner.id} className="transition-colors hover:bg-black/5" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                                    <td className="px-6 py-4 font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{owner.full_name}</td>
                                    <td className="px-6 py-4 font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                        <div className="text-sm">{owner.email}</div>
                                        <div className="text-sm" style={{ color: 'rgba(75,61,28,0.7)' }}>{owner.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                        {owner.bank_details || <span className="italic" style={{ color: 'rgba(75,61,28,0.5)' }}>{dict?.admin?.common?.not_provided || "Not provided"}</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Link
                                            href={`/${lang}/admin/owners/${owner.id}`}
                                            className="uppercase tracking-widest font-bold transition-colors hover:text-[#527858] mr-2" style={{ color: '#265140', fontSize: '10px' }}
                                        >
                                            {dict?.admin?.common?.view || "View"}
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(owner)}
                                            className="uppercase tracking-widest font-bold transition-colors hover:text-[#527858]" style={{ color: '#265140', fontSize: '10px' }}
                                        >
                                            {dict?.admin?.common?.edit || "Edit"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(owner.id)}
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
        </div>
    );
}
