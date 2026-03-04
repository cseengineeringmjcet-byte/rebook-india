"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '@/store/useUI';
import { useAuth } from '@/store/useAuth';
import { useCart } from '@/store/useCart';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import RebookIndiaLogo from './Logo';

export default function MobileMenu() {
    const { mobileMenuOpen, toggleMenu, openCart } = useUI();
    const { isLoggedIn, logout, user } = useAuth();
    const cartCount = useCart(state => state.count);
    const pathname = usePathname();

    return (
        <div className={`fixed inset-0 z-50 md:hidden flex flex-col transition-all duration-500 ease-in-out bg-[var(--color-ink)] overflow-y-auto ${mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
            {/* Header inside drawer */}
            <div className="flex items-center justify-between p-4 h-16 border-b border-white/10 shrink-0">
                <RebookIndiaLogo variant="nav" darkBg />
                <div className="flex justify-end gap-2 items-center">
                    <button onClick={() => { toggleMenu(); openCart(); }} className="relative text-[var(--color-cream)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 bg-[var(--color-rust)] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    <button onClick={toggleMenu} className="text-white hover:text-[var(--color-rust)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <X size={28} />
                    </button>
                </div>
            </div>

            <div className="flex-1 px-6 py-8 flex flex-col space-y-6">
                <Link href="/browse" onClick={toggleMenu} className={`block text-xl font-display font-medium min-h-[44px] ${pathname === '/browse' ? 'text-[var(--color-rust)]' : 'text-[var(--color-cream)]'}`}>Browse Books</Link>
                <Link href="/vendors" onClick={toggleMenu} className={`block text-xl font-display font-medium min-h-[44px] ${pathname === '/vendors' ? 'text-[var(--color-rust)]' : 'text-[var(--color-cream)]'}`}>Trusted Vendors</Link>
                <Link href="/sell" onClick={toggleMenu} className={`block text-xl font-display font-medium min-h-[44px] ${pathname === '/sell' ? 'text-[var(--color-rust)]' : 'text-[var(--color-cream)]'}`}>Sell Your Books</Link>
                <Link href="/faq" onClick={toggleMenu} className={`block text-xl font-display font-medium min-h-[44px] ${pathname === '/faq' ? 'text-[var(--color-rust)]' : 'text-[var(--color-cream)]'}`}>FAQ</Link>
                <a href="/#calculator" onClick={toggleMenu} className="block text-xl font-display font-medium min-h-[44px] text-[var(--color-cream)]">Pricing Calculator</a>
                <div className="h-[1px] bg-white/10 my-2" />
                <Link href="/orders" onClick={toggleMenu} className={`block text-xl font-display font-medium min-h-[44px] ${pathname === '/orders' ? 'text-[var(--color-rust)]' : 'text-[var(--color-cream)]'}`}>My Orders</Link>
                <Link href="/wishlist" onClick={toggleMenu} className={`block text-xl font-display font-medium min-h-[44px] ${pathname === '/wishlist' ? 'text-[var(--color-rust)]' : 'text-[var(--color-cream)]'}`}>My Wishlist</Link>
                {isLoggedIn && user?.role === 'admin' && (
                    <Link href="/admin" onClick={toggleMenu} className={`block text-xl font-display font-bold min-h-[44px] text-white`}>Admin Panel</Link>
                )}
            </div>

            <div className="p-6 pb-12 shrink-0">
                {isLoggedIn ? (
                    <button onClick={() => { logout(); toggleMenu(); }} className="block w-full text-center bg-transparent border-2 border-white text-white py-3 min-h-[48px] font-bold rounded-xl transition-colors">
                        Sign Out
                    </button>
                ) : (
                    <Link href="/auth" onClick={toggleMenu} className="flex justify-center items-center w-full text-center bg-[#C94A2D] text-white py-3 min-h-[48px] font-bold rounded-xl transition-colors gap-2 text-[15px]">
                        <User size={18} />
                        Login / Register
                    </Link>
                )}
            </div>
        </div>
    );
}
