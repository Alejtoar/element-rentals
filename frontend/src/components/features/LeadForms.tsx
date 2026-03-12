"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/api/client";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { getUTMForSubmission } from "@/lib/utm";

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
            const utmParams = getUTMForSubmission();
            await api.leads.submitOwner({ ...ownerData, source: "website", ...utmParams });
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
            const utmParams = getUTMForSubmission();
            await api.leads.submitGuest({ ...guestData, property_id: "general", source: "website", ...utmParams });
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

    const inputStyle: React.CSSProperties = {
        backgroundColor: '#e6e3d7',          /* brand-bone */
        border: '1px solid rgba(82,120,88,0.25)',
        color: '#4b3d1c',
        borderRadius: '2px',
        fontFamily: "'MegantZ', serif",
        padding: '0.75rem 1rem',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    const textareaStyle: React.CSSProperties = {
        ...inputStyle,
        minHeight: '120px',
        resize: 'vertical' as const,
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '0.75rem',
        fontFamily: "'Berlin Sans', sans-serif",
        color: 'rgba(75,61,28,0.65)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
        marginBottom: '0.35rem',
        display: 'block',
    };

    return (
        <section className="py-24" style={{ backgroundColor: '#e6e3d7' }}>
            <div className="container mx-auto px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span
                        className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase rounded-full"
                        style={{
                            backgroundColor: 'rgba(38,81,64,0.08)',
                            border: '1px solid rgba(38,81,64,0.15)',
                            color: '#265140',
                            fontFamily: "'Berlin Sans', sans-serif",
                        }}
                    >
                        {lang === 'es' ? 'Contáctanos' : 'Contact Us'}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* ——————————————————————————————
                        Owner Lead Form
                    —————————————————————————————— */}
                    <div
                        className="rounded-sm p-8 md:p-10"
                        style={{
                            backgroundColor: '#f4f2eb',
                            border: '1px solid rgba(82,120,88,0.18)',
                            boxShadow: '0 4px 20px rgba(75,61,28,0.08)',
                        }}
                    >
                        {/* Forest top accent bar */}
                        <div
                            className="w-12 h-1 rounded-full mb-6"
                            style={{ backgroundColor: '#265140' }}
                        />

                        <h3
                            className="text-2xl font-bold mb-3"
                            style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif", letterSpacing: '-0.01em' }}
                        >
                            {dict.owner_title}
                        </h3>
                        <p
                            className="mb-8 leading-loose"
                            style={{ color: 'rgba(75,61,28,0.65)', fontFamily: "'MegantZ', serif", lineHeight: '1.7' }}
                        >
                            {dict.owner_subtitle}
                        </p>

                        <form onSubmit={handleOwnerSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label style={labelStyle}>{dict.form.name}</label>
                                <input
                                    style={inputStyle}
                                    placeholder="John Doe"
                                    required
                                    value={ownerData.name}
                                    onChange={e => setOwnerData({ ...ownerData, name: e.target.value })}
                                    onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; e.target.style.boxShadow = '0 0 0 3px rgba(207,187,155,0.20)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Phone */}
                                <div>
                                    <label style={labelStyle}>{dict.form.phone}</label>
                                    <input
                                        style={inputStyle}
                                        placeholder="+57..."
                                        required
                                        value={ownerData.phone}
                                        onChange={e => setOwnerData({ ...ownerData, phone: e.target.value })}
                                        onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; e.target.style.boxShadow = '0 0 0 3px rgba(207,187,155,0.20)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                {/* Location */}
                                <div>
                                    <label style={labelStyle}>{dict.form.location}</label>
                                    <input
                                        style={inputStyle}
                                        placeholder="City, Country"
                                        required
                                        value={ownerData.location}
                                        onChange={e => setOwnerData({ ...ownerData, location: e.target.value })}
                                        onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; e.target.style.boxShadow = '0 0 0 3px rgba(207,187,155,0.20)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label style={labelStyle}>{dict.form.message}</label>
                                <textarea
                                    style={textareaStyle}
                                    placeholder={dict.form.message_placeholder_owner}
                                    value={ownerData.message}
                                    onChange={e => setOwnerData({ ...ownerData, message: e.target.value })}
                                    onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; e.target.style.boxShadow = '0 0 0 3px rgba(207,187,155,0.20)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {status.owner === "success" && (
                                <div
                                    className="p-4 rounded-sm text-center font-medium text-sm"
                                    style={{ backgroundColor: 'rgba(82,120,88,0.12)', color: '#265140', border: '1px solid rgba(82,120,88,0.25)' }}
                                >
                                    {dict.form.success_owner}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button type="submit" isLoading={loading.owner} variant="primary" className="flex-1" id="owner-form-submit">
                                    {dict.form.submit_owner}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={handleWhatsAppOwner}
                                    id="owner-form-whatsapp"
                                    style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                                >
                                    {dict.form.submit_whatsapp}
                                </Button>
                            </div>

                            <Link href={`/${lang}/partners`} className="block">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    id="owner-form-more-info"
                                >
                                    {dict.more_info}
                                </Button>
                            </Link>
                        </form>
                    </div>

                    {/* ——————————————————————————————
                        Guest Inquiry Form
                    —————————————————————————————— */}
                    <div
                        className="rounded-sm p-8 md:p-10"
                        style={{
                            backgroundColor: '#f4f2eb',
                            border: '1px solid rgba(82,120,88,0.18)',
                            boxShadow: '0 4px 20px rgba(75,61,28,0.08)',
                        }}
                    >
                        {/* Sand top accent bar */}
                        <div
                            className="w-12 h-1 rounded-full mb-6"
                            style={{ backgroundColor: '#cfbb9b' }}
                        />

                        <h3
                            className="text-2xl font-bold mb-3"
                            style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif", letterSpacing: '-0.01em' }}
                        >
                            {dict.guest_title}
                        </h3>
                        <p
                            className="mb-8 leading-loose"
                            style={{ color: 'rgba(75,61,28,0.65)', fontFamily: "'MegantZ', serif", lineHeight: '1.7' }}
                        >
                            {dict.guest_subtitle}
                        </p>

                        <form onSubmit={handleGuestSubmit} className="space-y-5">
                            <div>
                                <label style={labelStyle}>{dict.form.name}</label>
                                <input
                                    style={inputStyle}
                                    placeholder="Jane Smith"
                                    required
                                    value={guestData.name}
                                    onChange={e => setGuestData({ ...guestData, name: e.target.value })}
                                    onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; e.target.style.boxShadow = '0 0 0 3px rgba(207,187,155,0.20)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>{dict.form.phone}</label>
                                <input
                                    style={inputStyle}
                                    placeholder="+57..."
                                    required
                                    value={guestData.phone}
                                    onChange={e => setGuestData({ ...guestData, phone: e.target.value })}
                                    onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; e.target.style.boxShadow = '0 0 0 3px rgba(207,187,155,0.20)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>{dict.form.message}</label>
                                <textarea
                                    style={textareaStyle}
                                    placeholder={dict.form.message_placeholder_guest}
                                    required
                                    value={guestData.message}
                                    onChange={e => setGuestData({ ...guestData, message: e.target.value })}
                                    onFocus={(e) => { e.target.style.borderColor = '#cfbb9b'; e.target.style.boxShadow = '0 0 0 3px rgba(207,187,155,0.20)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(82,120,88,0.25)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {status.guest === "success" && (
                                <div
                                    className="p-4 rounded-sm text-center font-medium text-sm"
                                    style={{ backgroundColor: 'rgba(82,120,88,0.12)', color: '#265140', border: '1px solid rgba(82,120,88,0.25)' }}
                                >
                                    {dict.form.success_guest}
                                </div>
                            )}

                            <Button type="submit" isLoading={loading.guest} variant="sand" className="w-full" id="guest-form-submit">
                                {dict.form.submit_guest}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};
