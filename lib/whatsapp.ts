import { Book } from './data/books';
import { Vendor } from './data/vendors';

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '919876543210';

export function waBook(book: Book) {
    const text = `Hi Rebook India! I want to buy:\n\n*${book.title}* by ${book.author}\n🛒 Price: ₹${book.ourPrice} (MRP ₹${book.mrp})\n📍 Vendor: ${book.vendorName}, ${book.area}\n\nCan you confirm availability?`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function waSell() {
    const text = `Hi Rebook India! I want to sell a book.\n\n📚 Title:\n👨‍🏫 Author:\n💰 MRP:\n📍 My Area:\n\nPlease guide me on the next steps.`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function waVendor(v: Vendor) {
    const text = `Hi ${v.shopName}, I found you on Rebook India. I have an enquiry.`;
    return `https://wa.me/${v.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function waSupport() {
    const text = `Hi Rebook India Support, I need some help.`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
