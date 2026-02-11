"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/api/client";
import { GuestLeadRead, OwnerLeadRead } from "@/types";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

export default function LeadsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params || {});
    const [dict, setDict] = useState<any>(null);
    const [guestLeads, setGuestLeads] = useState<GuestLeadRead[]>([]);
    const [ownerLeads, setOwnerLeads] = useState<OwnerLeadRead[]>([]);
    const [activeTab, setActiveTab] = useState<"guest" | "owner">("guest");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadInit = async () => {
            if (lang) {
                const d = await getDictionary(lang as Locale);
                setDict(d);
            }
        };
        loadInit();

        const fetchLeads = async () => {
            setIsLoading(true);
            try {
                const [guests, owners] = await Promise.all([
                    api.leads.getGuest(),
                    api.leads.getOwner(),
                ]);
                setGuestLeads(guests);
                setOwnerLeads(owners);
            } catch (error) {
                console.error("Error fetching leads:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeads();
    }, [lang]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading && !dict) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{dict?.admin?.leads?.title || "Leads"}</h1>
                    <p className="text-slate-400">{dict?.admin?.leads?.subtitle || "Manage guest and owner inquiries"}</p>
                </div>
                <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
                    <button
                        onClick={() => setActiveTab("guest")}
                        className={`px-4 py-2 rounded-md transition-all duration-200 ${activeTab === "guest"
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        {dict?.admin?.leads?.guest_leads || "Guest Leads"}
                    </button>
                    <button
                        onClick={() => setActiveTab("owner")}
                        className={`px-4 py-2 rounded-md transition-all duration-200 ${activeTab === "owner"
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        {dict?.admin?.leads?.owner_leads || "Owner Leads"}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : (
                <div className="backdrop-blur-xl bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{dict?.admin?.table?.date || "Date"}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{dict?.admin?.table?.name || "Name"}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{dict?.admin?.table?.phone || "Phone"}</th>
                                {activeTab === "guest" ? (
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{dict?.admin?.table?.property_id || "Property ID"}</th>
                                ) : (
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{dict?.admin?.table?.location || "Location"}</th>
                                )}
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{dict?.admin?.leads?.source || "Source"}</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{dict?.admin?.table?.action || "Action"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {activeTab === "guest" ? (
                                guestLeads.length > 0 ? (
                                    guestLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-700/20 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-300">{formatDate(lead.created_at)}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-white">{lead.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-300">{lead.phone}</td>
                                            <td className="px-6 py-4 text-sm text-slate-400 font-mono text-xs">{lead.property_id || "N/A"}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs">
                                                    {lead.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <button className="text-purple-400 hover:text-purple-300 font-medium">{dict?.admin?.common?.view || "View"}</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">{dict?.admin?.leads?.none_found_guest || "No guest leads found"}</td>
                                    </tr>
                                )
                            ) : (
                                ownerLeads.length > 0 ? (
                                    ownerLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-700/20 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-300">{formatDate(lead.created_at)}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-white">{lead.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-300">{lead.phone}</td>
                                            <td className="px-6 py-4 text-sm text-slate-300">{lead.location}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs">
                                                    {lead.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <button className="text-purple-400 hover:text-purple-300 font-medium">{dict?.admin?.common?.view || "View"}</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">{dict?.admin?.leads?.none_found_owner || "No owner leads found"}</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
