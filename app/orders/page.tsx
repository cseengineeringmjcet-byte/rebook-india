"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { Package, Search, Eye, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function OrdersPage() {
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const tabs = ['All', 'Active', 'Delivered', 'Cancelled'];

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/auth');
            return;
        }
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('buyer_id', user?.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setOrders(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (orderId: string) => {
        const confirmMsg = "Are you sure you want to cancel this order?";
        if (!window.confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orderId);

            if (error) throw error;
            toast.success("Order cancelled successfully");
            fetchOrders();
        } catch {
            toast.error("Failed to cancel order");
        }
    };

    const filteredOrders = orders.filter(o => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Active') return ['pending', 'placed', 'approved'].includes(o.status);
        if (activeTab === 'Delivered') return o.status === 'delivered';
        if (activeTab === 'Cancelled') return ['cancelled', 'rejected'].includes(o.status);
        return true;
    });

    if (!isLoggedIn) return null;

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-12 md:py-20">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] flex items-center gap-3">
                        <Package className="text-[var(--color-rust)]" size={40} /> My Orders
                    </h1>
                </div>

                <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === tab
                                ? 'bg-[var(--color-ink)] text-white shadow-md'
                                : 'bg-[var(--color-cream)] text-[var(--color-dust)] hover:bg-white border border-[var(--color-ldust)]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-rust)]"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white p-12 text-center border border-[var(--color-ldust)] rounded-sm shadow-sm">
                        <Search size={48} className="text-[var(--color-dust)] mx-auto mb-4 opacity-50" />
                        <h2 className="font-display font-bold text-2xl text-[var(--color-ink)] mb-2">No {activeTab.toLowerCase()} orders found</h2>
                        <p className="text-[var(--color-dust)] mb-8">You haven&apos;t placed any book requests yet.</p>
                        <Link href="/browse" className="bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold shadow-md transition-colors text-lg inline-block">
                            Browse Books
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-white border border-[var(--color-ldust)] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-[var(--color-paper)] p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[var(--color-ldust)] text-sm">
                                    <div className="space-y-1 mb-4 md:mb-0">
                                        <div className="text-[var(--color-dust)] font-bold uppercase tracking-wider text-xs">Order Placed</div>
                                        <div className="font-mono font-bold">{new Date(order.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="space-y-1 mb-4 md:mb-0">
                                        <div className="text-[var(--color-dust)] font-bold uppercase tracking-wider text-xs">Total</div>
                                        <div className="font-mono font-bold text-[var(--color-ink)]">₹{order.price_paid}</div>
                                    </div>
                                    <div className="space-y-1 mb-4 md:mb-0">
                                        <div className="text-[var(--color-dust)] font-bold uppercase tracking-wider text-xs">Order Number</div>
                                        <div className="font-mono">{order.order_number}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/orders/${order.id}`} className="flex items-center gap-1 bg-white border border-[var(--color-ldust)] hover:border-[var(--color-ink)] text-[var(--color-ink)] px-4 py-2 rounded-sm font-bold text-xs transition-colors">
                                            <Eye size={14} /> View Details
                                        </Link>
                                        {['pending', 'placed', 'approved'].includes(order.status) && (
                                            <button onClick={() => handleCancel(order.id)} className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-sm font-bold text-xs transition-colors">
                                                <XCircle size={14} /> Cancel Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-[var(--color-sage)]' : order.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                                            <span className="text-xs font-bold uppercase tracking-wider bg-gray-50 px-2 py-0.5 border border-[var(--color-ldust)] rounded-sm">
                                                {order.status}
                                            </span>
                                        </div>
                                        <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-1">{order.book_title}</h3>
                                        <p className="text-[var(--color-dust)] text-sm mb-4">Deliver to: {order.delivery_addr}, {order.delivery_area}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
