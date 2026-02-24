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
            <div className="rounded-2xl p-8 glass border border-white/10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto mb-3" />
                <p className="text-sm text-white/50">{dict.availability_loading}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl p-6 glass border border-red-500/20 text-center">
                <p className="text-sm text-red-400">{dict.availability_error}</p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl p-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">{dict.availability_title}</h3>
                    <p className="text-xs text-white/50 mt-0.5">{dict.availability_subtitle}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500/70 border border-rose-400/50 inline-block" />
                        {dict.booked}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500/70 border border-emerald-400/50 inline-block" />
                        {dict.available}
                    </span>
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-5">
                <button
                    onClick={goToPrevMonth}
                    disabled={!canGoPrev}
                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="font-semibold text-white text-sm">
                    {MONTHS[currentMonth]} {currentYear}
                </span>
                <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Next month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-white/30 py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-1">
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
                                relative flex items-center justify-center w-full aspect-square rounded-xl text-xs font-medium transition-all
                                ${isPast ? 'opacity-25 text-white/30 cursor-default' : ''}
                                ${isBooked ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-not-allowed' : ''}
                                ${isAvailable ? 'hover:bg-emerald-500/20 text-white/80 cursor-default hover:text-emerald-300 hover:border hover:border-emerald-500/30' : ''}
                                ${isToday ? 'ring-1 ring-purple-400 ring-offset-1 ring-offset-transparent' : ''}
                            `}
                            title={isBooked ? dict.booked : isAvailable ? dict.available : ''}
                        >
                            {day}
                            {isBooked && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-400" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
