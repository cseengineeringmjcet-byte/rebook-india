import { create } from 'zustand';

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: 'buyer' | 'seller' | 'vendor' | 'admin';
    area: string;
}

interface AuthState {
    user: User | null;
    isLoggedIn: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    isLoggedIn: false,
    setUser: (user) => set({ user, isLoggedIn: !!user }),
    logout: () => set({ user: null, isLoggedIn: false }),
}));
