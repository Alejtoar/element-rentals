"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/api/client";
import { Expense, ExpenseCreate, ExpenseUpdate, Property, User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

interface ExpensesPageProps {
    params: Promise<{ lang: string }>;
}

export default function ExpensesPage({ params }: ExpensesPageProps) {
    const { lang } = use(params);
    const [dict, setDict] = useState<any>(null);
    const [user, setUser] = useState<User | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [formData, setFormData] = useState<ExpenseCreate>({
        property_id: "",
        date: new Date().toISOString().split('T')[0],
        category: "Maintenance",
        description: "",
        amount: 0,
        is_deductible: false,
        receipt_url: ""
    });

    // Filter State
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

    useEffect(() => {
        const loadInitData = async () => {
            try {
                const [dictionary, currentUser] = await Promise.all([
                    getDictionary(lang as Locale),
                    api.auth.getCurrentUser()
                ]);
                setDict(dictionary);
                setUser(currentUser);
                await loadProperties();
            } catch (err: any) {
                console.error("Error loading initial data:", err);
                setError(dict?.admin?.common?.error || "Failed to load initial data");
            }
        };
        loadInitData();
    }, [lang]);

    useEffect(() => {
        if (dict && user) {
            loadExpenses();
        }
    }, [dict, user, selectedPropertyId]);

    const loadProperties = async () => {
        try {
            const data = await api.properties.getAll();
            setProperties(data);
            if (data.length > 0 && !formData.property_id) {
                setFormData(prev => ({ ...prev, property_id: data[0].id }));
            }
        } catch (err: any) {
            console.error("Error loading properties:", err);
        }
    };

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await api.expenses.getAll(selectedPropertyId || undefined);
            setExpenses(data);
        } catch (err: any) {
            setError(err.message || dict?.admin?.expenses?.error_load || "Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const expenseData = {
                ...formData,
                amount: Number(formData.amount)
            };
            await api.expenses.create(expenseData);
            closeModal();
            loadExpenses();
        } catch (err: any) {
            alert(err.message || dict?.admin?.expenses?.error_create || "Failed to create expense");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExpense) return;
        try {
            const updateData: ExpenseUpdate = {
                date: formData.date,
                category: formData.category,
                amount: Number(formData.amount),
                description: formData.description,
                is_deductible: formData.is_deductible,
                receipt_url: formData.receipt_url
            };
            await api.expenses.update(editingExpense.id, updateData);
            closeModal();
            loadExpenses();
        } catch (err: any) {
            alert(err.message || dict?.admin?.expenses?.error_update || "Failed to update expense");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(dict?.admin?.common?.delete_confirm || "Are you sure?")) return;
        try {
            await api.expenses.delete(id);
            loadExpenses();
        } catch (err: any) {
            alert(err.message || dict?.admin?.expenses?.error_delete || "Failed to delete expense");
        }
    };

    const openCreateModal = () => {
        setEditingExpense(null);
        setFormData({
            property_id: properties.length > 0 ? properties[0].id : "",
            date: new Date().toISOString().split('T')[0],
            category: "Maintenance",
            description: "",
            amount: 0,
            is_deductible: false,
            receipt_url: ""
        });
        setShowModal(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setFormData({
            property_id: expense.property_id,
            date: expense.date.split('T')[0],
            category: expense.category,
            description: expense.description,
            amount: expense.amount,
            is_deductible: expense.is_deductible,
            receipt_url: expense.receipt_url || ""
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingExpense(null);
    };

    const getPropertyName = (id: string) => {
        return properties.find(p => p.id === id)?.name || dict?.admin?.common?.unknown_property || "Unknown Property";
    };

    const getCategoryLabel = (category: string) => {
        if (!dict?.admin?.expenses?.categories) return category;
        const key = category.toLowerCase();
        return dict.admin.expenses.categories[key] || category;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const canEdit = user?.role === 'admin' || user?.role === 'finance';

    if (loading && !dict) {
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
                    <h1 className="text-3xl font-bold text-white">{dict?.admin?.expenses?.title || "Expenses"}</h1>
                    <p className="text-slate-400 mt-1">{dict?.admin?.expenses?.subtitle || "Manage property expenses and tracking"}</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                        <option value="">{dict?.admin?.expenses?.all_properties || "All Properties"}</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <Button onClick={openCreateModal}>
                        {dict?.admin?.expenses?.add_expense || "Add Expense"}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-700/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.table?.date || "Date"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.expenses?.property || "Property"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.table?.category || "Category"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 w-1/4">{dict?.admin?.table?.description || "Description"}</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">{dict?.admin?.expenses?.amount || "Amount"}</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">{dict?.admin?.expenses?.is_deductible || "Deductible"}</th>
                            {canEdit && <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">{dict?.admin?.common?.actions || "Actions"}</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                    {dict?.admin?.expenses?.no_expenses || "No expenses found"}
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 text-slate-300">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-white font-medium">
                                        {getPropertyName(expense.property_id)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300">
                                            {getCategoryLabel(expense.category)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        <div className="flex flex-col">
                                            <span className="truncate max-w-xs" title={expense.description}>{expense.description}</span>
                                            {expense.receipt_url && (
                                                <a
                                                    href={expense.receipt_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                    {dict?.admin?.expenses?.view_receipt || "View Receipt"}
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-white font-mono">
                                        {formatCurrency(expense.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {expense.is_deductible ? (
                                            <span className="inline-flex px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/20">
                                                {dict?.admin?.common?.yes || "Yes"}
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs font-medium border border-slate-500/20">
                                                {dict?.admin?.common?.no || "No"}
                                            </span>
                                        )}
                                    </td>
                                    {canEdit && (
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => openEditModal(expense)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                                            >
                                                {dict?.admin?.common?.edit || "Edit"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                                            >
                                                {dict?.admin?.common?.delete || "Delete"}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingExpense ? (dict?.admin?.expenses?.edit_expense || "Edit Expense") : (dict?.admin?.expenses?.add_expense || "Add Expense")}
                        </h2>
                        <form onSubmit={editingExpense ? handleUpdate : handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{dict?.admin?.expenses?.property || "Property"}</label>
                                <select
                                    value={formData.property_id}
                                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    disabled={!!editingExpense}
                                    required
                                >
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{dict?.admin?.table?.date || "Date"}</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{dict?.admin?.expenses?.amount || "Amount"} (COP)</label>
                                    <Input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{dict?.admin?.table?.category || "Category"}</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    required
                                >
                                    <option value="Maintenance">{dict?.admin?.expenses?.categories?.maintenance || "Maintenance"}</option>
                                    <option value="Utilities">{dict?.admin?.expenses?.categories?.utilities || "Utilities"}</option>
                                    <option value="Cleaning">{dict?.admin?.expenses?.categories?.cleaning || "Cleaning"}</option>
                                    <option value="Supplies">{dict?.admin?.expenses?.categories?.supplies || "Supplies"}</option>
                                    <option value="Other">{dict?.admin?.expenses?.categories?.other || "Other"}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{dict?.admin?.table?.description || "Description"}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all h-24 resize-none"
                                    required
                                    placeholder={dict?.admin?.table?.description + "..." || "Enter details..."}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{dict?.admin?.expenses?.receipt_url || "Receipt URL"} (Optional)</label>
                                <Input
                                    type="text"
                                    value={formData.receipt_url || ""}
                                    onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>

                            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_deductible}
                                    onChange={(e) => setFormData({ ...formData, is_deductible: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-purple-600 focus:ring-purple-500/20 focus:ring-offset-0"
                                />
                                <span className="text-sm font-medium text-slate-200">
                                    {dict?.admin?.expenses?.is_deductible_label || "This expense is tax deductible"}
                                </span>
                            </label>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    {editingExpense ? (dict?.admin?.expenses?.update_expense || "Update Expense") : (dict?.admin?.expenses?.create_expense || "Create Expense")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={closeModal}
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
