"use client";

import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { Channel, ChannelCreate, ChannelUpdate } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ChannelsPage() {
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
        loadChannels();
    }, []);

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
        if (!confirm("Are you sure you want to delete this channel?")) return;

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

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Booking Channels</h1>
                    <p className="text-slate-400 mt-1">Manage reservation sources (Airbnb, Booking.com, Direct, etc.)</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    Create Channel
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map((channel) => (
                    <div
                        key={channel.id}
                        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{channel.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${channel.external
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'bg-green-500/20 text-green-300'
                                    }`}>
                                    {channel.external ? 'External' : 'Direct'}
                                </span>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-4">
                            Created: {new Date(channel.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => openEditModal(channel)}
                                className="flex-1 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(channel.id)}
                                className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-6">Create Channel</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                label="Channel Name"
                                placeholder="e.g., Airbnb, Booking.com, Direct"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                required
                            />
                            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="external"
                                    checked={createForm.external}
                                    onChange={(e) => setCreateForm({ ...createForm, external: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-600 text-purple-500 focus:ring-purple-500/20"
                                />
                                <label htmlFor="external" className="text-slate-300 cursor-pointer">
                                    External Channel (Airbnb, Booking.com, etc.)
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">Create</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedChannel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-6">Edit Channel</h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <Input
                                label="Channel Name"
                                value={editForm.name || ""}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="external-edit"
                                    checked={editForm.external ?? false}
                                    onChange={(e) => setEditForm({ ...editForm, external: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-600 text-purple-500 focus:ring-purple-500/20"
                                />
                                <label htmlFor="external-edit" className="text-slate-300 cursor-pointer">
                                    External Channel
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">Update</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
