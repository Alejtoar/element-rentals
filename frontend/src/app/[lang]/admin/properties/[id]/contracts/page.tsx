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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{dict?.admin?.contracts?.title || "Contracts"}</h2>
                <Button onClick={() => setShowModal(true)}>
                    {dict?.admin?.contracts?.add_contract || "Add Contract"}
                </Button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-700/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.contracts?.start_date || "Start Date"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.contracts?.end_date || "End Date"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.contracts?.commission_rate || "Commission"}</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">{dict?.admin?.contracts?.exclusive || "Exclusive"}</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">{dict?.admin?.table?.status || "Status"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {contracts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    {dict?.admin?.contracts?.no_contracts || "No contracts found"}
                                </td>
                            </tr>
                        ) : (
                            contracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 text-white font-mono text-sm">
                                        {contract.start_date}
                                    </td>
                                    <td className="px-6 py-4 text-white font-mono text-sm">
                                        {contract.end_date}
                                    </td>
                                    <td className="px-6 py-4 text-purple-400 font-semibold font-mono">
                                        {(contract.commission_rate * 100).toFixed(0)}%
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {contract.exclusive ? (
                                            <span className="text-green-400">✔</span>
                                        ) : (
                                            <span className="text-slate-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                            // Check if active based on dates (simple check, backend has is_active?)
                                            // Backend handoff says "Tracks ... active dates". Types has is_active.
                                            contract.is_active
                                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                                            }`}>
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {dict?.admin?.contracts?.add_contract || "Add Contract"}
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{dict?.admin?.contracts?.start_date || "Start Date"}</label>
                                    <Input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{dict?.admin?.contracts?.end_date || "End Date"}</label>
                                    <Input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{dict?.admin?.contracts?.commission_rate || "Commission Rate"} (0.0 - 1.0)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={formData.commission_rate}
                                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {(formData.commission_rate * 100).toFixed(0)}%
                                </p>
                            </div>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.exclusive}
                                    onChange={(e) => setFormData({ ...formData, exclusive: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-purple-600 focus:ring-purple-500/20 focus:ring-offset-0"
                                />
                                <span className="text-sm font-medium text-slate-200">
                                    {dict?.admin?.contracts?.exclusive || "Exclusive Contract"}
                                </span>
                            </label>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1" isLoading={submitting}>
                                    {dict?.admin?.common?.save || "Save"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
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
