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
                    <h1 className="text-3xl font-bold mb-2" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.leads?.title || "Leads"}</h1>
                    <p className="text-sm font-medium" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.leads?.subtitle || "Manage guest and owner inquiries"}</p>
                </div>
                <div className="flex p-1 rounded-sm border" style={{ backgroundColor: 'rgba(38,81,64,0.05)', borderColor: 'rgba(82,120,88,0.2)' }}>
                    <button
                        onClick={() => setActiveTab("guest")}
                        className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all duration-200"
                        style={{
                            backgroundColor: activeTab === "guest" ? '#265140' : 'transparent',
                            color: activeTab === "guest" ? '#e6e3d7' : '#265140',
                            fontFamily: "'Berlin Sans', sans-serif"
                        }}
                    >
                        {dict?.admin?.leads?.guest_leads || "Guest Leads"}
                    </button>
                    <button
                        onClick={() => setActiveTab("owner")}
                        className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all duration-200"
                        style={{
                            backgroundColor: activeTab === "owner" ? '#265140' : 'transparent',
                            color: activeTab === "owner" ? '#e6e3d7' : '#265140',
                            fontFamily: "'Berlin Sans', sans-serif"
                        }}
                    >
                        {dict?.admin?.leads?.owner_leads || "Owner Leads"}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
                </div>
            ) : (
                <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
                    <table className="w-full text-left border-collapse">
                        <thead style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                            <tr style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.date || "Date"}</th>
                                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.name || "Name"}</th>
                                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.phone || "Phone"}</th>
                                {activeTab === "guest" ? (
                                    <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.property_id || "Property ID"}</th>
                                ) : (
                                    <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.location || "Location"}</th>
                                )}
                                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.leads?.source || "Source"}</th>
                                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.action || "Action"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === "guest" ? (
                                guestLeads.length > 0 ? (
                                    guestLeads.map((lead) => (
                                        <tr key={lead.id} className="transition-colors hover:bg-black/5" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>{formatDate(lead.created_at)}</td>
                                            <td className="px-6 py-4 text-sm font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{lead.name}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>{lead.phone}</td>
                                            <td className="px-6 py-4 text-xs font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{lead.property_id || "N/A"}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'rgba(82,120,88,0.1)', color: '#527858' }}>
                                                    {lead.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <button className="font-bold uppercase tracking-widest transition-colors hover:text-[#527858]" style={{ color: '#265140', fontSize: '10px' }}>{dict?.admin?.common?.view || "View"}</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.leads?.none_found_guest || "No guest leads found"}</td>
                                    </tr>
                                )
                            ) : (
                                ownerLeads.length > 0 ? (
                                    ownerLeads.map((lead) => (
                                        <tr key={lead.id} className="transition-colors hover:bg-black/5" style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>{formatDate(lead.created_at)}</td>
                                            <td className="px-6 py-4 text-sm font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{lead.name}</td>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>{lead.phone}</td>
                                            <td className="px-6 py-4 text-sm font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{lead.location}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: 'rgba(82,120,88,0.1)', color: '#527858' }}>
                                                    {lead.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <button className="font-bold uppercase tracking-widest transition-colors hover:text-[#527858]" style={{ color: '#265140', fontSize: '10px' }}>{dict?.admin?.common?.view || "View"}</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.leads?.none_found_owner || "No owner leads found"}</td>
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
