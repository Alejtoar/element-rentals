"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/api/client";
import { Channel, ChannelCreate, ChannelUpdate } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

export default function ChannelsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params || {});
    const [dict, setDict] = useState<any>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [error, setError] = useState("");

    const [createForm, setCreateForm] = useState<ChannelCreate>({
        name: "",
        external: false,
    });

    const [editForm, setEditForm] = useState<ChannelUpdate>({});

    useEffect(() => {
        const loadInit = async () => {
            if (lang) {
                const d = await getDictionary(lang as Locale);
                setDict(d);
            }
        };
        loadInit();
        loadChannels();
    }, [lang]);

    const loadChannels = async () => {
        try {
            setLoading(true);
            const data = await api.channels.getAll();
            setChannels(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.channels.create(createForm);
            setShowCreateModal(false);
            setCreateForm({ name: "", external: false });
            loadChannels();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChannel) return;

        try {
            await api.channels.update(selectedChannel.id, editForm);
            setShowEditModal(false);
            setSelectedChannel(null);
            loadChannels();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(dict?.admin?.common?.delete_confirm || "Are you sure you want to delete this channel?")) return;

        try {
            await api.channels.delete(id);
            loadChannels();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const openEditModal = (channel: Channel) => {
        setSelectedChannel(channel);
        setEditForm({
            name: channel.name,
            external: channel.external,
        });
        setShowEditModal(true);
    };

    if (loading && !dict) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#265140' }}></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.channels?.title || "Channels"}</h1>
                    <p className="text-sm font-medium mt-1" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>{dict?.admin?.channels?.subtitle || "Manage reservation sources"}</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} variant="sand">
                    {dict?.admin?.channels?.add_channel || "Create Channel"}
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-sm text-sm font-medium" style={{ backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#cc4444' }}>
                    {dict?.admin?.common?.error || error}
                </div>
            )}

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map((channel) => (
                    <div
                        key={channel.id}
                        className="rounded-sm p-6 transition-all"
                        style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)', boxShadow: '0 4px 20px rgba(75,61,28,0.05)' }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{channel.name}</h3>
                                <span className="px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest"
                                    style={{
                                        backgroundColor: channel.external ? 'rgba(75,61,28,0.1)' : 'rgba(82,120,88,0.1)',
                                        color: channel.external ? '#4b3d1c' : '#527858'
                                    }}>
                                    {channel.external ? (dict?.admin?.channels?.external || "External") : (dict?.admin?.channels?.direct || "Direct")}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm font-medium mb-4" style={{ color: 'rgba(75,61,28,0.7)', fontFamily: "'MegantZ', serif" }}>
                            {dict?.admin?.table?.created_at || "Created"}: {new Date(channel.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => openEditModal(channel)}
                                className="flex-1 px-4 py-2 font-bold uppercase tracking-widest text-xs transition-colors rounded-sm"
                                style={{ backgroundColor: 'rgba(38,81,64,0.05)', color: '#265140' }}
                            >
                                {dict?.admin?.common?.edit || "Edit"}
                            </button>
                            <button
                                onClick={() => handleDelete(channel.id)}
                                className="flex-1 px-4 py-2 font-bold uppercase tracking-widest text-xs transition-colors rounded-sm hover:bg-red-50"
                                style={{ color: '#cc4444', backgroundColor: 'transparent', border: '1px solid rgba(204,68,68,0.2)' }}
                            >
                                {dict?.admin?.common?.delete || "Delete"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm p-8 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-6" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.channels?.add_channel || "Create Channel"}</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                label={dict?.admin?.channels?.channel_name || "Channel Name"}
                                placeholder="e.g., Airbnb, Booking.com, Direct"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                required
                            />
                            <div className="flex items-center gap-3 p-4 rounded-sm" style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                                <input
                                    type="checkbox"
                                    id="external"
                                    checked={createForm.external}
                                    onChange={(e) => setCreateForm({ ...createForm, external: e.target.checked })}
                                    className="w-5 h-5 rounded cursor-pointer"
                                    style={{ accentColor: '#265140' }}
                                />
                                <label htmlFor="external" className="text-sm font-bold cursor-pointer" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                    {dict?.admin?.channels?.external || "External Channel"}
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1" variant="sand">{dict?.admin?.common?.add || "Create"}</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedChannel && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-sm p-8 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#f4f2eb', border: '1px solid rgba(82,120,88,0.2)' }}>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-6" style={{ color: '#265140', fontFamily: "'Berlin Sans', sans-serif" }}>{dict?.admin?.channels?.edit_channel || "Edit Channel"}</h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <Input
                                label={dict?.admin?.channels?.channel_name || "Channel Name"}
                                value={editForm.name || ""}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            <div className="flex items-center gap-3 p-4 rounded-sm" style={{ backgroundColor: 'rgba(38,81,64,0.05)' }}>
                                <input
                                    type="checkbox"
                                    id="external-edit"
                                    checked={editForm.external ?? false}
                                    onChange={(e) => setEditForm({ ...editForm, external: e.target.checked })}
                                    className="w-5 h-5 rounded cursor-pointer"
                                    style={{ accentColor: '#265140' }}
                                />
                                <label htmlFor="external-edit" className="text-sm font-bold cursor-pointer" style={{ color: '#4b3d1c', fontFamily: "'MegantZ', serif" }}>
                                    {dict?.admin?.channels?.external || "External Channel"}
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1" variant="sand">{dict?.admin?.common?.save || "Update"}</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1"
                                >
                                    {dict?.admin?.common?.cancel || "Cancel"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
