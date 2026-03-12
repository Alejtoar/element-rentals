"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/api/client";
import { Reservation, Property, Guest, Channel } from "@/types";
import { PaymentManagement } from "@/components/admin/PaymentManagement";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string; lang: string }> }) {
    const { id, lang } = use(params);
    const router = useRouter();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [property, setProperty] = useState<Property | null>(null);
    const [guest, setGuest] = useState<Guest | null>(null);
    const [channel, setChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dict, setDict] = useState<any>(null);
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

            const [propData, channelData, d] = await Promise.all([
                api.properties.getById(resData.property_id),
                api.channels.getById(resData.channel_id),
                getDictionary(lang as Locale)
            ]);
            setProperty(propData);
            setChannel(channelData);
            setDict(d);

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
                return { bg: 'rgba(38,81,64,0.05)', text: '#265140', border: 'rgba(38,81,64,0.1)' };
            case 'cancelled':
                return { bg: 'rgba(255,100,100,0.05)', text: '#cc4444', border: 'rgba(255,100,100,0.1)' };
            case 'completed':
                return { bg: 'rgba(75,61,28,0.05)', text: '#4b3d1c', border: 'rgba(75,61,28,0.1)' };
            default:
                return { bg: 'rgba(75,61,28,0.05)', text: 'rgba(75,61,28,0.5)', border: 'rgba(75,61,28,0.1)' };
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    if (error || !reservation) {
        return (
            <div className="p-8">
                <div className="rounded-sm p-4 text-sm" style={{ backgroundColor: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                    {error || dict?.admin?.reservations?.not_found || "Reservation not found"}
                </div>
            </div>
        );
    }

    const resStatusStyle = getStatusColor(reservation.status);

    return (
        <div className="p-8">
            <div className="mb-0 flex items-center justify-between pb-6" style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                <div>
                    <button
                        onClick={() => router.push(`/${lang}/admin/reservations`)}
                        className="flex items-center gap-2 mb-4 font-bold uppercase tracking-widest text-[10px] transition-colors"
                        style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#265140'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'rgba(75,61,28,0.5)'}
                    >
                        ← {dict?.admin?.reservations?.back || "Back to Reservations"}
                    </button>
                    <h1 className="text-3xl font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.detail_title || "Reservation Details"}</h1>
                    <p className="mt-1 font-medium text-sm" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.reservations?.detail_desc || "Manage reservation and payments"}</p>
                </div>
                <span className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest`} style={{
                    backgroundColor: resStatusStyle.bg,
                    color: resStatusStyle.text,
                    border: `1px solid ${resStatusStyle.border}`,
                    fontFamily: "'Berlin Sans', sans-serif"
                }}>
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-sm p-6" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
                        <h2 className="text-lg font-bold uppercase tracking-widest mb-6" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.info_title || "Reservation Information"}</h2>
                        <div className="grid grid-cols-2 gap-6 p-4 rounded-sm" style={{ backgroundColor: 'rgba(38,81,64,0.02)', border: '1px solid rgba(82,120,88,0.1)' }}>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.property || "Property"}</div>
                                <div className="font-bold text-base" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{property?.name || "Unknown"}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.channel || "Channel"}</div>
                                <div className="font-bold text-base" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{channel?.name || "Unknown"}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.guest || "Guest"}</div>
                                <div className="font-bold text-base" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                    {reservation.reservation_type === 'owner_use' ? (dict?.admin?.reservations?.owner_use || 'Owner Use') : guest?.full_name || "Unknown"}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.guest_count || "Guest Count"}</div>
                                <div className="font-bold text-base" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{reservation.guest_count}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.check_in || "Check-in"}</div>
                                <div className="font-bold text-base" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                    {new Date(reservation.start_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.check_out || "Check-out"}</div>
                                <div className="font-bold text-base" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                    {new Date(reservation.end_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.total_amount || "Total Amount"}</div>
                                <div className="font-bold text-lg" style={{ color: '#265140', fontFamily: "'MegantZ', serif" }}>
                                    {formatCurrency(reservation.total_amount)}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.status || "Status"}</div>
                                {(() => {
                                    const st = getStatusColor(reservation.status);
                                    return (
                                        <span className={`inline-block px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest`} style={{
                                            backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}`, fontFamily: "'Berlin Sans', sans-serif"
                                        }}>
                                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    <PaymentManagement
                        reservationId={reservation.id}
                        totalAmount={reservation.total_amount}
                        onPaymentAdded={loadData}
                        dict={dict}
                    />
                </div>

                <div className="space-y-6">
                    <div className="rounded-sm p-6" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
                        <h3 className="text-lg font-bold uppercase tracking-widest mb-4" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.quick_actions || "Quick Actions"}</h3>
                        <div className="space-y-3">
                            <Button
                                onClick={() => {
                                    resetEditForm();
                                    setShowEditModal(true);
                                }}
                                className="w-full text-left justify-start"
                                variant="sand"
                            >
                                {dict?.admin?.reservations?.edit || "Edit Reservation"}
                            </Button>
                            {guest && (
                                <Button
                                    onClick={() => setShowGuestInfoModal(true)}
                                    className="w-full text-left justify-start"
                                    variant="outline"
                                >
                                    {dict?.admin?.reservations?.guest_contact || "Guest Contact Info"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="rounded-sm p-6" style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.2)', boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.reservation_type || "Reservation Type"}</h3>
                        <p className="font-bold text-lg" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                            {reservation.reservation_type === 'owner_use' ? (dict?.admin?.reservations?.owner_use || 'Owner Use') : (dict?.admin?.reservations?.guest_booking || 'Guest Booking')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Reservation Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                        <h2 className="text-2xl font-bold uppercase tracking-widest mb-6" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>Edit Reservation</h2>

                        {error && (
                            <div className="mb-4 p-3 rounded-sm text-sm" style={{ backgroundColor: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Status */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'Berlin Sans', sans-serif" }}>
                                    Status
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <label className="flex flex-col items-center p-4 rounded-sm cursor-pointer transition-colors" style={{ backgroundColor: editStatus === 'confirmed' ? 'rgba(38,81,64,0.1)' : '#e6e3d7', border: editStatus === 'confirmed' ? '1px solid #265140' : '1px solid transparent' }}>
                                        <input
                                            type="radio"
                                            value="confirmed"
                                            checked={editStatus === 'confirmed'}
                                            onChange={(e) => setEditStatus(e.target.value as 'confirmed' | 'cancelled' | 'completed')}
                                            className="hidden"
                                        />
                                        <span className="font-bold text-sm uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>Confirmed</span>
                                    </label>
                                    <label className="flex flex-col items-center p-4 rounded-sm cursor-pointer transition-colors" style={{ backgroundColor: editStatus === 'completed' ? 'rgba(75,61,28,0.1)' : '#e6e3d7', border: editStatus === 'completed' ? '1px solid #4b3d1c' : '1px solid transparent' }}>
                                        <input
                                            type="radio"
                                            value="completed"
                                            checked={editStatus === 'completed'}
                                            onChange={(e) => setEditStatus(e.target.value as 'confirmed' | 'cancelled' | 'completed')}
                                            className="hidden"
                                        />
                                        <span className="font-bold text-sm uppercase tracking-widest" style={{ color: '#4b3d1c', fontFamily: "'Berlin Sans', sans-serif" }}>Completed</span>
                                    </label>
                                    <label className="flex flex-col items-center p-4 rounded-sm cursor-pointer transition-colors" style={{ backgroundColor: editStatus === 'cancelled' ? 'rgba(255,100,100,0.1)' : '#e6e3d7', border: editStatus === 'cancelled' ? '1px solid #cc4444' : '1px solid transparent' }}>
                                        <input
                                            type="radio"
                                            value="cancelled"
                                            checked={editStatus === 'cancelled'}
                                            onChange={(e) => setEditStatus(e.target.value as 'confirmed' | 'cancelled' | 'completed')}
                                            className="hidden"
                                        />
                                        <span className="font-bold text-sm uppercase tracking-widest" style={{ color: '#cc4444', fontFamily: "'Berlin Sans', sans-serif" }}>Cancelled</span>
                                    </label>
                                </div>
                            </div>

                            {/* Total Amount */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'Berlin Sans', sans-serif" }}>
                                    Total Amount (COP)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-sm outline-none font-medium"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'Berlin Sans', sans-serif" }}>
                                        Check-in Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-sm outline-none font-medium"
                                        style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'Berlin Sans', sans-serif" }}>
                                        Check-out Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editEndDate}
                                        onChange={(e) => setEditEndDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-sm outline-none font-medium"
                                        style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetEditForm();
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="sand"
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm max-w-md w-full p-8" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                        <h2 className="text-2xl font-bold uppercase tracking-widest mb-6" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>Guest Contact Info</h2>

                        <div className="space-y-6">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>Full Name</div>
                                <div className="font-bold text-xl" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{guest.full_name}</div>
                            </div>

                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>Email</div>
                                {guest.email ? (
                                    <a
                                        href={`mailto:${guest.email}`}
                                        className="font-medium text-lg transition-colors"
                                        style={{ color: '#265140', fontFamily: "'MegantZ', serif" }}
                                    >
                                        {guest.email}
                                    </a>
                                ) : (
                                    <div className="font-medium" style={{ color: 'rgba(75,61,28,0.4)', fontFamily: "'MegantZ', serif" }}>Not provided</div>
                                )}
                            </div>

                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>Phone</div>
                                <a
                                    href={`tel:${guest.phone}`}
                                    className="font-medium text-lg transition-colors"
                                    style={{ color: '#265140', fontFamily: "'MegantZ', serif" }}
                                >
                                    {guest.phone}
                                </a>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button
                                variant="sand"
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
