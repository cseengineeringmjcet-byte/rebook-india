"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, MessageCircle, Star } from "lucide-react";
import { getVendors } from "@/lib/firebase/firestore";

function waVendor(vendor: any) {
    return `https://wa.me/916301038443`;
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [area, setArea] = useState("");
    const [badge, setBadge] = useState("All");

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await getVendors();
                setVendors(data || []);
            } catch (err) {
                console.error("Failed to load vendors", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = vendors.filter((v) => {
        const matchQ =
            !q ||
            (v.shop_name && v.shop_name.toLowerCase().includes(q.toLowerCase())) ||
            (v.speciality && v.speciality.toLowerCase().includes(q.toLowerCase()));
        const matchArea = !area || v.area === area;
        const matchBadge = badge === "All" || v.badge === badge;
        return matchQ && matchArea && matchBadge;
    });

    const uniqueAreas = Array.from(
        new Set(vendors.map((v) => v.area).filter(Boolean))
    ).sort();
    const badges = ["All", "Elite", "Premium", "Trusted", "Partner"];

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] mb-4">
                        Our Trusted Vendors
                    </h1>
                    <p className="text-[var(--color-dust)] text-lg max-w-2xl mx-auto">
                        These are the local heroes who make affordable education possible.
                        Skip the middleman, pick up locally, and save 50%.
                    </p>
                </div>

                {/* Filters Panel */}
                <div className="bg-white p-6 rounded-sm shadow-sm border border-[var(--color-ldust)] flex flex-col md:flex-row gap-4 mb-12">
                    <div className="flex-1 relative">
                        <Search
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-dust)]"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search vendor name or specialty..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[var(--color-paper)] border border-[var(--color-ldust)] rounded-sm focus:outline-none focus:border-[var(--color-rust)] text-sm font-bold"
                        />
                    </div>
                    <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full md:w-64 bg-[var(--color-paper)] border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] text-sm font-bold"
                    >
                        <option value="">All Areas in Hyderabad</option>
                        {uniqueAreas.map((a) => (
                            <option key={a} value={a as string}>
                                {a as string}
                            </option>
                        ))}
                    </select>
                    <select
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="w-full md:w-48 bg-[var(--color-paper)] border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] text-sm font-bold"
                    >
                        {badges.map((b) => (
                            <option key={b} value={b}>
                                {b === "All" ? "All Badges" : `${b} Vendors`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Vendors Grid */}
                {loading ? (
                    <div className="text-center py-20 text-[var(--color-dust)] font-bold text-lg animate-pulse">
                        Loading vendors from Firebase...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((v) => {
                            // Get fallback image if needed
                            const fallbackImage = "/category-covers/default.png";
                            const imgSrc = v.shop_image || v.shopImage || fallbackImage;

                            // Badge color mapping
                            const badgeColors: Record<string, string> = {
                                Elite: "bg-purple-600 border-purple-400 text-white",
                                Premium: "bg-blue-600 border-blue-400 text-white",
                                Trusted: "bg-green-600 border-green-400 text-white",
                                Partner: "bg-orange-600 border-orange-400 text-white",
                            };
                            const badgeCls =
                                badgeColors[v.badge] ||
                                "bg-gray-700 border-gray-500 text-white";

                            return (
                                <div
                                    key={v.id}
                                    className="bg-white rounded-sm overflow-hidden shadow-sm border border-[var(--color-ldust)] flex flex-col h-full group transition-all duration-300 hover:shadow-lg"
                                >
                                    <Link
                                        href={`/vendor/${v.id}`}
                                        className="block relative overflow-hidden"
                                    >
                                        <div className="h-[200px] relative">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                                            <img
                                                src={imgSrc}
                                                alt={v.shop_name}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = fallbackImage;
                                                }}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {/* Badge overlay */}
                                            {v.badge && (
                                                <div
                                                    className={`absolute top-3 left-3 z-20 text-[10px] font-bold px-2 py-1 rounded-sm uppercase flex items-center gap-1 border shadow-md ${badgeCls}`}
                                                >
                                                    {v.badge === "Elite" && "🏆 "} {v.badge}
                                                </div>
                                            )}
                                            {/* Rating overlay */}
                                            {v.rating && (
                                                <div className="absolute top-3 right-3 z-20 bg-white text-[var(--color-ink)] text-xs font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-md">
                                                    <Star
                                                        size={12}
                                                        fill="currentColor"
                                                        className="text-[var(--color-amber)]"
                                                    />{" "}
                                                    {v.rating}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="p-6 flex flex-col flex-1">
                                        <Link
                                            href={`/vendor/${v.id}`}
                                            className="font-display font-black text-xl text-[var(--color-ink)] mb-1 hover:text-[var(--color-rust)] transition-colors line-clamp-1"
                                        >
                                            {v.shop_name}
                                        </Link>
                                        <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-dust)] mb-4">
                                            {v.speciality || "Used Books"}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-[var(--color-ink)] mb-6 border-y border-[var(--color-ldust)] py-3 bg-[var(--color-paper)] -mx-6 px-6 mt-auto">
                                            <span className="flex items-center gap-1 font-bold">
                                                <MapPin size={16} className="text-[var(--color-rust)]" />{" "}
                                                {v.area}
                                            </span>
                                            {(v.total_books !== undefined || v.totalBooks !== undefined) && (
                                                <span className="font-mono font-bold">
                                                    {v.total_books ?? v.totalBooks} Books
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.open(waVendor(v), "_blank");
                                                }}
                                                className="bg-[#25D366]/10 text-[#128c7e] hover:bg-[#25D366] hover:text-white py-3 rounded-sm font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-[#25D366]/30"
                                            >
                                                <MessageCircle size={18} /> WhatsApp
                                            </button>
                                            <Link
                                                href={`/vendor/${v.id}`}
                                                className="bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-rust)] py-3 rounded-sm font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                                            >
                                                View Books
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filtered.length === 0 && (
                            <div className="col-span-full py-20 text-center text-[var(--color-dust)] border-2 border-dashed border-[var(--color-ldust)] rounded-sm">
                                <span className="text-2xl mb-2 block">🔍</span>
                                <p className="font-bold text-lg mb-1">No vendors found</p>
                                <p className="text-sm">Try adjusting your filters or search term.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
