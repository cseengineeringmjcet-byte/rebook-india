"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Search, Menu, Heart, X, User } from 'lucide-react';
import RebookIndiaLogo from './Logo';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useUI } from '@/store/useUI';
import { useAuth } from '@/store/useAuth';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    const cartCount = useCart(state => state.count);
    const wishlistCount = useWishlist(state => state.count);
    const { openCart, openSearch, toggleMenu } = useUI();
    const { isLoggedIn, user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-40 transition-all duration-300 border-b border-[var(--color-amber)]/10 ${scrolled ? 'bg-[var(--color-ink)]/95 backdrop-blur-md shadow-md' : 'bg-[var(--color-ink)]'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* LOGO */}
                <Link href="/" className="flex-shrink-0">
                    <RebookIndiaLogo variant="nav" darkBg />
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/browse" className={`text-sm font-medium hover:text-[var(--color-rust)] transition-colors ${pathname === '/browse' ? 'text-[var(--color-rust)]' : 'text-[var(--color-cream)]'}`}>
                        Browse
                    </Link>
                    <Link href="/vendors" className={`text-sm font-medium hover:text-[var(--color-rust)] transition-colors ${pathname === '/vendors' ? 'text-[var(--color-rust)]' : 'text-[var(--color-cream)]'}`}>
                        Vendors
                    </Link>
                    <Link href="/sell" className={`text-sm font-medium hover:text-[var(--color-rust)] transition-colors ${pathname === '/sell' ? 'text-[var(--color-rust)]' : 'text-[var(--color-cream)]'}`}>
                        Sell Books
                    </Link>
                    <a href="/#calculator" className="text-sm font-medium text-[var(--color-cream)] hover:text-[var(--color-rust)] transition-colors">
                        Pricing
                    </a>
                </div>

                {/* ICONS - DESKTOP & MOBILE */}
                <div className="flex items-center space-x-5">
                    {/* Search (Desktop only) */}
                    <button onClick={openSearch} className="hidden md:block text-[var(--color-cream)] hover:text-[var(--color-amber)] transition-colors">
                        <Search size={20} />
                    </button>

                    {/* Wishlist (Desktop only) */}
                    <Link href="/wishlist" className="hidden md:block relative text-[var(--color-cream)] hover:text-[#ff4b4b] transition-colors">
                        <Heart size={20} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[var(--color-rust)] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart View */}
                    <button onClick={openCart} className="relative text-[var(--color-cream)] hover:text-[var(--color-amber)] transition-colors">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[var(--color-rust)] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* Admin Link (Desktop) */}
                    {isLoggedIn && user?.role === 'admin' && (
                        <Link href="/admin" className="hidden md:flex items-center justify-center text-white bg-[var(--color-rust)] hover:bg-[#A93C23] transition-colors h-8 px-3 rounded-sm text-sm font-bold ml-2">
                            Admin Panel
                        </Link>
                    )}

                    {/* User Button (Desktop) */}
                    <Link href={isLoggedIn ? "/profile" : "/auth"} className="hidden md:flex items-center justify-center text-[var(--color-ink)] bg-[var(--color-cream)] hover:bg-[var(--color-rust)] hover:text-white transition-colors h-8 px-3 rounded-sm text-sm font-bold ml-2">
                        {isLoggedIn ? <User size={16} className="mr-1" /> : null}
                        {isLoggedIn ? 'Account' : 'Login'}
                    </Link>

                    {/* Hamburger (Mobile only) */}
                    <button onClick={toggleMenu} className="md:hidden text-[var(--color-cream)] ml-2 border-l border-white/10 pl-4">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
