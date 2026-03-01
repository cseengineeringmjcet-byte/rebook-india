import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '@/lib/data/books';

export interface CartItem extends Book {
    cartItemId: string; // Unique ID for cart instance
}

interface CartState {
    items: CartItem[];
    count: number;
    total: number;
    savings: number;
    addItem: (item: Book) => void;
    removeItem: (id: string) => void;
    clear: () => void;
    hasItem: (id: string) => boolean;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            count: 0,
            total: 0,
            savings: 0,
            addItem: (item) => {
                if (get().hasItem(item.id)) return;
                set((state) => {
                    const newItems = [...state.items, { ...item, cartItemId: crypto.randomUUID() }];
                    return {
                        items: newItems,
                        count: newItems.length,
                        total: newItems.reduce((acc, curr) => acc + curr.ourPrice, 0),
                        savings: newItems.reduce((acc, curr) => acc + curr.savings, 0),
                    };
                });
            },
            removeItem: (id) => {
                set((state) => {
                    const newItems = state.items.filter((i) => i.id !== id);
                    return {
                        items: newItems,
                        count: newItems.length,
                        total: newItems.reduce((acc, curr) => acc + curr.ourPrice, 0),
                        savings: newItems.reduce((acc, curr) => acc + curr.savings, 0),
                    };
                });
            },
            clear: () => set({ items: [], count: 0, total: 0, savings: 0 }),
            hasItem: (id) => get().items.some((i) => i.id === id),
        }),
        {
            name: 'ri-cart',
        }
    )
);
