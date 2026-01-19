"use client";

import React, { useState } from "react";
import { api } from "@/api/client";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface LeadFormsProps {
    dict: any;
    lang: "en" | "es";
}

export const LeadForms: React.FC<LeadFormsProps> = ({ dict, lang }) => {
    const [ownerData, setOwnerData] = useState({ name: "", phone: "", location: "", message: "" });
    const [guestData, setGuestData] = useState({ name: "", phone: "", message: "" });
    const [loading, setLoading] = useState({ owner: false, guest: false });
    const [status, setStatus] = useState({ owner: "", guest: "" });

    const handleOwnerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading({ ...loading, owner: true });
        try {
            await api.leads.submitOwner({ ...ownerData, source: "website" });
            setStatus({ ...status, owner: "success" });
            setOwnerData({ name: "", phone: "", location: "", message: "" });
        } catch (error) {
            console.error(error);
            setStatus({ ...status, owner: "error" });
        } finally {
            setLoading({ ...loading, owner: false });
        }
    };

    const handleGuestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading({ ...loading, guest: true });
        try {
            await api.leads.submitGuest({
                ...guestData,
                property_id: "general", // Generic lead
                source: "website"
            });
            setStatus({ ...status, guest: "success" });
            setGuestData({ name: "", phone: "", message: "" });
        } catch (error) {
            console.error(error);
            setStatus({ ...status, guest: "error" });
        } finally {
            setLoading({ ...loading, guest: false });
        }
    };

    const handleWhatsAppOwner = async () => {
        try {
            const { url } = await api.whatsapp.getOwnerLink(lang);
            window.open(url, "_blank");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Owner Lead Form */}
                    <div className="glass p-10 rounded-[2.5rem] shadow-2xl">
                        <h3 className="text-3xl font-bold mb-4">{dict.owner_title}</h3>
                        <p className="text-foreground/60 mb-8">
                            {dict.owner_subtitle}
                        </p>

                        <form onSubmit={handleOwnerSubmit} className="space-y-6">
                            <Input
                                label={dict.form.name}
                                placeholder="John Doe"
                                required
                                value={ownerData.name}
                                onChange={e => setOwnerData({ ...ownerData, name: e.target.value })}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input
                                    label={dict.form.phone}
                                    placeholder="+57..."
                                    required
                                    value={ownerData.phone}
                                    onChange={e => setOwnerData({ ...ownerData, phone: e.target.value })}
                                />
                                <Input
                                    label={dict.form.location}
                                    placeholder="City, Country"
                                    required
                                    value={ownerData.location}
                                    onChange={e => setOwnerData({ ...ownerData, location: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-foreground/80 ml-1">{dict.form.message}</label>
                                <textarea
                                    className="px-4 py-3 rounded-2xl bg-background/50 border border-foreground/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px]"
                                    placeholder={dict.form.message_placeholder_owner}
                                    value={ownerData.message}
                                    onChange={e => setOwnerData({ ...ownerData, message: e.target.value })}
                                />
                            </div>

                            {status.owner === "success" && (
                                <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl text-center font-medium">
                                    {dict.form.success_owner}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button type="submit" isLoading={loading.owner} className="flex-1">{dict.form.submit_owner}</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 border-green-500 text-green-500 hover:bg-green-500"
                                    onClick={handleWhatsAppOwner}
                                >
                                    {dict.form.submit_whatsapp}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Guest Inquiry Form */}
                    <div className="glass p-10 rounded-[2.5rem] shadow-2xl">
                        <h3 className="text-3xl font-bold mb-4">{dict.guest_title}</h3>
                        <p className="text-foreground/60 mb-8">
                            {dict.guest_subtitle}
                        </p>

                        <form onSubmit={handleGuestSubmit} className="space-y-6">
                            <Input
                                label={dict.form.name}
                                placeholder="Jane Smith"
                                required
                                value={guestData.name}
                                onChange={e => setGuestData({ ...guestData, name: e.target.value })}
                            />
                            <Input
                                label={dict.form.phone}
                                placeholder="+57..."
                                required
                                value={guestData.phone}
                                onChange={e => setGuestData({ ...guestData, phone: e.target.value })}
                            />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-foreground/80 ml-1">{dict.form.message}</label>
                                <textarea
                                    className="px-4 py-3 rounded-2xl bg-background/50 border border-foreground/10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px]"
                                    placeholder={dict.form.message_placeholder_guest}
                                    required
                                    value={guestData.message}
                                    onChange={e => setGuestData({ ...guestData, message: e.target.value })}
                                />
                            </div>

                            {status.guest === "success" && (
                                <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl text-center font-medium">
                                    {dict.form.success_guest}
                                </div>
                            )}

                            <Button type="submit" isLoading={loading.guest} className="w-full">{dict.form.submit_guest}</Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};
