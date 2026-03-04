'use client'
import { useEffect } from 'react'
import { useAuth } from '@/store/useAuth'

export default function AuthInit() {
    const initAuth = useAuth(s => s.initAuth)
    useEffect(() => {
        const unsub = initAuth()
        return () => unsub()
    }, [initAuth])
    return null
}
