'use client'

import React, { useEffect, useState } from 'react'
import { useDataStore } from '@/store/useDataStore'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

// Firebase config directly here to ensure NO environment issues globally
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

const mapBooks = (arr: any[]) => arr.map(d => ({
    ...d,
    category: d.category_id || d.category || 'default',
    vendorId: d.vendor_id || d.vendorId || '',
    ourPrice: d.our_price || d.ourPrice || 0,
    vendorEarn: d.vendor_earn || d.vendorEarn || 0,
    isAvailable: d.is_available ?? d.isAvailable ?? true,
    coverUrl: d.cover_url || d.coverUrl || '',
    condition: d.condition || 'good',
}));

const mapVendors = (arr: any[]) => arr.map(d => ({
    ...d,
    shopName: d.shop_name || d.shopName || '',
    ownerName: d.owner_name || d.ownerName || '',
    upiId: d.upi_id || d.upiId || '',
    shopImage: d.shop_image || d.shopImage || '',
}));

export default function FirebaseDataLoader({
    books: initialBooks = [],
    vendors: initialVendors = [],
    children
}: {
    books?: any[],
    vendors?: any[],
    children: React.ReactNode
}) {
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        // If the server-side gave us books, use them directly
        if (initialBooks.length > 0) {
            useDataStore.getState().setFirebaseData(mapBooks(initialBooks), mapVendors(initialVendors))
            return
        }

        // If not (e.g., missing FIREBASE_PRIVATE_KEY), fetch directly from client
        if (useDataStore.getState().books.length === 0 && !fetching) {
            setFetching(true)
            Promise.all([
                getDocs(query(collection(db, 'books'), where('is_available', '==', true))),
                getDocs(collection(db, 'vendors'))
            ]).then(([bSnap, vSnap]) => {
                const bData = bSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                const vData = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                useDataStore.getState().setFirebaseData(mapBooks(bData as any), mapVendors(vData as any));
            }).catch(err => {
                console.error("Firebase Client Fetch Error:", err)
            }).finally(() => {
                setFetching(false)
            });
        }
    }, [initialBooks, initialVendors, fetching])

    return <>{children}</>
}
