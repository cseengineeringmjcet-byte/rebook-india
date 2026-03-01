import React from 'react';
import Link from 'next/link';
import RebookIndiaLogo from './Logo';

export default function Footer() {
    return (
        <footer className="bg-[var(--color-ink)] text-[var(--color-ldust)] pt-16 pb-8 border-t-[4px] border-[var(--color-rust)]">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                {/* Col 1 */}
                <div className="lg:pr-8">
                    <RebookIndiaLogo variant="footer" darkBg />
                    <p className="mt-6 text-sm leading-relaxed">
                        Hyderabad's most trusted second-hand book marketplace. No payment gateways. Transparent earnings. Affordable education for everyone.
                    </p>
                </div>

                {/* Col 2 */}
                <div>
                    <h4 className="font-display font-bold text-[var(--color-cream)] text-lg mb-4">Browse</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/browse?cat=engineering" className="hover:text-[var(--color-amber)] transition-colors">Engineering</Link></li>
                        <li><Link href="/browse?cat=medical" className="hover:text-[var(--color-amber)] transition-colors">Medical MBBS</Link></li>
                        <li><Link href="/browse?cat=jee" className="hover:text-[var(--color-amber)] transition-colors">JEE / NEET</Link></li>
                        <li><Link href="/browse?cat=upsc" className="hover:text-[var(--color-amber)] transition-colors">UPSC / Competition</Link></li>
                        <li><Link href="/browse?cat=school" className="hover:text-[var(--color-amber)] transition-colors">School Textbooks</Link></li>
                        <li><Link href="/browse?cat=selfhelp" className="hover:text-[var(--color-amber)] transition-colors">Self-Help & Fiction</Link></li>
                    </ul>
                </div>

                {/* Col 3 */}
                <div>
                    <h4 className="font-display font-bold text-[var(--color-cream)] text-lg mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/vendors" className="hover:text-[var(--color-amber)] transition-colors">Our Trusted Vendors</Link></li>
                        <li><Link href="/sell" className="hover:text-[var(--color-amber)] transition-colors">Sell Your Books</Link></li>
                        <li><Link href="/#calculator" className="hover:text-[var(--color-amber)] transition-colors">Pricing Calculator</Link></li>
                        <li><Link href="/orders" className="hover:text-[var(--color-amber)] transition-colors">Track Order</Link></li>
                        <li><Link href="/auth" className="hover:text-[var(--color-amber)] transition-colors">Login / Register</Link></li>
                        <li><Link href="/admin" className="hover:text-[var(--color-amber)] transition-colors">Admin Dashboard</Link></li>
                    </ul>
                </div>

                {/* Col 4 */}
                <div>
                    <h4 className="font-display font-bold text-[var(--color-cream)] text-lg mb-4">Hyderabad Areas</h4>
                    <p className="text-sm leading-relaxed mb-4">
                        Abids • Koti • Ameerpet • Kukatpally • Dilsukhnagar • LB Nagar • Secunderabad • Banjara Hills • SR Nagar • Himayatnagar
                    </p>
                    <a
                        href="https://wa.me/919876543210"
                        className="inline-flex items-center gap-2 text-[var(--color-sage)] font-bold text-sm hover:text-white transition-colors"
                    >
                        <span className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.479-1.761-1.652-2.059-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                        </span>
                        Contact Support
                    </a>
                </div>
            </div>
            <div className="border-t border-white/10 pt-8 mt-8 text-center text-xs">
                © 2025 Rebook India Pvt. Ltd. Hyderabad, Telangana. All Rights Reserved.
            </div>
        </footer>
    );
}
