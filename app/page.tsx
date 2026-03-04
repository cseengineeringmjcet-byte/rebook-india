'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

// ── Firebase config ──────────────────────────────────────────────────────────
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

// ── Category gradients & emojis ──────────────────────────────────────────────
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

// ── Book Cover Component with 4-priority fallback ────────────────────────────
function BookCover({ book, className }: { book: any; className?: string }) {
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
    if (book.cover_url?.startsWith('http')) {
      list.push(book.cover_url)
    }
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

  const onError = () => advance()

  // Open Library sends a 1×1 grey pixel image when a cover doesn't exist,
  // instead of returning a 404. We detect this by checking naturalWidth on load.
  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    if (img.naturalWidth < 10 || img.naturalHeight < 10) {
      advance()
    }
  }

  // Priority 4: absolute final fallback — gradient card
  if (failed) {
    return (
      <div
        className={className}
        style={{
          width: '100%', height: '100%',
          background: `linear-gradient(135deg,${c1},${c2})`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 8, boxSizing: 'border-box',
        }}
      >
        <span style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</span>
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
      className={className}
      onError={onError}
      onLoad={onLoad}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  )
}


// ── Loading Skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
      gap: 16,
    }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: 'white' }}>
          <div style={{
            aspectRatio: '0.72', background: '#D4C5A9',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{ padding: '10px 12px 12px' }}>
            <div style={{ height: 10, background: '#D4C5A9', borderRadius: 6, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 8, background: '#D4C5A9', borderRadius: 6, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Home FAQ Component ───────────────────────────────────────────────────────
function HomeAccordion({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{
      border: '1px solid #D4C5A9', borderRadius: 8, marginBottom: 12,
      background: 'white', overflow: 'hidden', transition: 'all 0.3s'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', textAlign: 'left', padding: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isOpen ? '#f8fafc' : 'white', border: 'none', cursor: 'pointer'
        }}
      >
        <span style={{ fontWeight: 700, color: '#1A1208', fontSize: 16 }}>{q}</span>
        <Plus
          size={20}
          style={{
            flexShrink: 0, color: '#C94A2D',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease-in-out'
          }}
        />
      </button>
      <div style={{
        maxHeight: isOpen ? 500 : 0, opacity: isOpen ? 1 : 0,
        overflow: 'hidden', transition: 'all 0.3s ease-in-out'
      }}>
        <div style={{
          padding: '0 20px 20px', color: '#8B7355', fontSize: 15,
          lineHeight: 1.6, whiteSpace: 'pre-line', borderTop: isOpen ? '1px solid #D4C5A9' : 'none',
          paddingTop: isOpen ? '20px' : 0
        }}>
          {a}
        </div>
      </div>
    </div>
  )
}

const HOME_FAQS = [
  {
    q: "How much discount do I get on books?",
    a: "You get exactly 50% off the MRP on every single book. If a book costs Rs 1000 MRP you pay only Rs 500. No hidden charges. No delivery charges for pickup."
  },
  {
    q: "How do I order a book?",
    a: "Browse books on our website, click the book you want, click Add to Cart or Order via WhatsApp. We will contact you within 24 hours to confirm your order and arrange delivery or pickup."
  },
  {
    q: "Can I get home delivery in Hyderabad?",
    a: "Yes! We deliver across all areas of Hyderabad. You can also pick up directly from the vendor's shop to save time. Pickup is always free."
  },
  {
    q: "How do I sell my old books on Rebook India?",
    a: "Click Sell Your Books on the homepage, fill in the details of your book, upload a clear photo, and submit. Our admin team reviews within 24 hours and lists it. You earn 80% of the sale price when your book sells."
  },
  {
    q: "How much money will I earn from selling?",
    a: "You earn 80% of the sale price. We charge 20% commission. Example: If your book sells for Rs 500, you get Rs 400. The sale price is set at 50% of MRP so if MRP is Rs 1000, sale price is Rs 500 and you earn Rs 400."
  },
  {
    q: "What is Rebook India?",
    a: "Rebook India is Hyderabad's trusted marketplace for buying and selling second-hand books at 50% off MRP. We connect students who want to sell their old books with students who need affordable textbooks. We have 15 verified vendors across Hyderabad."
  }
];

// ── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const fetchBooks = async () => {
    setLoading(true)
    setError('')
    try {
      const snap = await getDocs(
        query(collection(db, 'books'), where('is_available', '==', true))
      )
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setBooks(data)
    } catch (err: any) {
      console.error('Firebase fetch error:', err)
      setError(err.message || 'Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBooks() }, [])

  // Unique categories from loaded books
  const categories = ['all', ...Array.from(new Set(books.map((b: any) => b.category_id).filter(Boolean)))]

  const filtered = activeTab === 'all'
    ? books
    : books.filter((b: any) => b.category_id === activeTab)

  const categoryLabel = (slug: string) => {
    if (slug === 'all') return 'All Books'
    return books.find((b: any) => b.category_id === slug)?.category_name || slug
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FAF6EC' }}>

      {/* HERO */}
      <section style={{ background: '#1A1208', padding: '60px 24px', textAlign: 'center' }}>
        <p style={{
          color: '#E8A020', fontSize: 13,
          fontFamily: 'DM Sans, sans-serif',
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
        }}>
          Hyderabad's Trusted Second-Hand Book Marketplace
        </p>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 900, color: '#F5EFE0',
          lineHeight: 1.2, maxWidth: 700, margin: '0 auto 16px',
        }}>
          Why Should{' '}
          <span style={{ color: '#E8A020' }}>Expensive Books</span>
          {' '}Stop Your Dreams?
        </h1>
        <p style={{
          color: '#D4C5A9', fontSize: 16,
          fontFamily: 'DM Sans, sans-serif',
          maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6,
        }}>
          Get 50% off MRP on every book. 15 trusted vendors. 35+ books available in Hyderabad.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/browse" style={{
            background: '#C94A2D', color: 'white',
            padding: '14px 28px', borderRadius: 12,
            textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600, fontSize: 15,
          }}>
            Browse Books in Hyderabad
          </Link>
          <Link href="/sell" style={{
            background: 'transparent', color: '#F5EFE0',
            padding: '14px 28px', borderRadius: 12,
            textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600, fontSize: 15,
            border: '1px solid #F5EFE0',
          }}>
            Sell Your Books
          </Link>
        </div>
      </section>

      {/* BOOKS SECTION */}
      <section style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 32, fontWeight: 700, color: '#1A1208',
          textAlign: 'center', marginBottom: 8,
        }}>
          Available Books
        </h2>
        <p style={{
          color: '#8B7355', textAlign: 'center',
          marginBottom: 32, fontFamily: 'DM Sans, sans-serif',
        }}>
          {loading ? 'Loading books...' : `${books.length} books at 50% off MRP across Hyderabad`}
        </p>

        {/* CATEGORY TABS */}
        {!loading && books.length > 0 && (
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            justifyContent: 'center', marginBottom: 32,
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                style={{
                  padding: '8px 18px', borderRadius: 24, border: 'none',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13, fontWeight: 600,
                  background: activeTab === cat ? '#C94A2D' : '#F5EFE0',
                  color: activeTab === cat ? 'white' : '#1A1208',
                  transition: 'all 0.2s',
                }}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        )}

        {/* LOADING */}
        {loading && <Skeleton />}

        {/* ERROR */}
        {error && !loading && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5',
            borderRadius: 16, padding: 32, textAlign: 'center',
          }}>
            <p style={{ color: '#991b1b', fontFamily: 'DM Sans, sans-serif', fontSize: 16, marginBottom: 16 }}>
              ❌ Failed to load books: {error}
            </p>
            <button
              onClick={fetchBooks}
              style={{
                background: '#C94A2D', color: 'white', border: 'none',
                padding: '12px 24px', borderRadius: 10,
                cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📚</p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1A1208', marginBottom: 8 }}>
              No books yet
            </p>
            <p style={{ color: '#8B7355', fontFamily: 'DM Sans, sans-serif', marginBottom: 24 }}>
              {activeTab === 'all'
                ? 'Firebase has no books yet. Run the seed page.'
                : `No ${activeTab} books available right now.`}
            </p>
            {activeTab === 'all' && (
              <Link href="/seed" style={{
                background: '#C94A2D', color: 'white',
                padding: '12px 24px', borderRadius: 10,
                textDecoration: 'none', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
              }}>
                Go to Seed Page →
              </Link>
            )}
          </div>
        )}

        {/* BOOKS GRID */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
            gap: 16,
          }}>
            {filtered.map((book: any) => {
              const ourPrice = book.our_price ?? Math.round(Number(book.mrp || 0) * 0.5)
              const savings = book.savings ?? Math.round(Number(book.mrp || 0) * 0.5)
              return (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      background: 'white', borderRadius: 16,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(26,18,8,0.08)',
                      transition: 'all 0.3s', cursor: 'pointer',
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
                    {/* COVER */}
                    <div style={{
                      width: '100%', aspectRatio: '0.72',
                      overflow: 'hidden', background: '#D4C5A9',
                    }}>
                      <BookCover book={book} />
                    </div>

                    {/* INFO */}
                    <div style={{ padding: '10px 12px 12px' }}>
                      <p style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: 12, fontWeight: 700, color: '#1A1208',
                        lineHeight: 1.3, marginBottom: 2,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {book.title}
                      </p>
                      <p style={{
                        fontSize: 10, color: '#8B7355',
                        fontFamily: 'DM Sans, sans-serif', marginBottom: 6,
                      }}>
                        {book.author}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{
                          fontFamily: 'Space Mono, monospace',
                          fontSize: 14, fontWeight: 700, color: '#4A7C59',
                        }}>
                          ₹{ourPrice}
                        </span>
                        <span style={{ fontSize: 10, color: '#8B7355', textDecoration: 'line-through' }}>
                          ₹{book.mrp}
                        </span>
                      </div>
                      <p style={{
                        fontSize: 10, color: '#C94A2D',
                        fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                      }}>
                        Save ₹{savings} • 50% OFF
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* FAQ HOMEPAGE SECTION */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 32, fontWeight: 700, color: '#1A1208',
            textAlign: 'center', marginBottom: 40,
          }}>
            Frequently Asked Questions
          </h2>
          <div>
            {HOME_FAQS.map((faq, i) => (
              <HomeAccordion key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/faq" style={{
              display: 'inline-block',
              background: 'transparent', color: '#1A1208',
              padding: '12px 28px', borderRadius: 8,
              textDecoration: 'none', fontFamily: 'DM Sans, sans-serif',
              fontWeight: 700, fontSize: 15,
              border: '2px solid #1A1208',
              transition: 'all 0.2s'
            }}>
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#1A1208', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#F5EFE0', marginBottom: 8 }}>
          Rebook<span style={{ color: '#C94A2D' }}>India</span>
        </p>
        <p style={{ color: '#8B7355', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>
          © 2025 Rebook India • Hyderabad's Trusted Second-Hand Book Marketplace
        </p>
      </footer>

    </main>
  )
}
