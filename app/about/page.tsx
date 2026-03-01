"use client";

import React from 'react';
import { Target, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-16">
            <div className="max-w-4xl mx-auto px-4">

                <div className="text-center mb-16">
                    <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-[var(--color-ink)] mb-6">Uniting Hyderabad for Accessible Education</h1>
                    <p className="text-[var(--color-dust)] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto italic font-display">
                        &quot;We believe that a lack of money should never be the reason a student stops learning.&quot;
                    </p>
                </div>

                <div className="prose prose-lg max-w-none text-[var(--color-ink)] mb-16">
                    <p className="mb-6">
                        Rebook India was born from a simple observation in the streets of Koti and Abids: thousands of students walk miles trying to negotiate for textbooks, while thousands of perfectly good books sit gathering dust in homes across Hyderabad.
                    </p>
                    <p className="mb-6">
                        We realized that local book vendors are the unsung heroes of our education system. They recycle knowledge and provide a lifeline to students. Rebook India is a platform built to digitize these vendors, giving them an online storefront to reach students across the city securely and transparently.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-sm shadow-sm border border-[var(--color-ldust)] hover:border-[var(--color-rust)] transition-colors">
                        <Target className="text-[var(--color-rust)] mb-4" size={32} />
                        <h3 className="font-display font-black text-2xl mb-3">Our Mission</h3>
                        <p className="text-[var(--color-dust)]">To make every essential textbook available at exactly 50% of its original MRP, ensuring financial constraints never hinder academic dreams.</p>
                    </div>
                    <div className="bg-white p-8 rounded-sm shadow-sm border border-[var(--color-ldust)] hover:border-[var(--color-rust)] transition-colors">
                        <ShieldCheck className="text-[var(--color-sage)] mb-4" size={32} />
                        <h3 className="font-display font-black text-2xl mb-3">Our Promise</h3>
                        <p className="text-[var(--color-dust)]">100% Transparency. No hidden fees. No online payments. You see exactly what the vendor earns and what we earn.</p>
                    </div>
                </div>

                <div className="bg-[var(--color-ink)] text-white p-8 md:p-12 rounded-sm shadow-xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-amber)] blur-3xl opacity-20 rounded-full" />
                    <h2 className="font-display font-black text-3xl mb-6 relative z-10">Why No Online Payments?</h2>
                    <div className="space-y-4 relative z-10 text-[var(--color-ldust)]">
                        <p>We built Rebook India on <strong>TRUST</strong>.</p>
                        <p>In a world of online scams, we wanted to ensure zero risk for our students. By eliminating payment gateways, we eliminate transaction fees, meaning you save more and vendors earn more.</p>
                        <p>You only pay when you have the book in your hands. It&apos;s the old-school way, brought into the digital age.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
