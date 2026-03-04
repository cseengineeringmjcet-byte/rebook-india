"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

const FAQ_DATA = [
    {
        category: "BUYING BOOKS",
        items: [
            {
                q: "How much discount do I get on books?",
                a: "You get exactly 50% off the MRP on every single book. If a book costs Rs 1000 MRP you pay only Rs 500. No hidden charges. No delivery charges for pickup."
            },
            {
                q: "How do I order a book?",
                a: "Browse books on our website, click the book you want, click Add to Cart or Order via WhatsApp. We will contact you within 24 hours to confirm your order and arrange delivery or pickup."
            },
            {
                q: "Can I get home delivery in Hyderabad?",
                a: "Yes! We deliver across all areas of Hyderabad. You can also pick up directly from the vendor's shop to save time. Pickup is always free."
            },
            {
                q: "What is the condition of the books?",
                a: "Every book has a condition rating:\nLike New - almost no use, looks brand new\nGood - minor highlights or notes, fully readable\nFair - some wear and tear, all pages intact\nAcceptable - heavy use but complete\nWe clearly show the condition on every book listing."
            },
            {
                q: "What if the book I want is not available?",
                a: "You can submit a request via WhatsApp at 6301038443. We will check with our 15 vendors across Hyderabad and notify you when it becomes available."
            },
            {
                q: "Can I return a book if I am not satisfied?",
                a: "Returns are accepted within 48 hours of receiving the book if the condition is significantly different from what was listed. Contact us on WhatsApp immediately."
            },
            {
                q: "How do I pay for the book?",
                a: "Payment is collected at the time of pickup or delivery. We accept cash, UPI (GPay PhonePe Paytm), and bank transfer. No advance payment required to place an order."
            }
        ]
    },
    {
        category: "SELLING BOOKS",
        items: [
            {
                q: "How do I sell my old books on Rebook India?",
                a: "Click Sell Your Books on the homepage, fill in the details of your book, upload a clear photo, and submit. Our admin team reviews within 24 hours and lists it. You earn 80% of the sale price when your book sells."
            },
            {
                q: "How much money will I earn from selling?",
                a: "You earn 80% of the sale price. We charge 20% commission. Example: If your book sells for Rs 500, you get Rs 400. The sale price is set at 50% of MRP so if MRP is Rs 1000, sale price is Rs 500 and you earn Rs 400."
            },
            {
                q: "How long does it take to sell my book?",
                a: "Most popular textbooks sell within 7 to 30 days. Engineering, Medical, and JEE books sell fastest. We will notify you immediately when your book sells."
            },
            {
                q: "When and how do I get paid after my book sells?",
                a: "We pay you within 48 hours of the book being delivered to the buyer. Payment via UPI, GPay, or bank transfer to your account."
            },
            {
                q: "Can I set my own price for my book?",
                a: "Our pricing is fixed at 50% of MRP for all books. This is our promise to buyers and ensures your book sells faster. You provide the MRP and we calculate the rest automatically."
            },
            {
                q: "What kind of books can I sell?",
                a: "We accept all academic and educational books including engineering, medical, JEE, NEET, UPSC, school textbooks, MBA books, and popular fiction and self-help books. Books must be complete with no missing pages."
            },
            {
                q: "How do I upload a photo of my book?",
                a: "On the Sell page click Upload Book Photo and select a clear photo of your book from your phone or computer. Make sure the cover and title are clearly visible. Good photos help your book sell faster."
            }
        ]
    },
    {
        category: "ABOUT REBOOK INDIA",
        items: [
            {
                q: "What is Rebook India?",
                a: "Rebook India is Hyderabad's trusted marketplace for buying and selling second-hand books at 50% off MRP. We connect students who want to sell their old books with students who need affordable textbooks. We have 15 verified vendors across Hyderabad."
            },
            {
                q: "Which areas of Hyderabad do you cover?",
                a: "We cover all major areas including Abids, Koti, Ameerpet, Kukatpally, Dilsukhnagar, LB Nagar, Secunderabad, Banjara Hills, Himayatnagar, SR Nagar, Madhapur, Tarnaka, Afzalgunj, Begumpet, and Mehdipatnam."
            },
            {
                q: "How many vendors do you have?",
                a: "We have 15 verified and trusted vendors across Hyderabad. Each vendor is personally verified by our team. Vendors are rated by students after each transaction."
            },
            {
                q: "Is Rebook India safe to use?",
                a: "Yes. All our vendors are personally verified. We do not collect advance payment online. You pay only when you receive the book. All student sellers are verified with phone numbers."
            },
            {
                q: "How do I contact Rebook India?",
                a: "WhatsApp: 6301038443 (fastest response) We respond within 2 hours on WhatsApp. You can also use the WhatsApp button on our website."
            }
        ]
    },
    {
        category: "TECHNICAL QUESTIONS",
        items: [
            {
                q: "Do I need to create an account to buy books?",
                a: "You can browse all books without an account. You need an account only to add to cart, place orders, or sell your books. Creating an account is free and takes less than 1 minute."
            },
            {
                q: "Is my personal information safe?",
                a: "Yes. We only collect your name, phone, and area. We never share your information with third parties. Your data is stored securely on Firebase."
            },
            {
                q: "My book photo is not showing. What do I do?",
                a: "This can happen if the photo upload was interrupted. Try uploading again with a smaller image file. Make sure your internet connection is stable. If the problem continues contact us on WhatsApp."
            },
            {
                q: "I placed an order but did not get a confirmation. What now?",
                a: "Check your orders page first. If the order shows there it was placed successfully. WhatsApp us at 6301038443 with your order number and we will confirm within 2 hours."
            }
        ]
    }
];

function Accordion({ q, a }: { q: string, a: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-[var(--color-ldust)] rounded-md mb-4 bg-white overflow-hidden shadow-sm transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-5 flex items-center justify-between focus:outline-none hover:bg-slate-50 transition-colors"
            >
                <span className="font-bold text-[var(--color-ink)] text-sm md:text-base leading-snug">{q}</span>
                <Plus
                    className={`flex-shrink-0 text-[var(--color-rust)] transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                    size={20}
                />
            </button>
            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-5 pt-0 text-[var(--color-dust)] text-sm md:text-base whitespace-pre-line leading-relaxed border-t border-[var(--color-ldust)]">
                    {a}
                </div>
            </div>
        </div>
    );
}

export default function FAQPage() {
    return (
        <main className="min-h-screen bg-[var(--color-cream)]">
            {/* HERO SECTION */}
            <section className="bg-[var(--color-ink)] py-16 md:py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--color-cream)] mb-4 leading-tight">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-[var(--color-ldust)] text-lg md:text-xl">
                        Everything you need to know about Rebook India
                    </p>
                </div>
            </section>

            {/* FAQ CONTENT */}
            <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <div className="space-y-16">
                    {FAQ_DATA.map((section, idx) => (
                        <div key={idx}>
                            <h2 className="font-display font-bold text-2xl text-[var(--color-ink)] mb-8 border-b-2 border-[var(--color-rust)] pb-2 inline-block">
                                {section.category}
                            </h2>
                            <div className="space-y-4">
                                {section.items.map((item, i) => (
                                    <Accordion key={i} q={item.q} a={item.a} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
