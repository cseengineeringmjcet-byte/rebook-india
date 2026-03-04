import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book } from '@/lib/data/books';
import { db } from '@/lib/firebase/config';
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc } from 'firebase/firestore';

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
            addItem: async (item) => {
                if (get().hasItem(item.id)) return;

                // Update local instantly
                set((state) => {
                    const newItems = [...state.items, { ...item, cartItemId: crypto.randomUUID() }];
                    return {
                        items: newItems,
                        count: newItems.length,
                        total: newItems.reduce((acc, curr) => acc + (curr.ourPrice || 0), 0),
                        savings: newItems.reduce((acc, curr) => acc + (curr.savings || 0), 0),
                    };
                });

                // Sync remote silently
                try {
                    const auth = getAuth();
                    const user = auth?.currentUser;
                    if (user) {
                        const snap = await getDocs(query(collection(db, "cart"), where("user_id", "==", user.uid), where("book_id", "==", item.id)));
                        if (snap.empty) {
                            await addDoc(collection(db, "cart"), {
                                book_id: item.id,
                                user_id: user.uid,
                                added_at: serverTimestamp()
                            });
                        }
                    }
                } catch (e) {
                    console.error("Cart sync failed", e);
                }
            },
            removeItem: async (id) => {
                set((state) => {
                    const newItems = state.items.filter((i) => i.id !== id);
                    return {
                        items: newItems,
                        count: newItems.length,
                        total: newItems.reduce((acc, curr) => acc + (curr.ourPrice || 0), 0),
                        savings: newItems.reduce((acc, curr) => acc + (curr.savings || 0), 0),
                    };
                });

                try {
                    const auth = getAuth();
                    const user = auth?.currentUser;
                    if (user) {
                        const snap = await getDocs(query(collection(db, "cart"), where("user_id", "==", user.uid), where("book_id", "==", id)));
                        snap.forEach(async d => await deleteDoc(d.ref));
                    }
                } catch (e) {
                    console.error("Cart sync rem failed", e);
                }
            },
            clear: async () => {
                set({ items: [], count: 0, total: 0, savings: 0 });

                try {
                    const auth = getAuth();
                    const user = auth?.currentUser;
                    if (user) {
                        const snap = await getDocs(query(collection(db, "cart"), where("user_id", "==", user.uid)));
                        snap.forEach(async d => await deleteDoc(d.ref));
                    }
                } catch (e) {
                    console.error("Cart clear rem failed", e);
                }
            },
            hasItem: (id) => get().items.some((i) => i.id === id),
        }),
        {
            name: 'ri-cart',
        }
    )
);
