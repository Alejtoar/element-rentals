"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AvailabilityBlock } from "@/types";
import { api } from "@/api/client";

interface AvailabilityCalendarProps {
    propertyId: string;
    dict: {
        availability_title: string;
        availability_subtitle: string;
        availability_loading: string;
        availability_error: string;
        booked: string;
        available: string;
    };
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function isDateBlocked(date: Date, blocks: AvailabilityBlock[]): boolean {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    return blocks.some(b => dateStr >= b.start_date && dateStr < b.end_date);
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

export default function AvailabilityCalendar({ propertyId, dict }: AvailabilityCalendarProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.properties.getPropertyAvailability(propertyId);
                // The API returns AvailabilityResponse: { property_id: string, blocked: AvailabilityBlock[] }
                setBlocks(response.blocked || []);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [propertyId]);

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
    };

    const canGoPrev = useMemo(() => {
        return currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth > today.getMonth());
    }, [currentMonth, currentYear, today]);

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const calendarCells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // Pad to multiple of 7
    while (calendarCells.length % 7 !== 0) {
        calendarCells.push(null);
    }

    if (loading) {
        return (
            <div className="rounded-sm p-8 text-center" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.20)' }}>
                <div 
                    className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 mx-auto mb-3" 
                    style={{ borderColor: '#527858' }}
                />
                <p className="text-sm" style={{ color: 'rgba(75,61,28,0.50)', fontFamily: "'MegantZ', serif" }}>
                    {dict.availability_loading}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-sm p-6 text-center" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(75,61,28,0.20)' }}>
                <p className="text-sm text-red-600" style={{ fontFamily: "'MegantZ', serif" }}>
                    {dict.availability_error}
                </p>
            </div>
        );
    }

    return (
        <div 
            className="rounded-sm p-6 shadow-sm overflow-hidden" 
            style={{ 
                backgroundColor: '#f4f2eb', /* brand-cream */
                border: '1px solid rgba(82,120,88,0.15)',
                boxShadow: '0 4px 20px rgba(75,61,28,0.06)'
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 
                        className="text-lg font-bold" 
                        style={{ color: '#4b3d1c', fontFamily: "'Berlin Sans', sans-serif" }}
                    >
                        {dict.availability_title}
                    </h3>
                    <p 
                        className="text-xs mt-0.5" 
                        style={{ color: 'rgba(75,61,28,0.60)', fontFamily: "'MegantZ', serif" }}
                    >
                        {dict.availability_subtitle}
                    </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1.5" style={{ color: 'rgba(75,61,28,0.50)', fontFamily: "'Berlin Sans', sans-serif" }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#e6e3d7', border: '1px solid rgba(75,61,28,0.20)' }} />
                        {dict.booked}
                    </span>
                    <span className="flex items-center gap-1.5" style={{ color: '#527858', fontFamily: "'Berlin Sans', sans-serif" }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#527858' }} />
                        {dict.available}
                    </span>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6 px-1">
                <button
                    onClick={goToPrevMonth}
                    disabled={!canGoPrev}
                    className="p-2 rounded-sm transition-all hover:bg-white/50 disabled:opacity-20"
                    style={{ color: '#527858' }}
                    aria-label="Previous month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span 
                    className="font-bold uppercase tracking-widest text-sm" 
                    style={{ color: '#4b3d1c', fontFamily: "'Berlin Sans', sans-serif" }}
                >
                    {MONTHS[currentMonth]} {currentYear}
                </span>
                <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-sm transition-all hover:bg-white/50"
                    style={{ color: '#527858' }}
                    aria-label="Next month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* DAY HEADERS */}
            <div className="grid grid-cols-7 mb-3">
                {DAYS.map(d => (
                    <div 
                        key={d} 
                        className="text-center text-[10px] font-bold uppercase tracking-tighter sm:tracking-widest py-1"
                        style={{ color: 'rgba(75,61,28,0.40)', fontFamily: "'Berlin Sans', sans-serif" }}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((day, idx) => {
                    if (day === null) {
                        return <div key={`empty-${idx}`} />;
                    }

                    const date = new Date(currentYear, currentMonth, day);
                    const isPast = date < today;
                    const isBooked = !isPast && isDateBlocked(date, blocks);
                    const isAvailable = !isPast && !isBooked;
                    const isToday = date.getTime() === today.getTime();

                    return (
                        <div
                            key={`day-${day}`}
                            className={`
                                relative flex items-center justify-center w-full aspect-square rounded-sm text-xs font-bold transition-all
                                ${isPast ? 'opacity-30 cursor-default' : 'cursor-default'}
                            `}
                            style={{
                                backgroundColor: isBooked ? 'rgba(75,61,28,0.05)' : isAvailable ? 'rgba(82,120,88,0.12)' : 'transparent',
                                color: isBooked ? 'rgba(75,61,28,0.30)' : isAvailable ? '#527858' : 'rgba(75,61,28,0.40)',
                                border: isToday ? '1px solid #cfbb9b' : '1px solid transparent',
                                fontFamily: "'Berlin Sans', sans-serif",
                            }}
                            title={isBooked ? dict.booked : isAvailable ? dict.available : ''}
                        >
                            {day}
                            {isAvailable && (
                                <span 
                                    className="absolute top-1 right-1 w-1 h-1 rounded-full" 
                                    style={{ backgroundColor: '#527858' }} 
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
