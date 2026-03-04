"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { Package, Search, Eye, XCircle, X } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function OrdersPage() {
    const { isLoggedIn, user, isLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push("/auth");
        } else if (isLoggedIn && user) {
            fetchOrders();
        }
    }, [isLoggedIn, isLoading, user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "orders"),
                where("buyer_id", "==", user?.uid)
            );
            const snap = await getDocs(q);

            const fetchedOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

            // Sort client-side newest first using placed_at
            fetchedOrders.sort((a: any, b: any) => {
                const timeA = a.placed_at?.seconds || a.created_at?.seconds || 0;
                const timeB = b.placed_at?.seconds || b.created_at?.seconds || 0;
                return timeB - timeA;
            });

            setOrders(fetchedOrders);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await updateDoc(doc(db, "orders", orderId), { status: "cancelled" });
            toast.success("Order cancelled");
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(null);
            }
        } catch (err) {
            toast.error("Failed to cancel order");
        }
    };

    const getStatusStyles = (status: string) => {
        const s = (status || "").toLowerCase();
        switch (s) {
            case "placed": return "bg-amber-100 text-amber-800 border-amber-200";
            case "reviewing": return "bg-blue-100 text-blue-800 border-blue-200";
            case "confirmed": return "bg-purple-100 text-purple-800 border-purple-200";
            case "dispatched": return "bg-orange-100 text-orange-800 border-orange-200";
            case "delivered": return "bg-green-100 text-green-800 border-green-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (isLoading || !isLoggedIn) {
        return (
            <div className="bg-[var(--color-cream)] min-h-screen py-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-rust)] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-12 md:py-20 relative">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] flex items-center gap-3 mb-10">
                    <Package className="text-[var(--color-rust)]" size={40} /> My Orders
                </h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-rust)] border-t-transparent"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-12 text-center border border-[var(--color-ldust)] rounded-sm shadow-sm">
                        <Search size={48} className="text-[var(--color-dust)] mx-auto mb-4 opacity-50" />
                        <h2 className="font-display font-bold text-2xl text-[var(--color-ink)] mb-2">No orders yet</h2>
                        <p className="text-[var(--color-dust)] mb-8">You haven't placed any book requests.</p>
                        <Link href="/browse" className="bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold shadow-sm transition-colors text-lg inline-block">
                            Browse Books
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => {
                            const dtRaw = order.placed_at?.seconds || order.created_at?.seconds;
                            const dtString = dtRaw ? new Date(dtRaw * 1000).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently";
                            const statusColor = getStatusStyles(order.status);

                            return (
                                <div key={order.id} className="bg-white border border-[var(--color-ldust)] rounded-sm overflow-hidden shadow-sm flex flex-col md:flex-row relative">
                                    <div className="p-6 md:p-8 flex-1">

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div>
                                                <div className="text-[var(--color-dust)] text-xs font-bold uppercase tracking-wider mb-1">
                                                    Order Placed: {dtString}
                                                </div>
                                                <div className="font-mono font-bold text-[var(--color-rust)] text-lg">
                                                    {order.order_number || order.id.slice(0, 10).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 font-bold text-xs uppercase tracking-wider rounded-sm border inline-block text-center shadow-sm w-fit ${statusColor}`}>
                                                {order.status || "placed"}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="font-display font-bold text-xl text-[var(--color-ink)] mb-1">{order.book_title}</h3>
                                            {(order.vendor_name || order.book_author) && (
                                                <p className="text-sm text-[var(--color-dust)] italic">
                                                    {order.vendor_name ? `From: ${order.vendor_name}` : `Author: ${order.book_author}`}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-4 items-end border-t border-[var(--color-ldust)] pt-4 mt-2">
                                            <div className="flex-1 min-w-[120px]">
                                                <div className="text-[var(--color-dust)] font-bold uppercase tracking-wider text-[10px] mb-1">Price Paid</div>
                                                <div className="font-mono font-black text-[var(--color-sage)] text-xl">₹{order.price_paid || order.our_price || 0}</div>
                                            </div>
                                            <div className="flex-1 min-w-[120px]">
                                                <div className="text-[var(--color-dust)] font-bold uppercase tracking-wider text-[10px] mb-1">Total Savings</div>
                                                <div className="font-mono font-bold text-[var(--color-rust)]">₹{order.savings || 0}</div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4 w-full md:w-auto">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-[var(--color-ldust)] hover:border-[var(--color-ink)] text-[var(--color-ink)] px-4 py-2 rounded-sm font-bold text-xs transition-colors"
                                                >
                                                    <Eye size={14} /> View Details
                                                </button>

                                                {(order.status || "").toLowerCase() === "placed" && (
                                                    <button
                                                        onClick={() => handleCancel(order.id)}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-sm font-bold text-xs transition-colors shadow-sm"
                                                    >
                                                        <XCircle size={14} /> Cancel Order
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white max-w-lg w-full rounded-sm shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-[var(--color-ldust)] flex justify-between items-center bg-[var(--color-paper)]">
                            <h3 className="font-display font-bold text-xl text-[var(--color-ink)]">Order Info</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-[var(--color-dust)] hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">

                            <div className="bg-[var(--color-paper)] p-4 rounded-sm border border-[var(--color-ldust)]">
                                <div className="text-[var(--color-dust)] text-[10px] font-bold uppercase tracking-wider mb-1">Order #</div>
                                <div className="font-mono text-[var(--color-rust)] font-bold text-lg">{selectedOrder.order_number || selectedOrder.id}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider rounded-sm border ${getStatusStyles(selectedOrder.status)}`}>
                                        {selectedOrder.status || "placed"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-wider text-xs border-b border-[var(--color-ldust)] pb-1">Book Details</h4>
                                <div className="font-bold text-[var(--color-ink)]">{selectedOrder.book_title}</div>
                                {selectedOrder.vendor_name && <div className="text-sm text-[var(--color-dust)] italic">Vendor: {selectedOrder.vendor_name}</div>}

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="bg-[var(--color-cream)] p-2 rounded-sm border border-[var(--color-ldust)]">
                                        <div className="text-[10px] uppercase text-[var(--color-dust)] font-bold">MRP</div>
                                        <div className="font-mono line-through text-sm">₹{selectedOrder.mrp}</div>
                                    </div>
                                    <div className="bg-[#25D366]/10 p-2 rounded-sm border border-[#25D366]/30">
                                        <div className="text-[10px] uppercase text-[#128c7e] font-bold">You Paid</div>
                                        <div className="font-mono font-bold text-[#128c7e] text-sm">₹{selectedOrder.price_paid || selectedOrder.our_price}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-[var(--color-ink)] uppercase tracking-wider text-xs border-b border-[var(--color-ldust)] pb-1">Delivery Info</h4>
                                <div className="text-sm text-[var(--color-dust)]">
                                    <span className="font-bold text-[var(--color-ink)] block mb-1">{selectedOrder.delivery_name || selectedOrder.buyer_name}</span>
                                    {selectedOrder.delivery_addr}<br />
                                    {selectedOrder.delivery_area}, {selectedOrder.delivery_pin}<br />
                                    Phone: {selectedOrder.delivery_phone || selectedOrder.buyer_phone}
                                </div>
                                {selectedOrder.buyer_notes && (
                                    <div className="bg-[var(--color-cream)] p-3 rounded-sm border border-[var(--color-ldust)] mt-2 italic text-xs text-[var(--color-dust)]">
                                        "{selectedOrder.buyer_notes}"
                                    </div>
                                )}
                            </div>

                            {(selectedOrder.status || "").toLowerCase() === "placed" && (
                                <button
                                    onClick={() => handleCancel(selectedOrder.id)}
                                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-sm font-bold transition-colors shadow-sm"
                                >
                                    Cancel This Order
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
