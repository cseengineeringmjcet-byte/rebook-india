"use client";

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useDataStore } from '@/store/useDataStore';
import BookCoverImage from '@/components/BookCoverImage';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { waVendor, waBook } from '@/lib/whatsapp';
import { toast } from 'sonner';
import { Heart, MapPin, MessageCircle, Star, Phone, ShieldCheck } from 'lucide-react';

export default function VendorDetail({ params }: { params: Promise<{ id: string }> }) {
    const { books, vendors } = useDataStore();
    const { id } = React.use(params);
    const vendor = vendors.find(v => v.id === id);
    const vendorBooks = books.filter(b => b.vendorId === id);

    const { addItem: addCart } = useCart();
    const { toggle: toggleWishlist, has: hasWishlist } = useWishlist();

    if (!vendor) return notFound();

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-0">

            {/* Vendor Hero */}
            <div className="relative h-[300px] md:h-[400px] w-full">
                <img src={vendor.shopImage} alt={vendor.shopName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-[10px] font-bold uppercase bg-[var(--color-rust)] px-2 py-1 rounded-sm tracking-wider">
                                    {vendor.badge === 'Elite' && '🏆 '} {vendor.badge} Vendor
                                </span>
                                <span className="text-sm font-bold flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-sm border border-white/20">
                                    <Star size={14} fill="currentColor" className="text-[var(--color-amber)]" /> {vendor.rating}
                                </span>
                                <span className="text-sm font-bold flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-sm border border-white/20">
                                    <ShieldCheck size={14} className="text-[var(--color-sage)]" /> Verified
                                </span>
                            </div>
                            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl mb-2">{vendor.shopName}</h1>
                            <p className="text-[var(--color-ldust)] font-bold text-lg">{vendor.speciality}</p>
                        </div>

                        <button
                            onClick={() => window.open(waVendor(vendor), '_blank')}
                            className="bg-[#25D366] text-white hover:bg-[#20bd5a] px-8 py-4 rounded-sm font-bold shadow-lg transition-colors flex items-center justify-center gap-2 text-lg shrink-0"
                        >
                            <MessageCircle size={24} /> Contact Vendor
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Vendor Info Sidebar */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-sm shadow-sm border border-[var(--color-ldust)] text-sm">
                            <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-4 border-b border-[var(--color-ldust)] pb-2">About Shop</h3>
                            <div className="space-y-4 text-[var(--color-dust)]">
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="mt-1 text-[var(--color-ink)]" />
                                    <div>
                                        <strong className="text-[var(--color-ink)] block">Location</strong>
                                        {vendor.area}, Hyderabad
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone size={16} className="mt-1 text-[var(--color-ink)]" />
                                    <div>
                                        <strong className="text-[var(--color-ink)] block">WhatsApp Support</strong>
                                        {vendor.whatsapp}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="font-mono mt-1 text-[var(--color-ink)] font-bold text-center w-4 text-xs">₹</div>
                                    <div>
                                        <strong className="text-[var(--color-ink)] block">Payment Methods</strong>
                                        Cash, UPI at shop
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--color-paper)] p-4 rounded-sm border border-[var(--color-ldust)] text-xs text-[var(--color-dust)]">
                            This vendor sells directly through Rebook India. All books listed are guaranteed at exactly 50% discount from the original MRP.
                        </div>
                    </div>

                    {/* Books List */}
                    <div className="md:col-span-3">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-display font-black text-2xl text-[var(--color-ink)]">Books by {vendor.shopName}</h2>
                            <span className="text-[var(--color-dust)] font-bold">{vendorBooks.length} available</span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {vendorBooks.map(book => (
                                <div key={book.id} className="bg-white group rounded-sm shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
                                    <Link href={`/book/${book.id}`} className="block relative">
                                        <BookCoverImage book={book} />
                                        <div className="absolute top-2 right-2 bg-[var(--color-rust)] text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm">
                                            50% OFF
                                        </div>
                                        <button
                                            onClick={(e) => { e.preventDefault(); toggleWishlist(book.id); toast.success(hasWishlist(book.id) ? "Removed from wishlist" : "Added to wishlist"); }}
                                            className={`absolute top-2 left-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors ${hasWishlist(book.id) ? 'text-red-500' : 'text-[var(--color-dust)] hover:text-red-500'}`}
                                        >
                                            <Heart size={16} fill={hasWishlist(book.id) ? "currentColor" : "none"} />
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
                                                className="flex-1 bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-white py-2 text-xs font-bold rounded-sm transition-colors"
                                            >
                                                Add to Cart
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

                            {vendorBooks.length === 0 && (
                                <div className="col-span-full py-12 text-center text-[var(--color-dust)] border-2 border-dashed border-[var(--color-ldust)] rounded-sm">
                                    This vendor hasn&apos;t listed any books yet.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
