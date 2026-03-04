import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App | null = null

try {
    if (!getApps().length) {
        if (process.env.FIREBASE_PRIVATE_KEY) {
            adminApp = initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            })
        }
    } else {
        adminApp = getApps()[0]
    }
} catch (e) {
    console.error("Firebase Admin initialization error", e)
}

export const adminDb = adminApp ? getFirestore(adminApp) : null
export const adminAuth = adminApp ? getAuth(adminApp) : null

export async function getAdminBooks() {
    if (!adminDb) return []
    try {
        const snap = await adminDb.collection('books').orderBy('created_at', 'desc').get()
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error("Firebase Admin Error getAdminBooks:", e)
        return []
    }
}

export async function getAdminVendors() {
    if (!adminDb) return []
    try {
        const snap = await adminDb.collection('vendors').orderBy('shop_name').get()
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (e) {
        console.error("Firebase Admin Error getAdminVendors:", e)
        return []
    }
}
