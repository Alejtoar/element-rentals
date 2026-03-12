"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api, getAuthToken } from "@/api/client";
import { getMediaUrl } from "@/lib/media";
import { Property, User } from "@/types";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

interface PropertiesPageProps {
    params: Promise<{ lang: string }>;
}

export default function PropertiesPage({ params }: PropertiesPageProps) {
    const { lang } = use(params);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [dict, setDict] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [currentUser, dictionary] = await Promise.all([
                    api.auth.getCurrentUser(),
                    getDictionary(lang as Locale)
                ]);
                setUser(currentUser);
                setDict(dictionary);
            } catch (err) {
                console.error("Failed to fetch initial data");
                // Still try to load dictionary even if user fails? 
                // Ideally yes, but let's keep it simple.
                // If this fails, user likely is null.
            }
        };
        loadData();
    }, [lang]);

    useEffect(() => {
        loadProperties();
    }, [filter]);

    const loadProperties = async () => {
        setIsLoading(true);
        setError("");

        try {
            const params: { active?: boolean } = {};
            if (filter === "active") params.active = true;
            if (filter === "inactive") params.active = false;

            const data = await api.properties.getAll(params);
            setProperties(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load properties");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingProperty(null);
        setIsFormOpen(true);
    };

    const handleEdit = (property: Property) => {
        setEditingProperty(property);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this property?")) return;
        try {
            await api.properties.delete(id);
            loadProperties();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete property");
        }
    };

    const formatPrice = (price: number) => {
        const formatted = Math.round(price)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return `$ ${formatted}`;
    };

    if (isFormOpen && user) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[80vh]">
                <PropertyForm
                    property={editingProperty || undefined}
                    user={user}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        loadProperties();
                    }}
                    onCancel={() => setIsFormOpen(false)}
                />
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                        {dict?.admin?.properties?.title || "Properties"}
                    </h1>
                    <p className="text-sm font-medium" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>
                        {dict?.admin?.properties?.subtitle || "Manage all properties in the system"}
                    </p>
                </div>
                <Button onClick={handleAdd} variant="primary">
                    {dict?.admin?.properties?.add_property || "Add Property"}
                </Button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-3">
                <button
                    onClick={() => setFilter("all")}
                    className="px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all duration-200"
                    style={{
                        backgroundColor: filter === "all" ? '#265140' : 'rgba(38,81,64,0.1)',
                        color: filter === "all" ? '#e6e3d7' : '#265140',
                        fontFamily: "'Berlin Sans', sans-serif"
                    }}
                >
                    {dict?.admin?.properties?.filter_all || "All Properties"}
                </button>
                <button
                    onClick={() => setFilter("active")}
                    className="px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all duration-200"
                    style={{
                        backgroundColor: filter === "active" ? '#265140' : 'rgba(38,81,64,0.1)',
                        color: filter === "active" ? '#e6e3d7' : '#265140',
                        fontFamily: "'Berlin Sans', sans-serif"
                    }}
                >
                    {dict?.admin?.properties?.filter_active || "Active Only"}
                </button>
                <button
                    onClick={() => setFilter("inactive")}
                    className="px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all duration-200"
                    style={{
                        backgroundColor: filter === "inactive" ? '#265140' : 'rgba(38,81,64,0.1)',
                        color: filter === "inactive" ? '#e6e3d7' : '#265140',
                        fontFamily: "'Berlin Sans', sans-serif"
                    }}
                >
                    {dict?.admin?.properties?.filter_inactive || "Inactive Only"}
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 rounded-sm p-4 text-sm font-medium" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                    {dict?.admin?.properties?.error_load || error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
                </div>
            )}

            {/* Table */}
            {!isLoading && !error && (
                <div className="rounded-sm overflow-hidden" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                                <tr style={{ borderBottom: '1px solid rgba(82,120,88,0.2)' }}>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.property || "Property"}</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.location || "Location"}</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.guests || "Guests"}</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.properties?.price || "Price/Night"}</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.status || "Status"}</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.properties?.featured || "Featured"}</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.table?.actions || "Actions"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'MegantZ', serif" }}>
                                            {dict?.admin?.properties?.no_properties || "No properties found"}
                                        </td>
                                    </tr>
                                ) : (
                                    properties.map((property) => (
                                        <tr
                                            key={property.id}
                                            className="transition-colors duration-150 hover:bg-black/5"
                                            style={{ borderBottom: '1px solid rgba(82,120,88,0.1)' }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {property.main_image_url && (
                                                        <img
                                                            src={getMediaUrl(property.main_image_url)}
                                                            alt={property.name}
                                                            className="w-12 h-12 rounded-sm object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <Link href={`/${lang}/admin/properties/${property.id}`} className="font-bold transition-colors" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>
                                                            {property.name}
                                                        </Link>
                                                        <p className="text-xs truncate max-w-xs mt-1" style={{ color: 'rgba(75,61,28,0.6)', fontFamily: "'MegantZ', serif" }}>
                                                            {property.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{property.city}</p>
                                                <p className="text-xs" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'MegantZ', serif" }}>{property.country}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>{property.max_guests}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold" style={{ color: '#527858', fontFamily: "'Berlin Sans', sans-serif" }}>
                                                    {formatPrice(property.nightly_price)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-widest"
                                                    style={{
                                                        backgroundColor: property.active ? 'rgba(82,120,88,0.1)' : 'rgba(75,61,28,0.1)',
                                                        color: property.active ? '#527858' : 'rgba(75,61,28,0.6)',
                                                        border: property.active ? '1px solid rgba(82,120,88,0.3)' : '1px solid rgba(75,61,28,0.2)',
                                                    }}
                                                >
                                                    {property.active ? (dict?.admin?.table?.active || "Active") : (dict?.admin?.table?.inactive || "Inactive")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {property.featured && (
                                                    <span className="inline-flex items-center gap-1" style={{ color: '#cfbb9b' }}>
                                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-xs uppercase font-bold tracking-widest" style={{ color: '#4b3d1c' }}>{dict?.admin?.properties?.featured || "Featured"}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/${lang}/admin/properties/${property.id}`}
                                                        className="p-2 transition-colors hover:text-[#527858]"
                                                        style={{ color: 'rgba(38,81,64,0.5)' }}
                                                        title={dict?.admin?.common?.view || "View"}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleEdit(property)}
                                                        className="p-2 transition-colors hover:text-[#265140]"
                                                        style={{ color: 'rgba(38,81,64,0.5)' }}
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(property.id)}
                                                        className="p-2 transition-colors hover:text-red-700"
                                                        style={{ color: 'rgba(38,81,64,0.5)' }}
                                                        title="Delete"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Stats Footer */}
            {!isLoading && !error && properties.length > 0 && (
                <div className="mt-6 flex items-center justify-between text-sm uppercase tracking-widest font-bold" style={{ color: 'rgba(75,61,28,0.5)', fontFamily: "'Berlin Sans', sans-serif" }}>
                    <p>
                        Showing <span style={{ color: '#4b3d1c' }}>{properties.length}</span> properties
                    </p>
                    <div className="flex gap-4">
                        <p>
                            Active: <span style={{ color: '#527858' }}>
                                {properties.filter(p => p.active).length}
                            </span>
                        </p>
                        <p>
                            Featured: <span style={{ color: '#cfbb9b' }}>
                                {properties.filter(p => p.featured).length}
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
