"use client";

import React, { useRef } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Book } from '@/lib/data/books';
import { Vendor } from '@/lib/data/vendors';

export default function SupabaseDataLoader({
    books,
    vendors,
    children
}: {
    books: Book[],
    vendors: Vendor[],
    children: React.ReactNode
}) {
    const initialized = useRef(false);

    if (!initialized.current) {
        useDataStore.getState().setSupabaseData(books, vendors);
        initialized.current = true;
    }

    return <>{children}</>;
}
