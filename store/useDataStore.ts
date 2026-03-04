import { create } from 'zustand';
import { Book } from '@/lib/data/books';
import { Vendor } from '@/lib/data/vendors';

interface DataState {
    books: Book[];
    vendors: Vendor[];
    isLoaded: boolean;
    setFirebaseData: (books: Book[], vendors: Vendor[]) => void;
}

export const useDataStore = create<DataState>((set) => ({
    books: [],
    vendors: [],
    isLoaded: false,
    setFirebaseData: (books, vendors) => set({ books, vendors, isLoaded: true })
}));
