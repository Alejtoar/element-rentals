"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/api/client";
import { Reservation, Property, Guest, Channel } from "@/types";
import { PaymentManagement } from "@/components/admin/PaymentManagement";
import { Button } from "@/components/ui/Button";

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string; lang: string }> }) {
    const { id, lang } = use(params);
    const router = useRouter();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [property, setProperty] = useState<Property | null>(null);
    const [guest, setGuest] = useState<Guest | null>(null);
    const [channel, setChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showGuestInfoModal, setShowGuestInfoModal] = useState(false);

    // Edit form state
    const [editStatus, setEditStatus] = useState<'confirmed' | 'cancelled' | 'completed'>('confirmed');
    const [editAmount, setEditAmount] = useState(0);
    const [editStartDate, setEditStartDate] = useState("");
    const [editEndDate, setEditEndDate] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const resData = await api.reservations.getById(id);
            setReservation(resData);
            setEditStatus(resData.status);
            setEditAmount(resData.total_amount);
            setEditStartDate(resData.start_date.split('T')[0]);
            setEditEndDate(resData.end_date.split('T')[0]);

            const [propData, channelData] = await Promise.all([
                api.properties.getById(resData.property_id),
                api.channels.getById(resData.channel_id),
            ]);
            setProperty(propData);
            setChannel(channelData);

            if (resData.guest_id) {
                const guestData = await api.guests.getById(resData.guest_id);
                setGuest(guestData);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateReservation = async () => {
        if (!reservation) return;

        if (editAmount <= 0) {
            setError("Amount must be greater than 0");
            return;
        }

        if (new Date(editStartDate) >= new Date(editEndDate)) {
            setError("Check-out date must be after check-in date");
            return;
        }

        try {
            setUpdating(true);
            setError("");
            await api.reservations.update(reservation.id, {
                status: editStatus,
                total_amount: editAmount,
                start_date: editStartDate,
                end_date: editEndDate,
            });
            await loadData();
            setShowEditModal(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const resetEditForm = () => {
        if (reservation) {
            setEditStatus(reservation.status);
            setEditAmount(reservation.total_amount);
            setEditStartDate(reservation.start_date.split('T')[0]);
            setEditEndDate(reservation.end_date.split('T')[0]);
            setError("");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'completed':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error || !reservation) {
        return (
            <div className="p-8">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                    {error || "Reservation not found"}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <button
                    onClick={() => router.push(`/${lang}/admin/reservations`)}
                    className="text-slate-400 hover:text-white transition-colors mb-4"
                >
                    ← Back to Reservations
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Reservation Details</h1>
                        <p className="text-slate-400 mt-1">Manage reservation and payments</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Reservation Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-slate-400 text-sm">Property</div>
                                <div className="text-white font-medium">{property?.name || "Unknown"}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Channel</div>
                                <div className="text-white font-medium">{channel?.name || "Unknown"}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Guest</div>
                                <div className="text-white font-medium">
                                    {reservation.reservation_type === 'owner_use' ? 'Owner Use' : guest?.full_name || "Unknown"}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Guest Count</div>
                                <div className="text-white font-medium">{reservation.guest_count}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Check-in</div>
                                <div className="text-white font-medium">
                                    {new Date(reservation.start_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Check-out</div>
                                <div className="text-white font-medium">
                                    {new Date(reservation.end_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Total Amount</div>
                                <div className="text-white font-medium text-lg">
                                    {formatCurrency(reservation.total_amount)}
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">Status</div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <PaymentManagement
                        reservationId={reservation.id}
                        totalAmount={reservation.total_amount}
                        onPaymentAdded={loadData}
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    resetEditForm();
                                    setShowEditModal(true);
                                }}
                                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-lg text-white transition-all duration-200 text-left font-medium"
                            >
                                Edit Reservation
                            </button>
                            {guest && (
                                <button
                                    onClick={() => setShowGuestInfoModal(true)}
                                    className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-colors text-left"
                                >
                                    Guest Contact Info
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-purple-300 mb-3">Reservation Type</h3>
                        <p className="text-white font-medium">
                            {reservation.reservation_type === 'owner_use' ? 'Owner Use' : 'Guest Booking'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Reservation Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">Edit Reservation</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Status
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <label className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                                        <input
                                            type="radio"
                                            value="confirmed"
                                            checked={editStatus === 'confirmed'}
                                            onChange={(e) => setEditStatus(e.target.value as 'confirmed' | 'cancelled' | 'completed')}
                                            className="w-4 h-4 text-green-500 mb-2"
                                        />
                                        <span className="text-white text-sm">Confirmed</span>
                                        <span className="mt-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                                    </label>
                                    <label className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                                        <input
                                            type="radio"
                                            value="completed"
                                            checked={editStatus === 'completed'}
                                            onChange={(e) => setEditStatus(e.target.value as 'confirmed' | 'cancelled' | 'completed')}
                                            className="w-4 h-4 text-blue-500 mb-2"
                                        />
                                        <span className="text-white text-sm">Completed</span>
                                        <span className="mt-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Finished</span>
                                    </label>
                                    <label className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                                        <input
                                            type="radio"
                                            value="cancelled"
                                            checked={editStatus === 'cancelled'}
                                            onChange={(e) => setEditStatus(e.target.value as 'confirmed' | 'cancelled' | 'completed')}
                                            className="w-4 h-4 text-red-500 mb-2"
                                        />
                                        <span className="text-white text-sm">Cancelled</span>
                                        <span className="mt-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Inactive</span>
                                    </label>
                                </div>
                            </div>

                            {/* Total Amount */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Total Amount (COP)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Check-in Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Check-out Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editEndDate}
                                        onChange={(e) => setEditEndDate(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetEditForm();
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateReservation}
                                disabled={updating}
                                className="flex-1"
                            >
                                {updating ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Guest Contact Info Modal */}
            {showGuestInfoModal && guest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Guest Contact Information</h2>

                        <div className="space-y-4">
                            <div>
                                <div className="text-slate-400 text-sm mb-1">Full Name</div>
                                <div className="text-white font-medium text-lg">{guest.full_name}</div>
                            </div>

                            <div>
                                <div className="text-slate-400 text-sm mb-1">Email</div>
                                {guest.email ? (
                                    <a
                                        href={`mailto:${guest.email}`}
                                        className="text-purple-400 hover:text-purple-300 font-medium"
                                    >
                                        {guest.email}
                                    </a>
                                ) : (
                                    <div className="text-slate-500">Not provided</div>
                                )}
                            </div>

                            <div>
                                <div className="text-slate-400 text-sm mb-1">Phone</div>
                                <a
                                    href={`tel:${guest.phone}`}
                                    className="text-purple-400 hover:text-purple-300 font-medium"
                                >
                                    {guest.phone}
                                </a>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                onClick={() => setShowGuestInfoModal(false)}
                                className="w-full"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
