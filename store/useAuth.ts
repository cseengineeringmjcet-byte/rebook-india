'use client'
import { create } from 'zustand'
import { onAuthChange } from '@/lib/firebase/auth'
import { getUserDoc } from '@/lib/firebase/firestore'

interface AuthStore {
    user: any | null
    userDoc: any | null
    isLoggedIn: boolean
    isLoading: boolean
    setUser: (user: any) => void
    logout: () => void
    initAuth: () => () => void
}

export const useAuth = create<AuthStore>((set) => ({
    user: null,
    userDoc: null,
    isLoggedIn: false,
    isLoading: true,

    setUser: (user) => set({ user, isLoggedIn: !!user }),

    logout: () => set({ user: null, userDoc: null, isLoggedIn: false }),

    initAuth: () => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                const userDoc = await getUserDoc(firebaseUser.uid)
                set({
                    user: firebaseUser,
                    userDoc,
                    isLoggedIn: true,
                    isLoading: false,
                })
            } else {
                set({
                    user: null,
                    userDoc: null,
                    isLoggedIn: false,
                    isLoading: false,
                })
            }
        })
        return unsubscribe
    },
}))
