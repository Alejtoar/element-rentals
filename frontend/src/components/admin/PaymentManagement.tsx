"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Payment, PaymentCreate, FinancialSummary } from "@/types";
import { Button } from "@/components/ui/Button";

interface PaymentManagementProps {
    reservationId: string;
    totalAmount: number;
    onPaymentAdded?: () => void;
}

export function PaymentManagement({ reservationId, totalAmount, onPaymentAdded }: PaymentManagementProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [amount, setAmount] = useState(0);
    const [paymentType, setPaymentType] = useState<'deposit' | 'balance' | 'penalty'>('deposit');
    const [provider, setProvider] = useState('Cash');
    const [beneficiary, setBeneficiary] = useState<'company' | 'third_party'>('company');
    const [status, setStatus] = useState<'paid' | 'pending'>('paid');

    useEffect(() => {
        loadData();
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
                provider,
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

    const resetForm = () => {
        setAmount(0);
        setPaymentType('deposit');
        setProvider('Cash');
        setBeneficiary('company');
        setStatus('paid');
        setError("");
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
                    <Button onClick={() => setShowForm(!showForm)} size="sm">
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

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method *</label>
                                <select
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Transfer">Bank Transfer</option>
                                    <option value="Stripe">Stripe</option>
                                    <option value="PayPal">PayPal</option>
                                </select>
                            </div>

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

                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddPayment} disabled={loading}>
                                {loading ? 'Recording...' : 'Record Payment'}
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
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
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
                                    <td className="px-6 py-4 text-slate-300 text-sm">{payment.provider}</td>
                                    <td className="px-6 py-4 text-white font-medium">{formatCurrency(payment.amount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${payment.status === 'paid'
                                            ? 'bg-green-500/20 text-green-300'
                                            : 'bg-yellow-500/20 text-yellow-300'
                                            }`}>
                                            {payment.status}
                                        </span>
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
