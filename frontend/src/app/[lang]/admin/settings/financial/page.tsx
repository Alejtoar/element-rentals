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
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6" style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-widest mb-1" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                        {dict.admin.payment_methods.title}
                    </h1>
                    <p className="font-medium text-sm" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>
                        {dict.admin.settings.financial}
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs transition-colors"
                    style={{ backgroundColor: '#c1a982', color: '#fff', fontFamily: "'Berlin Sans', sans-serif" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b0966a'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c1a982'}
                >
                    {dict.admin.payment_methods.add_method}
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
                </div>
            ) : methods.length === 0 ? (
                <div className="rounded-sm p-8 text-center" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                    <p className="font-medium" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'MegantZ', serif" }}>{dict.admin.common.no_data}</p>
                </div>
            ) : (
                <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                    <table className="w-full">
                        <thead style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                            <tr style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                                    {dict.admin.payment_methods.name}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                                    {dict.admin.payment_methods.fee_percent}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                                    {dict.admin.payment_methods.fee_fixed}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                                    {dict.admin.table.status}
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                                    {dict.admin.table.actions}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {methods.map((method) => (
                                <tr key={method.id} className="transition-colors hover:bg-black/5" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                        {method.name}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-sm" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>
                                        {Number(method.transaction_fee_percent).toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4 font-medium text-sm" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>
                                        ${Number(method.transaction_fee_fixed).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className="px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest"
                                            style={{
                                                backgroundColor: method.is_active ? 'rgba(38,81,64,0.05)' : 'rgba(255,100,100,0.05)',
                                                color: method.is_active ? '#265140' : '#cc4444',
                                                border: method.is_active ? '1px solid rgba(38,81,64,0.1)' : '1px solid rgba(255,100,100,0.1)'
                                            }}
                                        >
                                            {method.is_active
                                                ? dict.admin.table.active
                                                : dict.admin.table.inactive}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => handleEdit(method)}
                                                className="text-xs font-bold uppercase tracking-widest transition-colors"
                                                style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}
                                                onMouseOver={(e) => e.currentTarget.style.color = '#265140'}
                                                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(75,61,28,0.5)'}
                                            >
                                                {dict.admin.common.edit}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(method.id)}
                                                className="text-xs font-bold uppercase tracking-widest transition-colors"
                                                style={{ color: '#cc4444', fontFamily: "'Berlin Sans', sans-serif" }}
                                                onMouseOver={(e) => e.currentTarget.style.color = '#992222'}
                                                onMouseOut={(e) => e.currentTarget.style.color = '#cc4444'}
                                            >
                                                {dict.admin.common.delete}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm max-w-md w-full p-8" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                        <h2 className="text-2xl font-bold uppercase tracking-widest mb-6" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                            {editingMethod
                                ? dict.admin.payment_methods.edit_method
                                : dict.admin.payment_methods.add_method}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
                                    {dict.admin.payment_methods.name}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                    className="w-full px-4 py-3 rounded-sm outline-none font-medium"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
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
                                        className="w-full px-4 py-3 rounded-sm outline-none font-medium"
                                        style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
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
                                        className="w-full px-4 py-3 rounded-sm outline-none font-medium"
                                        style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) =>
                                            setFormData({ ...formData, is_active: e.target.checked })
                                        }
                                        className="w-4 h-4 rounded-sm"
                                        style={{ accentColor: '#265140' }}
                                    />
                                    <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                                        {dict.admin.payment_methods.is_active}
                                    </span>
                                </label>
                            </div>
                            <div className="flex gap-4 pt-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingMethod(null);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-sm font-bold uppercase tracking-widest text-[10px] transition-colors"
                                    style={{ backgroundColor: 'transparent', color: '#4b3d1c', border: '1px solid #4b3d1c', fontFamily: "'Berlin Sans', sans-serif" }}
                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(75,61,28,0.05)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    {dict.admin.common.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-sm font-bold uppercase tracking-widest text-[10px] transition-colors"
                                    style={{ backgroundColor: '#c1a982', color: '#fff', fontFamily: "'Berlin Sans', sans-serif" }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b0966a'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c1a982'}
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
