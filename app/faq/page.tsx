"use client";

import React, { useState } from 'react';
import { Plus, Minus, MessageCircle } from 'lucide-react';
import { waSupport } from '@/lib/whatsapp';

const faqs = [
    { q: "How do I pay for the books?", a: "We do not accept online payments. You pay cash or UPI directly to the vendor when you collect the book." },
    { q: "Are the books new or used?", a: "All books are used/second-hand, which is why we can offer them at exactly 50% of the original MRP. We clearly state the condition (Like New, Good, Fair, Acceptable) for every listing." },
    { q: "Can I sell my old books here?", a: "Absolutely! Go to the 'Sell' section, fill in the details and upload a photo. If approved, we will list it, and when sold, you get highest returns—80% of our selling price." },
    { q: "Do you deliver to my home?", a: "Currently, we operate on a pick-up model where you collect from the vendor's shop in your area. Home delivery is available via third-party partners at an extra cost (Porter/Swiggy Genie)." },
    { q: "What if the book's condition is bad when I go to pick it up?", a: "You always have the right to refuse the book at the shop if it doesn't match the condition described online. Since you haven't paid anything in advance, your money is completely safe." },
    { q: "Can I contact the vendor directly?", a: "Yes! Every book and vendor page has a WhatsApp button that directly connects you to that specific vendor's WhatsApp number." },
    { q: "Why is every book exactly 50% off?", a: "We want to remove the hassle of bargaining. A fixed 50% off MRP ensures fairness for both the student saving money and the vendor earning a living." }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-16">
            <div className="max-w-3xl mx-auto px-4">

                <div className="text-center mb-12">
                    <h1 className="font-display font-black text-4xl md:text-5xl text-[var(--color-ink)] mb-4">Frequently Asked Questions</h1>
                    <p className="text-[var(--color-dust)] text-lg">Everything you need to know about how Rebook India works.</p>
                </div>

                <div className="space-y-4 mb-16">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`bg-white rounded-sm border transition-colors ${openIndex === i ? 'border-[var(--color-rust)] shadow-md' : 'border-[var(--color-ldust)] hover:border-[var(--color-ink)]/20'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className="font-display font-bold text-lg text-[var(--color-ink)] pr-4">{faq.q}</span>
                                <span className={`shrink-0 transition-transform duration-300 ${openIndex === i ? 'text-[var(--color-rust)]' : 'text-[var(--color-dust)]'}`}>
                                    {openIndex === i ? <Minus size={20} /> : <Plus size={20} />}
                                </span>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="p-6 pt-0 text-[var(--color-dust)] border-t border-[var(--color-ldust)]/50 mt-2">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-[var(--color-paper)] p-8 rounded-sm border border-[var(--color-ldust)] text-center shadow-sm">
                    <h3 className="font-display font-black text-2xl text-[var(--color-ink)] mb-3">Still have questions?</h3>
                    <p className="text-[var(--color-dust)] mb-6">Our admin team is available from 9 AM to 9 PM.</p>
                    <a
                        href={waSupport()}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a] px-8 py-3 rounded-sm font-bold shadow-md transition-colors"
                    >
                        <MessageCircle size={20} /> Chat with Admin
                    </a>
                </div>

            </div>
        </div>
    );
}
