'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import { Heart, SlidersHorizontal, MessageCircle, X, Check, Search } from 'lucide-react'
import { useWishlist } from '@/store/useWishlist'
import { useCart } from '@/store/useCart'
import { toast } from 'sonner'

// ── Firebase ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: 'AIzaSyDAwlYwWmuBEUxS9p-jxp_9KgVAE79fepI',
    authDomain: 'rebookindia-29be8.firebaseapp.com',
    projectId: 'rebookindia-29be8',
    storageBucket: 'rebookindia-29be8.firebasestorage.app',
    messagingSenderId: '1014316461662',
    appId: '1:1014316461662:web:5c5b3037f031d50cabcecf',
}
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
    { value: '', label: 'All Categories' },
    { value: 'engineering', label: 'B.Tech Engineering' },
    { value: 'medical', label: 'MBBS Medical' },
    { value: 'jee', label: 'JEE Mains & Advanced' },
    { value: 'neet', label: 'NEET UG' },
    { value: 'upsc', label: 'UPSC Civil Services' },
    { value: 'bank', label: 'Bank PO & SSC' },
    { value: 'science', label: 'Class 11-12 Science' },
    { value: 'secondary', label: 'Class 9-10 CBSE' },
    { value: 'school', label: 'Class 1-8 School' },
    { value: 'mba', label: 'MBA & CAT' },
    { value: 'ca', label: 'CA & CMA' },
    { value: 'law', label: 'Law & CLAT' },
    { value: 'selfhelp', label: 'Self-Help & Business' },
    { value: 'fiction', label: 'Fiction & Literature' },
    { value: 'regional', label: 'Telugu & Regional' },
]

const CONDITION_OPTIONS = [
    { value: '', label: 'Any Condition' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'acceptable', label: 'Acceptable' },
]

