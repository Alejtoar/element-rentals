"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Property, User, Owner } from "@/types";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { getMediaUrl } from "@/lib/media";

interface PropertyFormProps {
    property?: Property;
    user: User;
    onSuccess: () => void;
    onCancel: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ property, user, onSuccess, onCancel }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [owners, setOwners] = useState<Owner[]>([]);
    const [isLoadingOwners, setIsLoadingOwners] = useState(false);
    const [formData, setFormData] = useState({
        name: property?.name || "",
        description: property?.description || "",
        address: property?.address || "",
        city: property?.city || "",
        country: property?.country || "Colombia",
        max_guests: property?.max_guests || 2,
        nightly_price: property?.nightly_price || 100,
        active: property?.active ?? true,
        featured: property?.featured ?? false,
        owner_id: (property as any)?.owner_id || "",
    });

    useEffect(() => {
        const fetchOwners = async () => {
            setIsLoadingOwners(true);
            try {
                const fetchedOwners = await api.owners.getAll();
                setOwners(fetchedOwners);
                // If creating and there are owners, pick the first one as default if none selected
                if (!property?.id && fetchedOwners.length > 0 && !formData.owner_id) {
                    setFormData(prev => ({ ...prev, owner_id: fetchedOwners[0].id }));
                }
            } catch (err) {
                console.error("Failed to fetch owners", err);
            } finally {
                setIsLoadingOwners(false);
            }
        };

        fetchOwners();
    }, [property]);

    const [images, setImages] = useState(property?.images || []);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (property?.id) {
                await api.properties.update(property.id, formData);
                onSuccess();
            } else {
                const newProperty = await api.properties.create(formData as any);
                onSuccess();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !property?.id) return;

        setUploadingImage(true);
        try {
            const updatedProperty = await api.properties.uploadImage(property.id, e.target.files[0], images.length === 0);
            setImages(updatedProperty.images || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        setUploadingImage(true);
        setError("");

        try {
            const updatedProperty = await api.properties.deleteImage(property!.id, imageId);
            setImages(updatedProperty.images || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete image");
        } finally {
            setUploadingImage(false);
        }
    };


    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden max-w-2xl w-full">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                    {property ? "Edit Property" : "Add New Property"}
                </h2>
                <div className="flex gap-2">
                    {[
                        { num: 1, label: "Details", icon: "📝" },
                        { num: 2, label: "Location", icon: "📍" },
                        { num: 3, label: "Pricing", icon: "💰" },
                        { num: 4, label: "Media", icon: "📸" }
                    ].map(({ num, label, icon }) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => setStep(num)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${step === num
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                }`}
                        >
                            <span className="mr-1">{icon}</span>
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Input
                            label="Property Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Luxury Villa Akumal"
                            required
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Property Owner</label>
                            <select
                                name="owner_id"
                                value={formData.owner_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, owner_id: e.target.value }))}
                                className="px-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 text-white"
                                required
                            >
                                <option value="" disabled>Select an owner</option>
                                {owners.map(owner => (
                                    <option key={owner.id} value={owner.id}>{owner.full_name} ({owner.email})</option>
                                ))}
                                {owners.length === 0 && !isLoadingOwners && (
                                    <option value="" disabled>No owners found. Create one first.</option>
                                )}
                            </select>
                            {owners.length === 0 && !isLoadingOwners && (
                                <p className="text-xs text-amber-400 ml-1">⚠️ You must create an owner in the database before adding properties.</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="px-4 py-3 rounded-2xl bg-slate-900/50 border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 text-white min-h-[120px]"
                                placeholder="Describe the property..."
                                required
                            />
                        </div>
                        <Input
                            label="Max Guests"
                            name="max_guests"
                            type="number"
                            value={formData.max_guests}
                            onChange={handleChange}
                            required
                        />
                        <div className="pt-4 flex gap-3">
                            {property?.id ? (
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="w-full"
                                >
                                    Save Changes
                                </Button>
                            ) : (
                                <Button type="button" onClick={nextStep} className="w-full">
                                    Next: Location
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Input
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Calle de Sol"
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Tulum"
                                required
                            />
                            <Input
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                placeholder="Mexico"
                                required
                            />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="outline" onClick={prevStep} className="flex-1">Back</Button>

                            {property?.id ? (
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="flex-1"
                                >
                                    Save Changes
                                </Button>
                            ) : (
                                <Button type="button" onClick={nextStep} className="flex-1">
                                    Next: Pricing
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Input
                            label="Nightly Price (COP)"
                            name="nightly_price"
                            type="number"
                            value={formData.nightly_price}
                            onChange={handleChange}
                            required
                        />

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${formData.active ? 'bg-purple-600' : 'bg-slate-700'}`} />
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${formData.active ? 'translate-x-6' : ''}`} />
                                </div>
                                <span className="text-slate-300 group-hover:text-white transition-colors">Active (Publicly Visible)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${formData.featured ? 'bg-yellow-600' : 'bg-slate-700'}`} />
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${formData.featured ? 'translate-x-6' : ''}`} />
                                </div>
                                <span className="text-slate-300 group-hover:text-white transition-colors">Featured Property</span>
                            </label>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="outline" onClick={prevStep} className="flex-1">Back</Button>

                            {property?.id ? (
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="flex-1"
                                >
                                    Save Changes
                                </Button>
                            ) : (
                                <Button type="button" onClick={nextStep} className="flex-1">
                                    Next: Media
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {!property?.id ? (
                            <div className="p-6 border-2 border-dashed border-slate-700 rounded-2xl text-center">
                                <p className="text-slate-400 mb-4">You can upload images after creating the property</p>
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="w-full"
                                >
                                    Create Property
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {images.map((img) => (
                                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 group">
                                            <img
                                                src={getMediaUrl(img.url)}
                                                className="w-full h-full object-cover"
                                                alt={img.is_main ? "Main property image" : "Property image"}
                                            />
                                            {img.is_main && (
                                                <div className="absolute top-1 left-1 bg-purple-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold">
                                                    MAIN
                                                </div>
                                            )}
                                            {/* Delete button - appears on hover */}
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteImage(img.id)}
                                                disabled={uploadingImage}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <label className={`aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                        {uploadingImage ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500" />
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6 text-slate-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span className="text-xs text-slate-500">Upload</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1">Back</Button>
                                    <Button onClick={onSuccess} className="flex-1">Finish</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </form>

            <div className="p-4 bg-slate-900/50 border-t border-slate-700/50 flex justify-end">
                <button
                    onClick={onCancel}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
