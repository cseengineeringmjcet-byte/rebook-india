"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { ArrowLeft, MessageCircle, Copy, Check, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isLoggedIn, isLoading } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push('/auth');
            return;
        }
        if (isLoggedIn && params.id) fetchOrder(params.id as string);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id, isLoggedIn, isLoading]);

    const fetchOrder = async (id: string) => {
        try {
            setLoading(true);
            const docRef = doc(db, 'orders', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error("Order not found");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (order) {
            navigator.clipboard.writeText(order.order_number);
            toast.success("Order number copied!");
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const docRef = doc(db, 'orders', order.id);
            await updateDoc(docRef, { status: 'cancelled' });

            toast.success("Order cancelled successfully");
            fetchOrder(order.id);
        } catch {
            toast.error("Failed to cancel order");
        }
    };

    if (loading) return <div className="min-h-screen py-20 text-center">Loading order...</div>;
    if (!order) return <div className="min-h-screen py-20 text-center">Order not found.</div>;

    const isActive = ['pending', 'placed', 'approved'].includes(order.status);
    const steps = ['placed', 'approved', 'delivered'];
    const currentStepIndex = order.status === 'cancelled' || order.status === 'rejected' ? -1 : steps.indexOf(order.status) >= 0 ? steps.indexOf(order.status) : 0;

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-12">
            <div className="max-w-3xl mx-auto px-4">
                <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-rust)] hover:underline mb-6">
                    <ArrowLeft size={16} /> Back to Orders
                </Link>

                <div className="bg-white border border-[var(--color-ldust)] rounded-sm shadow-sm p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[var(--color-ldust)] pb-6">
                        <div>
                            <div className="text-[var(--color-dust)] font-bold uppercase tracking-wider text-xs mb-1">Order Number</div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-mono font-black text-2xl text-[var(--color-ink)]">{order.order_number}</h1>
                                <button onClick={handleCopy} className="text-[var(--color-dust)] hover:text-[var(--color-rust)] p-1 rounded-sm border border-transparent hover:border-[var(--color-rust)] transition-colors" title="Copy">
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-left md:text-right">
                            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${order.status === 'delivered' ? 'bg-[var(--color-sage)] text-white' : order.status === 'cancelled' || order.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-[var(--color-gold)] text-[var(--color-ink)]'}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-[var(--color-ink)] mb-4 uppercase tracking-wider text-xs border-l-4 border-[var(--color-rust)] pl-2">Order Status</h3>
                        {order.status !== 'cancelled' && order.status !== 'rejected' ? (
                            <div className="flex items-center justify-between relative mt-8">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--color-ldust)] -z-10"></div>
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-sage)] -z-10 transition-all`} style={{ width: currentStepIndex === 0 ? '0%' : currentStepIndex === 1 ? '50%' : '100%' }}></div>

                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStepIndex >= 0 ? 'bg-[var(--color-sage)] text-white' : 'bg-[var(--color-ldust)] text-[var(--color-dust)]'} border-4 border-white shadow-sm`}>
                                        {currentStepIndex >= 0 ? <Check size={14} strokeWidth={3} /> : '1'}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${currentStepIndex >= 0 ? 'text-[var(--color-sage)]' : 'text-[var(--color-dust)]'}`}>Placed</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStepIndex >= 1 ? 'bg-[var(--color-sage)] text-white' : 'bg-[var(--color-ldust)] text-[var(--color-dust)]'} border-4 border-white shadow-sm`}>
                                        {currentStepIndex >= 1 ? <Check size={14} strokeWidth={3} /> : '2'}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${currentStepIndex >= 1 ? 'text-[var(--color-sage)]' : 'text-[var(--color-dust)]'}`}>Confirmed</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStepIndex === 2 ? 'bg-[var(--color-sage)] text-white' : 'bg-[var(--color-ldust)] text-[var(--color-dust)]'} border-4 border-white shadow-sm`}>
                                        {currentStepIndex === 2 ? <Check size={14} strokeWidth={3} /> : '3'}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${currentStepIndex === 2 ? 'text-[var(--color-sage)]' : 'text-[var(--color-dust)]'}`}>Delivered</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-200 text-sm font-bold flex items-center gap-2">
                                <XCircle size={18} /> This order was {order.status}.
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-[var(--color-ink)] mb-3 uppercase tracking-wider text-xs border-l-4 border-[var(--color-sage)] pl-2">Delivery Details</h3>
                            <div className="bg-[var(--color-paper)] p-4 rounded-sm border border-[var(--color-ldust)] text-sm">
                                <p className="font-bold text-[var(--color-ink)] mb-1">{order.delivery_name}</p>
                                <p className="text-[var(--color-dust)] mb-1">{order.delivery_addr}</p>
                                <p className="text-[var(--color-dust)] mb-1">{order.delivery_area} - {order.delivery_pin}</p>
                                <p className="text-[var(--color-dust)]">Phone: {order.delivery_phone}</p>
                                {order.buyer_notes && (
                                    <div className="mt-3 pt-3 border-t border-[var(--color-ldust)]">
                                        <p className="text-xs text-[var(--color-dust)] italic">Note: {order.buyer_notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--color-ink)] mb-3 uppercase tracking-wider text-xs border-l-4 border-[var(--color-ink)] pl-2">Book Details</h3>
                            <div className="bg-[var(--color-paper)] p-4 rounded-sm border border-[var(--color-ldust)] text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-dust)]">Book Title</span>
                                    <span className="font-bold text-[var(--color-ink)] truncate max-w-[150px]">{order.book_title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-dust)]">Price to Pay</span>
                                    <span className="font-mono font-bold text-[var(--color-sage)] px-2 py-0.5 bg-[var(--color-sage)]/10 rounded-sm">₹{order.price_paid}</span>
                                </div>
                                <div className="flex justify-between border-t border-[var(--color-ldust)] pt-2 mt-2">
                                    <span className="text-[var(--color-ink)] font-bold">Total Request</span>
                                    <span className="font-mono font-black text-[var(--color-ink)]">₹{order.price_paid}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--color-ldust)]">
                        {isActive && (
                            <button onClick={handleCancel} className="flex-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 py-3 rounded-sm font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                <XCircle size={16} /> Cancel Request
                            </button>
                        )}
                        <button onClick={() => window.open(`https://wa.me/919876543210?text=Hello%20Rebook%20India,%20I%20have%20a%20question%20regarding%20my%20order%20${order.order_number}.`, '_blank')} className="flex-1 bg-[#25D366]/10 text-[#128c7e] hover:bg-[#25D366] hover:text-white border border-[#25D366]/30 py-3 rounded-sm font-bold text-sm transition-colors flex items-center justify-center gap-2">
                            <MessageCircle size={16} /> Contact Support
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