const SORT_OPTIONS = [
    { value: 'latest', label: 'Latest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
]

// ── Gradients ─────────────────────────────────────────────────────────────────
const GRADIENTS: Record<string, [string, string, string]> = {
    engineering: ['#1a3a6e', '#2d6abf', '⚙️'],
    medical: ['#0d5c3c', '#1a8f5e', '🏥'],
    jee: ['#6b1a1a', '#c0392b', '⚡'],
    neet: ['#4a0d6b', '#8e44ad', '🔬'],
    upsc: ['#2c1a6e', '#6c3fb5', '🏛️'],
    bank: ['#1a4a6e', '#2980b9', '🏦'],
    science: ['#0d4a5c', '#16a085', '🧪'],
    secondary: ['#4a3000', '#e67e22', '📖'],
    school: ['#2d5c3e', '#4A7C59', '🎒'],
    mba: ['#2c3e50', '#34495e', '💼'],
    ca: ['#1a3a2c', '#2e7d5e', '📊'],
    law: ['#3a1a0d', '#8B4513', '⚖️'],
    selfhelp: ['#7d2d00', '#C94A2D', '💡'],
    fiction: ['#1a1208', '#8B7355', '📝'],
    regional: ['#4a1a6e', '#9b59b6', '🌸'],
    default: ['#8B7355', '#C94A2D', '📚'],
}

// ── AI category cover images (generated, served from /public/category-covers/)
const AI_COVERS: Record<string, string> = {
    engineering: '/category-covers/engineering.png',
    medical: '/category-covers/medical.png',
    jee: '/category-covers/jee.png',
    neet: '/category-covers/neet.png',
    upsc: '/category-covers/upsc.png',
    bank: '/category-covers/bank.png',
    science: '/category-covers/science.png',
    secondary: '/category-covers/secondary.png',
    school: '/category-covers/school.png',
    mba: '/category-covers/mba.png',
    ca: '/category-covers/ca.png',
    law: '/category-covers/law.png',
    selfhelp: '/category-covers/selfhelp.png',
    fiction: '/category-covers/fiction.png',
    regional: '/category-covers/regional.png',
    default: '/category-covers/default.png',
}

// ── Book Cover with 4-priority fallback ───────────────────────────────────────
function BookCover({ book }: { book: any }) {
    const catKey = book.category_id ?? book.category ?? 'default'
    const [c1, c2, emoji] = GRADIENTS[catKey] ?? GRADIENTS.default
    const aiCover = AI_COVERS[catKey] ?? AI_COVERS.default

    // Priority 1: Firebase Storage photo_url (student uploaded) — NEVER overridden
    // Priority 2: Open Library ISBN cover
    // Priority 3: AI-generated category image ← NEW
    // Priority 4: Gradient with emoji (absolute last resort)

    const buildUrls = () => {
        const list: string[] = []
        if (book.photo_url?.startsWith('https://firebasestorage.googleapis.com')) {
            list.push(book.photo_url)
        }
        if (book.isbn) {
            list.push(`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`)
            list.push(`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`)
        }
        if (book.cover_url?.startsWith('http')) list.push(book.cover_url)
        // Priority 3: AI category cover
        list.push(aiCover)
        return list
    }

    const urls = buildUrls()
    const [idx, setIdx] = useState(0)
    const [failed, setFailed] = useState(false)

    const advance = () => {
        if (idx + 1 < urls.length) setIdx(idx + 1)
        else setFailed(true)
    }

    // Open Library returns a 1×1 pixel placeholder instead of 404 for missing covers
    const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (e.currentTarget.naturalWidth < 10 || e.currentTarget.naturalHeight < 10) advance()
    }

    // Priority 4: absolute last resort — gradient card
    if (failed) {
        return (
            <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(135deg,${c1},${c2})`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 10, boxSizing: 'border-box',
            }}>
                <span style={{ fontSize: 30, marginBottom: 8 }}>{emoji}</span>
                <p style={{
                    color: 'rgba(255,255,255,0.95)', fontSize: 9,
                    fontWeight: 700, textAlign: 'center',
                    lineHeight: 1.3, margin: 0,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {book.title}
                </p>
            </div>
        )
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={urls[idx]}
            alt={book.title}
            onError={advance}
            onLoad={onLoad}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
    )
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function Skeleton() {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 16,
        }}>
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '0.72', background: '#D4C5A9', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ padding: 12 }}>
                        <div style={{ height: 10, background: '#D4C5A9', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ height: 8, background: '#D4C5A9', borderRadius: 4, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── WhatsApp helper ───────────────────────────────────────────────────────────
function waLink(book: any) {
    const text = `Hi Rebook India! I want to buy:\n\n*${book.title}* by ${book.author}\n🛒 Price: ₹${book.our_price ?? book.ourPrice} (MRP ₹${book.mrp})\n\nCan you confirm availability?`
    return `https://wa.me/919876543210?text=${encodeURIComponent(text)}`
}

// ── Main Browse Content ───────────────────────────────────────────────────────
function BrowseContent() {
    const searchParams = useSearchParams()
    const { toggle: toggleWishlist, has: hasWishlist } = useWishlist()
    const { addItem: addCart, hasItem } = useCart()

    const [allBooks, setAllBooks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    // Filters
    const [search, setSearch] = useState(searchParams.get('q') || '')
    const [category, setCategory] = useState(searchParams.get('cat') || '')
    const [condition, setCondition] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [sort, setSort] = useState('latest')

    // Fetch all available books once
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true)
            setError('')
            try {
                const snap = await getDocs(
                    query(collection(db, 'books'), where('is_available', '==', true))
                )
                setAllBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
            } catch (err: any) {
                console.error('Browse fetch error:', err)
                setError(err.message || 'Failed to load books')
            } finally {
                setLoading(false)
            }
        }
        fetchBooks()
    }, [])

    // Filter + sort
    const filtered = allBooks
        .filter(b => {
            const q = search.toLowerCase()
            const matchSearch = !q ||
                (b.title ?? '').toLowerCase().includes(q) ||
                (b.author ?? '').toLowerCase().includes(q) ||
                (b.isbn ?? '').toLowerCase().includes(q)
            const matchCat = !category || (b.category_id ?? b.category) === category
            const matchCond = !condition || b.condition === condition
            const price = b.our_price ?? b.ourPrice ?? 0
            const matchMin = !minPrice || price >= Number(minPrice)
            const matchMax = !maxPrice || price <= Number(maxPrice)
            return matchSearch && matchCat && matchCond && matchMin && matchMax
        })
        .sort((a, b) => {
            const pa = a.our_price ?? a.ourPrice ?? 0
            const pb = b.our_price ?? b.ourPrice ?? 0
            if (sort === 'price_asc') return pa - pb
            if (sort === 'price_desc') return pb - pa
            return 0 // latest = Firestore order
        })

    const clearFilters = () => {
        setSearch(''); setCategory(''); setCondition('')
        setMinPrice(''); setMaxPrice(''); setSort('latest')
    }

    // ── Filters panel (reused for desktop sidebar + mobile sheet)
    const FiltersPanel = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Search */}
            <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#1A1208', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Search
                </label>
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8B7355' }} />
                    <input
                        type="text"
                        placeholder="Title, author, ISBN..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 10, paddingBottom: 10,
                            border: '1px solid #D4C5A9', borderRadius: 6, fontSize: 13, outline: 'none',
                            fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                        }}
                    />
                </div>
            </div>

            {/* Category */}
            <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#1A1208', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Category
                </label>
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{
                        width: '100%', padding: '10px 12px', border: '1px solid #D4C5A9',
                        borderRadius: 6, fontSize: 13, outline: 'none',
                        fontFamily: 'DM Sans, sans-serif', background: 'white', color: '#1A1208',
                    }}
                >
                    {CATEGORY_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Condition */}
            <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#1A1208', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Condition
                </label>
                <select
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                    style={{
                        width: '100%', padding: '10px 12px', border: '1px solid #D4C5A9',
                        borderRadius: 6, fontSize: 13, outline: 'none',
                        fontFamily: 'DM Sans, sans-serif', background: 'white', color: '#1A1208',
                    }}
                >
                    {CONDITION_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Price Range */}
            <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#1A1208', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Price Range (₹)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#8B7355', fontFamily: 'DM Sans, sans-serif' }}>Min price</span>
                        <input
                            type="number"
                            placeholder="e.g. 100"
                            value={minPrice}
                            onChange={e => setMinPrice(e.target.value)}
                            style={{
                                width: '100%', padding: '9px 10px', border: '1px solid #D4C5A9',
                                borderRadius: 6, fontSize: 13, outline: 'none',
                                fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#8B7355', fontFamily: 'DM Sans, sans-serif' }}>Max price</span>
                        <input
                            type="number"
                            placeholder="e.g. 2000"
                            value={maxPrice}
                            onChange={e => setMaxPrice(e.target.value)}
                            style={{
                                width: '100%', padding: '9px 10px', border: '1px solid #D4C5A9',
                                borderRadius: 6, fontSize: 13, outline: 'none',
                                fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Clear */}
            <button
                onClick={clearFilters}
                style={{
                    width: '100%', padding: '10px', border: '1px solid #D4C5A9',
                    borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', background: 'white', color: '#8B7355',
                }}
            >
                Clear All Filters
            </button>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#FAF6EC', padding: '32px 0' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

                {/* Page heading */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{
                        fontFamily: 'Playfair Display, serif', fontSize: 28,
                        fontWeight: 900, color: '#1A1208', marginBottom: 4,
                    }}>
                        Browse Books
                    </h1>
                    {!loading && (
                        <p style={{ color: '#8B7355', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
                            Showing <strong style={{ color: '#1A1208' }}>{filtered.length}</strong> book{filtered.length !== 1 ? 's' : ''} available in Hyderabad
                        </p>
                    )}
                </div>

                {/* Top bar: Sort + Mobile filter button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginBottom: 24 }}>
                    <select
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                        style={{
                            padding: '10px 14px', border: '1px solid #D4C5A9',
                            borderRadius: 6, fontSize: 13, fontWeight: 700,
                            fontFamily: 'DM Sans, sans-serif', background: 'white', color: '#1A1208',
                            outline: 'none', cursor: 'pointer',
                        }}
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setMobileFiltersOpen(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '10px 16px', background: '#1A1208', color: 'white',
                            border: 'none', borderRadius: 6, cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 13,
                        }}
                    >
                        <SlidersHorizontal size={16} /> Filters
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                    {/* Desktop Sidebar */}
                    <div style={{
                        width: 260, flexShrink: 0,
                        background: 'white', borderRadius: 12, padding: 24,
                        boxShadow: '0 2px 8px rgba(26,18,8,0.08)',
                        position: 'sticky', top: 88,
                    }}
                        className="hidden-on-mobile"
                    >
                        <h3 style={{
                            fontFamily: 'Playfair Display, serif', fontWeight: 700,
                            fontSize: 16, color: '#1A1208', marginBottom: 20,
                            paddingBottom: 12, borderBottom: '1px solid #D4C5A9',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <SlidersHorizontal size={16} /> Filters
                        </h3>
                        <FiltersPanel />
                    </div>

                    {/* Book Grid */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {loading && <Skeleton />}

                        {error && !loading && (
                            <div style={{
                                background: '#fee2e2', border: '1px solid #fca5a5',
                                borderRadius: 12, padding: 32, textAlign: 'center',
                            }}>
                                <p style={{ color: '#991b1b', fontFamily: 'DM Sans, sans-serif', fontSize: 15, marginBottom: 12 }}>
                                    ❌ {error}
                                </p>
                            </div>
                        )}

                        {!loading && !error && filtered.length === 0 && (
                            <div style={{
                                background: 'white', borderRadius: 12, padding: '60px 32px',
                                textAlign: 'center', boxShadow: '0 2px 8px rgba(26,18,8,0.08)',
                            }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1A1208', marginBottom: 8 }}>
                                    No books found
                                </h3>
                                <p style={{ color: '#8B7355', fontFamily: 'DM Sans, sans-serif', marginBottom: 24 }}>
                                    Try adjusting your search or filters.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        background: '#C94A2D', color: 'white', border: 'none',
                                        padding: '12px 28px', borderRadius: 8, cursor: 'pointer',
                                        fontWeight: 700, fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                                    }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}

                        {!loading && !error && filtered.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: 16,
                            }}>
                                {filtered.map(book => {
                                    const ourPrice = book.our_price ?? book.ourPrice ?? Math.round(Number(book.mrp || 0) * 0.5)
                                    const savings = book.savings ?? Math.round(Number(book.mrp || 0) * 0.5)
                                    const inCart = hasItem(book.id)
                                    const inWishlist = hasWishlist(book.id)

                                    return (
                                        <div
                                            key={book.id}
                                            style={{
                                                background: 'white', borderRadius: 12, overflow: 'hidden',
                                                boxShadow: '0 2px 8px rgba(26,18,8,0.08)',
                                                transition: 'all 0.25s', display: 'flex', flexDirection: 'column',
                                            }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                                                    ; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(26,18,8,0.15)'
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                                                    ; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(26,18,8,0.08)'
                                            }}
                                        >
                                            {/* Cover */}
                                            <div style={{ position: 'relative', width: '100%', aspectRatio: '0.72', background: '#D4C5A9', overflow: 'hidden' }}>
                                                <Link href={`/book/${book.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                                                    <BookCover book={book} />
                                                </Link>

                                                {/* 50% OFF badge */}
                                                <div style={{
                                                    position: 'absolute', top: 8, right: 8,
                                                    background: '#C94A2D', color: 'white',
                                                    fontSize: 9, fontWeight: 700, padding: '3px 7px',
                                                    borderRadius: 4, fontFamily: 'DM Sans, sans-serif',
                                                }}>
                                                    50% OFF
                                                </div>

                                                {/* Condition badge */}
                                                {book.condition && (
                                                    <div style={{
                                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                                        background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
                                                        padding: '20px 8px 8px',
                                                    }}>
                                                        <span style={{
                                                            color: 'white', fontSize: 9, fontWeight: 700,
                                                            textTransform: 'uppercase', letterSpacing: 0.5,
                                                            fontFamily: 'DM Sans, sans-serif',
                                                        }}>
                                                            {book.condition.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Wishlist */}
                                                <button
                                                    onClick={e => {
                                                        e.preventDefault()
                                                        toggleWishlist(book.id)
                                                        toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist')
                                                    }}
                                                    style={{
                                                        position: 'absolute', top: 8, left: 8,
                                                        background: 'rgba(255,255,255,0.9)', border: 'none',
                                                        borderRadius: '50%', width: 30, height: 30,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', color: inWishlist ? '#ef4444' : '#8B7355',
                                                    }}
                                                >
                                                    <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
                                                </button>
                                            </div>

                                            {/* Info */}
                                            <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <Link href={`/book/${book.id}`} style={{ textDecoration: 'none' }}>
                                                    <p style={{
                                                        fontFamily: 'Playfair Display, serif', fontSize: 12,
                                                        fontWeight: 700, color: '#1A1208', lineHeight: 1.3,
                                                        marginBottom: 2, overflow: 'hidden',
                                                        display: '-webkit-box', WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}>
                                                        {book.title}
                                                    </p>
                                                    <p style={{ fontSize: 10, color: '#8B7355', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>
                                                        {book.author}
                                                    </p>
                                                </Link>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                                                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, fontWeight: 700, color: '#4A7C59' }}>
                                                        ₹{ourPrice}
                                                    </span>
                                                    <span style={{ fontSize: 10, color: '#8B7355', textDecoration: 'line-through' }}>
                                                        ₹{book.mrp}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: 10, color: '#C94A2D', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, marginBottom: 10 }}>
                                                    Save ₹{savings} • 50% OFF
                                                </p>

                                                {/* Actions */}
                                                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                                                    <button
                                                        onClick={() => {
                                                            if (!inCart) {
                                                                addCart({ ...book, ourPrice, savings })
                                                                toast.success(`Added: ${book.title}`)
                                                            }
                                                        }}
                                                        style={{
                                                            flex: 1, padding: '8px 4px', border: 'none',
                                                            borderRadius: 6, cursor: inCart ? 'default' : 'pointer',
                                                            fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                                                            fontSize: 11, display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', gap: 4,
                                                            background: inCart ? '#4A7C59' : '#1A1208',
                                                            color: 'white', transition: 'background 0.2s',
                                                        }}
                                                    >
                                                        {inCart ? <><Check size={12} /> In Cart</> : 'Add to Cart'}
                                                    </button>
                                                    <a
                                                        href={waLink(book)}
                                                        target="_blank" rel="noopener noreferrer"
                                                        style={{
                                                            width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'rgba(37,211,102,0.1)', color: '#25D366',
                                                            borderRadius: 6, textDecoration: 'none', flexShrink: 0,
                                                        }}
                                                    >
                                                        <MessageCircle size={16} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Sheet */}
            {mobileFiltersOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}>
                    <div
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
                        onClick={() => setMobileFiltersOpen(false)}
                    />
                    <div style={{
                        position: 'relative', background: '#FAF6EC',
                        borderTopLeftRadius: 20, borderTopRightRadius: 20,
                        padding: 24, maxHeight: '88vh', overflowY: 'auto',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18, color: '#1A1208' }}>
                                Filters
                            </h3>
                            <button
                                onClick={() => setMobileFiltersOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355' }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <FiltersPanel />
                        <button
                            onClick={() => setMobileFiltersOpen(false)}
                            style={{
                                marginTop: 24, width: '100%', padding: '14px',
                                background: '#1A1208', color: 'white', border: 'none',
                                borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            Show {filtered.length} Results
                        </button>
                    </div>
                </div>
            )}

            <style>{`
        @media (min-width: 768px) { .hidden-on-mobile { display: block !important; } }
        @media (max-width: 767px) { .hidden-on-mobile { display: none !important; } }
      `}</style>
        </div>
    )
}

export default function BrowsePage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#FAF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#8B7355', fontSize: 16 }}>Loading books...</p>
            </div>
        }>
            <BrowseContent />
        </Suspense>
    )
}
