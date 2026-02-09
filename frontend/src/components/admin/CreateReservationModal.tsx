"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Property, Guest, Channel, GuestCreate } from "@/types";
import { Button } from "@/components/ui/Button";

interface CreateReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateReservationModal({ isOpen, onClose, onSuccess }: CreateReservationModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [properties, setProperties] = useState<Property[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);

    const [propertyId, setPropertyId] = useState("");
    const [guestId, setGuestId] = useState("");
    const [channelId, setChannelId] = useState("");
    const [reservationType, setReservationType] = useState<'commercial' | 'owner_use'>('commercial');
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [guestCount, setGuestCount] = useState(1);
    const [totalAmount, setTotalAmount] = useState(0);

    const [showQuickCreate, setShowQuickCreate] = useState(false);
    const [newGuestName, setNewGuestName] = useState("");
    const [newGuestEmail, setNewGuestEmail] = useState("");
    const [newGuestPhone, setNewGuestPhone] = useState("");

    const [guestSearch, setGuestSearch] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            const [propData, guestData, channelData] = await Promise.all([
                api.properties.getAll({ active: true }),
                api.guests.getAll(),
                api.channels.getAll(),
            ]);
            setProperties(propData);
            setGuests(guestData);
            setChannels(channelData);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleQuickCreateGuest = async () => {
        if (!newGuestName || !newGuestPhone) {
            setError("Guest name and phone are required");
            return;
        }

        try {
            setLoading(true);
            const newGuest: GuestCreate = {
                full_name: newGuestName,
                email: newGuestEmail || undefined,
                phone: newGuestPhone,
            };
            const createdGuest = await api.guests.create(newGuest);
            setGuests([...guests, createdGuest]);
            setGuestId(createdGuest.id);
            setShowQuickCreate(false);
            setNewGuestName("");
            setNewGuestEmail("");
            setNewGuestPhone("");
            setError("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!propertyId || !channelId || !startDate || !endDate) {
            setError("Please fill in all required fields");
            return;
        }

        if (reservationType === 'commercial' && !guestId) {
            setError("Please select or create a guest for commercial reservations");
            return;
        }

        try {
            setLoading(true);
            await api.reservations.create({
                property_id: propertyId,
                guest_id: reservationType === 'commercial' ? guestId : undefined,
                channel_id: channelId,
                reservation_type: reservationType,
                start_date: startDate,
                end_date: endDate,
                guest_count: guestCount,
                total_amount: totalAmount,
                status: 'confirmed',
            });
            onSuccess();
            resetForm();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setPropertyId("");
        setGuestId("");
        setChannelId("");
        setReservationType('commercial');
        setStartDate("");
        setEndDate("");
        setGuestCount(1);
        setTotalAmount(0);
        setError("");
        setShowQuickCreate(false);
        setGuestSearch("");
    };

    const filteredGuests = guests.filter(g =>
        g.full_name.toLowerCase().includes(guestSearch.toLowerCase()) ||
        g.phone.includes(guestSearch) ||
        (g.email && g.email.toLowerCase().includes(guestSearch.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Create Reservation</h2>
                            <p className="text-slate-400 text-sm mt-1">Step {step} of 3</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); onClose(); }}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-4 flex gap-2">
                        {[1, 2, 3].map(s => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-purple-500' : 'bg-slate-700'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Property *</label>
                                <select
                                    value={propertyId}
                                    onChange={(e) => setPropertyId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    <option value="">Select a property</option>
                                    {properties.map(prop => (
                                        <option key={prop.id} value={prop.id}>{prop.name} - {prop.city}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Channel *</label>
                                <select
                                    value={channelId}
                                    onChange={(e) => setChannelId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                >
                                    <option value="">Select a channel</option>
                                    {channels.map(channel => (
                                        <option key={channel.id} value={channel.id}>
                                            {channel.name} {channel.external && '(External)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Reservation Type *</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="commercial"
                                            checked={reservationType === 'commercial'}
                                            onChange={(e) => setReservationType(e.target.value as 'commercial')}
                                            className="text-purple-500"
                                        />
                                        <span className="text-white">Commercial</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="owner_use"
                                            checked={reservationType === 'owner_use'}
                                            onChange={(e) => setReservationType(e.target.value as 'owner_use')}
                                            className="text-purple-500"
                                        />
                                        <span className="text-white">Owner Use</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {reservationType === 'commercial' ? (
                                <>
                                    {!showQuickCreate ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Search Guest</label>
                                                <input
                                                    type="text"
                                                    value={guestSearch}
                                                    onChange={(e) => setGuestSearch(e.target.value)}
                                                    placeholder="Search by name, email, or phone..."
                                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                                />
                                            </div>

                                            <div className="max-h-64 overflow-y-auto space-y-2">
                                                {filteredGuests.map(guest => (
                                                    <div
                                                        key={guest.id}
                                                        onClick={() => setGuestId(guest.id)}
                                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${guestId === guest.id
                                                            ? 'bg-purple-500/20 border-purple-500'
                                                            : 'bg-slate-900/30 border-slate-700 hover:border-slate-600'
                                                            }`}
                                                    >
                                                        <div className="font-medium text-white">{guest.full_name}</div>
                                                        <div className="text-sm text-slate-400">{guest.phone}</div>
                                                        {guest.email && <div className="text-sm text-slate-400">{guest.email}</div>}
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setShowQuickCreate(true)}
                                                className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-colors"
                                            >
                                                + Quick Create New Guest
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-semibold text-white">Quick Create Guest</h3>
                                                <button onClick={() => setShowQuickCreate(false)} className="text-slate-400 hover:text-white">
                                                    Cancel
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                                                <input
                                                    type="text"
                                                    value={newGuestName}
                                                    onChange={(e) => setNewGuestName(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Phone *</label>
                                                <input
                                                    type="tel"
                                                    value={newGuestPhone}
                                                    onChange={(e) => setNewGuestPhone(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Email (Optional)</label>
                                                <input
                                                    type="email"
                                                    value={newGuestEmail}
                                                    onChange={(e) => setNewGuestEmail(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                                />
                                            </div>

                                            <Button onClick={handleQuickCreateGuest} disabled={loading} className="w-full">
                                                {loading ? 'Creating...' : 'Create Guest'}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-purple-400 text-lg font-medium">Owner Use Reservation</div>
                                    <div className="text-slate-400 mt-2">No guest selection required</div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">End Date *</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Guest Count *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={guestCount}
                                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Total Amount (COP) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={totalAmount}
                                    onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-xl border-t border-slate-700/50 p-6 flex justify-between">
                    <Button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        variant="secondary"
                    >
                        Previous
                    </Button>

                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)}>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Reservation'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
