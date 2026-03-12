"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Payment, PaymentCreate, PaymentUpdate, PaymentMethod, FinancialSummary } from "@/types";
import { Button } from "@/components/ui/Button";

interface PaymentManagementProps {
    reservationId: string;
    totalAmount: number;
    onPaymentAdded?: () => void;
    dict?: any;
}

export function PaymentManagement({ reservationId, totalAmount, onPaymentAdded, dict }: PaymentManagementProps) {
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
                <div className="rounded-sm p-6" style={{ backgroundColor: 'rgba(75,61,28,0.03)', border: '1px solid rgba(82,120,88,0.2)' }}>
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-4" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.financial_summary || "Financial Summary"}</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.total_amount || "Total Amount"}</div>
                            <div className="text-xl font-bold" style={{ color: '#265140', fontFamily: "'MegantZ', serif" }}>{formatCurrency(financialSummary.total_amount)}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.total_paid || "Total Paid"}</div>
                            <div className="text-xl font-bold" style={{ color: '#527858', fontFamily: "'MegantZ', serif" }}>{formatCurrency(financialSummary.total_paid)}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.balance || "Balance"}</div>
                            <div className="text-xl font-bold" style={{ color: '#c1a982', fontFamily: "'MegantZ', serif" }}>{formatCurrency(financialSummary.balance)}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.status || "Status"}</div>
                            <div className={`text-xl font-bold uppercase tracking-widest text-[10px]`} style={{ color: financialSummary.is_fully_paid ? '#527858' : '#c1a982', fontFamily: "'Berlin Sans', sans-serif" }}>
                                {financialSummary.is_fully_paid ? (dict?.admin?.reservations?.fully_paid || 'Fully Paid') : (dict?.admin?.reservations?.pending || 'Pending')}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>
                            <span>{dict?.admin?.reservations?.payment_progress || "Payment Progress"}</span>
                            <span>{Math.round((financialSummary.total_paid / financialSummary.total_amount) * 100)}%</span>
                        </div>
                        <div className="h-2 rounded-sm overflow-hidden" style={{ backgroundColor: 'rgba(75,61,28,0.1)' }}>
                            <div
                                className="h-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (financialSummary.total_paid / financialSummary.total_amount) * 100)}%`, backgroundColor: '#527858' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                    <h3 className="text-lg font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.payment_history || "Payment History"}</h3>
                    <Button onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }} size="sm" variant={showForm ? 'outline' : 'sand'}>
                        {showForm ? (dict?.admin?.reservations?.cancel || 'Cancel') : (dict?.admin?.reservations?.record_payment || '+ Record Payment')}
                    </Button>
                </div>

                {showForm && (
                    <div className="p-6" style={{ backgroundColor: 'rgba(75,61,28,0.02)', borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                        {error && (
                            <div className="mb-4 p-3 rounded-sm text-sm" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.amount_cop || "Amount (COP) *"}</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={amount || ''}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setAmount(isNaN(val) ? 0 : val);
                                    }}
                                    className="w-full px-4 py-2 rounded-sm outline-none font-medium"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                />
                            </div>

                            {!editingPayment && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.payment_type || "Payment Type *"}</label>
                                    <select
                                        value={paymentType}
                                        onChange={(e) => setPaymentType(e.target.value as 'deposit' | 'balance' | 'penalty')}
                                        className="w-full px-4 py-2 rounded-sm outline-none font-medium"
                                        style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                    >
                                        <option value="deposit">{dict?.admin?.reservations?.deposit || "Deposit"}</option>
                                        <option value="balance">{dict?.admin?.reservations?.balance_option || "Balance"}</option>
                                        <option value="penalty">{dict?.admin?.reservations?.penalty || "Penalty"}</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.payment_method_label || "Payment Method *"}</label>
                                <select
                                    value={paymentMethodId}
                                    onChange={(e) => setPaymentMethodId(e.target.value)}
                                    className="w-full px-4 py-2 rounded-sm outline-none font-medium"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                >
                                    <option value="">{dict?.admin?.reservations?.none_no_fees || "None (No fees)"}</option>
                                    {paymentMethods.length === 0 && (
                                        <option value="" disabled>{dict?.admin?.reservations?.no_payment_methods || "No payment methods available"}</option>
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
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.beneficiary || "Beneficiary *"}</label>
                                    <select
                                        value={beneficiary}
                                        onChange={(e) => setBeneficiary(e.target.value as 'company' | 'third_party')}
                                        className="w-full px-4 py-2 rounded-sm outline-none font-medium"
                                        style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                    >
                                        <option value="company">{dict?.admin?.reservations?.company || "Company"}</option>
                                        <option value="third_party">{dict?.admin?.reservations?.third_party || "Third Party"}</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.status || "Status *"}</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')}
                                    className="w-full px-4 py-2 rounded-sm outline-none font-medium"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                >
                                    <option value="paid">{dict?.admin?.reservations?.paid || "Paid"}</option>
                                    <option value="pending">{dict?.admin?.reservations?.pending || "Pending"}</option>
                                </select>
                            </div>
                        </div>

                        {/* Net Amount Preview */}
                        {amount > 0 && paymentMethodId && (
                            <div className="mt-4 p-4 rounded-sm" style={{ backgroundColor: 'rgba(82,120,88,0.05)', border: '1px solid rgba(82,120,88,0.2)' }}>
                                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'Berlin Sans', sans-serif" }}>Net Amount Preview:</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold" style={{ color: '#265140', fontFamily: "'MegantZ', serif" }}>
                                        {formatCurrency(netAmount)}
                                    </span>
                                    <span className="text-sm font-medium" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'MegantZ', serif" }}>
                                        after {formatCurrency(totalFees)} in fees
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button
                                variant="sand"
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
                        <thead style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                            <tr style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.date || "Date"}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.type || "Type"}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.method || "Method"}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.amount || "Amount"}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.net_amount || "Net Amount"}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.status || "Status"}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.actions || "Actions"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id} className="transition-colors hover:bg-black/5" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                        {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm" style={{ backgroundColor: 'rgba(75,61,28,0.05)', color: '#4b3d1c', border: '1px solid rgba(75,61,28,0.1)' }}>
                                            {payment.payment_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-sm" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{getPaymentMethodName(payment.payment_method_id)}</td>
                                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#265140', fontFamily: "'MegantZ', serif" }}>{formatCurrency(payment.amount)}</td>
                                    <td className="px-6 py-4 font-bold text-sm" style={{ color: '#527858', fontFamily: "'MegantZ', serif" }}>{formatCurrency(payment.net_amount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest`} style={{
                                            backgroundColor: payment.status === 'paid' ? 'rgba(38,81,64,0.05)' : 'rgba(75,61,28,0.05)',
                                            color: payment.status === 'paid' ? '#265140' : '#c1a982',
                                            border: payment.status === 'paid' ? '1px solid rgba(38,81,64,0.1)' : '1px solid rgba(75,61,28,0.1)'
                                        }}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => handleEdit(payment)}
                                                className="text-xs font-bold uppercase tracking-widest transition-colors"
                                                style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}
                                                onMouseOver={(e) => e.currentTarget.style.color = '#265140'}
                                                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(75,61,28,0.5)'}
                                            >
                                                {dict?.admin?.reservations?.edit_action || "Edit"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(payment.id)}
                                                className="text-xs font-bold uppercase tracking-widest transition-colors"
                                                style={{ color: '#cc4444', fontFamily: "'Berlin Sans', sans-serif" }}
                                                onMouseOver={(e) => e.currentTarget.style.color = '#992222'}
                                                onMouseOut={(e) => e.currentTarget.style.color = '#cc4444'}
                                            >
                                                {dict?.admin?.reservations?.delete || "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {payments.length === 0 && (
                        <div className="text-center py-12 font-medium text-sm" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'MegantZ', serif" }}>
                            No payments recorded yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
