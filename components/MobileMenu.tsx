"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '@/store/useUI';
import { useAuth } from '@/store/useAuth';
import { Menu, X } from 'lucide-react';

export default function MobileMenu() {
    const { mobileMenuOpen, toggleMenu } = useUI();
    const { isLoggedIn, logout, user } = useAuth();
    const pathname = usePathname();

    if (!mobileMenuOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={toggleMenu} />
            <div className="fixed top-16 right-0 bottom-0 w-[80vw] max-w-[300px] bg-[var(--color-ink)] z-40 md:hidden transform transition-transform shadow-2xl flex flex-col">
                <div className="flex justify-end p-4 border-b border-white/10">
                    <button onClick={toggleMenu} className="text-white/60 hover:text-white p-2">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 p-6 flex flex-col space-y-6">
                    <Link href="/" onClick={toggleMenu} className={`text-lg font-display ${pathname === '/' ? 'text-[var(--color-amber)]' : 'text-white'}`}>Home</Link>
                    <Link href="/browse" onClick={toggleMenu} className={`text-lg font-display ${pathname === '/browse' ? 'text-[var(--color-amber)]' : 'text-white'}`}>Browse Books</Link>
                    <Link href="/vendors" onClick={toggleMenu} className={`text-lg font-display ${pathname === '/vendors' ? 'text-[var(--color-amber)]' : 'text-white'}`}>Trusted Vendors</Link>
                    <Link href="/sell" onClick={toggleMenu} className={`text-lg font-display ${pathname === '/sell' ? 'text-[var(--color-amber)]' : 'text-white'}`}>Sell Your Books</Link>
                    <a href="/#calculator" onClick={toggleMenu} className="text-lg font-display text-white">Pricing Calculator</a>
                    <div className="h-[1px] bg-white/10 my-4" />
                    <Link href="/wishlist" onClick={toggleMenu} className={`text-lg font-display ${pathname === '/wishlist' ? 'text-[var(--color-amber)]' : 'text-white'}`}>My Wishlist</Link>
                    <Link href="/profile" onClick={toggleMenu} className={`text-lg font-display ${pathname === '/profile' ? 'text-[var(--color-amber)]' : 'text-white'}`}>My Account</Link>
                    {isLoggedIn && user?.role === 'admin' && (
                        <Link href="/admin" onClick={toggleMenu} className={`text-lg font-display text-[var(--color-rust)]`}>Admin Panel</Link>
                    )}
                </div>
                <div className="p-6 border-t border-white/10 bg-white/5">
                    {isLoggedIn ? (
                        <button onClick={() => { logout(); toggleMenu(); }} className="block w-full text-center bg-red-500 hover:bg-red-600 text-white py-3 font-bold rounded-sm transition-colors">
                            Sign Out
                        </button>
                    ) : (
                        <Link href="/auth" onClick={toggleMenu} className="block w-full text-center bg-[var(--color-rust)] hover:bg-[#A93C23] text-white py-3 font-bold rounded-sm transition-colors">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
