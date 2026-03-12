"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/api/client";
import { Contract, ContractCreate } from "@/types";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContractsPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = use(params);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [dict, setDict] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<ContractCreate>({
        property_id: id,
        start_date: "",
        end_date: "",
        commission_rate: 0.20,
        exclusive: false
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [c, d] = await Promise.all([
                    api.contracts.getAll(id),
                    getDictionary(lang as Locale)
                ]);
                setContracts(c);
                setDict(d);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, lang]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await api.contracts.create({
                ...formData,
                property_id: id
            });
            setShowModal(false);
            const updated = await api.contracts.getAll(id);
            setContracts(updated);
            // reset form defaults
            setFormData({
                property_id: id,
                start_date: "",
                end_date: "",
                commission_rate: 0.20,
                exclusive: false
            });
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("overlap")) {
                setError(dict?.admin?.contracts?.overlap_error || "Contract dates overlap with an existing contract");
            } else {
                setError(err.message || dict?.admin?.common?.error || "Failed to create contract");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.contracts?.title || "Contracts"}</h2>
                <Button onClick={() => setShowModal(true)} variant="sand">
                    {dict?.admin?.contracts?.add_contract || "Add Contract"}
                </Button>
            </div>

            <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
                <table className="w-full">
                    <thead style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                        <tr style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.contracts?.start_date || "Start Date"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.contracts?.end_date || "End Date"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.contracts?.commission_rate || "Commission"}</th>
                            <th className="px-6 py-4 text-center text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.contracts?.exclusive || "Exclusive"}</th>
                            <th className="px-6 py-4 text-right text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.status || "Status"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm font-medium" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>
                                    {dict?.admin?.contracts?.no_contracts || "No contracts found"}
                                </td>
                            </tr>
                        ) : (
                            contracts.map((contract) => (
                                <tr key={contract.id} className="transition-colors hover:bg-black/5" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                        {contract.start_date}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                        {contract.end_date}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#265140', fontFamily: "'MegantZ', serif" }}>
                                        {(contract.commission_rate * 100).toFixed(0)}%
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {contract.exclusive ? (
                                            <span style={{ color: '#265140' }}>✔</span>
                                        ) : (
                                            <span style={{ color: 'rgba(75,61,28,0.3)' }}>-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-widest`} style={{
                                            backgroundColor: contract.is_active ? 'rgba(38,81,64,0.05)' : 'rgba(75,61,28,0.05)',
                                            color: contract.is_active ? '#265140' : 'rgba(75,61,28,0.5)',
                                            border: contract.is_active ? '1px solid rgba(38,81,64,0.1)' : '1px solid rgba(75,61,28,0.1)'
                                        }}>
                                            {contract.is_active ? (dict?.admin?.contracts?.active || "Active") : (dict?.admin?.contracts?.inactive || "Inactive")}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm p-8 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-6" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                            {dict?.admin?.contracts?.add_contract || "Add Contract"}
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 rounded-sm text-sm" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.contracts?.start_date || "Start Date"}</label>
                                    <Input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.contracts?.end_date || "End Date"}</label>
                                    <Input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.contracts?.commission_rate || "Commission Rate"} (0.0 - 1.0)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={formData.commission_rate}
                                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                                    required
                                />
                                <p className="text-xs font-medium mt-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'MegantZ', serif" }}>
                                    {(formData.commission_rate * 100).toFixed(0)}%
                                </p>
                            </div>

                            <label className="flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-colors" style={{ backgroundColor: 'rgba(38,81,64,0.05)', border: '1px solid rgba(82,120,88,0.1)' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.exclusive}
                                    onChange={(e) => setFormData({ ...formData, exclusive: e.target.checked })}
                                    className="w-5 h-5 rounded cursor-pointer"
                                    style={{ accentColor: '#265140' }}
                                />
                                <span className="text-sm font-bold" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                    {dict?.admin?.contracts?.exclusive || "Exclusive Contract"}
                                </span>
                            </label>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1" isLoading={submitting} variant="sand">
                                    {dict?.admin?.common?.save || "Save"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
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
