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
        const formatted = Math.round(amount)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return `$ ${formatted}`;
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.title || "Reservations"}</h1>
                    <p className="mt-1 text-sm font-medium" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.reservations?.subtitle || "Manage property bookings and stays"}</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} variant="sand">
                    {dict?.admin?.reservations?.add_reservation || "Create Reservation"}
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-sm text-sm font-medium" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 rounded-sm border p-5 space-y-4" style={{ backgroundColor: 'rgba(38,81,64,0.02)', borderColor: 'rgba(82,120,88,0.2)' }}>
                <div className="flex flex-wrap gap-4 items-end">
                    {/* Property filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
                            {dict?.table?.property || "Property"}
                        </label>
                        <select
                            value={filterProperty}
                            onChange={(e) => setFilterProperty(e.target.value)}
                            className="px-4 py-2.5 rounded-sm transition-all outline-none cursor-pointer"
                            style={{
                                backgroundColor: '#e6e3d7',
                                border: '1px solid rgba(82,120,88,0.3)',
                                color: '#4b3d1c',
                                fontFamily: "'MegantZ', serif",
                                boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)'
                            }}
                        >
                            <option value="">{dict?.admin?.properties?.filter_all || "All Properties"}</option>
                            {properties.map(prop => (
                                <option key={prop.id} value={prop.id}>{prop.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
                            {dict?.admin?.table?.status || "Status"}
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 rounded-sm transition-all outline-none cursor-pointer"
                            style={{
                                backgroundColor: '#e6e3d7',
                                border: '1px solid rgba(82,120,88,0.3)',
                                color: '#4b3d1c',
                                fontFamily: "'MegantZ', serif",
                                boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)'
                            }}
                        >
                            <option value="">{dict?.admin?.common?.all_statuses || "All Statuses"}</option>
                            <option value="confirmed">{dict?.admin?.reservations?.confirmed || "Confirmed"}</option>
                            <option value="cancelled">{dict?.admin?.reservations?.cancelled || "Cancelled"}</option>
                            <option value="completed">{dict?.admin?.reservations?.completed || "Completed"}</option>
                        </select>
                    </div>

                    {/* Date range divider */}
                    <div className="hidden md:block w-px h-10 self-end mb-0.5" style={{ backgroundColor: 'rgba(82,120,88,0.2)' }} />

                    {/* Start date filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
                            {dict?.admin?.reservations?.filter_start_date || "From Date"}
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#527858' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-sm transition-all outline-none"
                                style={{
                                    backgroundColor: '#e6e3d7',
                                    border: '1px solid rgba(82,120,88,0.3)',
                                    color: '#4b3d1c',
                                    fontFamily: "'MegantZ', serif",
                                    boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)'
                                }}
                            />
                        </div>
                    </div>

                    {/* End date filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>
                            {dict?.admin?.reservations?.filter_end_date || "To Date"}
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#527858' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="date"
                                value={filterEndDate}
                                min={filterStartDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-sm transition-all outline-none"
                                style={{
                                    backgroundColor: '#e6e3d7',
                                    border: '1px solid rgba(82,120,88,0.3)',
                                    color: '#4b3d1c',
                                    fontFamily: "'MegantZ', serif",
                                    boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Clear dates */}
                    {hasDateFilter && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-transparent font-medium uppercase tracking-wider select-none">x</label>
                            <button
                                onClick={clearDateFilters}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-sm border hover:bg-black/5 text-sm transition-all"
                                style={{ borderColor: 'rgba(82,120,88,0.3)', color: '#265140', fontFamily: "'MegantZ', serif", fontWeight: 'bold' }}
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
                    <div className="flex items-center gap-2 text-xs rounded-sm px-4 py-2 w-fit font-bold" style={{ backgroundColor: '#265140', color: '#f4f2eb', fontFamily: "'MegantZ', serif" }}>
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
                        <span style={{ color: '#cfbb9b' }}>• {filteredReservations.length} results</span>
                    </div>
                )}
            </div>

            <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
                <table className="w-full">
                    <thead style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                        <tr style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.property || "Property"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.guest || "Guest"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.dates || "Dates"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.channel || "Channel"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.total || "Total"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.paid || "Paid"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.reservations?.balance || "Balance"}</th>
                            <th className="px-6 py-4 text-left text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.status || "Status"}</th>
                            <th className="px-6 py-4 text-right text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.actions || "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations.map((reservation) => {
                            const balance = calculateBalance(reservation);
                            const isFullyPaid = balance <= 0;

                            return (
                                <tr key={reservation.id} className="transition-colors hover:bg-black/5" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                                    <td className="px-6 py-4 font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                                        {getPropertyName(reservation.property_id)}
                                    </td>
                                    <td className="px-6 py-4 font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                        {getGuestName(reservation.guest_id)}
                                        {reservation.reservation_type === 'owner_use' && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-bold uppercase tracking-widest rounded-sm" style={{ backgroundColor: 'rgba(207,187,155,0.2)', color: '#4b3d1c' }}>
                                                {dict?.admin?.reservations?.owner_use || "Owner"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>
                                        <div className="font-bold">{new Date(reservation.start_date).toLocaleDateString()}</div>
                                        <div>to {new Date(reservation.end_date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>
                                        {getChannelName(reservation.channel_id)}
                                    </td>
                                    <td className="px-6 py-4 font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                        {formatCurrency(reservation.total_amount)}
                                    </td>
                                    <td className="px-6 py-4 font-medium" style={{ color: '#527858', fontFamily: "'MegantZ', serif" }}>
                                        {formatCurrency(reservation.total_paid || 0)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold" style={{ color: isFullyPaid ? '#527858' : '#cc4444', fontFamily: "'Berlin Sans', sans-serif" }}>
                                            {formatCurrency(balance)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest" style={{
                                            backgroundColor: reservation.status === 'confirmed' ? 'rgba(82,120,88,0.1)' :
                                                reservation.status === 'cancelled' ? 'rgba(204,68,68,0.1)' :
                                                    'rgba(75,61,28,0.1)',
                                            color: reservation.status === 'confirmed' ? '#527858' :
                                                reservation.status === 'cancelled' ? '#cc4444' :
                                                    '#4b3d1c'
                                        }}>
                                            {dict?.admin?.reservations?.[reservation.status] || reservation.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => router.push(`/admin/reservations/${reservation.id}`)}
                                            className="font-bold uppercase tracking-widest transition-colors hover:text-[#527858]" style={{ color: '#265140', fontSize: '10px' }}
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
                <div className="text-center py-12 text-sm font-medium" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>
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
