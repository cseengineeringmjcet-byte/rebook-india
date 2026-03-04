"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { toast } from 'sonner';
import { User, LogOut, Package, MapPin, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, userDoc, isLoggedIn, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) return null;

    if (!isLoggedIn || !user) {
        if (typeof window !== 'undefined') router.push('/auth');
        return null;
    }

    const handleLogout = async () => {
        try {
            const { signOutUser } = await import('@/lib/firebase/auth');
            await signOutUser();
            toast.info("Logged out successfully");
            router.push('/');
        } catch (err) {
            toast.error("Logout failed");
        }
    };

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)]">My Account</h1>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-4 py-2 rounded-sm">
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-sm shadow-sm border border-[var(--color-ldust)] text-center">
                            <div className="w-24 h-24 bg-[var(--color-paper)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-ink)] border border-[var(--color-ldust)]">
                                <User size={40} />
                            </div>
                            <h2 className="font-bold text-lg text-[var(--color-ink)]">{userDoc?.full_name || 'User'}</h2>
                            <p className="text-sm text-[var(--color-dust)] mb-4">{user.email}</p>
                            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--color-sage)] bg-[var(--color-sage)]/10 px-3 py-1 rounded-sm">
                                {userDoc?.role || 'Buyer'} Account
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-sm shadow-sm border border-[var(--color-ldust)]">
                            <h3 className="font-display font-bold text-xl text-[var(--color-ink)] mb-4 border-b border-[var(--color-ldust)] pb-3">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div>
                                    <span className="block text-[var(--color-dust)] text-xs uppercase font-bold mb-1">Phone Number</span>
                                    <span className="font-mono">{userDoc?.phone || 'Not provided'}</span>
                                </div>
                                <div>
                                    <span className="block text-[var(--color-dust)] text-xs uppercase font-bold mb-1">Default Area</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} className="text-[var(--color-rust)]" /> {userDoc?.area || 'Not provided'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/orders" className="bg-white p-6 rounded-sm shadow-sm border border-[var(--color-ldust)] hover:border-[var(--color-rust)] transition-colors group flex flex-col items-center justify-center text-center">
                                <Package size={32} className="text-[var(--color-dust)] group-hover:text-[var(--color-rust)] mb-3 transition-colors" />
                                <span className="font-bold text-[var(--color-ink)]">My Orders</span>
                            </Link>
                            <Link href="/wishlist" className="bg-white p-6 rounded-sm shadow-sm border border-[var(--color-ldust)] hover:border-[var(--color-rust)] transition-colors group flex flex-col items-center justify-center text-center">
                                <Heart size={32} className="text-[var(--color-dust)] group-hover:text-red-500 mb-3 transition-colors" />
                                <span className="font-bold text-[var(--color-ink)]">My Wishlist</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
