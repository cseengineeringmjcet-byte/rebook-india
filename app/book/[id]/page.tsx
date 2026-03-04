"use client";

import React from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useDataStore } from '@/store/useDataStore';
import { useState } from 'react';
import BookCoverImage from '@/components/BookCoverImage';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { waBook, waVendor } from '@/lib/whatsapp';
import { useAuth } from '@/store/useAuth';
import { toast } from 'sonner';
import { ShoppingCart, Heart, MessageCircle, Star, MapPin, Package, Check, ChevronRight, ChevronDown } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

export default function BookDetail({ params }: { params: Promise<{ id: string }> }) {
    const { books, vendors, isLoaded } = useDataStore();
    const { id } = React.use(params);
    const book = books.find(b => b.id === id);
    const { addItem, hasItem } = useCart();
    const { toggle: toggleWishlist, has: hasWishlist } = useWishlist();
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const [accordionOpen, setAccordionOpen] = useState(false);

    if (!isLoaded) return <div className="min-h-[50vh] flex items-center justify-center">Loading book details...</div>;
    if (!book) return notFound();

    const vendor = vendors.find(v => v.id === book.vendorId);
    const similarBooks = books.filter(b => b.category === book.category && b.id !== book.id).slice(0, 4);

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-12">
            <div className="max-w-6xl mx-auto px-4">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-8">
                    <Link href="/" className="hover:text-[var(--color-rust)]">Home</Link>
                    <ChevronRight size={12} />
                    <Link href={`/browse?cat=${book.category}`} className="hover:text-[var(--color-rust)]">{book.category?.replace('_', ' ')}</Link>
                    <ChevronRight size={12} />
                    <span className="text-[var(--color-ink)] truncate max-w-[200px] inline-block">{book.title}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* Left: Image */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="sticky top-24">
                            <BookCoverImage isbn={book.isbn || ''} title={book.title} category={book.category || (book as any).category_id} coverUrl={(book as any).cover_url || (book as any).coverUrl} className="w-full max-w-[300px] mx-auto md:max-w-full shadow-2xl rounded-sm group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]" />
                            <div className="mt-4 flex gap-2 justify-center hidden md:flex">
                                <button
                                    onClick={() => { toggleWishlist(book.id); toast.success("Wishlist updated"); }}
                                    className="flex items-center gap-2 text-sm font-bold text-[var(--color-dust)] hover:text-red-500 transition-colors"
                                >
                                    <Heart size={16} fill={hasWishlist(book.id) ? "currentColor" : "none"} className={hasWishlist(book.id) ? "text-red-500" : ""} />
                                    {hasWishlist(book.id) ? 'Saved' : 'Save to Wishlist'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="md:col-span-8 lg:col-span-6 space-y-6">
                        <div>
                            <span className="inline-block bg-[var(--color-ink)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm mb-3">
                                Condition: {book.condition?.replace('_', ' ')}
                            </span>
                            <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] leading-tight mb-2">
                                {book.title}
                            </h1>
                            <p className="text-lg text-[var(--color-dust)]">{book.author}</p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-dust)] mt-4 divide-x divide-[var(--color-ldust)]">
                                <span className="pr-4">ISBN: {book.isbn}</span>
                                <span className="px-4">Publisher cover matched</span>
                                <span className="pl-4 text-[var(--color-sage)] font-bold flex items-center gap-1">
                                    <Check size={14} /> In Stock
                                </span>
                            </div>
                        </div>

                        {/* Price Block */}
                        <div className="bg-white border border-[var(--color-ldust)] p-6 rounded-sm shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-[var(--color-rust)] text-white font-bold text-xs uppercase tracking-widest px-4 py-1 rounded-bl-lg">
                                50% OFF MRP
                            </div>
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-4xl md:text-5xl font-mono font-black text-[var(--color-sage)]">₹{book.ourPrice}</span>
                                <span className="text-lg font-mono text-[var(--color-dust)] line-through pb-1">₹{book.mrp}</span>
                            </div>
                            <div className="text-[var(--color-rust)] font-bold mb-4">You save exactly ₹{book.savings}</div>

                            <div className="text-xs text-[var(--color-dust)] group mt-4">
                                <button
                                    onClick={() => setAccordionOpen(!accordionOpen)}
                                    className="cursor-pointer hover:text-[var(--color-ink)] font-bold flex items-center gap-1 w-full text-left"
                                >
                                    <span className="w-4 h-4 rounded-full bg-[var(--color-paper)] flex items-center justify-center transition-transform duration-300" style={{ transform: accordionOpen ? 'rotate(180deg)' : 'none' }}>
                                        <ChevronDown size={12} />
                                    </span>
                                    Where does this money go?
                                </button>
                                <div
                                    className={`mt-3 pl-4 border-l-2 border-[var(--color-ldust)] space-y-2 bg-[var(--color-paper)] pr-4 rounded-r-sm transition-all duration-300 overflow-hidden ${accordionOpen ? 'max-h-48 py-2 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
                                >
                                    <div className="flex justify-between"><span>Vendor earns (80%):</span> <span className="font-mono font-bold">₹{book.vendorEarn}</span></div>
                                    <div className="flex justify-between"><span>Rebook earns (20%):</span> <span className="font-mono font-bold">₹{book.riEarn}</span></div>
                                    <div className="pt-2 italic border-t border-[var(--color-ldust)] opacity-80">&quot;We are honest about every rupee.&quot;</div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                            <button
                                onClick={async () => {
                                    if (!isLoggedIn || !user) {
                                        toast.error("Please login to continue");
                                        router.push('/auth');
                                        return;
                                    }
                                    try {
                                        toast.loading("Preparing checkout...");

                                        // Ensure it isn't completely duplicated 
                                        const snap = await getDocs(query(collection(db, "cart"), where("user_id", "==", user.uid), where("book_id", "==", book.id)));
                                        if (snap.empty) {
                                            await addDoc(collection(db, "cart"), {
                                                book_id: book.id,
                                                user_id: user.uid,
                                                added_at: serverTimestamp()
                                            });
                                        }

                                        toast.dismiss();
                                        router.push('/checkout');
                                    } catch (err) {
                                        toast.dismiss();
                                        toast.error("Failed to process cart.");
                                    }
                                }}
                                className="flex items-center justify-center bg-[var(--color-rust)] text-white hover:bg-[#A93C23] py-4 rounded-sm font-bold shadow-md transition-colors text-lg w-full"
                            >
                                Place Order Request
                            </button>
                            <button
                                onClick={async () => {
                                    if (!isLoggedIn || !user) {
                                        toast.error("Please login to add to cart");
                                        router.push('/auth');
                                        return;
                                    }
                                    if (!hasItem(book.id)) {
                                        try {
                                            toast.loading("Adding...");

                                            // Ensure it isn't completely duplicated 
                                            const snap = await getDocs(query(collection(db, "cart"), where("user_id", "==", user.uid), where("book_id", "==", book.id)));
                                            if (snap.empty) {
                                                await addDoc(collection(db, "cart"), {
                                                    book_id: book.id,
                                                    user_id: user.uid,
                                                    added_at: serverTimestamp()
                                                });
                                                addItem(book); // Update local UI instantly
                                            }

                                            toast.dismiss();
                                            toast.success("Added to cart");
                                        } catch (err) {
                                            toast.dismiss();
                                            toast.error("Failed to add to cart.");
                                        }
                                    }
                                }}
                                className={`flex items-center justify-center gap-2 py-4 rounded-sm font-bold shadow-md transition-colors text-lg w-full ${hasItem(book.id) ? 'bg-[var(--color-sage)] text-white' : 'bg-[var(--color-ink)] text-white hover:bg-black'}`}
                            >
                                {hasItem(book.id) ? <><Check size={20} /> In Cart</> : <><ShoppingCart size={20} /> Add to Cart</>}
                            </button>
                        </div>
                        <button
                            onClick={() => window.open(waBook(book), '_blank')}
                            className="w-full flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#128c7e] hover:bg-[#25D366] hover:text-white py-3 rounded-sm font-bold transition-colors"
                        >
                            <MessageCircle size={20} /> Enquire via WhatsApp
                        </button>

                        <div className="flex items-start gap-4 p-4 bg-[var(--color-paper)] border border-[var(--color-ldust)] rounded-sm mt-8">
                            <Package className="text-[var(--color-dust)] mt-1" size={24} />
                            <div>
                                <h4 className="font-bold text-[var(--color-ink)] text-sm mb-1">How collection works</h4>
                                <p className="text-xs text-[var(--color-dust)] leading-relaxed">Place order request online &rarr; Admin confirms availability &rarr; Pay cash/UPI directly at the vendor&apos;s shop during pickup, or upon delivery. No payment on website.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar: Vendor */}
                    <div className="md:col-span-12 lg:col-span-3">
                        <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-4">Sold By</h3>
                        {vendor && (
                            <div className="bg-white border border-[var(--color-ldust)] rounded-sm shadow-sm overflow-hidden sticky top-24">
                                <div className="h-[100px] relative">
                                    <img src={vendor.shopImage} alt={vendor.shopName} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                                        <span className="text-white text-[10px] font-bold uppercase bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-sm border border-white/20">
                                            {vendor.badge}
                                        </span>
                                        <span className="text-white text-xs font-bold flex items-center gap-1">
                                            <Star size={12} fill="currentColor" className="text-[var(--color-amber)]" /> {vendor.rating}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <Link href={`/vendor/${vendor.id}`} className="font-display font-bold text-[var(--color-ink)] hover:text-[var(--color-rust)] block mb-2">{vendor.shopName}</Link>
                                    <div className="flex items-center gap-1 text-xs text-[var(--color-dust)] mb-4">
                                        <MapPin size={12} /> {vendor.area}
                                    </div>
                                    <button
                                        onClick={() => window.open(waVendor(vendor), '_blank')}
                                        className="w-full bg-[#25D366]/10 text-[#128c7e] hover:bg-[#25D366] hover:text-white py-2 rounded-sm font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <MessageCircle size={14} /> Contact Vendor
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Similar Books */}
                {similarBooks.length > 0 && (
                    <div className="mt-20 pt-10 border-t border-[var(--color-ldust)]">
                        <h2 className="font-display font-black text-2xl text-[var(--color-ink)] mb-6">More in {book.category?.replace('_', ' ')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {similarBooks.map(b => (
                                <Link href={`/book/${b.id}`} key={b.id} className="bg-white group rounded-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1 border border-[var(--color-ldust)]">
                                    <BookCoverImage isbn={b.isbn || ''} title={b.title} category={b.category || (b as any).category_id} coverUrl={(b as any).cover_url || (b as any).coverUrl} />
                                    <div className="p-3">
                                        <h3 className="font-display font-bold text-xs text-[var(--color-ink)] line-clamp-1 mb-1 group-hover:text-[var(--color-rust)]">{b.title}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-mono text-sm font-bold text-[var(--color-sage)]">₹{b.ourPrice}</span>
                                            <span className="font-mono text-[10px] line-through text-[var(--color-dust)]">₹{b.mrp}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
