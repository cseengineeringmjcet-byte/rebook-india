"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVendorById } from "@/lib/firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import BookCoverImage from "@/components/BookCoverImage";
import { useCart } from "@/store/useCart";
import { useWishlist } from "@/store/useWishlist";
import { toast } from "sonner";
import {
    Heart,
    MapPin,
    MessageCircle,
    Star,
    Phone,
    ShieldCheck,
    Calendar,
} from "lucide-react";

function waVendor(vendor: any) {
    return `https://wa.me/916301038443`;
}

function waBook(vendor: any, book: any) {
    const text = `Hi ${vendor.shop_name || "Vendor"}, I'm interested in buying:
*${book.title}*
Price: ₹${book.our_price || book.ourPrice}
Is it available?`;
    return `https://wa.me/916301038443?text=${encodeURIComponent(text)}`;
}

export default function VendorDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);
    const [vendor, setVendor] = useState<any>(null);
    const [vendorBooks, setVendorBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { addItem: addCart } = useCart();
    const { toggle: toggleWishlist, has: hasWishlist } = useWishlist();

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Load Vendor
                const vData = await getVendorById(id) as any;
                if (!vData) {
                    setLoading(false);
                    return;
                }
                setVendor(vData);

                // Load Books from Firestore where vendor_id === id
                let booksSnap = await getDocs(
                    query(collection(db, "books"), where("vendor_id", "==", id))
                );
                let fetchedBooks = booksSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Try vendorId if empty
                if (fetchedBooks.length === 0) {
                    booksSnap = await getDocs(
                        query(collection(db, "books"), where("vendorId", "==", id))
                    );
                    fetchedBooks = booksSnap.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                }

                // If STILL empty, it might be due to mismatched auto-IDs. Query by shop name!
                if (fetchedBooks.length === 0 && vData.shop_name) {
                    booksSnap = await getDocs(
                        query(collection(db, "books"), where("vendor_name", "==", vData.shop_name))
                    );
                    fetchedBooks = booksSnap.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                }

                if (fetchedBooks.length === 0 && vData.shop_name) {
                    booksSnap = await getDocs(
                        query(collection(db, "books"), where("vendorName", "==", vData.shop_name))
                    );
                    fetchedBooks = booksSnap.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                }

                setVendorBooks(fetchedBooks);
            } catch (err) {
                console.error("Failed to load vendor details:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-rust)] border-t-transparent"></div>
                <p className="font-bold text-[var(--color-dust)] text-lg animate-pulse">
                    Loading vendor...
                </p>
            </div>
        );
    }

    if (!vendor) return notFound();

    const fallbackImage = "/category-covers/default.png";
    const shopImageBg = vendor.shop_image || vendor.shopImage || fallbackImage;

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-0">
            {/* Vendor Hero */}
            <div className="relative h-[280px] md:h-[450px] w-full bg-[var(--color-ink)]">
                <img
                    src={shopImageBg}
                    alt={vendor.shop_name}
                    className="w-full h-full object-cover opacity-60"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImage;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {vendor.badge && (
                                    <span className="text-[10px] font-bold uppercase bg-[var(--color-rust)] px-3 py-1.5 rounded-sm tracking-wider shadow-sm">
                                        {vendor.badge === "Elite" && "🏆 "} {vendor.badge} Vendor
                                    </span>
                                )}
                                <span className="text-sm font-bold flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/20">
                                    <Star
                                        size={14}
                                        fill="currentColor"
                                        className="text-[var(--color-amber)]"
                                    />{" "}
                                    {vendor.rating || "N/A"}
                                </span>
                                {(vendor.is_verified || vendor.isVerified) && (
                                    <span className="text-sm font-bold flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/20">
                                        <ShieldCheck size={14} className="text-[var(--color-sage)]" />{" "}
                                        Verified
                                    </span>
                                )}
                            </div>
                            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl mb-2 drop-shadow-lg">
                                {vendor.shop_name}
                            </h1>
                            <p className="text-[var(--color-ldust)] font-bold text-lg md:text-xl flex items-center gap-2">
                                <MapPin size={20} className="text-[var(--color-rust)]" />
                                {vendor.area}
                            </p>
                        </div>

                        <button
                            onClick={() => window.open(waVendor(vendor), "_blank")}
                            className="bg-[#25D366] text-white hover:bg-[#20bd5a] px-8 py-4 rounded-sm font-bold shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-3 text-lg shrink-0"
                        >
                            <MessageCircle size={24} /> Contact Vendor
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Vendor Info Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-sm shadow-sm border border-[var(--color-ldust)] text-sm">
                            <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-4 border-b border-[var(--color-ldust)] pb-2 flex items-center gap-2">
                                <span>Shop Details</span>
                            </h3>
                            <div className="space-y-5 text-[var(--color-dust)]">
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-[var(--color-ink)] shrink-0" />
                                    <div>
                                        <strong className="text-[var(--color-ink)] block mb-1">
                                            Location
                                        </strong>
                                        {vendor.area}, Hyderabad
                                    </div>
                                </div>
                                {vendor.established && (
                                    <div className="flex items-start gap-3">
                                        <Calendar
                                            size={18}
                                            className="text-[var(--color-ink)] shrink-0"
                                        />
                                        <div>
                                            <strong className="text-[var(--color-ink)] block mb-1">
                                                Since
                                            </strong>
                                            Est. {vendor.established}
                                        </div>
                                    </div>
                                )}
                                {vendor.total_books !== undefined && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--color-ink)] font-black text-lg w-[18px] text-center shrink-0 leading-none">
                                            B
                                        </span>
                                        <div>
                                            <strong className="text-[var(--color-ink)] block mb-1">
                                                Total Books
                                            </strong>
                                            {vendor.total_books} listed
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <Phone size={18} className="text-[var(--color-ink)] shrink-0" />
                                    <div>
                                        <strong className="text-[var(--color-ink)] block mb-1">
                                            WhatsApp Support
                                        </strong>
                                        +{vendor.whatsapp}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--color-paper)] p-5 rounded-sm border border-[var(--color-ldust)] text-xs text-[var(--color-ink)] leading-relaxed shadow-inner">
                            <strong className="block text-[var(--color-rust)] text-sm mb-2">
                                Why buy from this vendor?
                            </strong>
                            This vendor sells directly through the Rebook India platform. Every
                            used book is guaranteed at exactly <strong>50% off MRP</strong> with
                            no hidden charges.
                        </div>
                    </div>

                    {/* Books List Grid */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-ldust)]">
                            <h2 className="font-display font-black text-3xl text-[var(--color-ink)]">
                                Available Books
                            </h2>
                            <span className="bg-[var(--color-rust)] text-white text-xs font-bold px-3 py-1 rounded-sm shadow-sm">
                                {vendorBooks.length} Books
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {vendorBooks.map((book) => {
                                const bookPhoto = book.photo_url || book.cover_url || book.coverUrl;
                                const bookPrice = book.our_price || book.ourPrice;

                                return (
                                    <div
                                        key={book.id}
                                        className="bg-white group rounded-sm shadow-sm border border-[var(--color-ldust)] hover:border-[var(--color-rust)] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
                                    >
                                        <Link
                                            href={`/book/${book.id}`}
                                            className="block relative aspect-[2/3] overflow-hidden"
                                        >
                                            <BookCoverImage
                                                isbn={book.isbn || ""}
                                                title={book.title}
                                                category={
                                                    book.category || book.category_id || "default"
                                                }
                                                coverUrl={bookPhoto}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 right-2 bg-[var(--color-rust)] text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-md">
                                                50% OFF
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleWishlist(book.id);
                                                    toast.success(
                                                        hasWishlist(book.id)
                                                            ? "Removed from wishlist"
                                                            : "Added to wishlist"
                                                    );
                                                }}
                                                className={`absolute top-2 left-2 p-2 rounded-full shadow-md backdrop-blur-md transition-colors ${hasWishlist(book.id)
                                                    ? "bg-red-50 text-red-500"
                                                    : "bg-white/80 text-[var(--color-dust)] hover:text-red-500 hover:bg-white"
                                                    }`}
                                            >
                                                <Heart
                                                    size={16}
                                                    fill={hasWishlist(book.id) ? "currentColor" : "none"}
                                                />
                                            </button>
                                        </Link>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <Link
                                                href={`/book/${book.id}`}
                                                className="font-display font-bold text-sm md:text-base text-[var(--color-ink)] line-clamp-2 leading-snug mb-1 group-hover:text-[var(--color-rust)] transition-colors"
                                            >
                                                {book.title}
                                            </Link>
                                            <p className="text-[10px] md:text-xs text-[var(--color-dust)] uppercase tracking-wide mb-3 flex-1 line-clamp-1">
                                                {book.author}
                                            </p>

                                            <div className="mb-4">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-mono text-lg font-black text-[var(--color-sage)]">
                                                        ₹{bookPrice}
                                                    </span>
                                                    <span className="font-mono text-xs line-through text-[var(--color-dust)]">
                                                        ₹{book.mrp}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addCart(book);
                                                        toast.success(`Added ${book.title} to cart`);
                                                    }}
                                                    className="flex-1 bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-white py-2.5 text-xs font-bold rounded-sm transition-colors shadow-sm"
                                                >
                                                    Add to Cart
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(waBook(vendor, book), "_blank");
                                                    }}
                                                    className="w-10 flex flex-shrink-0 items-center justify-center bg-[#25D366]/10 text-[#25D366] rounded-sm hover:bg-[#25D366] hover:text-white transition-colors"
                                                    title="Ask Vendor via WhatsApp"
                                                >
                                                    <MessageCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {vendorBooks.length === 0 && (
                                <div className="col-span-full py-16 text-center text-[var(--color-dust)] border-2 border-dashed border-[var(--color-ldust)] rounded-sm flex flex-col items-center justify-center">
                                    <span className="text-4xl mb-3 opacity-50 block">📚</span>
                                    <p className="text-lg font-bold">No books available yet</p>
                                    <p className="text-sm max-w-sm mt-1">
                                        This vendor hasn't listed any books for sale on the platform
                                        at the moment. Check back later!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
