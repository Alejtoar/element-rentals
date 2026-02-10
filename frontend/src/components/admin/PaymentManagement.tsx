"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Payment, PaymentCreate, PaymentUpdate, PaymentMethod, FinancialSummary } from "@/types";
import { Button } from "@/components/ui/Button";

interface PaymentManagementProps {
    reservationId: string;
    totalAmount: number;
    onPaymentAdded?: () => void;
}

export function PaymentManagement({ reservationId, totalAmount, onPaymentAdded }: PaymentManagementProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

    // Form state
    const [amount, setAmount] = useState(0);
    const [paymentType, setPaymentType] = useState<'deposit' | 'balance' | 'penalty'>('deposit');
    const [paymentMethodId, setPaymentMethodId] = useState<string>("");
    const [beneficiary, setBeneficiary] = useState<'company' | 'third_party'>('company');
    const [status, setStatus] = useState<'paid' | 'pending'>('paid');

    useEffect(() => {
        loadData();
        loadPaymentMethods();
    }, [reservationId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [paymentsData, summaryData] = await Promise.all([
                api.payments.getByReservation(reservationId),
                api.reservations.getFinancialSummary(reservationId),
            ]);
            setPayments(paymentsData);
            setFinancialSummary(summaryData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadPaymentMethods = async () => {
        try {
            const methods = await api.paymentMethods.getAll(true); // active only
            setPaymentMethods(methods);
        } catch (err: any) {
            console.error("Failed to load payment methods:", err);
        }
    };

    const calculateNetAmount = (amt: number, methodId: string): number => {
        const method = paymentMethods.find(m => m.id === methodId);
        if (!method) return amt;

        const percentFee = (amt * method.transaction_fee_percent) / 100;
        const totalFees = percentFee + method.transaction_fee_fixed;
        const netAmount = amt - totalFees;

        return Math.max(netAmount, 0);
    };

    const handleAddPayment = async () => {
        if (amount <= 0) {
            setError("Amount must be greater than 0");
            return;
        }

        try {
            setLoading(true);
            const percentage_applied = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

            const newPayment: PaymentCreate = {
                reservation_id: reservationId,
                amount,
                payment_type: paymentType,
                non_refundable: paymentType === 'deposit',
                payment_method_id: paymentMethodId || undefined,
                beneficiary,
                percentage_applied,
                status,
                paid_at: status === 'paid' ? new Date().toISOString() : undefined,
            };

            await api.payments.create(newPayment);
            await loadData();
            setShowForm(false);
            resetForm();
            if (onPaymentAdded) onPaymentAdded();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPayment = async () => {
        if (!editingPayment) return;
        if (amount <= 0) {
            setError("Amount must be greater than 0");
            return;
        }

        try {
            setLoading(true);
            const updateData: PaymentUpdate = {
                amount,
                payment_method_id: paymentMethodId || undefined,
                status,
                paid_at: status === 'paid' ? new Date().toISOString() : undefined,
            };

            await api.payments.update(editingPayment.id, updateData);
            await loadData();
            setShowForm(false);
            setEditingPayment(null);
            resetForm();
            if (onPaymentAdded) onPaymentAdded();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (payment: Payment) => {
        setEditingPayment(payment);
        setAmount(payment.amount);
        setPaymentMethodId(payment.payment_method_id || "");
        setStatus(payment.status);
        setShowForm(true);
    };

    const handleDelete = async (paymentId: string) => {
        if (!confirm("Are you sure you want to delete this payment? This action cannot be undone.")) {
            return;
        }

        try {
            setLoading(true);
            await api.payments.delete(paymentId);
            await loadData();
            if (onPaymentAdded) onPaymentAdded();
        } catch (err: any) {
            setError(err.message || "Failed to delete payment");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setAmount(0);
        setPaymentType('deposit');
        setPaymentMethodId(""); // Default to no payment method
        setBeneficiary('company');
        setStatus('paid');
        setError("");
        setEditingPayment(null);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getPaymentMethodName = (methodId: string | undefined): string => {
        if (!methodId) return "N/A";
        const method = paymentMethods.find(m => m.id === methodId);
        return method ? method.name : "Unknown";
    };

    const netAmount = calculateNetAmount(amount, paymentMethodId);
    const totalFees = amount - netAmount;

    return (
        <div className="space-y-6">
            {financialSummary && (
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <div className="text-slate-400 text-sm">Total Amount</div>
                            <div className="text-white text-xl font-bold">{formatCurrency(financialSummary.total_amount)}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm">Total Paid</div>
                            <div className="text-green-400 text-xl font-bold">{formatCurrency(financialSummary.total_paid)}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm">Balance</div>
                            <div className="text-yellow-400 text-xl font-bold">{formatCurrency(financialSummary.balance)}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-sm">Status</div>
                            <div className={`text-xl font-bold ${financialSummary.is_fully_paid ? 'text-green-400' : 'text-yellow-400'}`}>
                                {financialSummary.is_fully_paid ? 'Fully Paid' : 'Pending'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                            <span>Payment Progress</span>
                            <span>{Math.round((financialSummary.total_paid / financialSummary.total_amount) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${Math.min(100, (financialSummary.total_paid / financialSummary.total_amount) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Payment History</h3>
                    <Button onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }} size="sm">
                        {showForm ? 'Cancel' : '+ Record Payment'}
                    </Button>
                </div>

                {showForm && (
                    <div className="p-6 bg-slate-900/30 border-b border-slate-700/50">
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Amount (COP) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={amount || ''}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setAmount(isNaN(val) ? 0 : val);
                                    }}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            {!editingPayment && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Payment Type *</label>
                                    <select
                                        value={paymentType}
                                        onChange={(e) => setPaymentType(e.target.value as 'deposit' | 'balance' | 'penalty')}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                    >
                                        <option value="deposit">Deposit</option>
                                        <option value="balance">Balance</option>
                                        <option value="penalty">Penalty</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method *</label>
                                <select
                                    value={paymentMethodId}
                                    onChange={(e) => setPaymentMethodId(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    <option value="">None (No fees)</option>
                                    {paymentMethods.length === 0 && (
                                        <option value="" disabled>No payment methods available</option>
                                    )}
                                    {paymentMethods.map((method) => (
                                        <option key={method.id} value={method.id}>
                                            {method.name} ({Number(method.transaction_fee_percent).toFixed(2)}% + ${Number(method.transaction_fee_fixed).toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {!editingPayment && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Beneficiary *</label>
                                    <select
                                        value={beneficiary}
                                        onChange={(e) => setBeneficiary(e.target.value as 'company' | 'third_party')}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                    >
                                        <option value="company">Company</option>
                                        <option value="third_party">Third Party</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Status *</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        {/* Net Amount Preview */}
                        {amount > 0 && paymentMethodId && (
                            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                <div className="text-sm text-slate-300 mb-2">Net Amount Preview:</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-green-400">
                                        {formatCurrency(netAmount)}
                                    </span>
                                    <span className="text-sm text-slate-400">
                                        after {formatCurrency(totalFees)} in fees
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={editingPayment ? handleEditPayment : handleAddPayment}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (editingPayment ? 'Update Payment' : 'Record Payment')}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/30">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Type</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Method</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Amount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Net Amount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 text-slate-300 text-sm">
                                        {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                            {payment.payment_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 text-sm">{getPaymentMethodName(payment.payment_method_id)}</td>
                                    <td className="px-6 py-4 text-white font-medium">{formatCurrency(payment.amount)}</td>
                                    <td className="px-6 py-4 text-green-400 font-medium">{formatCurrency(payment.net_amount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${payment.status === 'paid'
                                            ? 'bg-green-500/20 text-green-300'
                                            : 'bg-yellow-500/20 text-yellow-300'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(payment)}
                                                className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(payment.id)}
                                                className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {payments.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            No payments recorded yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
