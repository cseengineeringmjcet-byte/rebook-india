"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useDataStore } from '@/store/useDataStore';
import { Search, MapPin, MessageCircle, Star } from 'lucide-react';
import { waVendor } from '@/lib/whatsapp';

export default function VendorsPage() {
    const { vendors } = useDataStore();
    const [q, setQ] = useState('');
    const [area, setArea] = useState('');
    const [badge, setBadge] = useState('');

    const filtered = vendors.filter(v => {
        const matchQ = !q || v.shopName.toLowerCase().includes(q.toLowerCase()) || v.speciality.toLowerCase().includes(q.toLowerCase());
        const matchArea = !area || v.area === area;
        const matchBadge = !badge || v.badge === badge;
        return matchQ && matchArea && matchBadge;
    });

    const uniqueAreas = Array.from(new Set(vendors.map(v => v.area))).sort();
    const badges = ['Elite', 'Premium', 'Trusted', 'Partner'];

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-16">
            <div className="max-w-7xl mx-auto px-4">

                <div className="text-center mb-12">
                    <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] mb-4">Our Trusted Vendors</h1>
                    <p className="text-[var(--color-dust)] text-lg max-w-2xl mx-auto">
                        These are the local heroes who make affordable education possible. Skip the middleman, pick up locally, and save 50%.
                    </p>
                </div>

                {/* Filters Panel */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-[var(--color-ldust)] flex flex-col md:flex-row gap-4 mb-12">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-dust)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search vendor name or specialty..."
                            value={q} onChange={e => setQ(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[var(--color-paper)] border border-[var(--color-ldust)] rounded-sm focus:outline-none focus:border-[var(--color-rust)] text-sm font-bold"
                        />
                    </div>
                    <select
                        value={area} onChange={e => setArea(e.target.value)}
                        className="w-full md:w-64 bg-[var(--color-paper)] border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] text-sm font-bold"
                    >
                        <option value="">All Areas in Hyderabad</option>
                        {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <select
                        value={badge} onChange={e => setBadge(e.target.value)}
                        className="w-full md:w-48 bg-[var(--color-paper)] border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] text-sm font-bold"
                    >
                        <option value="">All Badges</option>
                        {badges.map(b => <option key={b} value={b}>{b} Vendors</option>)}
                    </select>
                </div>

                {/* Vendors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(v => (
                        <Link href={`/vendor/${v.id}`} key={v.id} className="bg-white rounded-sm overflow-hidden shadow-sm border border-[var(--color-ldust)] group hover:-translate-y-1 transition-transform block">
                            <div className="h-[160px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                                <img src={v.shopImage} alt={v.shopName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase flex items-center gap-1 border border-white/20">
                                    {v.badge === 'Elite' && '🏆 '} {v.badge}
                                </div>
                                <div className="absolute top-3 right-3 z-20 bg-white text-[var(--color-ink)] text-xs font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-md">
                                    <Star size={12} fill="currentColor" className="text-[var(--color-amber)]" /> {v.rating}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-display font-bold text-xl text-[var(--color-ink)] mb-1 group-hover:text-[var(--color-rust)] transition-colors">{v.shopName}</h3>
                                <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-dust)] mb-4">{v.speciality}</div>

                                <div className="flex items-center justify-between text-sm text-[var(--color-ink)] mb-6 border-y border-[var(--color-ldust)] py-3 bg-[var(--color-paper)] -mx-6 px-6">
                                    <span className="flex items-center gap-1 font-bold"><MapPin size={16} className="text-[var(--color-rust)]" /> {v.area}</span>
                                    <span className="font-mono font-bold">{v.totalBooks} Books</span>
                                </div>

                                <button
                                    onClick={(e) => { e.preventDefault(); window.open(waVendor(v), '_blank'); }}
                                    className="w-full bg-[#25D366]/10 text-[#128c7e] hover:bg-[#25D366] hover:text-white py-3 rounded-sm font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-[#25D366]/30"
                                >
                                    <MessageCircle size={18} /> WhatsApp Vendor
                                </button>
                            </div>
                        </Link>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-20 text-[var(--color-dust)]">
                            No vendors found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
