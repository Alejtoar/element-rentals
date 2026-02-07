"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Reservation, Property, Guest, Channel, Payment } from "@/types";
import { Button } from "@/components/ui/Button";

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [filterProperty, setFilterProperty] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [resData, propData, guestData, channelData] = await Promise.all([
                api.reservations.getAll(),
                api.properties.getAll(),
                api.guests.getAll(),
                api.channels.getAll(),
            ]);
            setReservations(resData);
            setProperties(propData);
            setGuests(guestData);
            setChannels(channelData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getPropertyName = (propertyId: string) => {
        const property = properties.find(p => p.id === propertyId);
        return property?.name || "Unknown";
    };

    const getGuestName = (guestId?: string) => {
        if (!guestId) return "Owner Use";
        const guest = guests.find(g => g.id === guestId);
        return guest?.full_name || "Unknown";
    };

    const getChannelName = (channelId: string) => {
        const channel = channels.find(c => c.id === channelId);
        return channel?.name || "Unknown";
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const filteredReservations = reservations.filter(res => {
        if (filterProperty && res.property_id !== filterProperty) return false;
        if (filterStatus && res.status !== filterStatus) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Reservations</h1>
                    <p className="text-slate-400 mt-1">Manage property bookings and stays</p>
                </div>
                <Button onClick={() => alert("Create reservation flow - Coming soon!")}>
                    Create Reservation
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex gap-4">
                <select
                    value={filterProperty}
                    onChange={(e) => setFilterProperty(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                    <option value="">All Properties</option>
                    {properties.map(prop => (
                        <option key={prop.id} value={prop.id}>{prop.name}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                    <option value="">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Reservations Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-700/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Property</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Guest</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Dates</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Channel</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {filteredReservations.map((reservation) => (
                            <tr key={reservation.id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">
                                    {getPropertyName(reservation.property_id)}
                                </td>
                                <td className="px-6 py-4 text-slate-300">
                                    {getGuestName(reservation.guest_id)}
                                    {reservation.reservation_type === 'owner_use' && (
                                        <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                                            Owner
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-300 text-sm">
                                    <div>{new Date(reservation.start_date).toLocaleDateString()}</div>
                                    <div className="text-slate-400">to {new Date(reservation.end_date).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-300">
                                    {getChannelName(reservation.channel_id)}
                                </td>
                                <td className="px-6 py-4 text-white font-medium">
                                    {formatCurrency(reservation.total_amount)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                                            reservation.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                                                'bg-blue-500/20 text-blue-300'
                                        }`}>
                                        {reservation.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => alert(`View details for ${reservation.id}`)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => alert(`Edit reservation ${reservation.id}`)}
                                        className="text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredReservations.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    No reservations found
                </div>
            )}
        </div>
    );
}
