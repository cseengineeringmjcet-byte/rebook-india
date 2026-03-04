'use client'

import { useMemo, useState } from 'react'
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import Link from 'next/link'

// Firebase config directly here (per requirement)
const firebaseConfig = {
  apiKey: "AIzaSyDAwlYwWmuBEUxS9p-jxp_9KgVAE79fepI",
  authDomain: "rebookindia-29be8.firebaseapp.com",
  projectId: "rebookindia-29be8",
  storageBucket: "rebookindia-29be8.firebasestorage.app",
  messagingSenderId: "1014316461662",
  appId: "1:1014316461662:web:5c5b3037f031d50cabcecf",
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)

const calcPrices = (mrp: number) => ({
  our_price: Math.round(mrp * 0.5),
  vendor_earn: Math.round(mrp * 0.4),
  ri_earn: Math.round(mrp * 0.1),
  savings: Math.round(mrp * 0.5),
})

type SeedCategory = { slug: string; name: string; emoji: string; sort_order: number }
type SeedVendor = {
  shop_name: string
  owner_name: string
  area: string
  phone: string
  badge: string
  rating: number
  shop_image: string
  created_at?: any
}
type SeedBook = { title: string; isbn: string; mrp: number; category_id: string; author: string }

const CATEGORIES: SeedCategory[] = [
  { slug: 'engineering', name: 'Engineering', emoji: '⚙️', sort_order: 1 },
  { slug: 'medical', name: 'Medical', emoji: '🏥', sort_order: 2 },
  { slug: 'jee', name: 'JEE', emoji: '⚡', sort_order: 3 },
  { slug: 'neet', name: 'NEET', emoji: '🧬', sort_order: 4 },
  { slug: 'upsc', name: 'UPSC', emoji: '🏛️', sort_order: 5 },
  { slug: 'bank', name: 'Banking', emoji: '🏦', sort_order: 6 },
  { slug: 'mba', name: 'MBA', emoji: '💼', sort_order: 7 },
  { slug: 'science', name: 'Science', emoji: '🧪', sort_order: 8 },
  { slug: 'secondary', name: 'Secondary', emoji: '📘', sort_order: 9 },
  { slug: 'school', name: 'School', emoji: '🎒', sort_order: 10 },
  { slug: 'selfhelp', name: 'Self Help', emoji: '💡', sort_order: 11 },
  { slug: 'fiction', name: 'Fiction', emoji: '📝', sort_order: 12 },
  { slug: 'regional', name: 'Regional', emoji: '🌸', sort_order: 13 },
  { slug: 'kids', name: 'Kids', emoji: '🧸', sort_order: 14 },
  { slug: 'competitive', name: 'Competitive', emoji: '🎯', sort_order: 15 },
]

