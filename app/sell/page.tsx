"use client";

import React, { useState } from 'react';
import { Camera, CheckCircle2, ChevronRight, Calculator } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';
import { toast } from 'sonner';
import { waSell } from '@/lib/whatsapp';

export default function SellPage() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [mrpPreview, setMrpPreview] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState<(string | ArrayBuffer | null)[]>([null, null, null]);

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        category: 'engineering',
        mrp: '',
        condition: 'good',
        area: user?.area || '',
        phone: user?.phone || '',
        notes: ''
    });

    const categories = [
        { id: 'engineering', name: 'Engineering' },
        { id: 'medical', name: 'Medical' },
        { id: 'jee', name: 'JEE / NEET' },
        { id: 'upsc', name: 'UPSC' },
        { id: 'school', name: 'School' },
        { id: 'selfhelp', name: 'Self-Help & Fiction' }
    ];

    const handleNext = () => {
        if (step === 1) {
            if (!formData.title || !formData.author || !formData.mrp) {
                toast.error("Please fill all required book details");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            if (!formData.area || !formData.phone) {
                toast.error("Please provide contact details");
                return;
            }
            submitSellRequest();
        }
    };

    const submitSellRequest = async () => {
        setLoading(true);
        try {
            // Mock insert since user may not be logged in or mock supabase
            const { error } = await supabase.from('book_listings').insert({
                id: crypto.randomUUID(),
                seller_id: user?.id || null,
                title: formData.title,
                author: formData.author,
                category_id: null, // we don't look up uuid for category in mock
                mrp: Number(formData.mrp),
                condition: formData.condition,
                description: formData.notes,
                seller_area: formData.area,
                seller_phone: formData.phone,
                status: 'pending'
            });

            if (error && error.message !== 'FetchError: Failed to fetch') {
                console.error(error);
            }

            setStep(4);
            toast.success("Book submitted for review!");
        } catch (err) {
            console.error(err);
            toast.error("Submission failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (step === 4) {
        return (
            <div className="bg-[var(--color-cream)] min-h-screen py-20">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <div className="w-24 h-24 bg-[var(--color-sage)] rounded-full flex items-center justify-center shadow-lg border-4 border-white mx-auto mb-6 text-white border-opacity-10">
                        <CheckCircle2 size={48} strokeWidth={3} />
                    </div>
                    <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] mb-4">Request Submitted!</h1>
                    <p className="text-[var(--color-dust)] mb-8 max-w-md mx-auto">Admin will review your book within 24 hours. We will WhatsApp you when it goes live on Rebook India.</p>

                    <button onClick={() => { setStep(1); setFormData({ ...formData, title: '', author: '', mrp: '' }); setMrpPreview(''); }} className="bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold shadow-md transition-colors inline-block text-lg">
                        Sell Another Book
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-cream)]">
            {/* Mini Hero */}
            <div className="bg-[var(--color-ink)] text-white py-12 px-4 shadow-md relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-rust)] blur-3xl rounded-full opacity-20" />
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h1 className="font-display font-black text-3xl md:text-5xl mb-4 text-[var(--color-cream)]">Your Old Books = Someone&apos;s Dream</h1>
                    <p className="text-[var(--color-ldust)] mb-6 text-lg">List your complete, usable books. We handle the rest.</p>

                    <div className="bg-white/10 p-4 border border-white/20 rounded-sm flex items-center gap-4 max-w-md mx-auto backdrop-blur-md">
                        <Calculator className="text-[var(--color-amber)]" size={24} />
                        <div className="text-left flex-1">
                            <div className="text-xs uppercase tracking-wider text-white/70 font-bold">Earnings Calculator</div>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="number"
                                    placeholder="Book MRP (₹)"
                                    value={mrpPreview}
                                    onChange={(e) => setMrpPreview(Number(e.target.value))}
                                    className="bg-black/20 text-white w-28 px-2 py-1 outline-none font-mono text-sm border-b border-white/30"
                                />
                                <span className="text-sm font-bold text-[var(--color-sage)]">
                                    → You Earn ₹{mrpPreview ? Math.round((mrpPreview as number) * 0.5 * 0.8) : 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-10 gap-2 md:gap-4 text-xs font-bold uppercase tracking-wider">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[var(--color-rust)]' : 'text-[var(--color-dust)]'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[var(--color-rust)] text-white' : 'bg-[var(--color-ldust)]'}`}>1</span>
                        <span className="hidden sm:inline">Book Details</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--color-ldust)]" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[var(--color-rust)]' : 'text-[var(--color-dust)]'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[var(--color-rust)] text-white' : 'bg-[var(--color-ldust)]'}`}>2</span>
                        <span className="hidden sm:inline">Photos</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--color-ldust)]" />
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[var(--color-rust)]' : 'text-[var(--color-dust)]'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[var(--color-rust)] text-white' : 'bg-[var(--color-ldust)]'}`}>3</span>
                        <span className="hidden sm:inline">Contact</span>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-[var(--color-ldust)]">

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="font-display font-black text-2xl text-[var(--color-ink)] mb-6 border-b border-[var(--color-ldust)] pb-4">Step 1: Book Information</h2>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Book Title *</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]" placeholder="E.g. Concepts of Physics Part 1" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Author(s) *</label>
                                <input type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]" placeholder="E.g. H.C. Verma" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Category *</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] bg-white">
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Original MRP (₹) *</label>
                                    <input type="number" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]" placeholder="850" />

                                    {formData.mrp && (
                                        <div className="text-xs text-[var(--color-sage)] font-bold mt-2 bg-[var(--color-sage)]/10 p-2 rounded-sm border border-[var(--color-sage)]/20 shadow-sm inline-block w-full">
                                            You will earn exactly ₹{Math.round(Number(formData.mrp) * 0.5 * 0.8)} upon sale!
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1 pt-2">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider mb-2 block">Condition *</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { id: 'like_new', l: 'Like New', d: 'No markings, perfect spine' },
                                        { id: 'good', l: 'Good', d: 'Minor wear, clean pages' },
                                        { id: 'fair', l: 'Fair', d: 'Some highlights/notes, readable' },
                                        { id: 'acceptable', l: 'Acceptable', d: 'Heavy wear, all pages intact' }
                                    ].map(c => (
                                        <label key={c.id} className={`p-4 border rounded-sm cursor-pointer transition-colors flex flex-col ${formData.condition === c.id ? 'border-[var(--color-rust)] bg-[var(--color-rust)]/5 relative' : 'border-[var(--color-ldust)] hover:border-[var(--color-ink)]/30'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <input type="radio" name="condition" checked={formData.condition === c.id} onChange={() => setFormData({ ...formData, condition: c.id })} className="accent-[var(--color-rust)]" />
                                                <span className="font-bold text-[var(--color-ink)] text-sm">{c.l}</span>
                                            </div>
                                            <span className="text-xs text-[var(--color-dust)] pl-5">{c.d}</span>
                                            {formData.condition === c.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-rust)]" />}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleNext} className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold transition-colors mt-6 text-lg">
                                Continue to Photos →
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center justify-between mb-6 border-b border-[var(--color-ldust)] pb-4">
                                <h2 className="font-display font-black text-2xl text-[var(--color-ink)]">Step 2: Upload Photos</h2>
                                <button onClick={() => setStep(1)} className="text-xs text-[var(--color-rust)] font-bold hover:underline">Back</button>
                            </div>

                            <div className="bg-[var(--color-paper)] p-4 border border-[var(--color-ldust)] rounded-sm text-sm text-[var(--color-dust)] mb-6">
                                Uploading real, clear photos increases trust and speeds up the sale. Please upload at least 1 photo showing the front cover.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="border-2 border-dashed border-[var(--color-ldust)] hover:border-[var(--color-rust)] bg-[var(--color-cream)] h-48 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-colors text-[var(--color-dust)] relative overflow-hidden group">
                                        {photos[i - 1] ? (
                                            <>
                                                <img src={photos[i - 1] as string} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                                <button onClick={(e) => { e.preventDefault(); const newPhotos = [...photos]; newPhotos[i - 1] = null; setPhotos(newPhotos); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors z-20">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const newPhotos = [...photos];
                                                            newPhotos[i - 1] = reader.result;
                                                            setPhotos(newPhotos);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                <Camera className="mb-2 group-hover:scale-110 transition-transform" size={32} />
                                                <span className="text-xs font-bold">{i === 1 ? 'Front Cover *' : `Optional Image ${i}`}</span>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleNext} className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold transition-colors mt-6 text-lg">
                                Continue to Contact Info →
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center justify-between mb-6 border-b border-[var(--color-ldust)] pb-4">
                                <h2 className="font-display font-black text-2xl text-[var(--color-ink)]">Step 3: Contact Details</h2>
                                <button onClick={() => setStep(2)} className="text-xs text-[var(--color-rust)] font-bold hover:underline">Back</button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Your Area *</label>
                                <select value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] bg-white text-[var(--color-ink)]">
                                    <option value="">Select Area in Hyderabad</option>
                                    {['Kukatpally', 'Ameerpet', 'Abids', 'Koti', 'Dilsukhnagar', 'LB Nagar', 'Secunderabad', 'Madhapur', 'Banjara Hills', 'SR Nagar'].map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">WhatsApp Number *</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 15) })} className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]" placeholder="9876543210" />
                                <p className="text-[10px] text-[var(--color-dust)]">We will use this to contact you when your book is requested by a buyer.</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Additional Notes</label>
                                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] min-h-[80px]" placeholder="E.g., Any missing pages or torn cover?" />
                            </div>

                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="flex-1 bg-[var(--color-rust)] hover:bg-[#A93C23] text-white px-8 py-4 rounded-sm font-bold transition-colors mt-6 text-lg disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Book to Rebook India'}
                                </button>
                            </div>

                            {/* WhatsApp Alternative */}
                            <div className="text-center pt-6 border-t border-[var(--color-ldust)] mt-6">
                                <p className="text-sm font-bold text-[var(--color-ink)] mb-3">Or submit directly via WhatsApp</p>
                                <button
                                    onClick={() => window.open(waSell(), '_blank')}
                                    className="bg-[#25D366] text-white hover:bg-[#20bd5a] px-6 py-3 rounded-sm font-bold transition-colors text-sm shadow-md"
                                >
                                    Message +91 98765 43210
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
