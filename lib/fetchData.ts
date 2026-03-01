import { supabaseAdmin } from './supabaseAdmin';
import { Book, books as mockBooks } from './data/books';
import { Vendor, vendors as mockVendors } from './data/vendors';

export async function fetchInitialData() {
    console.log("Fetching live data from Supabase...");

    if (process.env.npm_lifecycle_event === 'build' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.warn("Build environment detected or missing URL. Returning local data.");
        return { books: mockBooks, vendors: mockVendors };
    }

    try {
        const { data: vData, error: vError } = await supabaseAdmin.from('vendors').select('*');
        const { data: bData, error: bError } = await supabaseAdmin.from('books').select(`
            *,
            categories(slug),
            vendors(shop_name, area)
        `);

        if (vError || bError || !vData || !bData || vData.length === 0 || bData.length === 0) {
            console.warn("Supabase fetch failed or returned empty. Falling back to local data.");
            return { books: mockBooks, vendors: mockVendors };
        }

        const vendors: Vendor[] = vData.map(v => ({
            id: v.id,
            shopName: v.shop_name,
            area: v.area,
            whatsapp: v.whatsapp,
            established: v.established,
            totalBooks: v.total_books,
            rating: v.rating,
            badge: v.badge,
            isFeatured: v.is_featured,
            speciality: v.speciality,
            shopImage: v.shop_image,
        }));

        const books: Book[] = bData.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author,
            publisher: b.publisher || 'Unknown Publisher',
            isbn: b.isbn || '',
            edition: b.edition || '',
            // @ts-ignore
            category: b.categories?.slug || 'unknown',
            mrp: b.mrp,
            ourPrice: b.our_price,
            savings: b.savings,
            vendorEarn: b.vendor_earn,
            riEarn: b.ri_earn,
            coverUrl: b.cover_url || undefined,
            condition: b.condition,
            vendorId: b.vendor_id,
            // @ts-ignore
            vendorName: b.vendors?.shop_name || 'Unknown Vendor',
            // @ts-ignore
            area: b.vendors?.area || 'Unknown Area',
        }));

        return { books, vendors };
    } catch (e) {
        console.error("Exception fetching from Supabase. Falling back to local.", e);
        return { books: mockBooks, vendors: mockVendors };
    }
}
