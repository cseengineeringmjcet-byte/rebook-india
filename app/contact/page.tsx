"use client";

import React from 'react';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { waSupport } from '@/lib/whatsapp';

export default function ContactPage() {
    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-16">
            <div className="max-w-4xl mx-auto px-4">

                <div className="text-center mb-16">
                    <h1 className="font-display font-black text-4xl md:text-5xl text-[var(--color-ink)] mb-4">Contact Us</h1>
                    <p className="text-[var(--color-dust)] text-lg">We are here to help Hyderabad&apos;s student community.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-sm shadow-sm border border-[var(--color-ldust)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366] rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />
                        <MessageCircle className="text-[#25D366] mb-4" size={32} />
                        <h3 className="font-display font-black text-2xl text-[var(--color-ink)] mb-2">WhatsApp Support</h3>
                        <p className="text-[var(--color-dust)] mb-6 text-sm">Fastest way to reach us. Available 9 AM - 9 PM daily.</p>
                        <a
                            href={waSupport()}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-sm font-bold shadow-md hover:bg-[#20bd5a] transition-colors"
                        >
                            Message +91 98765 43210
                        </a>
                    </div>

                    <div className="bg-white p-8 rounded-sm shadow-sm border border-[var(--color-ldust)]">
                        <Mail className="text-[var(--color-rust)] mb-4" size={32} />
                        <h3 className="font-display font-black text-2xl text-[var(--color-ink)] mb-2">Email Us</h3>
                        <p className="text-[var(--color-dust)] mb-6 text-sm">For partnerships, vendor onboarding, or bulk requests.</p>
                        <a
                            href="mailto:hello@rebookindia.com"
                            className="inline-flex items-center gap-2 border border-[var(--color-ink)] text-[var(--color-ink)] px-6 py-3 rounded-sm font-bold shadow-sm hover:bg-[var(--color-ink)] hover:text-white transition-colors"
                        >
                            hello@rebookindia.com
                        </a>
                    </div>
                </div>

                <div className="bg-[var(--color-paper)] p-8 rounded-sm border border-[var(--color-ldust)] flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-[var(--color-ldust)] shrink-0">
                        <MapPin className="text-[var(--color-dust)]" size={24} />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-xl text-[var(--color-ink)] mb-1">Our Office</h3>
                        <p className="text-[var(--color-dust)] text-sm">
                            Rebook India Hub<br />
                            Near JNTU Metro Station<br />
                            Kukatpally, Hyderabad, Telangana 500072
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
