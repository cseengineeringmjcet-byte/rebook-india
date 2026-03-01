import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
    ids: string[];
    count: number;
    toggle: (id: string) => void;
    has: (id: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
    persist(
        (set, get) => ({
            ids: [],
            count: 0,
            toggle: (id) => {
                set((state) => {
                    const exists = state.ids.includes(id);
                    const newIds = exists ? state.ids.filter(i => i !== id) : [...state.ids, id];
                    return { ids: newIds, count: newIds.length };
                });
            },
            has: (id) => get().ids.includes(id),
        }),
        {
            name: 'ri-wishlist',
        }
    )
);
