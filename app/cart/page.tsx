"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/store/useCart';
import BookCoverImage from '@/components/BookCoverImage';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
    const { items, count, total, savings, removeItem } = useCart();

    if (items.length === 0) {
        return (
            <div className="bg-[var(--color-cream)] min-h-screen py-20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[var(--color-paper)] mx-auto mb-6 text-[var(--color-dust)]">
                        <ShoppingCart size={40} />
                    </div>
                    <h1 className="font-display font-black text-3xl md:text-4xl text-[var(--color-ink)] mb-4">Your cart is empty</h1>
                    <p className="text-[var(--color-dust)] mb-8">Save 50% on every book. Start exploring our collection.</p>
                    <Link href="/browse" className="bg-[var(--color-rust)] hover:bg-[#A93C23] text-white px-8 py-4 rounded-sm font-bold shadow-md transition-colors inline-block">
                        Browse Books Available in Hyderabad
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-16">
            <div className="max-w-6xl mx-auto px-4">

                <h1 className="font-display font-black text-3xl md:text-4xl text-[var(--color-ink)] mb-8">Your Cart ({count} items)</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-sm shadow-sm border border-[var(--color-ldust)] overflow-hidden">
                            <div className="bg-[var(--color-paper)] p-4 border-b border-[var(--color-ldust)] hidden md:grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-wider text-[var(--color-dust)]">
                                <div className="col-span-6">Book</div>
                                <div className="col-span-2 text-center">Condition</div>
                                <div className="col-span-3 text-right">Price</div>
                                <div className="col-span-1 border"></div>
                            </div>

                            <div className="divide-y divide-[var(--color-ldust)]">
                                {items.map((item) => (
                                    <div key={item.cartItemId} className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center">
                                        <div className="md:col-span-6 flex gap-4 w-full relative">
                                            <div className="w-[60px] md:w-[80px] shrink-0">
                                                <BookCoverImage book={item} />
                                            </div>
                                            <div className="flex-1">
                                                <Link href={`/book/${item.id}`} className="font-display font-bold text-[var(--color-ink)] hover:text-[var(--color-rust)] line-clamp-2 md:text-lg leading-snug">
                                                    {item.title}
                                                </Link>
                                                <p className="text-xs text-[var(--color-dust)] mt-1">{item.author}</p>
                                                <p className="text-xs text-[var(--color-dust)] mt-2 italic hidden md:block">Sold by: {item.vendorName}</p>

                                                {/* Mobile only controls */}
                                                <div className="flex justify-between items-center mt-3 md:hidden">
                                                    <span className="text-[10px] font-bold uppercase bg-[var(--color-paper)] px-2 py-0.5 rounded-sm border border-[var(--color-ldust)]">
                                                        {item.condition.replace('_', ' ')}
                                                    </span>
                                                    <button
                                                        onClick={() => { removeItem(item.id); toast.info("Removed from cart"); }}
                                                        className="text-red-400 hover:text-red-500 p-2"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 text-center hidden md:block">
                                            <span className="text-[10px] font-bold uppercase bg-[var(--color-paper)] px-2 py-1 rounded-sm border border-[var(--color-ldust)]">
                                                {item.condition.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="hidden md:col-span-3 md:flex flex-col items-end">
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-mono text-lg font-bold text-[var(--color-sage)]">₹{item.ourPrice}</span>
                                                <span className="font-mono text-xs line-through text-[var(--color-dust)]">₹{item.mrp}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-[var(--color-rust)] mt-1">
                                                Save ₹{item.savings}
                                            </div>
                                        </div>

                                        <div className="md:col-span-1 text-right hidden md:block">
                                            <button
                                                onClick={() => { removeItem(item.id); toast.info("Removed from cart"); }}
                                                className="text-red-400 hover:text-red-500 p-2 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* Mobile Price */}
                                        <div className="w-full flex justify-between items-end border-t border-[var(--color-ldust)] pt-3 md:hidden">
                                            <div className="text-[10px] text-[var(--color-dust)] italic">{item.vendorName}</div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-[var(--color-sage)] text-lg">₹{item.ourPrice}</div>
                                                <div className="font-mono text-xs line-through text-[var(--color-dust)]">₹{item.mrp}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-sm shadow-sm border border-[var(--color-ldust)] p-6 sticky top-24">
                            <h2 className="font-display font-bold text-xl text-[var(--color-ink)] mb-6 border-b border-[var(--color-ldust)] pb-4">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-[var(--color-dust)] text-sm">
                                    <span>Total Items</span>
                                    <span className="font-mono">{count} books</span>
                                </div>
                                <div className="flex justify-between text-[var(--color-dust)] text-sm">
                                    <span>Total MRP</span>
                                    <span className="font-mono line-through">₹{total + savings}</span>
                                </div>
                                <div className="flex justify-between text-[var(--color-sage)] font-bold text-sm">
                                    <span>Your Savings</span>
                                    <span className="font-mono">- ₹{savings}</span>
                                </div>
                                <div className="flex justify-between text-[var(--color-dust)] text-sm border-b border-[var(--color-ldust)] pb-4">
                                    <span>Delivery Charge</span>
                                    <span className="font-mono text-[var(--color-sage)]">₹0 (Pickup)</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-bold text-[var(--color-ink)] text-lg">Total</span>
                                    <span className="font-mono font-black text-[var(--color-ink)] text-2xl">₹{total}</span>
                                </div>
                            </div>

                            <div className="bg-[var(--color-paper)] p-3 rounded-sm border border-[var(--color-ldust)] mb-6 text-xs text-[var(--color-dust)] flex items-start gap-2">
                                <div className="text-[var(--color-amber)] mt-0.5">ℹ️</div>
                                <p>This is an order request. You pay <strong>nothing</strong> online. You will pay the vendor directly upon pickup/delivery.</p>
                            </div>

                            <Link href="/checkout" className="w-full flex items-center justify-center gap-2 bg-[var(--color-rust)] hover:bg-[#A93C23] text-white py-4 rounded-sm font-bold shadow-md transition-colors text-lg">
                                Proceed to Checkout <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
