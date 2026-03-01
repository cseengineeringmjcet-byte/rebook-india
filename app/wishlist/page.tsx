"use client";

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/store/useWishlist';
import { useCart } from '@/store/useCart';
import { useDataStore } from '@/store/useDataStore';
import BookCoverImage from '@/components/BookCoverImage';
import { Heart, Trash2, ShoppingCart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { waBook } from '@/lib/whatsapp';

export default function WishlistPage() {
    const { books } = useDataStore();
    const { ids: wishlistIds, count, toggle: toggleWishlist } = useWishlist();
    const { addItem: addCart } = useCart();

    const wishlistBooks = books.filter(b => wishlistIds.includes(b.id));

    if (count === 0) {
        return (
            <div className="bg-[var(--color-cream)] min-h-screen py-20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-red-50 text-red-400 mx-auto mb-6">
                        <Heart size={40} className="fill-current" />
                    </div>
                    <h1 className="font-display font-black text-3xl md:text-4xl text-[var(--color-ink)] mb-4">Your Wishlist is empty</h1>
                    <p className="text-[var(--color-dust)] mb-8">Save books you'd like to buy later. They'll wait right here.</p>
                    <Link href="/browse" className="bg-[var(--color-rust)] hover:bg-[#A93C23] text-white px-8 py-4 rounded-sm font-bold shadow-md transition-colors inline-block">
                        Find Books You'll Love
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-16">
            <div className="max-w-7xl mx-auto px-4">

                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-red-500 fill-current" size={32} />
                    <h1 className="font-display font-black text-3xl md:text-4xl text-[var(--color-ink)]">Your Wishlist ({count})</h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {wishlistBooks.map(book => (
                        <div key={book.id} className="bg-white group rounded-sm shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
                            <Link href={`/book/${book.id}`} className="block relative">
                                <BookCoverImage book={book} />
                                <div className="absolute top-2 right-2 bg-[var(--color-rust)] text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm">
                                    50% OFF
                                </div>
                                <button
                                    onClick={(e) => { e.preventDefault(); toggleWishlist(book.id); toast.info("Removed from wishlist"); }}
                                    className="absolute top-2 left-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-red-500 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </Link>
                            <div className="p-4 flex-1 flex flex-col">
                                <Link href={`/book/${book.id}`} className="font-display font-bold text-sm text-[var(--color-ink)] line-clamp-2 leading-snug mb-1 hover:text-[var(--color-rust)] transition-colors">
                                    {book.title}
                                </Link>
                                <p className="text-[10px] text-[var(--color-dust)] uppercase mb-3 flex-1">{book.author}</p>

                                <div className="mb-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-mono text-lg font-bold text-[var(--color-sage)]">₹{book.ourPrice}</span>
                                        <span className="font-mono text-xs line-through text-[var(--color-dust)]">₹{book.mrp}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={(e) => { e.preventDefault(); addCart(book); toast.success(`Added to cart: ${book.title}`); }}
                                        className="flex-1 bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-white py-2 text-xs font-bold rounded-sm transition-colors flex items-center justify-center gap-1"
                                    >
                                        <ShoppingCart size={14} /> Add to Cart
                                    </button>
                                    <a
                                        href={waBook(book)}
                                        target="_blank" rel="noopener noreferrer"
                                        className="w-8 flex items-center justify-center bg-[#25D366]/10 text-[#25D366] rounded-sm hover:bg-[#25D366] hover:text-white transition-colors"
                                    >
                                        <MessageCircle size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
