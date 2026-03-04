'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import RebookIndiaLogo from '@/components/Logo'
import {
  BookOpen,
  ClipboardList,
  Grid,
  LogOut,
  Settings,
  Store,
  Tag,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

const ADMIN_USER = 'rebookindia'
const ADMIN_PASS = 'RebookAdmin@2025'

const INK = '#1A1208'
const RUST = '#C94A2D'

type SectionId = 'dashboard' | 'orders' | 'listings' | 'books' | 'vendors' | 'users' | 'settings'

type AnyDoc = Record<string, any> & { id: string }

function tsToDate(v: any): Date | null {
  if (!v) return null
  if (typeof v === 'string') {
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (v?.toDate) return (v as Timestamp).toDate()
  if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000)
  return null
}

function money(n: any) {
  const x = typeof n === 'number' ? n : Number(n ?? 0)
  return `₹${Number.isFinite(x) ? x : 0}`
}

function calcPrices(mrp: number) {
  const m = typeof mrp === 'number' ? mrp : Number(mrp)
  return {
    our_price: Math.round(m * 0.5),
    vendor_earn: Math.round(m * 0.4),
    ri_earn: Math.round(m * 0.1),
    savings: Math.round(m * 0.5),
  }
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem('ri_admin_logged_in', 'true')
        onLogin()
        toast.success('Welcome back, Admin!')
      } else {
        setError('Invalid credentials')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: INK }}>
      <div className={`bg-white w-full max-w-[420px] rounded-2xl shadow-2xl p-8 ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <div className="flex justify-center mb-6">
          <RebookIndiaLogo variant="nav" darkBg={false} />
        </div>
        <div className="text-center mb-6">
          <h1 className="font-display font-bold text-2xl text-[var(--color-ink)] mb-1">Admin Panel</h1>
          <p className="font-sans text-[13px] text-[var(--color-dust)]">Rebook India Control Center</p>
        </div>

        <div className="h-[1px] w-12 mx-auto bg-[var(--color-amber)] mb-8" />

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-[var(--color-ldust)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-rust)] focus:outline-none"
              placeholder="Enter admin username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-[var(--color-ldust)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-rust)] focus:outline-none pr-16"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-dust)] font-bold text-xs hover:text-[var(--color-ink)] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 font-bold text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-rust)] hover:bg-[#A93C23] disabled:opacity-60 text-[var(--color-cream)] rounded-xl py-[14px] font-sans font-semibold text-[15px] transition-colors flex justify-center items-center"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[var(--color-dust)]">
          Rebook India © 2025 | Admin Access Only
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
            20%, 40%, 60%, 80% { transform: translateX(6px); }
          }
        `
      }} />
    </div>
  )
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-ldust)] flex items-center justify-between bg-[var(--color-paper)]">
          <div className="font-display font-black text-[20px] text-[var(--color-ink)]">{title}</div>
          <button onClick={onClose} className="p-2 rounded-full border border-[var(--color-ldust)] bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-auto">{children}</div>
      </div>
    </div>
  )
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState<SectionId>('dashboard')
  const [time, setTime] = useState(new Date())

  const [orders, setOrders] = useState<AnyDoc[]>([])
  const [books, setBooks] = useState<AnyDoc[]>([])
  const [vendors, setVendors] = useState<AnyDoc[]>([])
  const [users, setUsers] = useState<AnyDoc[]>([])
  const [categories, setCategories] = useState<AnyDoc[]>([])
  const [listings, setListings] = useState<AnyDoc[]>([])

  // Approve/Reject listing modals
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<AnyDoc | null>(null)
  const [approveVendorId, setApproveVendorId] = useState('')
  const [approveCategoryId, setApproveCategoryId] = useState('')
  const [approveMrp, setApproveMrp] = useState<number>(0)
  const [rejectReason, setRejectReason] = useState('')

  // search and tabs
  const [orderSearch, setOrderSearch] = useState('')
  const [listingTab, setListingTab] = useState('Pending')

  // Book add/edit modal
  const [bookModalOpen, setBookModalOpen] = useState(false)
  const [bookEditing, setBookEditing] = useState<AnyDoc | null>(null)
  const [bookForm, setBookForm] = useState<any>({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    edition: '',
    category_id: '',
    vendor_id: '',
    mrp: 0,
    condition: 'good',
    stock: 1,
    description: '',
    cover_url: '',
    is_featured: false,
    is_available: true,
  })

  // Vendor add/edit modal
  const [vendorModalOpen, setVendorModalOpen] = useState(false)
  const [vendorEditing, setVendorEditing] = useState<AnyDoc | null>(null)
  const [vendorForm, setVendorForm] = useState<any>({
    shop_name: '',
    owner_name: '',
    area: '',
    phone: '',
    badge: 'Verified',
    rating: 4.5,
    shop_image: '',
  })

  // Notification modal (users)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyUser, setNotifyUser] = useState<AnyDoc | null>(null)
  const [notifyMessage, setNotifyMessage] = useState('')

  const usersById = useMemo(() => {
    const m: Record<string, AnyDoc> = {}
    for (const u of users) m[u.id] = u
    return m
  }, [users])

  useEffect(() => {
    const unsubs: Array<() => void> = []

    unsubs.push(onSnapshot(query(collection(db, 'users'), orderBy('created_at', 'desc')), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnyDoc)))
    }, (e) => toast.error(`Users listener error: ${e.message}`)))

    unsubs.push(onSnapshot(query(collection(db, 'vendors'), orderBy('shop_name', 'asc')), (snap) => {
      setVendors(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnyDoc)))
    }, (e) => toast.error(`Vendors listener error: ${e.message}`)))

    unsubs.push(onSnapshot(query(collection(db, 'categories'), orderBy('sort_order', 'asc')), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnyDoc)))
    }, (e) => toast.error(`Categories listener error: ${e.message}`)))

    unsubs.push(onSnapshot(query(collection(db, 'books'), orderBy('created_at', 'desc')), (snap) => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnyDoc)))
    }, (e) => toast.error(`Books listener error: ${e.message}`)))

    // Orders — real time
    unsubs.push(onSnapshot(query(collection(db, 'orders'), orderBy('placed_at', 'desc')), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnyDoc)))
    }, (e) => toast.error(`Orders listener error: ${e.message}`)))

    // Listings — real time
    unsubs.push(onSnapshot(query(collection(db, 'book_listings'), orderBy('created_at', 'desc')), (snap) => {
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnyDoc)))
    }, (e) => toast.error(`Listings listener error: ${e.message}`)))

    const timerId = setInterval(() => setTime(new Date()), 1000)
    return () => {
      unsubs.forEach(u => u())
      clearInterval(timerId)
    }
  }, [])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => (o.status || '').toLowerCase() === 'placed').length
    const totalBooks = books.length
    const totalVendors = vendors.length
    const pendingListings = listings.filter(l => (l.status || '').toLowerCase() === 'pending').length
    const totalUsers = users.length
    return { totalOrders, pendingOrders, totalBooks, totalVendors, pendingListings, totalUsers }
  }, [orders, books, vendors, listings, users])

  const recentOrders = useMemo(() => orders.slice(0, 10), [orders])

  const menu = useMemo(() => ([
    { id: 'dashboard' as const, label: 'Dashboard', icon: <Grid size={20} /> },
    { id: 'orders' as const, label: 'Orders', icon: <ClipboardList size={20} /> },
    { id: 'listings' as const, label: 'Listings', icon: <Tag size={20} /> },
    { id: 'books' as const, label: 'Books', icon: <BookOpen size={20} /> },
    { id: 'vendors' as const, label: 'Vendors', icon: <Store size={20} /> },
    { id: 'users' as const, label: 'Users', icon: <Users size={20} /> },
    { id: 'settings' as const, label: 'Settings', icon: <Settings size={20} /> },
  ]), [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        ...(newStatus === 'confirmed' ? { confirmed_at: serverTimestamp() } : {}),
        ...(newStatus === 'dispatched' ? { dispatched_at: serverTimestamp() } : {}),
        ...(newStatus === 'delivered' ? { delivered_at: serverTimestamp() } : {}),
      })
      toast.success('Order updated')
    } catch (e: any) {
      toast.error(`Failed to update order: ${e.message}`)
    }
  }

  const openApprove = (listing: AnyDoc) => {
    setSelectedListing(listing)
    setApproveVendorId(listing.vendor_id || vendors[0]?.id || '')
    setApproveCategoryId(listing.category_id || listing.category || categories[0]?.id || categories[0]?.slug || '')
    setApproveMrp(Number(listing.mrp || 0))
    setApproveOpen(true)
  }

  const openReject = (listing: AnyDoc) => {
    setSelectedListing(listing)
    setRejectReason('')
    setRejectOpen(true)
  }

  const listingUserId = (l: AnyDoc | null) =>
    (l?.user_id || l?.seller_id || l?.uid || l?.buyer_id || '') as string

  const approveListing = async () => {
    if (!selectedListing) return
    if (!approveVendorId || !approveCategoryId) {
      toast.error('Select vendor and category')
      return
    }
    try {
      const mrp = Number(approveMrp || selectedListing.mrp || 0)
      const bookPayload = {
        title: selectedListing.title || selectedListing.book_title || '',
        author: selectedListing.author || '',
        isbn: selectedListing.isbn || '',
        publisher: selectedListing.publisher || '',
        edition: selectedListing.edition || '',
        category_id: approveCategoryId,
        vendor_id: approveVendorId,
        mrp,
        condition: selectedListing.condition || 'good',
        stock: Number(selectedListing.stock || 1),
        description: selectedListing.description || '',
        cover_url: selectedListing.cover_url || selectedListing.photo_url || selectedListing.photo_1 || '',
        photo_url: selectedListing.photo_url || selectedListing.photo_1 || selectedListing.cover_url || '',
        is_featured: false,
        is_available: true,
        views: 0,
        ...calcPrices(mrp),
        created_at: serverTimestamp(),
      }

      await addDoc(collection(db, 'books'), bookPayload)
      await updateDoc(doc(db, 'book_listings', selectedListing.id), {
        status: 'approved',
        vendor_id: approveVendorId,
        category_id: approveCategoryId,
        mrp,
        approved_at: serverTimestamp(),
      })
      const uid = listingUserId(selectedListing)
      if (uid) {
        await addDoc(collection(db, 'notifications'), {
          user_id: uid,
          title: 'Listing approved',
          message: 'Your book is live!',
          is_read: false,
          created_at: serverTimestamp(),
        })
      }
      toast.success('Listing approved and book created')
      setApproveOpen(false)
      setSelectedListing(null)
    } catch (e: any) {
      toast.error(`Approve failed: ${e.message}`)
    }
  }

  const rejectListing = async () => {
    if (!selectedListing) return
    if (!rejectReason.trim()) {
      toast.error('Reason is required')
      return
    }
    try {
      await updateDoc(doc(db, 'book_listings', selectedListing.id), {
        status: 'rejected',
        reject_reason: rejectReason.trim(),
        rejected_at: serverTimestamp(),
      })
      const uid = listingUserId(selectedListing)
      if (uid) {
        await addDoc(collection(db, 'notifications'), {
          user_id: uid,
          title: 'Listing rejected',
          message: rejectReason.trim(),
          is_read: false,
          created_at: serverTimestamp(),
        })
      }
      toast.success('Listing rejected')
      setRejectOpen(false)
      setSelectedListing(null)
    } catch (e: any) {
      toast.error(`Reject failed: ${e.message}`)
    }
  }

  const openAddBook = () => {
    setBookEditing(null)
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      edition: '',
      category_id: categories[0]?.slug || categories[0]?.id || '',
      vendor_id: vendors[0]?.id || '',
      mrp: 0,
      condition: 'good',
      stock: 1,
      description: '',
      cover_url: '',
      is_featured: false,
      is_available: true,
    })
    setBookModalOpen(true)
  }

  const openEditBook = (b: AnyDoc) => {
    setBookEditing(b)
    setBookForm({
      title: b.title || '',
      author: b.author || '',
      isbn: b.isbn || '',
      publisher: b.publisher || '',
      edition: b.edition || '',
      category_id: b.category_id || '',
      vendor_id: b.vendor_id || '',
      mrp: Number(b.mrp || 0),
      condition: b.condition || 'good',
      stock: Number(b.stock || 1),
      description: b.description || '',
      cover_url: b.cover_url || '',
      is_featured: !!b.is_featured,
      is_available: b.is_available ?? true,
    })
    setBookModalOpen(true)
  }

  const saveBook = async () => {
    const mrp = Number(bookForm.mrp || 0)
    if (!bookForm.title || !mrp) {
      toast.error('Title and MRP are required')
      return
    }
    const payload = {
      ...bookForm,
      mrp,
      stock: Number(bookForm.stock || 1),
      ...calcPrices(mrp),
    }
    try {
      if (bookEditing) {
        await updateDoc(doc(db, 'books', bookEditing.id), payload)
        toast.success('Book updated')
      } else {
        await addDoc(collection(db, 'books'), {
          ...payload,
          views: 0,
          created_at: serverTimestamp(),
        })
        toast.success('Book added')
      }
      setBookModalOpen(false)
      setBookEditing(null)
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`)
    }
  }

  const deleteBook = async (b: AnyDoc) => {
    if (!confirm(`Delete "${b.title}"?`)) return
    try {
      await deleteDoc(doc(db, 'books', b.id))
      toast.success('Book deleted')
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message}`)
    }
  }

  const toggleBookField = async (bookId: string, field: 'is_featured' | 'is_available', next: boolean) => {
    try {
      await updateDoc(doc(db, 'books', bookId), { [field]: next })
    } catch (e: any) {
      toast.error(`Update failed: ${e.message}`)
    }
  }

  const openAddVendor = () => {
    setVendorEditing(null)
    setVendorForm({
      shop_name: '',
      owner_name: '',
      area: '',
      phone: '',
      badge: 'Verified',
      rating: 4.5,
      shop_image: '',
    })
    setVendorModalOpen(true)
  }

  const openEditVendor = (v: AnyDoc) => {
    setVendorEditing(v)
    setVendorForm({
      shop_name: v.shop_name || '',
      owner_name: v.owner_name || '',
      area: v.area || '',
      phone: v.phone || '',
      badge: v.badge || 'Verified',
      rating: Number(v.rating || 4.5),
      shop_image: v.shop_image || '',
    })
    setVendorModalOpen(true)
  }

  const saveVendor = async () => {
    if (!vendorForm.shop_name) {
      toast.error('Shop name is required')
      return
    }
    try {
      if (vendorEditing) {
        await updateDoc(doc(db, 'vendors', vendorEditing.id), vendorForm)
        toast.success('Vendor updated')
      } else {
        await addDoc(collection(db, 'vendors'), { ...vendorForm, created_at: serverTimestamp() })
        toast.success('Vendor added')
      }
      setVendorModalOpen(false)
      setVendorEditing(null)
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`)
    }
  }

  const updateVendorBadge = async (vendorId: string, badge: string) => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId), { badge })
      toast.success('Badge updated')
    } catch (e: any) {
      toast.error(`Badge update failed: ${e.message}`)
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role })
      toast.success('Role updated')
    } catch (e: any) {
      toast.error(`Role update failed: ${e.message}`)
    }
  }

  const sendNotification = async () => {
    if (!notifyUser) return
    if (!notifyMessage.trim()) {
      toast.error('Message required')
      return
    }
    try {
      await addDoc(collection(db, 'notifications'), {
        user_id: notifyUser.id,
        title: 'Message from Rebook India',
        message: notifyMessage.trim(),
        is_read: false,
        created_at: serverTimestamp(),
      })
      toast.success('Notification sent')
      setNotifyOpen(false)
      setNotifyUser(null)
      setNotifyMessage('')
    } catch (e: any) {
      toast.error(`Send failed: ${e.message}`)
    }
  }

  const exportCsv = (rows: Record<string, any>[], filename: string) => {
    if (!rows.length) return toast.error('Nothing to export')
    const headers = Object.keys(rows[0])
    const escape = (v: any) => {
      const s = String(v ?? '')
      return `"${s.replaceAll('"', '""')}"`
    }
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const clearCollection = async (name: string) => {
    if (!confirm(`Clear ALL documents in "${name}"?`)) return
    try {
      const snap = await getDocs(collection(db, name))
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
      toast.success(`${name} cleared`)
    } catch (e: any) {
      toast.error(`Clear failed: ${e.message}`)
    }
  }

  const pricesPreview = useMemo(() => calcPrices(Number(bookForm.mrp || 0)), [bookForm.mrp])
  const approvePreview = useMemo(() => calcPrices(Number(approveMrp || 0)), [approveMrp])

  const pendingListings = useMemo(() => listings.filter(l => (l.status || '').toLowerCase() === 'pending'), [listings])

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-[var(--color-cream)]">
      {/* LEFT SIDEBAR */}
      <aside className="w-[260px] h-full flex flex-col shrink-0 flex-none z-20 shadow-xl" style={{ background: INK }}>
        <div className="p-6">
          <RebookIndiaLogo variant="nav" darkBg />
          <div className="text-[var(--color-amber)] text-[11px] font-bold uppercase tracking-widest mt-2">Admin Panel</div>
          <div className="h-[1px] w-full bg-[var(--color-amber)]/20 mt-4" />
        </div>

        <nav className="flex flex-col gap-1 mt-2 flex-1 overflow-y-auto w-full px-2">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-3 px-4 py-3 mx-2 font-bold transition-all duration-200 ${active === item.id
                ? 'text-white rounded-r-xl border-l-[4px] border-[#E8A020]'
                : 'text-[var(--color-ldust)] hover:bg-white/5 hover:text-white rounded-xl'
                }`}
              style={active === item.id ? { background: RUST } : undefined}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-6 py-4">
          <div className="h-[1px] w-full bg-white/10 mb-4" />
          <div className="mb-4">
            <div className="text-white font-bold">{ADMIN_USER}</div>
            <div className="text-[var(--color-dust)] text-xs">Administrator</div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 border"
            style={{ borderColor: 'rgba(201,74,45,0.35)', color: RUST }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = RUST; (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = RUST }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--color-cream)]">
        <header className="sticky top-0 bg-[var(--color-paper)] border-b border-[var(--color-ldust)] px-6 py-4 z-10 flex justify-between items-center shrink-0">
          <h1 className="font-display font-black text-[22px] text-[var(--color-ink)] capitalize">{active}</h1>
          <div className="flex items-center gap-6 text-sm font-bold text-[var(--color-dust)]">
            <div>
              {time.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} • {time.toLocaleTimeString('en-IN')}
            </div>
            <div>
              Pending listings: <span className="font-mono text-[var(--color-rust)]">{stats.pendingListings}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* DASHBOARD */}
          {active === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 text-white" style={{ background: INK }}>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-70">Total Orders</div>
                  <div className="text-4xl font-black font-mono text-[var(--color-amber)] mt-1">{stats.totalOrders}</div>
                </div>
                <div className="rounded-2xl p-5 bg-yellow-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-yellow-800">Pending Orders</div>
                  <div className="text-4xl font-black font-mono text-yellow-700 mt-1">{stats.pendingOrders}</div>
                </div>
                <div className="rounded-2xl p-5 text-white bg-[var(--color-sage)]">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80">Total Books</div>
                  <div className="text-4xl font-black font-mono mt-1">{stats.totalBooks}</div>
                </div>
                <div className="rounded-2xl p-5 bg-white border border-[var(--color-ldust)]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)]">Total Vendors</div>
                  <div className="text-4xl font-black font-mono text-[var(--color-ink)] mt-1">{stats.totalVendors}</div>
                </div>
                <div className="rounded-2xl p-5 text-white" style={{ background: stats.pendingListings > 0 ? RUST : '#ffffff' }}>
                  <div className={`text-xs font-bold uppercase tracking-wider ${stats.pendingListings > 0 ? 'opacity-90' : 'text-[var(--color-dust)]'}`}>Pending Listings</div>
                  <div className={`text-4xl font-black font-mono mt-1 ${stats.pendingListings > 0 ? 'text-white' : 'text-[var(--color-ink)]'}`}>{stats.pendingListings}</div>
                </div>
                <div className="rounded-2xl p-5 bg-amber-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800">Total Users</div>
                  <div className="text-4xl font-black font-mono text-amber-700 mt-1">{stats.totalUsers}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[var(--color-ldust)] overflow-hidden">
                <div className="px-5 py-4 bg-[var(--color-paper)] border-b border-[var(--color-ldust)] font-bold">Recent 10 Orders</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-[var(--color-dust)] border-b border-[var(--color-ldust)]">
                      <tr>
                        <th className="px-5 py-3">Order#</th>
                        <th className="px-5 py-3">Buyer</th>
                        <th className="px-5 py-3">Book</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-ldust)]">
                      {recentOrders.map(o => {
                        const buyer = usersById[o.buyer_id]?.full_name || o.delivery_name || 'Guest'
                        const dt = tsToDate(o.placed_at) || new Date()
                        return (
                          <tr key={o.id} className="hover:bg-[var(--color-paper)]">
                            <td className="px-5 py-3 font-mono font-bold text-[var(--color-rust)]">{o.order_number || o.id}</td>
                            <td className="px-5 py-3 font-bold text-[var(--color-ink)]">{buyer}</td>
                            <td className="px-5 py-3">{o.book_title || o.title || '-'}</td>
                            <td className="px-5 py-3 font-mono font-bold text-[var(--color-sage)]">{money(o.price_paid ?? o.our_price ?? o.amount)}</td>
                            <td className="px-5 py-3">{o.status || '-'}</td>
                            <td className="px-5 py-3 text-xs text-[var(--color-dust)]">{dt.toLocaleString('en-IN')}</td>
                          </tr>
                        )
                      })}
                      {!recentOrders.length && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-[var(--color-dust)]">No orders yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS (REAL TIME) */}
          {active === 'orders' && (
            <div className="bg-white rounded-2xl border border-[var(--color-ldust)] overflow-hidden max-w-7xl mx-auto">
              <div className="px-5 py-4 bg-[var(--color-paper)] border-b border-[var(--color-ldust)] flex items-center justify-between">
                <span className="font-bold">Orders (real time)</span>
                <input
                  type="text"
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  placeholder="Search by order# or buyer..."
                  className="border border-[var(--color-ldust)] rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-[var(--color-rust)]"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[11px] uppercase tracking-wider text-[var(--color-dust)] border-b border-[var(--color-ldust)]">
                    <tr>
                      <th className="px-5 py-3">Order#</th>
                      <th className="px-5 py-3">Buyer</th>
                      <th className="px-5 py-3">Book</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-ldust)]">
                    {orders.filter(o => {
                      if (!orderSearch) return true;
                      const q = orderSearch.toLowerCase()
                      const b = (usersById[o.buyer_id]?.full_name || o.delivery_name || '').toLowerCase()
                      const n = (o.order_number || o.id || '').toLowerCase()
                      return b.includes(q) || n.includes(q)
                    }).map(o => {
                      const buyer = usersById[o.buyer_id]?.full_name || o.delivery_name || 'Guest'
                      const dt = tsToDate(o.placed_at) || new Date()
                      const status = (o.status || 'placed').toLowerCase()
                      return (
                        <tr key={o.id} className="hover:bg-[var(--color-paper)]">
                          <td className="px-5 py-3 font-mono font-bold text-[var(--color-rust)]">{o.order_number || o.id}</td>
                          <td className="px-5 py-3">
                            <div className="font-bold text-[var(--color-ink)]">{buyer}</div>
                            <div className="text-xs text-[var(--color-dust)]">{usersById[o.buyer_id]?.phone || o.delivery_phone || ''}</div>
                          </td>
                          <td className="px-5 py-3">{o.book_title || o.title || '-'}</td>
                          <td className="px-5 py-3 font-mono font-bold text-[var(--color-sage)]">{money(o.price_paid ?? o.our_price ?? o.amount)}</td>
                          <td className="px-5 py-3">
                            <select
                              value={status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className="text-xs font-bold uppercase rounded-full px-3 py-1.5 bg-[var(--color-ink)] text-white"
                            >
                              <option value="placed">placed</option>
                              <option value="confirmed">confirmed</option>
                              <option value="dispatched">dispatched</option>
                              <option value="delivered">delivered</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                          <td className="px-5 py-3 text-xs text-[var(--color-dust)]">{dt.toLocaleString('en-IN')}</td>
                        </tr>
                      )
                    })}
                    {!orders.length && (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-[var(--color-dust)]">No orders yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LISTINGS (REAL TIME) */}
          {active === 'listings' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl border border-[var(--color-ldust)] overflow-hidden">
                <div className="px-5 py-3 bg-[var(--color-paper)] border-b border-[var(--color-ldust)] flex items-center justify-between">
                  <span className="font-bold">Listings (real time)</span>
                  <div className="flex bg-[var(--color-cream)] rounded-lg p-1 border border-[var(--color-ldust)]">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(t => (
                      <button
                        key={t}
                        onClick={() => setListingTab(t)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${listingTab === t ? 'bg-[var(--color-ink)] text-white' : 'text-[var(--color-dust)] hover:text-[var(--color-ink)]'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-[var(--color-dust)] border-b border-[var(--color-ldust)]">
                      <tr>
                        <th className="px-5 py-3 w-16">Photo</th>
                        <th className="px-5 py-3">Book</th>
                        <th className="px-5 py-3">Seller</th>
                        <th className="px-5 py-3">MRP</th>
                        <th className="px-5 py-3">Area</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-ldust)]">
                      {listings.filter(l => {
                        if (listingTab === 'All') return true
                        return (l.status || 'pending').toLowerCase() === listingTab.toLowerCase()
                      }).map(l => (
                        <tr key={l.id} className="hover:bg-[var(--color-paper)]">
                          <td className="px-5 py-3">
                            <img src={l.cover_url || l.photo_url || l.photo_1 || 'https://via.placeholder.com/60?text=No+Photo'} className="w-12 h-16 object-cover rounded shadow border border-[var(--color-ldust)] bg-[#D4C5A9]/20" alt="student-upload" />
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-bold text-[var(--color-ink)]">{l.title || '-'}</div>
                            <div className="text-xs text-[var(--color-dust)]">{l.author || ''}</div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-bold text-[var(--color-ink)]">{usersById[listingUserId(l)]?.full_name || l.seller_name || 'Seller'}</div>
                            <div className="text-xs text-[var(--color-dust)]">{usersById[listingUserId(l)]?.phone || l.phone || ''}</div>
                          </td>
                          <td className="px-5 py-3 font-mono font-bold text-[var(--color-sage)]">{money(l.mrp)}</td>
                          <td className="px-5 py-3">{l.area || '-'}</td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-2 items-center">
                              {(l.status || 'pending').toLowerCase() === 'pending' && (
                                <>
                                  <button onClick={() => openApprove(l)} className="px-3 py-2 rounded-xl text-white font-bold text-xs" style={{ background: '#16a34a' }}>Approve</button>
                                  <button onClick={() => openReject(l)} className="px-3 py-2 rounded-xl text-white font-bold text-xs" style={{ background: '#ef4444' }}>Reject</button>
                                </>
                              )}
                              {(l.status || '').toLowerCase() !== 'pending' && (
                                <span className={`text-xs font-bold uppercase ${l.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{l.status}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!listings.filter(l => listingTab === 'All' || (l.status || 'pending').toLowerCase() === listingTab.toLowerCase()).length && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-[var(--color-dust)]">No listings found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <Modal open={approveOpen} title="Approve listing" onClose={() => setApproveOpen(false)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex justify-center mb-2">
                    <img src={selectedListing?.photo_url || selectedListing?.cover_url || selectedListing?.photo_1 || 'https://via.placeholder.com/300?text=No+Photo'} className="h-48 object-contain bg-slate-100 border border-slate-200 rounded-lg p-2 shadow-sm" alt="Student Upload" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Vendor</div>
                    <select value={approveVendorId} onChange={e => setApproveVendorId(e.target.value)} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm">
                      <option value="">Select vendor</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.shop_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Category</div>
                    <select value={approveCategoryId} onChange={e => setApproveCategoryId(e.target.value)} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.slug ?? c.id}>{c.name ?? c.slug ?? c.id}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">MRP</div>
                    <input type="number" value={approveMrp} onChange={e => setApproveMrp(Number(e.target.value))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm" />
                  </div>
                  <div className="rounded-2xl bg-[var(--color-paper)] border border-[var(--color-ldust)] p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Live calculations</div>
                    <div className="font-mono text-sm space-y-1">
                      <div>Our Price: <span className="font-black text-[var(--color-sage)]">{money(approvePreview.our_price)}</span></div>
                      <div>Vendor Earns: <span className="font-black">{money(approvePreview.vendor_earn)}</span></div>
                      <div>Rebook Earns: <span className="font-black">{money(approvePreview.ri_earn)}</span></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setApproveOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--color-ldust)] font-bold">Cancel</button>
                  <button onClick={approveListing} className="px-4 py-2 rounded-xl text-white font-bold" style={{ background: RUST }}>Confirm Approve</button>
                </div>
              </Modal>

              <Modal open={rejectOpen} title="Reject listing" onClose={() => setRejectOpen(false)}>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Reason (required)</div>
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm min-h-[140px]" />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setRejectOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--color-ldust)] font-bold">Cancel</button>
                  <button onClick={rejectListing} className="px-4 py-2 rounded-xl text-white font-bold" style={{ background: '#ef4444' }}>Confirm Reject</button>
                </div>
              </Modal>
            </div>
          )}

          {/* BOOKS (REAL TIME) */}
          {active === 'books' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-display font-black text-2xl text-[var(--color-ink)]">Books</div>
                  <div className="text-sm text-[var(--color-dust)]">{books.length} total</div>
                </div>
                <button onClick={openAddBook} className="px-4 py-3 rounded-xl text-white font-bold" style={{ background: RUST }}>Add Book</button>
              </div>

              <div className="bg-white rounded-2xl border border-[var(--color-ldust)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-[11px] uppercase tracking-wider text-[var(--color-dust)] border-b border-[var(--color-ldust)]">
                      <tr>
                        <th className="px-5 py-3 w-16">Cover</th>
                        <th className="px-5 py-3">Title</th>
                        <th className="px-5 py-3">ISBN</th>
                        <th className="px-5 py-3">MRP</th>
                        <th className="px-5 py-3">Featured</th>
                        <th className="px-5 py-3">Available</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-ldust)]">
                      {books.map(b => {
                        const cover = b.photo_url || b.cover_url || (b.isbn ? `https://covers.openlibrary.org/b/isbn/${b.isbn}-S.jpg` : 'https://via.placeholder.com/60?text=No+Cover')
                        return (
                          <tr key={b.id} className="hover:bg-[var(--color-paper)]">
                            <td className="px-5 py-3">
                              <img src={cover} className="w-10 h-14 object-cover rounded shadow-sm border border-[var(--color-ldust)] bg-[#D4C5A9]/20" alt="cover" />
                            </td>
                            <td className="px-5 py-3">
                              <div className="font-bold text-[var(--color-ink)]">{b.title}</div>
                              <div className="text-xs text-[var(--color-dust)]">{b.author}</div>
                            </td>
                            <td className="px-5 py-3 font-mono text-xs">{b.isbn || '-'}</td>
                            <td className="px-5 py-3 font-mono font-bold text-[var(--color-sage)]">{money(b.mrp)}</td>
                            <td className="px-5 py-3">
                              <input type="checkbox" checked={!!b.is_featured} onChange={(e) => toggleBookField(b.id, 'is_featured', e.target.checked)} />
                            </td>
                            <td className="px-5 py-3">
                              <input type="checkbox" checked={b.is_available ?? true} onChange={(e) => toggleBookField(b.id, 'is_available', e.target.checked)} />
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => openEditBook(b)} className="px-3 py-2 rounded-xl border border-[var(--color-ldust)] font-bold text-xs">Edit</button>
                                <button onClick={() => deleteBook(b)} className="px-3 py-2 rounded-xl text-white font-bold text-xs" style={{ background: '#ef4444' }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {!books.length && (
                        <tr><td colSpan={7} className="px-5 py-10 text-center text-[var(--color-dust)]">No books yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <Modal open={bookModalOpen} title={bookEditing ? 'Edit book' : 'Add book'} onClose={() => setBookModalOpen(false)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['Title', 'title'],
                    ['Author', 'author'],
                    ['ISBN', 'isbn'],
                    ['Publisher', 'publisher'],
                    ['Edition', 'edition'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">{label}</div>
                      <input value={bookForm[key]} onChange={(e) => setBookForm((p: any) => ({ ...p, [key]: e.target.value }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm" />
                    </div>
                  ))}

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Category</div>
                    <select value={bookForm.category_id} onChange={(e) => setBookForm((p: any) => ({ ...p, category_id: e.target.value }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm">
                      {categories.map(c => <option key={c.id} value={c.slug ?? c.id}>{c.name ?? c.slug ?? c.id}</option>)}
                    </select>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Vendor</div>
                    <select value={bookForm.vendor_id} onChange={(e) => setBookForm((p: any) => ({ ...p, vendor_id: e.target.value }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm">
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.shop_name}</option>)}
                    </select>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">MRP</div>
                    <input type="number" value={bookForm.mrp} onChange={(e) => setBookForm((p: any) => ({ ...p, mrp: Number(e.target.value) }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm" />
                  </div>

                  <div className="rounded-2xl bg-[var(--color-paper)] border border-[var(--color-ldust)] p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Live calculations</div>
                    <div className="font-mono text-sm space-y-1">
                      <div>Our Price: <span className="font-black text-[var(--color-sage)]">{money(pricesPreview.our_price)}</span></div>
                      <div>Vendor Earns: <span className="font-black">{money(pricesPreview.vendor_earn)}</span></div>
                      <div>Rebook Earns: <span className="font-black">{money(pricesPreview.ri_earn)}</span></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Condition</div>
                    <select value={bookForm.condition} onChange={(e) => setBookForm((p: any) => ({ ...p, condition: e.target.value }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm">
                      <option value="like_new">like_new</option>
                      <option value="good">good</option>
                      <option value="fair">fair</option>
                      <option value="poor">poor</option>
                    </select>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Stock</div>
                    <input type="number" value={bookForm.stock} onChange={(e) => setBookForm((p: any) => ({ ...p, stock: Number(e.target.value) }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm" />
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Description</div>
                    <textarea value={bookForm.description} onChange={(e) => setBookForm((p: any) => ({ ...p, description: e.target.value }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm min-h-[100px]" />
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Cover URL</div>
                    <input value={bookForm.cover_url} onChange={(e) => setBookForm((p: any) => ({ ...p, cover_url: e.target.value }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm" />
                  </div>

                  <div className="flex items-center gap-3">
                    <input id="featured" type="checkbox" checked={!!bookForm.is_featured} onChange={(e) => setBookForm((p: any) => ({ ...p, is_featured: e.target.checked }))} />
                    <label htmlFor="featured" className="font-bold text-sm text-[var(--color-ink)]">Is Featured</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input id="available" type="checkbox" checked={bookForm.is_available ?? true} onChange={(e) => setBookForm((p: any) => ({ ...p, is_available: e.target.checked }))} />
                    <label htmlFor="available" className="font-bold text-sm text-[var(--color-ink)]">Is Available</label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setBookModalOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--color-ldust)] font-bold">Cancel</button>
                  <button onClick={saveBook} className="px-4 py-2 rounded-xl text-white font-bold" style={{ background: RUST }}>{bookEditing ? 'Save changes' : 'Add book'}</button>
                </div>
              </Modal>
            </div>
          )}

          {/* VENDORS */}
          {active === 'vendors' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-display font-black text-2xl text-[var(--color-ink)]">Vendors</div>
                  <div className="text-sm text-[var(--color-dust)]">{vendors.length} total</div>
                </div>
                <button onClick={openAddVendor} className="px-4 py-3 rounded-xl text-white font-bold" style={{ background: RUST }}>Add Vendor</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vendors.map(v => (
                  <div key={v.id} className="bg-white rounded-2xl border border-[var(--color-ldust)] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.shop_image || 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900'} alt={v.shop_name} className="w-full h-[140px] object-cover" />
                    <div className="p-4">
                      <div className="font-bold text-[var(--color-ink)]">{v.shop_name}</div>
                      <div className="text-xs text-[var(--color-dust)] mt-1">📍 {v.area || '-'}</div>
                      <div className="text-xs text-[var(--color-sage)] mt-1 font-bold">⭐ {v.rating || 4.5} • {v.badge || 'Verified'}</div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <select value={v.badge || 'Verified'} onChange={(e) => updateVendorBadge(v.id, e.target.value)} className="border border-[var(--color-ldust)] rounded-xl px-3 py-2 text-xs font-bold">
                          {['Verified', 'Top Rated', 'Fast Pickup', 'Best Deals'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={() => openEditVendor(v)} className="px-3 py-2 rounded-xl border border-[var(--color-ldust)] font-bold text-xs">Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!vendors.length && (
                  <div className="text-[var(--color-dust)]">No vendors yet.</div>
                )}
              </div>

              <Modal open={vendorModalOpen} title={vendorEditing ? 'Edit vendor' : 'Add vendor'} onClose={() => setVendorModalOpen(false)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['Shop Name', 'shop_name'],
                    ['Owner Name', 'owner_name'],
                    ['Area', 'area'],
                    ['Phone', 'phone'],
                    ['Shop Image URL', 'shop_image'],
                  ].map(([label, key]) => (
                    <div key={key} className={key === 'shop_image' ? 'md:col-span-2' : ''}>
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">{label}</div>
                      <input value={vendorForm[key]} onChange={(e) => setVendorForm((p: any) => ({ ...p, [key]: e.target.value }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm" />
                    </div>
                  ))}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Badge</div>
                    <select value={vendorForm.badge} onChange={(e) => setVendorForm((p: any) => ({ ...p, badge: e.target.value }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm">
                      {['Verified', 'Top Rated', 'Fast Pickup', 'Best Deals'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Rating</div>
                    <input type="number" step="0.1" value={vendorForm.rating} onChange={(e) => setVendorForm((p: any) => ({ ...p, rating: Number(e.target.value) }))} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setVendorModalOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--color-ldust)] font-bold">Cancel</button>
                  <button onClick={saveVendor} className="px-4 py-2 rounded-xl text-white font-bold" style={{ background: RUST }}>{vendorEditing ? 'Save changes' : 'Add vendor'}</button>
                </div>
              </Modal>
            </div>
          )}

          {/* USERS */}
          {active === 'users' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-display font-black text-2xl text-[var(--color-ink)]">Users</div>
                  <div className="text-sm text-[var(--color-dust)]">{users.length} total</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[var(--color-ldust)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-[var(--color-dust)] border-b border-[var(--color-ldust)]">
                      <tr>
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Joined</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-ldust)]">
                      {users.map(u => {
                        const dt = tsToDate(u.created_at)
                        return (
                          <tr key={u.id} className="hover:bg-[var(--color-paper)]">
                            <td className="px-5 py-3">
                              <div className="font-bold text-[var(--color-ink)]">{u.full_name || 'User'}</div>
                              <div className="text-xs text-[var(--color-dust)]">{u.phone || ''}</div>
                            </td>
                            <td className="px-5 py-3 text-[var(--color-dust)]">{u.email || ''}</td>
                            <td className="px-5 py-3">
                              <select value={u.role || 'buyer'} onChange={(e) => updateUserRole(u.id, e.target.value)} className="border border-[var(--color-ldust)] rounded-xl px-3 py-2 text-xs font-bold uppercase">
                                <option value="buyer">buyer</option>
                                <option value="seller">seller</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td className="px-5 py-3 text-xs text-[var(--color-dust)]">{dt ? dt.toLocaleDateString('en-IN') : '-'}</td>
                            <td className="px-5 py-3">
                              <div className="flex justify-end">
                                <button
                                  onClick={() => { setNotifyUser(u); setNotifyMessage(''); setNotifyOpen(true) }}
                                  className="px-3 py-2 rounded-xl text-white font-bold text-xs"
                                  style={{ background: INK }}
                                >
                                  Send notification
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {!users.length && (
                        <tr><td colSpan={5} className="px-5 py-10 text-center text-[var(--color-dust)]">No users yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <Modal open={notifyOpen} title="Send notification" onClose={() => setNotifyOpen(false)}>
                <div className="text-sm text-[var(--color-dust)] mb-3">
                  To: <span className="font-bold text-[var(--color-ink)]">{notifyUser?.full_name || notifyUser?.email || notifyUser?.id}</span>
                </div>
                <textarea value={notifyMessage} onChange={(e) => setNotifyMessage(e.target.value)} className="w-full border border-[var(--color-ldust)] rounded-xl px-3 py-3 text-sm min-h-[140px]" placeholder="Type message..." />
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setNotifyOpen(false)} className="px-4 py-2 rounded-xl border border-[var(--color-ldust)] font-bold">Cancel</button>
                  <button onClick={sendNotification} className="px-4 py-2 rounded-xl text-white font-bold" style={{ background: RUST }}>Send</button>
                </div>
              </Modal>
            </div>
          )}

          {/* SETTINGS */}
          {active === 'settings' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl border border-[var(--color-ldust)] p-6">
                <div className="font-display font-black text-xl text-[var(--color-ink)]">Database stats</div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-[var(--color-paper)] border border-[var(--color-ldust)] p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)]">Orders</div>
                    <div className="font-mono font-black text-2xl text-[var(--color-ink)]">{stats.totalOrders}</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-paper)] border border-[var(--color-ldust)] p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)]">Books</div>
                    <div className="font-mono font-black text-2xl text-[var(--color-ink)]">{stats.totalBooks}</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-paper)] border border-[var(--color-ldust)] p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)]">Users</div>
                    <div className="font-mono font-black text-2xl text-[var(--color-ink)]">{stats.totalUsers}</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-paper)] border border-[var(--color-ldust)] p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-dust)]">Vendors</div>
                    <div className="font-mono font-black text-2xl text-[var(--color-ink)]">{stats.totalVendors}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[var(--color-ldust)] p-6 space-y-4">
                <div className="font-display font-black text-xl text-[var(--color-ink)]">Export CSV</div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-4 py-2 rounded-xl text-white font-bold"
                    style={{ background: INK }}
                    onClick={() => exportCsv(orders.map(o => ({
                      order_number: o.order_number || o.id,
                      buyer: usersById[o.buyer_id]?.full_name || o.delivery_name || '',
                      book: o.book_title || '',
                      amount: o.price_paid ?? o.amount ?? '',
                      status: o.status || '',
                      placed_at: tsToDate(o.placed_at)?.toISOString() || '',
                    })), 'orders.csv')}
                  >
                    Export Orders
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl text-white font-bold"
                    style={{ background: INK }}
                    onClick={() => exportCsv(books.map(b => ({
                      title: b.title,
                      author: b.author,
                      isbn: b.isbn,
                      mrp: b.mrp,
                      our_price: b.our_price,
                      category_id: b.category_id,
                      vendor_id: b.vendor_id,
                      is_available: b.is_available,
                      is_featured: b.is_featured,
                    })), 'books.csv')}
                  >
                    Export Books
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl text-white font-bold"
                    style={{ background: INK }}
                    onClick={() => exportCsv(users.map(u => ({
                      full_name: u.full_name,
                      email: u.email,
                      phone: u.phone,
                      role: u.role,
                      created_at: tsToDate(u.created_at)?.toISOString() || '',
                    })), 'users.csv')}
                  >
                    Export Users
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[var(--color-ldust)] p-6 space-y-4">
                <div className="font-display font-black text-xl text-[var(--color-ink)]">Maintenance</div>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 rounded-xl font-bold border border-[var(--color-ldust)]" onClick={() => clearCollection('cart')}>Clear cart</button>
                  <button className="px-4 py-2 rounded-xl font-bold border border-[var(--color-ldust)]" onClick={() => clearCollection('wishlist')}>Clear wishlist</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const v = sessionStorage.getItem('ri_admin_logged_in')
    setLoggedIn(v === 'true')
    setLoading(false)
  }, [])

  if (loading) return null

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />
  }

  return (
    <AdminDashboard onLogout={() => {
      sessionStorage.removeItem('ri_admin_logged_in')
      setLoggedIn(false)
      toast.success('Logged out')
    }} />
  )
}

