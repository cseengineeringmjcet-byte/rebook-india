"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDataStore } from '@/store/useDataStore';
import BookCoverImage from '@/components/BookCoverImage';
import { Heart, SlidersHorizontal, MapPin, MessageCircle, X, Check } from 'lucide-react';
import { useWishlist } from '@/store/useWishlist';
import { useCart } from '@/store/useCart';
import { waBook } from '@/lib/whatsapp';
import { toast } from 'sonner';
import Link from 'next/link';

const CATEGORIES = [
    'engineering', 'medical', 'jee', 'neet', 'upsc', 'bank', 'science',
    'secondary', 'school', 'mba', 'ca', 'law', 'selfhelp', 'fiction', 'regional'
];

const CONDITIONS = ['all', 'like_new', 'good', 'fair', 'acceptable'];

function BrowseContent() {
    const { books, vendors } = useDataStore();
    const searchParams = useSearchParams();

    const initialCat = searchParams.get('cat') || '';
    const initialQ = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQ);
    const [selectedCats, setSelectedCats] = useState<string[]>(initialCat ? [initialCat] : []);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [sort, setSort] = useState('newest');

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const { toggle: toggleWishlist, has: hasWishlist } = useWishlist();
    const { addItem: addCart, hasItem } = useCart();

    // Debounce search update
    useEffect(() => {
        const t = setTimeout(() => {
            // update URL without full page reload
            const params = new URLSearchParams(searchParams.toString());
            if (searchQuery) params.set('q', searchQuery);
            else params.delete('q');
            window.history.replaceState(null, '', `?${params.toString()}`);
        }, 500);
        return () => clearTimeout(t);
    }, [searchQuery, searchParams]);

    // Client-side filtering
    const filtered = books.filter(b => {
        const matchQ = !searchQuery ||
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = selectedCats.length === 0 || selectedCats.includes(b.category);
        const matchCond = selectedConditions.length === 0 || selectedConditions.includes('all') || selectedConditions.includes(b.condition);
        const matchVen = selectedVendors.length === 0 || selectedVendors.includes(b.vendorId);
        const matchPrice = b.ourPrice >= priceRange[0] && b.ourPrice <= priceRange[1];
        return matchQ && matchCat && matchCond && matchVen && matchPrice;
    });

    // Sorting
    filtered.sort((a, b) => {
        if (sort === 'price_asc') return a.ourPrice - b.ourPrice;
        if (sort === 'price_desc') return b.ourPrice - a.ourPrice;
        return 0; // newest default (array order)
    });

    const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
        setList(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    };

    const renderSidebar = () => (
        <div className="space-y-8">
            <div>
                <h4 className="font-display font-bold text-[var(--color-ink)] mb-3">Categories</h4>
                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {CATEGORIES.map(c => (
                        <label key={c} className="flex items-center gap-2 text-sm text-[var(--color-dust)] cursor-pointer hover:text-[var(--color-ink)]">
                            <input
                                type="checkbox"
                                checked={selectedCats.includes(c)}
                                onChange={() => toggleFilter(selectedCats, setSelectedCats, c)}
                                className="rounded-sm border-[var(--color-ldust)] text-[var(--color-rust)] focus:ring-[var(--color-rust)]"
                            />
                            <span className="capitalize">{c.replace('_', ' ')}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-display font-bold text-[var(--color-ink)] mb-3">Condition</h4>
                <div className="space-y-2">
                    {CONDITIONS.map(c => (
                        <label key={c} className="flex items-center gap-2 text-sm text-[var(--color-dust)] cursor-pointer hover:text-[var(--color-ink)]">
                            <input
                                type="radio"
                                name="condition"
                                checked={selectedConditions.includes(c)}
                                onChange={() => {
                                    setSelectedConditions(prev => prev.includes(c) ? [] : [c]);
                                }}
                                onClick={() => {
                                    if (selectedConditions.includes(c)) {
                                        // allow uncheck radio
                                        setSelectedConditions([]);
                                    }
                                }}
                                className="border-[var(--color-ldust)] text-[var(--color-rust)] focus:ring-[var(--color-rust)]"
                            />
                            <span className="capitalize">{c.replace('_', ' ')}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display font-bold text-[var(--color-ink)]">Price Range</h4>
                </div>
                <div className="relative h-2 bg-[var(--color-ldust)] rounded-lg text-center font-bold text-xs text-[var(--color-ink)] pt-1 mb-8">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                </div>
                <div className="relative mt-4">
                    <input
                        type="range" min="0" max="5000" step="50"
                        value={priceRange[0]} onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                        className="absolute w-full h-2 bg-transparent pointer-events-none appearance-none cursor-pointer accent-[var(--color-rust)] dual-slider z-20"
                        style={{ pointerEvents: 'none' }}
                    />
                    <input
                        type="range" min="0" max="5000" step="50"
                        value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                        className="absolute w-full h-2 bg-transparent pointer-events-none appearance-none cursor-pointer accent-[var(--color-rust)] dual-slider z-20"
                        style={{ pointerEvents: 'none' }}
                    />
                    <div className="w-full h-2 bg-[var(--color-ldust)] rounded-lg absolute inset-0 z-0"></div>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .dual-slider::-webkit-slider-thumb { pointer-events: auto; }
                    .dual-slider::-moz-range-thumb { pointer-events: auto; }
                `}} />
            </div>

            <div>
                <h4 className="font-display font-bold text-[var(--color-ink)] mb-3">Vendors</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {vendors.map(v => (
                        <label key={v.id} className="flex items-center gap-2 text-sm text-[var(--color-dust)] cursor-pointer hover:text-[var(--color-ink)]">
                            <input
                                type="checkbox"
                                checked={selectedVendors.includes(v.id)}
                                onChange={() => toggleFilter(selectedVendors, setSelectedVendors, v.id)}
                                className="rounded-sm border-[var(--color-ldust)] text-[var(--color-rust)] focus:ring-[var(--color-rust)]"
                            />
                            <span className="flex-1 truncate">{v.shopName}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* Top Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex-1 relative max-w-xl">
                        <input
                            type="text"
                            placeholder="Search books..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-white border border-[var(--color-ldust)] rounded-sm focus:outline-none focus:border-[var(--color-rust)] shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-[var(--color-dust)] hidden md:inline-block">
                            {filtered.length} books found
                        </span>
                        <select
                            value={sort} onChange={e => setSort(e.target.value)}
                            className="bg-white border border-[var(--color-ldust)] rounded-sm px-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--color-rust)] shadow-sm text-[var(--color-ink)]"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price Low to High</option>
                            <option value="price_desc">Price High to Low</option>
                        </select>
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="md:hidden bg-[var(--color-ink)] text-white p-3 rounded-sm shadow-sm"
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex items-start gap-8">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block w-64 shrink-0 bg-white p-6 shadow-sm border border-[var(--color-ldust)] rounded-sm sticky top-24">
                        <h3 className="font-display font-black text-xl text-[var(--color-ink)] mb-6 flex items-center gap-2 border-b border-[var(--color-ldust)] pb-4">
                            <SlidersHorizontal size={20} />
                            Filters
                        </h3>
                        {renderSidebar()}
                    </div>

                    {/* Grid */}
                    <div className="flex-1">
                        {filtered.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-sm border border-[var(--color-ldust)] shadow-sm">
                                <div className="text-4xl mb-4">📚</div>
                                <h3 className="font-display font-bold text-xl text-[var(--color-ink)]">No books match your filters</h3>
                                <p className="text-[var(--color-dust)] mt-2 mb-6">Try relaxing your search or category filters.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery(''); setSelectedCats([]); setSelectedConditions([]); setSelectedVendors([]); setPriceRange([0, 5000]);
                                    }}
                                    className="bg-[var(--color-ink)] text-white hover:bg-[var(--color-rust)] px-6 py-2 rounded-sm font-bold transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {filtered.map(book => (
                                    <div key={book.id} className="bg-white group rounded-sm shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
                                        <Link href={`/book/${book.id}`} className="block relative">
                                            <BookCoverImage book={book} />
                                            <div className="absolute top-2 right-2 bg-[var(--color-rust)] text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm">
                                                50% OFF
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                                                <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-sm">
                                                    {book.condition.replace('_', ' ')}
                                                </span>
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

                                            <div className="mb-3">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-mono text-lg font-bold text-[var(--color-sage)]">₹{book.ourPrice}</span>
                                                    <span className="font-mono text-xs line-through text-[var(--color-dust)]">₹{book.mrp}</span>
                                                </div>
                                                <div className="text-[11px] font-bold text-[var(--color-rust)] bg-[var(--color-rust)]/10 inline-block px-1.5 py-0.5 rounded-sm mt-1">
                                                    Save ₹{book.savings}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 text-[9px] text-[var(--color-dust)] mb-4">
                                                <MapPin size={10} />
                                                <span className="truncate">{book.vendorName}, {book.area}</span>
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!hasItem(book.id)) {
                                                            addCart(book);
                                                            toast.success(`Added to cart: ${book.title}`);
                                                        }
                                                    }}
                                                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-sm transition-colors ${hasItem(book.id) ? 'bg-[var(--color-sage)] text-white' : 'bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-white'}`}
                                                >
                                                    {hasItem(book.id) ? <><Check size={14} /> In Cart</> : 'Add to Cart'}
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
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Bottom Sheet */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="relative bg-[var(--color-cream)] w-full max-h-[85vh] overflow-y-auto rounded-t-xl p-6 shadow-2xl animate-in slide-in-from-bottom pb-20">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--color-ldust)] pb-4">
                            <h3 className="font-display font-black text-xl text-[var(--color-ink)] flex items-center gap-2">
                                <SlidersHorizontal size={20} />
                                Filters
                            </h3>
                            <button onClick={() => setMobileFiltersOpen(false)} className="text-[var(--color-dust)] p-2">
                                <X size={24} />
                            </button>
                        </div>
                        {renderSidebar()}
                        <div className="mt-8 sticky bottom-0 bg-[var(--color-cream)] pt-4 pb-4">
                            <button
                                onClick={() => setMobileFiltersOpen(false)}
                                className="w-full bg-[var(--color-ink)] text-white py-4 rounded-sm font-bold shadow-lg"
                            >
                                Show {filtered.length} Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BrowsePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--color-cream)] p-20 text-center font-bold">Loading...</div>}>
            <BrowseContent />
        </Suspense>
    )
}
