import { create } from 'zustand';

interface UIState {
    searchOpen: boolean;
    cartOpen: boolean;
    mobileMenuOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleMenu: () => void;
    closeAll: () => void;
}

export const useUI = create<UIState>((set) => ({
    searchOpen: false,
    cartOpen: false,
    mobileMenuOpen: false,
    openSearch: () => set({ searchOpen: true, cartOpen: false, mobileMenuOpen: false }),
    closeSearch: () => set({ searchOpen: false }),
    openCart: () => set({ cartOpen: true, searchOpen: false, mobileMenuOpen: false }),
    closeCart: () => set({ cartOpen: false }),
    toggleMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen, searchOpen: false, cartOpen: false })),
    closeAll: () => set({ searchOpen: false, cartOpen: false, mobileMenuOpen: false }),
}));
