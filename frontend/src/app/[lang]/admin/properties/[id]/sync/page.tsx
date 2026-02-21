"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/api/client";
import { ExternalCalendar, Property, SyncResult } from "@/types";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function PropertySyncPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = use(params);
    const [dict, setDict] = useState<any>(null);
    const [property, setProperty] = useState<Property | null>(null);
    const [calendars, setCalendars] = useState<ExternalCalendar[]>([]);
    const [loading, setLoading] = useState(true);

    // Add calendar form
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState("");

    // Sync state
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Copy state
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [d, prop, cals] = await Promise.all([
                    getDictionary(lang as Locale),
                    api.properties.getById(id),
                    api.properties.getExternalCalendars(id),
                ]);
                setDict(d);
                setProperty(prop);
                setCalendars(cals);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, lang]);

    const icalUrl = property?.ical_secret
        ? `${API_BASE}/api/v1/properties/${id}/ical?token=${property.ical_secret}`
        : null;

    const handleCopy = () => {
        if (icalUrl) {
            navigator.clipboard.writeText(icalUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleAddCalendar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newUrl.trim()) return;
        setAdding(true);
        setAddError("");
        try {
            const created = await api.properties.addExternalCalendar(id, { name: newName.trim(), url: newUrl.trim() });
            setCalendars(prev => [...prev, created]);
            setNewName("");
            setNewUrl("");
        } catch (err: any) {
            setAddError(err.message || "Failed to add calendar");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteCalendar = async (calId: string) => {
        if (!window.confirm(dict?.admin?.ical?.delete_confirm || "Remove this calendar?")) return;
        try {
            await api.properties.deleteExternalCalendar(id, calId);
            setCalendars(prev => prev.filter(c => c.id !== calId));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSyncAll = async () => {
        setSyncing(true);
        setSyncMsg(null);
        try {
            await api.properties.syncCalendars(id);
            setSyncMsg({
                type: 'success',
                text: dict?.admin?.ical?.sync_started || 'Synchronization started! The calendar will update in a few moments.'
            });
        } catch (err: any) {
            setSyncMsg({ type: 'error', text: dict?.admin?.ical?.sync_error || "Sync failed to start." });
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
            </div>
        );
    }

    const t = dict?.admin?.ical || {};

    return (
        <div className="space-y-8 max-w-3xl">
            {/* --- EXPORT SECTION --- */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-white">{t.export_title || "Export your Calendar (iCal)"}</h2>
                    </div>
                    <p className="text-slate-400 text-sm ml-11">{t.export_desc || "Share this URL with external platforms."}</p>
                </div>

                <div className="p-6">
                    {icalUrl ? (
                        <div className="flex gap-3">
                            <input
                                readOnly
                                value={icalUrl}
                                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30 truncate"
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${copied
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t.copied || "Copied!"}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        {t.copy_url || "Copy URL"}
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-400 text-sm text-center">
                            <svg className="w-5 h-5 inline mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            No iCal secret available for this property.
                        </div>
                    )}
                </div>
            </div>

            {/* --- IMPORT / EXTERNAL CALENDARS SECTION --- */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-white">{t.import_title || "Import External Calendars"}</h2>
                        </div>
                        <p className="text-slate-400 text-sm ml-11">{t.import_desc || "Add iCal URLs from Airbnb, Booking.com, etc."}</p>
                    </div>
                    <button
                        onClick={handleSyncAll}
                        disabled={syncing || calendars.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/20 whitespace-nowrap"
                    >
                        {syncing ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {t.syncing || "Syncing..."}
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t.sync_all || "Sync All"}
                            </>
                        )}
                    </button>
                </div>

                {/* Sync message */}
                {syncMsg && (
                    <div className={`mx-6 mt-4 px-4 py-3 rounded-xl text-sm font-medium border ${syncMsg.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        {syncMsg.text}
                    </div>
                )}

                {/* Calendars list */}
                <div className="p-6 space-y-3">
                    {calendars.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            <svg className="w-10 h-10 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            {t.no_calendars || "No external calendars linked yet."}
                        </div>
                    ) : (
                        calendars.map(cal => (
                            <div
                                key={cal.id}
                                className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-xl border border-slate-700/50 group hover:border-slate-600 transition-all"
                            >
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-sm">{cal.name}</p>
                                    <p className="text-slate-500 text-xs font-mono truncate">{cal.url}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteCalendar(cal.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    title="Remove"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}

                    {/* Add calendar form */}
                    <form onSubmit={handleAddCalendar} className="pt-3 space-y-3 border-t border-slate-700/50">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.add_calendar || "Add Calendar"}</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder={t.name_placeholder || "e.g. Airbnb, Booking.com"}
                                required
                                className="flex-shrink-0 sm:w-44 px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all"
                            />
                            <input
                                type="url"
                                value={newUrl}
                                onChange={e => setNewUrl(e.target.value)}
                                placeholder={t.url_placeholder || "https://www.airbnb.com/calendar/ical/..."}
                                required
                                className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-mono"
                            />
                            <button
                                type="submit"
                                disabled={adding}
                                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all whitespace-nowrap"
                            >
                                {adding ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        {t.add_loading || "Adding..."}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        {t.add_calendar || "Add"}
                                    </>
                                )}
                            </button>
                        </div>
                        {addError && (
                            <p className="text-red-400 text-xs">{addError}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
