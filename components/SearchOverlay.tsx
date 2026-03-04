"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDataStore } from '@/store/useDataStore';
import BookCoverImage from './BookCoverImage';
import { Search, X } from 'lucide-react';
import { useUI } from '@/store/useUI';

export default function SearchOverlay() {
    const { books } = useDataStore();
    const { searchOpen, closeSearch } = useUI();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<typeof books>([]);

    useEffect(() => {
        if (!searchOpen) {
            setQuery('');
            setResults([]);
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeSearch();
        };
        window.addEventListener('keydown', handleKeyDown);

        // Auto focus might be handled via a ref, but simple approach:
        const t = setTimeout(() => {
            document.getElementById('ri-search-input')?.focus();
        }, 100);

        return () => {
            clearTimeout(t);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [searchOpen, closeSearch]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.length > 1) {
                const lower = query.toLowerCase();
                const filtered = books.filter(b =>
                    b.title.toLowerCase().includes(lower) ||
                    b.author.toLowerCase().includes(lower) ||
                    b.category.toLowerCase().includes(lower)
                );
                setResults(filtered.slice(0, 5)); // show up to 5
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query]);

    if (!searchOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-[var(--color-ink)]/95 flex flex-col items-center pt-24 px-4 backdrop-blur-sm" onClick={closeSearch}>
            <button
                onClick={closeSearch}
                className="absolute top-6 right-6 text-white/60 hover:text-white p-2"
            >
                <X size={32} />
            </button>

            <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={24} />
                    <input
                        id="ri-search-input"
                        type="text"
                        placeholder="Search books, authors..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-sm text-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[var(--color-rust)] focus:bg-white/15 transition-colors"
                        autoComplete="off"
                    />
                </div>

                {results.length > 0 && (
                    <div className="mt-8 space-y-4">
                        {results.map(book => (
                            <Link
                                key={book.id}
                                href={`/book/${book.id}`}
                                onClick={closeSearch}
                                className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-sm transition-colors group"
                            >
                                <div className="w-12 flex-shrink-0">
                                    <BookCoverImage isbn={book.isbn || ''} title={book.title} category={book.category || (book as any).category_id} coverUrl={(book as any).cover_url || (book as any).coverUrl} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-display font-bold group-hover:text-[var(--color-amber)] transition-colors">
                                        {book.title}
                                    </div>
                                    <div className="text-white/60 text-sm">{book.author}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[var(--color-sage)] font-mono font-bold">₹{book.ourPrice}</div>
                                    <div className="text-white/40 text-xs line-through">₹{book.mrp}</div>
                                </div>
                            </Link>
                        ))}
                        <div className="text-center mt-6">
                            <Link href={`/browse?q=${query}`} onClick={closeSearch} className="text-[var(--color-amber)] hover:text-white text-sm font-bold uppercase tracking-widest border-b border-[var(--color-amber)] pb-1">
                                See all results
                            </Link>
                        </div>
                    </div>
                )}

                {query.length > 2 && results.length === 0 && (
                    <div className="mt-12 text-center text-white/60">
                        No books found for "{query}". <br />
                        <Link href="/sell" onClick={closeSearch} className="text-[var(--color-amber)] mt-2 inline-block">Request a book?</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
