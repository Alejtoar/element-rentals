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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                <div className="sticky top-0 z-10 p-6" style={{ backgroundColor: 'rgba(244,242,235,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>Create Reservation</h2>
                            <p className="text-sm font-medium mt-1" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>Step {step} of 3</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); onClose(); }}
                            className="transition-colors hover:text-[#265140]" style={{ color: 'rgba(75,61,28,0.5)' }}
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
                                className="h-1 flex-1 rounded-sm transition-colors"
                                style={{ backgroundColor: s <= step ? '#265140' : 'rgba(82,120,88,0.2)' }}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 rounded-sm text-sm font-bold" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Property *</label>
                                <select
                                    value={propertyId}
                                    onChange={(e) => setPropertyId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-sm outline-none cursor-pointer"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                >
                                    <option value="">Select a property</option>
                                    {properties.map(prop => (
                                        <option key={prop.id} value={prop.id}>{prop.name} - {prop.city}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Channel *</label>
                                <select
                                    value={channelId}
                                    onChange={(e) => setChannelId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-sm outline-none cursor-pointer"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
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
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Reservation Type *</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="commercial"
                                            checked={reservationType === 'commercial'}
                                            onChange={(e) => setReservationType(e.target.value as 'commercial')}
                                            style={{ accentColor: '#265140' }}
                                        />
                                        <span className="text-sm font-bold" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>Commercial</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="owner_use"
                                            checked={reservationType === 'owner_use'}
                                            onChange={(e) => setReservationType(e.target.value as 'owner_use')}
                                            style={{ accentColor: '#265140' }}
                                        />
                                        <span className="text-sm font-bold" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>Owner Use</span>
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
                                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Search Guest</label>
                                                <input
                                                    type="text"
                                                    value={guestSearch}
                                                    onChange={(e) => setGuestSearch(e.target.value)}
                                                    placeholder="Search by name, email, or phone..."
                                                    className="w-full px-4 py-3 rounded-sm outline-none"
                                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                                />
                                            </div>

                                            <div className="max-h-64 overflow-y-auto space-y-2">
                                                {filteredGuests.map(guest => (
                                                    <div
                                                        key={guest.id}
                                                        onClick={() => setGuestId(guest.id)}
                                                        className="p-4 rounded-sm cursor-pointer transition-all"
                                                        style={{
                                                            border: guestId === guest.id ? '2px solid #265140' : '1px solid rgba(82,120,88,0.2)',
                                                            backgroundColor: guestId === guest.id ? 'rgba(38,81,64,0.05)' : 'transparent'
                                                        }}
                                                    >
                                                        <div className="font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{guest.full_name}</div>
                                                        <div className="text-sm font-medium mt-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{guest.phone}</div>
                                                        {guest.email && <div className="text-sm font-medium" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{guest.email}</div>}
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setShowQuickCreate(true)}
                                                className="w-full py-3 border-2 border-dashed rounded-sm font-bold tracking-wider uppercase transition-colors"
                                                style={{ borderColor: 'rgba(82,120,88,0.3)', color: '#527858', fontSize: '12px' }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#265140'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(82,120,88,0.3)'}
                                            >
                                                + Quick Create New Guest
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>Quick Create Guest</h3>
                                                <button onClick={() => setShowQuickCreate(false)} className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#527858]" style={{ color: 'rgba(75,61,28,0.6)' }}>
                                                    Cancel
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Full Name *</label>
                                                <input
                                                    type="text"
                                                    value={newGuestName}
                                                    onChange={(e) => setNewGuestName(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-sm outline-none"
                                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Phone *</label>
                                                <input
                                                    type="tel"
                                                    value={newGuestPhone}
                                                    onChange={(e) => setNewGuestPhone(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-sm outline-none"
                                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Email (Optional)</label>
                                                <input
                                                    type="email"
                                                    value={newGuestEmail}
                                                    onChange={(e) => setNewGuestEmail(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-sm outline-none"
                                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                                />
                                            </div>

                                            <Button onClick={handleQuickCreateGuest} disabled={loading} className="w-full" variant="sand">
                                                {loading ? 'Creating...' : 'Create Guest'}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-lg font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>Owner Use Reservation</div>
                                    <div className="text-sm font-medium mt-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>No guest selection required</div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Start Date *</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-sm outline-none"
                                        style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>End Date *</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-sm outline-none"
                                        style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Guest Count *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={isNaN(guestCount) ? "" : guestCount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setGuestCount(val === "" ? 1 : parseInt(val));
                                    }}
                                    className="w-full px-4 py-3 rounded-sm outline-none"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'Berlin Sans', sans-serif" }}>Total Amount (COP) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={isNaN(totalAmount) ? "" : totalAmount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setTotalAmount(val === "" ? 0 : parseFloat(val));
                                    }}
                                    className="w-full px-4 py-3 rounded-sm outline-none"
                                    style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(82,120,88,0.3)', color: '#4b3d1c', fontFamily: "'MegantZ', serif", boxShadow: 'inset 0 2px 4px rgba(75,61,28,0.02)' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 p-6 flex justify-between" style={{ backgroundColor: 'rgba(244,242,235,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(82,120,88,0.2)' }}>
                    <Button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        variant="outline"
                    >
                        Previous
                    </Button>

                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)} variant="sand">Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading} variant="sand">
                            {loading ? 'Creating...' : 'Create Reservation'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
