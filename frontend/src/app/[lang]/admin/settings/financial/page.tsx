"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/api/client";
import { PaymentMethod, PaymentMethodCreate } from "@/types";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

interface FinancialPageProps {
    params: Promise<{ lang: string }>;
}

export default function FinancialPage({ params }: FinancialPageProps) {
    const { lang } = use(params);
    const [dict, setDict] = useState<any>(null);
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [formData, setFormData] = useState<PaymentMethodCreate>({
        name: "",
        transaction_fee_percent: 0,
        transaction_fee_fixed: 0,
        is_active: true,
    });

    useEffect(() => {
        const loadDictionary = async () => {
            const dictionary = await getDictionary(lang as Locale);
            setDict(dictionary);
        };
        loadDictionary();
    }, [lang]);

    useEffect(() => {
        if (dict) {
            loadMethods();
        }
    }, [dict]);

    const loadMethods = async () => {
        try {
            setLoading(true);
            const data = await api.paymentMethods.getAll();
            setMethods(data);
        } catch (error: any) {
            alert(dict?.admin?.common?.error || "Error loading payment methods");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMethod) {
                await api.paymentMethods.update(editingMethod.id, formData);
            } else {
                await api.paymentMethods.create(formData);
            }
            setShowModal(false);
            setEditingMethod(null);
            setFormData({
                name: "",
                transaction_fee_percent: 0,
                transaction_fee_fixed: 0,
                is_active: true,
            });
            loadMethods();
        } catch (error: any) {
            alert(error.message || dict?.admin?.common?.error);
        }
    };

    const handleEdit = (method: PaymentMethod) => {
        setEditingMethod(method);
        setFormData({
            name: method.name,
            transaction_fee_percent: Number(method.transaction_fee_percent),
            transaction_fee_fixed: Number(method.transaction_fee_fixed),
            is_active: method.is_active,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(dict?.admin?.common?.confirm_delete)) return;
        try {
            await api.paymentMethods.delete(id);
            loadMethods();
        } catch (error: any) {
            alert(error.message || dict?.admin?.common?.error);
        }
    };

    const handleAdd = () => {
        setEditingMethod(null);
        setFormData({
            name: "",
            transaction_fee_percent: 0,
            transaction_fee_fixed: 0,
            is_active: true,
        });
        setShowModal(true);
    };

    if (!dict) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {dict.admin.payment_methods.title}
                    </h1>
                    <p className="text-slate-400">
                        {dict.admin.settings.financial}
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                >
                    {dict.admin.payment_methods.add_method}
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : methods.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-8 text-center">
                    <p className="text-slate-400">{dict.admin.common.no_data}</p>
                </div>
            ) : (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    {dict.admin.payment_methods.name}
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    {dict.admin.payment_methods.fee_percent}
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    {dict.admin.payment_methods.fee_fixed}
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    {dict.admin.table.status}
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                                    {dict.admin.table.actions}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {methods.map((method) => (
                                <tr key={method.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">
                                        {method.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        {Number(method.transaction_fee_percent).toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        ${Number(method.transaction_fee_fixed).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${method.is_active
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-slate-500/20 text-slate-400"
                                                }`}
                                        >
                                            {method.is_active
                                                ? dict.admin.table.active
                                                : dict.admin.table.inactive}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(method)}
                                            className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                                        >
                                            {dict.admin.common.edit}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(method.id)}
                                            className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            {dict.admin.common.delete}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingMethod
                                ? dict.admin.payment_methods.edit_method
                                : dict.admin.payment_methods.add_method}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {dict.admin.payment_methods.name}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {dict.admin.payment_methods.fee_percent}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.transaction_fee_percent}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            transaction_fee_percent: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {dict.admin.payment_methods.fee_fixed}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.transaction_fee_fixed}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            transaction_fee_fixed: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    required
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                        setFormData({ ...formData, is_active: e.target.checked })
                                    }
                                    className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="is_active" className="ml-2 text-sm text-slate-300">
                                    {dict.admin.payment_methods.is_active}
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingMethod(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    {dict.admin.common.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                                >
                                    {dict.admin.common.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