const VENDORS: Omit<SeedVendor, 'created_at'>[] = [
  { shop_name: 'Koti Book Hub', owner_name: 'Ramesh', area: 'Koti', phone: '9000000001', badge: 'Top Rated', rating: 4.7, shop_image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900' },
  { shop_name: 'Secunderabad Study Store', owner_name: 'Sana', area: 'Secunderabad', phone: '9000000002', badge: 'Verified', rating: 4.6, shop_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900' },
  { shop_name: 'Ameerpet Academy Books', owner_name: 'Imran', area: 'Ameerpet', phone: '9000000003', badge: 'Fast Pickup', rating: 4.5, shop_image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900' },
  { shop_name: 'Hitech City Readers', owner_name: 'Ananya', area: 'Hitech City', phone: '9000000004', badge: 'Verified', rating: 4.6, shop_image: 'https://images.unsplash.com/photo-1529148482759-b35b25c7f217?w=900' },
  { shop_name: 'Dilsukhnagar Discount Books', owner_name: 'Kiran', area: 'Dilsukhnagar', phone: '9000000005', badge: 'Best Deals', rating: 4.4, shop_image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=900' },
  { shop_name: 'Mehdipatnam Medical Books', owner_name: 'Faiz', area: 'Mehdipatnam', phone: '9000000006', badge: 'Verified', rating: 4.6, shop_image: 'https://images.unsplash.com/photo-1491841651911-c44c30c34548?w=900' },
  { shop_name: 'Kukatpally Textbook Mart', owner_name: 'Vijay', area: 'Kukatpally', phone: '9000000007', badge: 'Top Rated', rating: 4.7, shop_image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900' },
  { shop_name: 'Madhapur Exam Prep', owner_name: 'Neha', area: 'Madhapur', phone: '9000000008', badge: 'Fast Pickup', rating: 4.5, shop_image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?w=900' },
  { shop_name: 'Nampally Book Street', owner_name: 'Suresh', area: 'Nampally', phone: '9000000009', badge: 'Best Deals', rating: 4.4, shop_image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=900' },
  { shop_name: 'Begumpet Readers Corner', owner_name: 'Priya', area: 'Begumpet', phone: '9000000010', badge: 'Verified', rating: 4.6, shop_image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=900' },
  { shop_name: 'Charminar Classics', owner_name: 'Salman', area: 'Charminar', phone: '9000000011', badge: 'Top Rated', rating: 4.7, shop_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900' },
  { shop_name: 'LB Nagar School Books', owner_name: 'Lakshmi', area: 'LB Nagar', phone: '9000000012', badge: 'Verified', rating: 4.5, shop_image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=900' },
  { shop_name: 'Himayatnagar Self-help Store', owner_name: 'Rahul', area: 'Himayatnagar', phone: '9000000013', badge: 'Best Deals', rating: 4.4, shop_image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=900' },
  { shop_name: 'Gachibowli Tech Reads', owner_name: 'Pooja', area: 'Gachibowli', phone: '9000000014', badge: 'Top Rated', rating: 4.7, shop_image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=900' },
  { shop_name: 'Uppal Competitive Books', owner_name: 'Arun', area: 'Uppal', phone: '9000000015', badge: 'Verified', rating: 4.5, shop_image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=900' },
]

const BOOKS: SeedBook[] = [
  { title: 'BS Grewal Higher Engineering Mathematics', isbn: '9788174091956', mrp: 950, category_id: 'engineering', author: 'B.S. Grewal' },
  { title: 'Introduction to Algorithms (CLRS)', isbn: '9780262033848', mrp: 1850, category_id: 'engineering', author: 'Cormen • Leiserson • Rivest • Stein' },
  { title: 'Operating System Concepts (Galvin)', isbn: '9781119800361', mrp: 1150, category_id: 'engineering', author: 'Silberschatz • Galvin • Gagne' },
  { title: 'Advanced Engineering Mathematics (Kreyszig)', isbn: '9788126554232', mrp: 1250, category_id: 'engineering', author: 'Erwin Kreyszig' },
  { title: 'Engineering Mechanics (Hibbeler)', isbn: '9780133918922', mrp: 1380, category_id: 'engineering', author: 'R.C. Hibbeler' },
  { title: 'Database System Concepts (Korth)', isbn: '9780078022159', mrp: 1350, category_id: 'engineering', author: 'Korth • Silberschatz • Sudarshan' },
  { title: 'Computer Networks (Tanenbaum)', isbn: '9780132126953', mrp: 1200, category_id: 'engineering', author: 'Andrew S. Tanenbaum' },
  { title: 'Microelectronic Circuits (Sedra/Smith)', isbn: '9780199476299', mrp: 1450, category_id: 'engineering', author: 'Sedra • Smith' },
  { title: 'Thermodynamics (Cengel)', isbn: '9780073398174', mrp: 1550, category_id: 'engineering', author: 'Yunus A. Çengel' },
  { title: 'Signals and Systems (Oppenheim)', isbn: '9780138147570', mrp: 1300, category_id: 'engineering', author: 'Oppenheim • Willsky' },
  { title: 'HC Verma Physics Part 1', isbn: '9788177091878', mrp: 500, category_id: 'jee', author: 'H.C. Verma' },
  { title: 'HC Verma Physics Part 2', isbn: '9788177092080', mrp: 500, category_id: 'jee', author: 'H.C. Verma' },
  { title: 'DC Pandey Mechanics Part 1', isbn: '9789313191797', mrp: 695, category_id: 'jee', author: 'D.C. Pandey' },
  { title: 'MS Chauhan Organic Chemistry', isbn: '9789385576607', mrp: 750, category_id: 'jee', author: 'M.S. Chauhan' },
  { title: "Gray's Anatomy 42nd Edition", isbn: '9780702052309', mrp: 2500, category_id: 'medical', author: 'Standring (Ed.)' },
  { title: 'BD Chaurasia Human Anatomy Vol 1', isbn: '9788123924854', mrp: 850, category_id: 'medical', author: 'B.D. Chaurasia' },
  { title: 'Guyton and Hall Medical Physiology', isbn: '9780323597128', mrp: 2300, category_id: 'medical', author: 'Guyton • Hall' },
  { title: 'Robbins Basic Pathology', isbn: '9780323353175', mrp: 2600, category_id: 'medical', author: 'Kumar • Abbas • Aster' },
  { title: "Harrison's Principles of Internal Medicine", isbn: '9781259644030', mrp: 4500, category_id: 'medical', author: 'Fauci et al.' },
  { title: 'KD Tripathi Medical Pharmacology', isbn: '9789352704996', mrp: 1550, category_id: 'medical', author: 'K.D. Tripathi' },
  { title: 'Bailey and Love Surgery', isbn: '9781138295773', mrp: 3200, category_id: 'medical', author: 'Bailey • Love' },
  { title: 'Laxmikant Indian Polity', isbn: '9789353168933', mrp: 950, category_id: 'upsc', author: 'M. Laxmikanth' },
  { title: "Bipin Chandra India's Struggle", isbn: '9780143031345', mrp: 499, category_id: 'upsc', author: 'Bipin Chandra' },
  { title: 'GC Leong Certificate Geography', isbn: '9780195668452', mrp: 660, category_id: 'upsc', author: 'G.C. Leong' },
  { title: 'RS Aggarwal Quantitative Aptitude', isbn: '9789352535057', mrp: 595, category_id: 'upsc', author: 'R.S. Aggarwal' },
  { title: 'RS Aggarwal Verbal Reasoning', isbn: '9789352530878', mrp: 595, category_id: 'upsc', author: 'R.S. Aggarwal' },
  { title: 'RD Sharma Mathematics Class 12', isbn: '9788190804547', mrp: 680, category_id: 'secondary', author: 'R.D. Sharma' },
  { title: 'NCERT Physics Class 12 Part 1', isbn: '9788174506160', mrp: 250, category_id: 'science', author: 'NCERT' },
  { title: 'RS Aggarwal Maths Class 10', isbn: '9789352530892', mrp: 540, category_id: 'secondary', author: 'R.S. Aggarwal' },
  { title: 'Lakhmir Singh Physics Class 10', isbn: '9789352530977', mrp: 440, category_id: 'secondary', author: 'Lakhmir Singh' },
  { title: 'Atomic Habits', isbn: '9781847941831', mrp: 599, category_id: 'selfhelp', author: 'James Clear' },
  { title: 'Wings of Fire', isbn: '8173711461', mrp: 250, category_id: 'selfhelp', author: 'A.P.J. Abdul Kalam' },
  { title: 'The Alchemist', isbn: '9780062315007', mrp: 350, category_id: 'fiction', author: 'Paulo Coelho' },
  { title: 'Rich Dad Poor Dad', isbn: '9781612680194', mrp: 399, category_id: 'selfhelp', author: 'Robert T. Kiyosaki' },
  { title: 'Zero to One', isbn: '9780804139021', mrp: 699, category_id: 'selfhelp', author: 'Peter Thiel' },
]

export default function SeedPage() {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  const total = useMemo(() => CATEGORIES.length + VENDORS.length + BOOKS.length, [])

  const log = (line: string) => setLogs(prev => [line, ...prev])

  const runSeed = async () => {
    setRunning(true)
    setDone(false)
    setError('')
    setLogs([])
    try {
      log(`Starting seed... total items: ${total}`)

      // 1) Categories (15) using setDoc with slug as doc ID
      log(`Uploading categories (${CATEGORIES.length})...`)
      for (const c of CATEGORIES) {
        await setDoc(doc(db, 'categories', c.slug), {
          slug: c.slug,
          name: c.name,
          emoji: c.emoji,
          sort_order: c.sort_order,
          created_at: serverTimestamp(),
        })
        log(`✅ category: ${c.slug}`)
      }

      // 2) Vendors (15) using addDoc
      log(`Uploading vendors (${VENDORS.length})...`)
      const vendorIds: string[] = []
      for (const v of VENDORS) {
        const ref = await addDoc(collection(db, 'vendors'), {
          ...v,
          created_at: serverTimestamp(),
        })
        vendorIds.push(ref.id)
        log(`✅ vendor: ${v.shop_name}`)
      }

      // 3) Books (35) using addDoc with calcPrices
      log(`Uploading books (${BOOKS.length})...`)
      for (let i = 0; i < BOOKS.length; i++) {
        const b = BOOKS[i]
        const vendor_id = vendorIds[i % vendorIds.length] || ''
        await addDoc(collection(db, 'books'), {
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          mrp: b.mrp,
          category_id: b.category_id,
          vendor_id,
          condition: 'good',
          stock: 1,
          description: 'Seeded book (demo).',
          cover_url: '',
          is_featured: false,
          is_available: true,
          views: 0,
          ...calcPrices(b.mrp),
          created_at: serverTimestamp(),
        })
        log(`✅ book: ${b.title}`)
      }

      setDone(true)
      log('🎉 Seed complete.')
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Seed failed')
      log(`❌ Seed failed: ${e?.message || e}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper)] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black text-[var(--color-ink)]">Seed Firebase</h1>
            <p className="text-[var(--color-dust)] mt-2 text-sm">
              This will upload categories, vendors, and books into Firestore for <span className="font-mono font-bold">rebookindia-29be8</span>.
            </p>
            <p className="text-[var(--color-dust)] mt-1 text-sm">
              After this, go back to <Link className="text-[var(--color-rust)] font-bold hover:underline" href="/">homepage</Link> and you should see books immediately.
            </p>
          </div>

          <button
            disabled={running}
            onClick={runSeed}
            className="shrink-0 bg-[var(--color-rust)] hover:bg-[#A93C23] disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-bold"
          >
            {running ? 'Seeding…' : done ? 'Seed Again' : 'Run Seed'}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm font-bold">
            {error}
          </div>
        )}

        {done && !error && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 text-sm font-bold">
            Seed complete. Homepage should show books now.
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-[var(--color-ldust)] p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)]">Categories</div>
            <div className="text-2xl font-black font-mono text-[var(--color-ink)] mt-1">{CATEGORIES.length}</div>
          </div>
          <div className="rounded-2xl bg-white border border-[var(--color-ldust)] p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)]">Vendors</div>
            <div className="text-2xl font-black font-mono text-[var(--color-ink)] mt-1">{VENDORS.length}</div>
          </div>
          <div className="rounded-2xl bg-white border border-[var(--color-ldust)] p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)]">Books</div>
            <div className="text-2xl font-black font-mono text-[var(--color-ink)] mt-1">{BOOKS.length}</div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-[var(--color-ink)] text-[var(--color-cream)] p-5 border border-black/20">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-amber)] mb-3">Progress log</div>
          <div className="font-mono text-[12px] leading-5 max-h-[420px] overflow-auto whitespace-pre-wrap">
            {logs.length ? logs.join('\n') : 'Click “Run Seed” to begin.'}
          </div>
        </div>
      </div>
    </main>
  )
}

