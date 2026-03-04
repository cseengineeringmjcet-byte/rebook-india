import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    QueryConstraint,
} from 'firebase/firestore'
import { db } from './config'

// ─── BOOKS ───────────────────────────────────────────────

export const getBooks = async () => {
    const snap = await getDocs(
        query(
            collection(db, 'books'),
            where('is_available', '==', true)
        )
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getBookById = async (id: string) => {
    const snap = await getDoc(doc(db, 'books', id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getBooksByCategory = async (categorySlug: string) => {
    if (categorySlug === 'all') return getBooks()
    const snap = await getDocs(
        query(
            collection(db, 'books'),
            where('category_id', '==', categorySlug),
            where('is_available', '==', true),
            orderBy('created_at', 'desc')
        )
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addBook = async (bookData: any) => {
    const prices = calcPrices(bookData.mrp)
    return await addDoc(collection(db, 'books'), {
        ...bookData,
        ...prices,
        views: 0,
        is_available: true,
        is_featured: false,
        created_at: serverTimestamp(),
    })
}

export const updateBook = async (id: string, data: any) => {
    if (data.mrp) {
        const prices = calcPrices(data.mrp)
        data = { ...data, ...prices }
    }
    await updateDoc(doc(db, 'books', id), data)
}

export const deleteBook = async (id: string) => {
    await deleteDoc(doc(db, 'books', id))
}

// Price calculator for Firestore (no generated columns)
export const calcPrices = (mrp: number) => {
    const n = typeof mrp === 'number' ? mrp : Number(mrp)
    return {
        our_price: Math.round(n * 0.5),
        vendor_earn: Math.round(n * 0.4),
        ri_earn: Math.round(n * 0.1),
        savings: Math.round(n * 0.5),
    }
}

// ─── VENDORS ─────────────────────────────────────────────

export const getVendors = async () => {
    const snap = await getDocs(
        query(collection(db, 'vendors'), orderBy('shop_name'))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getVendorById = async (id: string) => {
    const snap = await getDoc(doc(db, 'vendors', id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const addVendor = async (data: any) => {
    return await addDoc(collection(db, 'vendors'), {
        ...data,
        created_at: serverTimestamp(),
    })
}

export const updateVendor = async (id: string, data: any) => {
    await updateDoc(doc(db, 'vendors', id), data)
}

// ─── CATEGORIES ──────────────────────────────────────────

export const getCategories = async () => {
    const snap = await getDocs(
        query(collection(db, 'categories'), orderBy('sort_order'))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── ORDERS ──────────────────────────────────────────────

export const genOrderNumber = () => {
    const d = new Date()
    const yy = d.getFullYear().toString().slice(-2)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `RI${yy}${mm}${dd}${rand}`
}

export const createOrder = async (orderData: any) => {
    const orderNumber = genOrderNumber()
    await setDoc(doc(db, 'orders', orderNumber), {
        ...orderData,
        order_number: orderNumber,
        status: 'placed',
        placed_at: serverTimestamp(),
        confirmed_at: null,
        dispatched_at: null,
        delivered_at: null,
    })
    return orderNumber
}

export const getOrdersByUser = async (userId: string) => {
    const snap = await getDocs(
        query(
            collection(db, 'orders'),
            where('buyer_id', '==', userId),
            orderBy('placed_at', 'desc')
        )
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateOrderStatus = async (
    orderId: string,
    status: string
) => {
    const updates: any = { status }
    if (status === 'confirmed') updates.confirmed_at = serverTimestamp()
    if (status === 'dispatched') updates.dispatched_at = serverTimestamp()
    if (status === 'delivered') updates.delivered_at = serverTimestamp()
    await updateDoc(doc(db, 'orders', orderId), updates)
}

export const getAllOrders = async () => {
    const snap = await getDocs(
        query(collection(db, 'orders'), orderBy('placed_at', 'desc'))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── CART ────────────────────────────────────────────────

export const getCart = async (userId: string) => {
    const snap = await getDocs(
        query(collection(db, 'cart'), where('user_id', '==', userId))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addToCart = async (userId: string, bookId: string) => {
    const existing = await getDocs(
        query(
            collection(db, 'cart'),
            where('user_id', '==', userId),
            where('book_id', '==', bookId)
        )
    )
    if (!existing.empty) return
    await addDoc(collection(db, 'cart'), {
        user_id: userId,
        book_id: bookId,
        added_at: serverTimestamp(),
    })
}

export const removeFromCart = async (cartId: string) => {
    await deleteDoc(doc(db, 'cart', cartId))
}

export const clearCart = async (userId: string) => {
    const snap = await getDocs(
        query(collection(db, 'cart'), where('user_id', '==', userId))
    )
    const deletes = snap.docs.map(d => deleteDoc(d.ref))
    await Promise.all(deletes)
}

// ─── WISHLIST ────────────────────────────────────────────

export const getWishlist = async (userId: string) => {
    const snap = await getDocs(
        query(collection(db, 'wishlist'), where('user_id', '==', userId))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const toggleWishlist = async (userId: string, bookId: string) => {
    const existing = await getDocs(
        query(
            collection(db, 'wishlist'),
            where('user_id', '==', userId),
            where('book_id', '==', bookId)
        )
    )
    if (!existing.empty) {
        await deleteDoc(existing.docs[0].ref)
        return false // removed
    } else {
        await addDoc(collection(db, 'wishlist'), {
            user_id: userId,
            book_id: bookId,
            added_at: serverTimestamp(),
        })
        return true // added
    }
}

// ─── BOOK LISTINGS ───────────────────────────────────────

export const submitListing = async (data: any) => {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    return await addDoc(collection(db, 'book_listings'), {
        ...data,
        status: 'pending',
        reject_reason: null,
        expires_at: Timestamp.fromDate(expiresAt),
        created_at: serverTimestamp(),
    })
}

export const getAllListings = async () => {
    const snap = await getDocs(
        query(collection(db, 'book_listings'), orderBy('created_at', 'desc'))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateListing = async (id: string, data: any) => {
    await updateDoc(doc(db, 'book_listings', id), data)
}

// ─── USERS ───────────────────────────────────────────────

export const createUserDoc = async (uid: string, data: any) => {
    await setDoc(doc(db, 'users', uid), {
        ...data,
        role: 'buyer',
        total_saved: 0,
        created_at: serverTimestamp(),
    })
}

export const getUserDoc = async (uid: string) => {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const updateUserDoc = async (uid: string, data: any) => {
    await updateDoc(doc(db, 'users', uid), data)
}

export const getAllUsers = async () => {
    const snap = await getDocs(
        query(collection(db, 'users'), orderBy('created_at', 'desc'))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── ADDRESSES ───────────────────────────────────────────

export const getAddresses = async (userId: string) => {
    const snap = await getDocs(
        query(collection(db, 'addresses'), where('user_id', '==', userId))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addAddress = async (data: any) => {
    return await addDoc(collection(db, 'addresses'), data)
}

export const deleteAddress = async (id: string) => {
    await deleteDoc(doc(db, 'addresses', id))
}

// ─── NOTIFICATIONS ───────────────────────────────────────

export const getNotifications = async (userId: string) => {
    const snap = await getDocs(
        query(
            collection(db, 'notifications'),
            where('user_id', '==', userId),
            orderBy('created_at', 'desc')
        )
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addNotification = async (data: any) => {
    await addDoc(collection(db, 'notifications'), {
        ...data,
        is_read: false,
        created_at: serverTimestamp(),
    })
}

export const markAllNotificationsRead = async (userId: string) => {
    const snap = await getDocs(
        query(
            collection(db, 'notifications'),
            where('user_id', '==', userId),
            where('is_read', '==', false)
        )
    )
    const updates = snap.docs.map(d => updateDoc(d.ref, { is_read: true }))
    await Promise.all(updates)
}
