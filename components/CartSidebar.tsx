"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/store/useCart';
import { useUI } from '@/store/useUI';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import BookCoverImage from './BookCoverImage';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { toast } from 'sonner';

export default function CartSidebar() {
    const { cartOpen, closeCart } = useUI();
    const { items, count, total, savings, removeItem } = useCart();
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    const handleProceed = () => {
        closeCart();
        if (isLoggedIn) {
            router.push('/checkout');
        } else {
            toast.error("Please login to continue");
            router.push('/auth');
        }
    };

    if (!cartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                onClick={closeCart}
            />

            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-[var(--color-paper)] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-ldust)] bg-[var(--color-cream)]">
                    <div className="flex items-center gap-2 font-display font-bold text-lg text-[var(--color-ink)]">
                        <ShoppingCart size={20} />
                        Your Cart ({count})
                    </div>
                    <button onClick={closeCart} className="p-2 hover:bg-black/5 rounded-full transition-colors text-[var(--color-ink)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                            <ShoppingCart size={48} className="mb-4 text-[var(--color-dust)]" />
                            <p className="font-body text-[var(--color-ink)] font-medium mb-4">Your cart is empty</p>
                            <Link
                                href="/browse"
                                onClick={closeCart}
                                className="bg-[var(--color-rust)] text-white px-6 py-2 rounded-sm font-bold text-sm hover:bg-opacity-90 transition"
                            >
                                Browse Books
                            </Link>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.cartItemId} className="flex gap-3 bg-white p-2 rounded-sm shadow-sm border border-[var(--color-ldust)]">
                                <div className="w-[50px] shrink-0">
                                    <BookCoverImage book={item} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/book/${item.id}`} onClick={closeCart} className="hover:text-[var(--color-rust)] block">
                                        <h4 className="font-display font-bold text-sm text-[var(--color-ink)] truncate leading-tight hover:text-[var(--color-rust)]">{item.title}</h4>
                                    </Link>
                                    <p className="text-xs text-[var(--color-dust)] truncate">{item.author}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="font-mono font-bold text-[var(--color-sage)]">₹{item.ourPrice}</span>
                                        <span className="font-mono text-xs line-through text-[var(--color-dust)]">₹{item.mrp}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        removeItem(item.id);
                                        toast.info("Removed from cart");
                                    }}
                                    className="text-red-400 hover:text-red-600 p-2 shrink-0 self-start"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 bg-white border-t border-[var(--color-ldust)] space-y-3">
                        <div className="flex justify-between text-sm text-[var(--color-dust)]">
                            <span>Total Books</span>
                            <span className="font-mono">{count}</span>
                        </div>
                        <div className="flex justify-between text-sm text-[var(--color-sage)] font-bold">
                            <span>Total Savings</span>
                            <span className="font-mono">₹{savings}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg text-[var(--color-ink)] font-bold pt-2 border-t border-[var(--color-ldust)]">
                            <span>Total</span>
                            <span className="font-mono text-xl">₹{total}</span>
                        </div>

                        <button
                            onClick={handleProceed}
                            className="mt-4 block w-full bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] text-center py-3 rounded-sm font-bold transition-colors"
                        >
                            Proceed to Order Request →
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
