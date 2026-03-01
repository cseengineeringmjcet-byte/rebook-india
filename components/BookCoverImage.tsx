"use client";

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Book } from '@/lib/data/books';

interface BookCoverImageProps {
    book: Book | { title: string; isbn: string; category: string };
    className?: string;
    style?: React.CSSProperties;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
    engineering: 'linear-gradient(135deg, #1a3a6e, #2d6abf)',
    medical: 'linear-gradient(135deg, #0d5c3c, #1a8f5e)',
    jee: 'linear-gradient(135deg, #6b1a1a, #c0392b)',
    upsc: 'linear-gradient(135deg, #2c1a6e, #6c3fb5)',
    selfhelp: 'linear-gradient(135deg, #C94A2D, #E8A020)',
    fiction: 'linear-gradient(135deg, #1A1208, #8B7355)',
    school: 'linear-gradient(135deg, #4A7C59, #2d5c3e)',
    default: 'linear-gradient(135deg, #8B7355, #C94A2D)',
};

const VERIFIED_GOOGLE_IDS: Record<string, string> = {
    '9788174091956': 'SY9OAQAAIAAJ',
    '9780262033848': 'BgpZzgEACAAJ',
    '9781119800361': 'P9WBEAAAQBAJ',
    '9788126554232': 'LF4_AQAAQBAJ',
    '9780133918922': 'COKRAQAAQBAJ',
    '9780078022159': 'qbAlMQEACAAJ',
    '9780132126953': 'o3l_QgAACAAJ',
    '9780199476299': 'y9MZAQAAIAAJ',
    '9788177091878': 'f9ZOAQAAIAAJ',
    '9788177092080': 'xpSDAQAAIAAJ',
    '9789313191797': 'GqpbzgEACAAJ',
    '9780702052309': 'UbyzswEACAAJ',
    '9788123924854': 'bdRkzgEACAAJ',
    '9780323597128': 'MWKItAEACAAJ',
    '9780323353175': 'qgBOjgEACAAJ',
    '9781259644030': 'oYFGzgEACAAJ',
    '9789352704996': 'a7J6zQEACAAJ',
    '9781138295773': '3xVKDgAAQBAJ',
    '9789353168933': 'AHkYzQEACAAJ',
    '9780143031345': 'MvKlAAAACAAJ',
    '9780195668452': 'ZSBGAQAAIAAJ',
    '9789352535057': 'dJ5lzQEACAAJ',
    '9781847941831': 'XfFvDwAAQBAJ',
    '8173711461': 'E4p2CwAAQBAJ',
    '9780062315007': 'FP_PAgAAQBAJ',
    '9780804139021': 'ZoOKCgAAQBAJ',
    '9788190804547': 'LB5bngEACAAJ',
};

export default function BookCoverImage({ book, className, style }: BookCoverImageProps) {
    const [tier, setTier] = useState<1 | 2 | 3 | 4>(1);
    const [loading, setLoading] = useState(true);

    // Determine current image URL based on tier
    let src = '';
    if (tier === 1) {
        const googleId = VERIFIED_GOOGLE_IDS[book.isbn];
        if (googleId) {
            src = `https://books.google.com/books/content?id=${googleId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
        } else {
            // Fallback immediately if no verified ID
            src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
        }
    } else if (tier === 2) {
        src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
    } else if (tier === 3) {
        src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
    }

    const handleError = () => {
        if (tier < 4) {
            setTier((t) => (t + 1) as 1 | 2 | 3 | 4);
        }
    };

    const gradient = CATEGORY_GRADIENTS[book.category] || CATEGORY_GRADIENTS.default;

    return (
        <div
            className={clsx('relative overflow-hidden bg-[var(--color-paper)] shadow-md rounded-sm', className)}
            style={{ aspectRatio: '0.72', ...style }}
        >
            {/* Loading Skeleton */}
            {loading && tier < 4 && (
                <div className="absolute inset-0 bg-black/5 animate-pulse" />
            )}

            {/* Tier 4 Fallback (CSS Gradient) */}
            {(tier === 4 || (tier === 1 && !src)) && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white"
                    style={{ background: gradient }}
                >
                    <div className="text-4xl mb-2 shadow-sm">📚</div>
                    <div className="font-display font-bold text-sm leading-tight line-clamp-4 drop-shadow-md">
                        {book.title}
                    </div>
                </div>
            )}

            {/* Image layers for Tier 1-3 */}
            {tier < 4 && src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={book.title}
                    className={clsx(
                        'absolute inset-0 w-full h-full object-cover origin-center transition-opacity duration-300',
                        loading ? 'opacity-0' : 'opacity-100'
                    )}
                    onLoad={() => setLoading(false)}
                    onError={handleError}
                    crossOrigin="anonymous"
                />
            )}
        </div>
    );
}
