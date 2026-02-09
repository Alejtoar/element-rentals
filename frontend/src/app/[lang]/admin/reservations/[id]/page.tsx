"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/api/client";
import { Reservation, Property, Guest, Channel } from "@/types";
import { PaymentManagement } from "@/components/admin/PaymentManagement";

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string; lang: string }> }) {
    const { id, lang } = use(params);
    const router = useRouter();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [property, setProperty] = useState<Property | null>(null);
    const [guest, setGuest] = useState<Guest | null>(null);
    const [channel, setChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const resData = await api.reservations.getById(id);
            setReservation(resData);

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
                <h1 className="text-3xl font-bold text-white">Reservation Details</h1>
                <p className="text-slate-400 mt-1">Manage reservation and payments</p>
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
                            <button className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-colors text-left">
                                View Property
                            </button>
                            <button className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-white transition-colors text-left">
                                Contact Guest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
