"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/api/client";
import { getMediaUrl } from "@/lib/media";
import { Property } from "@/types";

interface PropertiesPageProps {
    params: Promise<{ lang: string }>;
}

export default function PropertiesPage({ params }: PropertiesPageProps) {
    const { lang } = use(params);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Properties</h1>
                <p className="text-slate-400">Manage all properties in the system</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-3">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === "all"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                        }`}
                >
                    All Properties
                </button>
                <button
                    onClick={() => setFilter("active")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === "active"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                        }`}
                >
                    Active Only
                </button>
                <button
                    onClick={() => setFilter("inactive")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === "inactive"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                        }`}
                >
                    Inactive Only
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}

            {/* Table */}
            {!isLoading && !error && (
                <div className="backdrop-blur-xl bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700/50">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Property</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Location</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Guests</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Price/Night</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Featured</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            No properties found
                                        </td>
                                    </tr>
                                ) : (
                                    properties.map((property) => (
                                        <tr
                                            key={property.id}
                                            className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {property.main_image_url && (
                                                        <img
                                                            src={getMediaUrl(property.main_image_url)}
                                                            alt={property.name}
                                                            className="w-12 h-12 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-white">{property.name}</p>
                                                        <p className="text-xs text-slate-400 truncate max-w-xs">
                                                            {property.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-300">{property.city}</p>
                                                <p className="text-xs text-slate-500">{property.country}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-300">{property.max_guests}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-purple-400">
                                                    {formatPrice(property.nightly_price)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${property.active
                                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                        : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                                                        }`}
                                                >
                                                    {property.active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {property.featured && (
                                                    <span className="inline-flex items-center gap-1 text-yellow-400">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-xs">Featured</span>
                                                    </span>
                                                )}
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
                <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
                    <p>
                        Showing <span className="font-semibold text-slate-300">{properties.length}</span> properties
                    </p>
                    <div className="flex gap-4">
                        <p>
                            Active: <span className="font-semibold text-green-400">
                                {properties.filter(p => p.active).length}
                            </span>
                        </p>
                        <p>
                            Featured: <span className="font-semibold text-yellow-400">
                                {properties.filter(p => p.featured).length}
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
