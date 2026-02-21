"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/api/client";
import { Reservation, Property, Guest, Channel } from "@/types";
import { Button } from "@/components/ui/Button";
import { CreateReservationModal } from "@/components/admin/CreateReservationModal";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

export default function ReservationsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params || {});
    const [dict, setDict] = useState<any>(null);
    const router = useRouter();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [filterProperty, setFilterProperty] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    useEffect(() => {
        const loadInit = async () => {
            if (lang) {
                const d = await getDictionary(lang as Locale);
                setDict(d);
            }
        };
        loadInit();
        loadData();
    }, [lang]);

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
        if (!guestId) return dict?.admin?.reservations?.owner_use || "Owner Use";
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
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateBalance = (reservation: Reservation) => {
        const totalPaid = reservation.total_paid || 0;
        return reservation.total_amount - totalPaid;
    };

    const clearDateFilters = () => {
        setFilterStartDate("");
        setFilterEndDate("");
    };

    const filteredReservations = reservations.filter(res => {
        if (filterProperty && res.property_id !== filterProperty) return false;
        if (filterStatus && res.status !== filterStatus) return false;
        // Date range filter: reservation overlaps with the searched period
        if (filterStartDate || filterEndDate) {
            const resStart = res.start_date;
            const resEnd = res.end_date;
            if (filterStartDate && resEnd < filterStartDate) return false;
            if (filterEndDate && resStart > filterEndDate) return false;
        }
        return true;
    });

    const hasDateFilter = filterStartDate || filterEndDate;

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
                    <h1 className="text-3xl font-bold text-white">{dict?.admin?.reservations?.title || "Reservations"}</h1>
                    <p className="text-slate-400 mt-1">{dict?.admin?.reservations?.subtitle || "Manage property bookings and stays"}</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    {dict?.admin?.reservations?.add_reservation || "Create Reservation"}
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5 space-y-4">
                <div className="flex flex-wrap gap-4 items-end">
                    {/* Property filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                            {dict?.table?.property || "Property"}
                        </label>
                        <select
                            value={filterProperty}
                            onChange={(e) => setFilterProperty(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
                        >
                            <option value="">{dict?.admin?.properties?.filter_all || "All Properties"}</option>
                            {properties.map(prop => (
                                <option key={prop.id} value={prop.id}>{prop.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                            {dict?.admin?.table?.status || "Status"}
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
                        >
                            <option value="">{dict?.admin?.common?.all_statuses || "All Statuses"}</option>
                            <option value="confirmed">{dict?.admin?.reservations?.confirmed || "Confirmed"}</option>
                            <option value="cancelled">{dict?.admin?.reservations?.cancelled || "Cancelled"}</option>
                            <option value="completed">{dict?.admin?.reservations?.completed || "Completed"}</option>
                        </select>
                    </div>

                    {/* Date range divider */}
                    <div className="hidden md:block w-px h-10 bg-slate-700/60 self-end mb-0.5" />

                    {/* Start date filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                            {dict?.admin?.reservations?.filter_start_date || "From Date"}
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20 text-sm [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* End date filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                            {dict?.admin?.reservations?.filter_end_date || "To Date"}
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="date"
                                value={filterEndDate}
                                min={filterStartDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20 text-sm [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Clear dates */}
                    {hasDateFilter && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-transparent font-medium uppercase tracking-wider select-none">x</label>
                            <button
                                onClick={clearDateFilters}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {dict?.admin?.reservations?.clear_filters || "Clear Filters"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Active filter chips */}
                {(filterStartDate || filterEndDate) && (
                    <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2 w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span>
                            {filterStartDate && filterEndDate
                                ? `${filterStartDate} → ${filterEndDate}`
                                : filterStartDate
                                    ? `${dict?.admin?.reservations?.filter_start_date || "From"}: ${filterStartDate}`
                                    : `${dict?.admin?.reservations?.filter_end_date || "To"}: ${filterEndDate}`}
                        </span>
                        <span className="text-purple-400/60">• {filteredReservations.length} results</span>
                    </div>
                )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-700/30">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.table?.property || "Property"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.reservations?.guest || "Guest"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.reservations?.dates || "Dates"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.reservations?.channel || "Channel"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.reservations?.total || "Total"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.reservations?.paid || "Paid"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.reservations?.balance || "Balance"}</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">{dict?.admin?.table?.status || "Status"}</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">{dict?.admin?.table?.actions || "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {filteredReservations.map((reservation) => {
                            const balance = calculateBalance(reservation);
                            const isFullyPaid = balance <= 0;

                            return (
                                <tr key={reservation.id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">
                                        {getPropertyName(reservation.property_id)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        {getGuestName(reservation.guest_id)}
                                        {reservation.reservation_type === 'owner_use' && (
                                            <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
                                                {dict?.admin?.reservations?.owner_use || "Owner"}
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
                                    <td className="px-6 py-4 text-green-400 font-medium">
                                        {formatCurrency(reservation.total_paid || 0)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${isFullyPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {formatCurrency(balance)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                                            reservation.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                                                'bg-blue-500/20 text-blue-300'
                                            }`}>
                                            {dict?.admin?.reservations?.[reservation.status] || reservation.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => router.push(`/admin/reservations/${reservation.id}`)}
                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            {dict?.admin?.reservations?.view_details || "View"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredReservations.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    {dict?.admin?.common?.no_data || "No reservations found"}
                </div>
            )}

            <CreateReservationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={loadData}
            />
        </div>
    );
}
