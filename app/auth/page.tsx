"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { toast } from 'sonner';

export default function AuthPage() {
    const { setUser } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        setUser({
            id: 'mock-user-123',
            email: email || 'user@example.com',
            full_name: 'Test Setup User',
            phone: '9876543210',
            role: 'buyer',
            area: 'Kukatpally'
        });
        toast.success("Successfully logged in!");
        router.push('/');
    };

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-20 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-sm shadow-xl border border-[var(--color-ldust)]">
                <div className="text-center mb-8">
                    <h1 className="font-display font-black text-3xl text-[var(--color-ink)] mb-2">Welcome Back</h1>
                    <p className="text-[var(--color-dust)]">Sign in to Rebook India</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] mt-1"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] mt-1"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold shadow-md transition-colors text-lg">
                        Sign In
                    </button>
                    <p className="text-center text-xs text-[var(--color-dust)]">
                        *This is a mock login for demo purposes. Any credentials will work.
                    </p>
                </form>
            </div>
        </div>
    );
}
