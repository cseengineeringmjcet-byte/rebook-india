"use client";

import React from 'react';

export default function TermsPage() {
    return (
        <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-16">
            <div className="max-w-3xl mx-auto px-4">
                <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] mb-8">Terms & Conditions</h1>

                <div className="prose prose-sm md:prose-base text-[var(--color-dust)]">
                    <p className="mb-6">Last updated: Oct 2026</p>

                    <h2 className="font-display font-bold text-xl text-[var(--color-ink)] mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-6">By using Rebook India, you agree to these Terms. Rebook India acts purely as an information directory and communication platform connecting students with local book vendors in Hyderabad.</p>

                    <h2 className="font-display font-bold text-xl text-[var(--color-ink)] mt-8 mb-4">2. Zero Payment Policy</h2>
                    <p className="mb-6">Rebook India does not process any online payments. All monetary transactions occur directly between the buyer (student) and the seller (vendor) physically at the shop or upon delivery. We are not liable for any financial disputes arising from these direct transactions.</p>

                    <h2 className="font-display font-bold text-xl text-[var(--color-ink)] mt-8 mb-4">3. Book Condition & Returns</h2>
                    <p className="mb-6">While we mandate accurate condition descriptions (Like New, Good, Fair, Acceptable), the final inspection is the buyer&apos;s responsibility during collection. If a book does not meet your expectations at the time of pickup, you are free to cancel the transaction. Once payment is made to the vendor, Rebook India cannot enforce returns.</p>

                    <h2 className="font-display font-bold text-xl text-[var(--color-ink)] mt-8 mb-4">4. Selling Books</h2>
                    <p className="mb-6">When you list a book to sell, you agree to provide it in the described condition. Rebook India reserves the right to reject listings that are counterfeit, heavily damaged, or irrelevant.</p>

                    <h2 className="font-display font-bold text-xl text-[var(--color-ink)] mt-8 mb-4">5. Pricing Formula</h2>
                    <p className="mb-6">Our standard pricing model is fixed: Books are sold at exactly 50% of the Original MRP. Vendors earn 80% of this selling price, and Rebook India earns 20% to maintain the platform.</p>
                </div>
            </div>
        </div>
    );
}
