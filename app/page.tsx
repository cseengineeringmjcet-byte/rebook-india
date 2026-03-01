"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useDataStore } from '@/store/useDataStore';
import { useWishlist } from '@/store/useWishlist';
import { useCart } from '@/store/useCart';
import { waBook, waVendor } from '@/lib/whatsapp';
import BookCoverImage from '@/components/BookCoverImage';
import RebookIndiaLogo from '@/components/Logo';
import { Heart, CheckCircle2, MessageCircle, MapPin, Check } from 'lucide-react';
import { toast } from 'sonner';

// --- Animated Counter Hook ---
function AnimatedCounter({ from = 0, to, duration = 2 }: { from?: number; to: number; duration?: number }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      animate(count, to, { duration, ease: "easeOut" });
    }
  }, [count, inView, to, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function Home() {
  const { books, vendors } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [mrpInput, setMrpInput] = useState<number>(1000);
  const [sellMrp, setSellMrp] = useState<number | ''>('');
  const { toggle: toggleWishlist, has: hasWishlist } = useWishlist();
  const { addItem: addCart, hasItem } = useCart();

  useEffect(() => {
    const visited = localStorage.getItem('ri_visited');
    if (visited || process.env.NODE_ENV === 'development') { // Skip loader in dev for speed, or if visited
      // Wait, let's keep it for prod/dev if they specifically asked for 2 seconds.
      // prompt: skip if localStorage has ri_visited
    }
    if (visited) {
      setTimeout(() => setLoading(false), 0);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
        localStorage.setItem('ri_visited', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--color-ink)] flex flex-col items-center justify-center">
        <RebookIndiaLogo variant="loader" darkBg />
        <div className="mt-8 w-64 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-rust)] to-[var(--color-amber)]"
          />
        </div>
        <p className="mt-6 text-[var(--color-dust)] text-[10px] tracking-[3px] uppercase font-bold">
          Every Book Deserves a Second Life
        </p>
      </div>
    );
  }

  // Derived Books
  const tabs = ['All', '⚙️ Engineering', '🏥 Medical', '⚡ JEE', '🏛️ UPSC', '🎓 School', '💡 Self-Help', '📝 Fiction'];
  const filteredBooks = activeTab === 'All' ? books : books.filter(b => {
    if (activeTab.includes('Engineering')) return b.category === 'engineering';
    if (activeTab.includes('Medical')) return b.category === 'medical';
    if (activeTab.includes('JEE')) return b.category === 'jee';
    if (activeTab.includes('UPSC')) return b.category === 'upsc';
    if (activeTab.includes('School')) return b.category === 'school';
    if (activeTab.includes('Self-Help')) return b.category === 'selfhelp';
    if (activeTab.includes('Fiction')) return b.category === 'fiction';
    return true;
  });

  const featuredVendors = vendors.filter(v => v.isFeatured).slice(0, 6);

  // Stats Calc
  const ourPrice = Math.round(mrpInput * 0.5);
  const vEarns = Math.round(ourPrice * 0.8);
  const rEarns = Math.round(ourPrice * 0.2);
  const bSaves = mrpInput - ourPrice;

  const heroBooks = [
    books.find(b => b.id === 'b1'), books.find(b => b.id === 'b15'), books.find(b => b.id === 'b31'),
    books.find(b => b.id === 'b22'), books.find(b => b.id === 'b11'), books.find(b => b.id === 'b2'),
    books.find(b => b.id === 'b32'), books.find(b => b.id === 'b33'), books.find(b => b.id === 'b34'),
  ].filter(Boolean) as typeof books;

  return (
    <div className="flex flex-col min-h-screen">

      {/* HERO SECTION */}
      <section className="min-h-screen bg-[var(--color-ink)] pt-16 grid grid-cols-1 lg:grid-cols-[55%_45%] relative overflow-hidden">
        {/* Left Panel */}
        <div className="px-6 lg:pl-16 xl:pl-24 py-12 lg:py-24 flex flex-col justify-center relative z-10">
          <motion.div
            initial="hidden" animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
              hidden: {}
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-8">
              <RebookIndiaLogo variant="hero" darkBg />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-2 mb-6 text-white/90 text-sm font-bold bg-white/5 py-1.5 px-3 rounded-full w-fit">
              <div className="w-2 h-2 rounded-full bg-[var(--color-amber)] animate-bdot" />
              Live in Hyderabad — Shark Tank India Ready
            </motion.div>

            <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="font-display italic text-[var(--color-amber)] opacity-50 text-xl lg:text-2xl mb-2">
              &quot;पुस्तकें महंगी हों तो पढ़ाई क्यों रुके?&quot;
            </motion.h2>

            <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="font-display font-black text-[var(--color-cream)] leading-[1.1] text-[clamp(28px,3.5vw,46px)] mb-6">
              Why Should <span className="text-[var(--color-amber)]">Expensive Books</span> Stop Your Dreams?
            </motion.h1>

            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-[var(--color-ldust)] text-[15px] leading-relaxed max-w-xl mb-6">
              Rebook India connects Hyderabad&apos;s students with 15 trusted second-hand book vendors. Real books. 50% off MRP. Always.
            </motion.p>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="border-l-2 border-[var(--color-rust)] pl-3 py-1 text-[var(--color-dust)] text-sm mb-10">
              మీ పుస్తకాలు అమ్మండి — మంచి ధర పొందండి
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/browse" className="bg-[var(--color-rust)] hover:bg-[#A93C23] text-white px-8 py-4 rounded-sm font-bold text-center transition-colors shadow-lg">
                Browse Books in Hyderabad →
              </Link>
              <Link href="/sell" className="border border-[var(--color-cream)] hover:bg-[var(--color-cream)] hover:text-[var(--color-ink)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold text-center transition-all bg-white/5 backdrop-blur-sm">
                📱 Sell Your Books
              </Link>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-4 gap-4 border-t border-[var(--color-amber)]/10 pt-8">
              <div className="flex flex-col"><span className="text-[var(--color-cream)] font-bold text-lg lg:text-xl">15</span><span className="text-[var(--color-dust)] text-xs font-bold uppercase tracking-wider">Trusted Vendors</span></div>
              <div className="flex flex-col"><span className="text-[var(--color-cream)] font-bold text-lg lg:text-xl">14.2K+</span><span className="text-[var(--color-dust)] text-xs font-bold uppercase tracking-wider">Books</span></div>
              <div className="flex flex-col"><span className="text-[var(--color-cream)] font-bold text-lg lg:text-xl">62K+</span><span className="text-[var(--color-dust)] text-xs font-bold uppercase tracking-wider">Families</span></div>
              <div className="flex flex-col"><span className="text-[var(--color-cream)] font-bold text-lg lg:text-xl">₹48L+</span><span className="text-[var(--color-dust)] text-xs font-bold uppercase tracking-wider">Saved</span></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex bg-[var(--color-paper)] p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          <div className="grid grid-cols-3 gap-6 w-full max-w-[500px] relative z-10 perspective-[1000px]">
            {heroBooks.slice(0, 9).map((b, i) => (
              <Link href={`/book/${b.id}`} key={b.id || i} className="group relative transform transition-all duration-500 hover:-translate-y-2 hover:animate-none hover:rotate-0 hover:z-20 shadow-xl hover:shadow-2xl flex"
                style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (1.5 + ((i % 3) * 0.5))}deg)` }}>
                <BookCoverImage book={b} className="w-full" />
              </Link>
            ))}
          </div>

          <div className="absolute top-8 right-8 bg-white p-3 shadow-2xl rounded-sm border border-[var(--color-ldust)] flex items-center gap-3 animate-float z-30 pointer-events-none max-w-[200px]">
            <div className="text-2xl">📚</div>
            <div className="text-xs leading-tight font-medium text-[var(--color-ink)]">
              BS Grewal sold ₹475<br /><span className="text-[var(--color-dust)]">Kukatpally · 2 min ago</span>
            </div>
          </div>

          <div className="absolute bottom-16 left-8 bg-white p-3 shadow-2xl rounded-sm border border-[var(--color-ldust)] flex items-center gap-3 animate-float z-30 pointer-events-none max-w-[200px]" style={{ animationDelay: '1.5s' }}>
            <div className="text-2xl">🩺</div>
            <div className="text-xs leading-tight font-medium text-[var(--color-ink)]">
              Gray&apos;s Anatomy listed<br /><span className="text-[var(--color-dust)]">₹1,250 · Afzalgunj</span>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE TICKER */}
      <div className="bg-[var(--color-rust)] text-white py-2 overflow-hidden ticker-wrap relative">
        <div className="flex whitespace-nowrap animate-ticker ticker-inner text-sm font-bold tracking-wider">
          <span className="mx-4">◆ BS Grewal sold ₹475 Kukatpally</span>
          <span className="mx-4">◆ Gray&apos;s Anatomy listed ₹1250 Afzalgunj</span>
          <span className="mx-4">◆ Laxmikant order placed LB Nagar</span>
          <span className="mx-4">◆ HC Verma Part 1+2 sold SR Nagar</span>
          <span className="mx-4 text-[var(--color-gold)]">◆ 14200th book milestone 🏆</span>
          <span className="mx-4">◆ Atomic Habits sold ₹300 Himayatnagar</span>
          <span className="mx-4">◆ CLRS sold ₹925 Madhapur</span>
          <span className="mx-4 text-white">◆ New buyer from Dilsukhnagar 🎉</span>
          {/* Duplicate for seamless loop */}
          <span className="mx-4">◆ BS Grewal sold ₹475 Kukatpally</span>
          <span className="mx-4">◆ Gray&apos;s Anatomy listed ₹1250 Afzalgunj</span>
          <span className="mx-4">◆ Laxmikant order placed LB Nagar</span>
          <span className="mx-4">◆ HC Verma Part 1+2 sold SR Nagar</span>
          <span className="mx-4 text-[var(--color-gold)]">◆ 14200th book milestone 🏆</span>
          <span className="mx-4">◆ Atomic Habits sold ₹300 Himayatnagar</span>
          <span className="mx-4">◆ CLRS sold ₹925 Madhapur</span>
          <span className="mx-4 text-white">◆ New buyer from Dilsukhnagar 🎉</span>
        </div>
      </div>

      {/* PRICING CALCULATOR */}
      <section id="calculator" className="py-20 bg-[var(--color-cream)] flex justify-center px-4">
        <div className="max-w-4xl w-full bg-white p-8 md:p-12 shadow-xl border border-[var(--color-ldust)] rounded-[4px] relative">
          <div className="text-center mb-10">
            <h2 className="font-display font-black text-3xl md:text-4xl text-[var(--color-ink)] mb-4">Transparent Pricing Math</h2>
            <p className="text-[var(--color-dust)] max-w-xl mx-auto italic font-display">&quot;We are transparent about what we earn. Trust matters more than money.&quot;</p>
          </div>

          <div className="mb-12">
            <label className="block text-center font-bold text-[var(--color-ink)] mb-4 text-lg">Change Book MRP to See Magic:</label>
            <input
              type="range" min="100" max="5000" step="50"
              value={mrpInput} onChange={(e) => setMrpInput(Number(e.target.value))}
              className="w-full h-3 bg-[var(--color-ldust)] rounded-lg appearance-none cursor-pointer accent-[var(--color-rust)]"
            />
            <div className="text-center mt-4 font-mono text-xl font-bold text-[var(--color-dust)]">₹{mrpInput}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-[var(--color-paper)] p-4 rounded-sm border-t-4 border-[var(--color-rust)] text-center">
              <div className="text-xs uppercase text-[var(--color-dust)] font-bold mb-1 line-through">MRP</div>
              <div className="text-xl font-mono text-[var(--color-ink)] opacity-50 line-through">₹{mrpInput}</div>
            </div>
            <div className="bg-[var(--color-paper)] p-4 rounded-sm border-t-4 border-[var(--color-ink)] text-center shadow-md transform -translate-y-1">
              <div className="text-xs uppercase text-[var(--color-ink)] font-bold mb-1">Our Price (50%)</div>
              <div className="text-2xl font-mono text-[var(--color-ink)] font-bold">₹{ourPrice}</div>
            </div>
            <div className="bg-[var(--color-paper)] p-4 rounded-sm border-t-4 border-[var(--color-sage)] text-center">
              <div className="text-xs uppercase text-[var(--color-sage)] font-bold mb-1">Vendor (80%)</div>
              <div className="text-xl font-mono text-[var(--color-sage)] font-bold">₹{vEarns}</div>
            </div>
            <div className="bg-[var(--color-paper)] p-4 rounded-sm border-t-4 border-[var(--color-ink)] text-center">
              <div className="text-xs uppercase text-[var(--color-ink)] font-bold mb-1 opacity-70">Rebook (20%)</div>
              <div className="text-xl font-mono text-[var(--color-ink)] font-bold">₹{rEarns}</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-amber)] p-6 rounded-sm text-center shadow-lg transform -translate-y-2 mt-6 border border-white/20">
            <div className="text-sm uppercase text-[var(--color-ink)] font-black tracking-widest mb-1">Your Total Savings</div>
            <div className="text-4xl md:text-5xl font-mono text-[var(--color-ink)] font-black">₹{bSaves}</div>
          </div>
        </div>
      </section>

      {/* BOOKS SECTION */}
      <section className="py-20 bg-[var(--color-paper)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-black text-3xl md:text-4xl text-[var(--color-ink)]">Recently Added Books</h2>
            <Link href="/browse" className="text-[var(--color-rust)] font-bold hover:underline hidden md:block">View All Books →</Link>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-10 pb-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === tab
                  ? 'bg-[var(--color-rust)] text-white shadow-md'
                  : 'bg-[var(--color-cream)] text-[var(--color-dust)] hover:bg-white border border-[var(--color-ldust)]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredBooks.slice(0, 10).map(book => (
              <div key={book.id} className="bg-white group rounded-sm shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
                <div className="relative">
                  <Link href={`/book/${book.id}`} className="block">
                    <BookCoverImage book={book} />
                  </Link>
                  <div className="absolute top-2 right-2 bg-[var(--color-rust)] text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm">
                    50% OFF
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-sm">
                      {book.condition.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(book.id); toast.success(hasWishlist(book.id) ? "Removed from wishlist" : "Added to wishlist"); }}
                    className={`absolute top-2 left-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors ${hasWishlist(book.id) ? 'text-red-500' : 'text-[var(--color-dust)] hover:text-red-500'}`}
                  >
                    <Heart size={16} fill={hasWishlist(book.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Link href={`/book/${book.id}`} className="hover:text-[var(--color-rust)]">
                    <h3 className="font-display font-bold text-sm text-[var(--color-ink)] line-clamp-2 leading-snug mb-1 hover:text-[var(--color-rust)]">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-[10px] text-[var(--color-dust)] uppercase mb-3 flex-1">{book.author}</p>

                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-lg font-bold text-[var(--color-sage)]">₹{book.ourPrice}</span>
                      <span className="font-mono text-xs line-through text-[var(--color-dust)]">₹{book.mrp}</span>
                    </div>
                    <div className="text-[11px] font-bold text-[var(--color-rust)] bg-[var(--color-rust)]/10 inline-block px-1.5 py-0.5 rounded-sm mt-1">
                      Save ₹{book.savings}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-[var(--color-dust)] mb-4">
                    <MapPin size={10} />
                    <span className="truncate">{book.vendorName}, {book.area}</span>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (!hasItem(book.id)) {
                          addCart(book);
                          toast.success(`Added to cart: ${book.title}`);
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-sm transition-colors ${hasItem(book.id) ? 'bg-[var(--color-sage)] text-white' : 'bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-white'}`}
                    >
                      {hasItem(book.id) ? <><Check size={14} /> In Cart</> : 'Add to Cart'}
                    </button>
                    <a
                      href={waBook(book)}
                      target="_blank" rel="noopener noreferrer"
                      className="w-8 flex items-center justify-center bg-[#25D366]/10 text-[#25D366] rounded-sm hover:bg-[#25D366] hover:text-white transition-colors"
                    >
                      <MessageCircle size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length > 10 && (
            <div className="text-center mt-12 block md:hidden">
              <Link href={`/browse`} className="border border-[var(--color-ink)] text-[var(--color-ink)] px-6 py-3 font-bold rounded-sm inline-block">
                View All Books →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-[var(--color-cream)] border-t border-[var(--color-ldust)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-3xl md:text-4xl text-[var(--color-ink)] mb-4">How Rebook Works</h2>
            <p className="text-[var(--color-dust)]">No payment gateways. Direct interaction. Trust-based system.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[var(--color-ldust)] via-[var(--color-amber)] to-[var(--color-ldust)] z-0" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { n: 1, t: "Browse & Find", d: "Search 35+ verified books at exactly 50% discount", icon: "🔍" },
                { n: 2, t: "Place Request", d: "Add to cart and submit order with no payment", icon: "🛒" },
                { n: 3, t: "Admin Confirms", d: "We confirm stock via WhatsApp in 24 hrs", icon: "💬" },
                { n: 4, t: "Book Delivered", d: "Pay directly to vendor upon collection", icon: "🤝" }
              ].map(step => (
                <div key={step.n} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[var(--color-cream)] mb-6 text-3xl">
                    {step.icon}
                  </div>
                  <div className="text-[var(--color-rust)] font-bold mb-2 uppercase tracking-wider text-xs">Step {step.n}</div>
                  <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-2">{step.t}</h3>
                  <p className="text-[var(--color-dust)] text-sm px-4">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className="py-20 bg-[var(--color-ink)] text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-3xl md:text-4xl text-[var(--color-cream)] mb-4">Our Impact in Hyderabad</h2>
            <div className="w-16 h-1 bg-[var(--color-rust)] mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-6 text-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-mono text-[var(--color-amber)] font-bold mb-2">
                <AnimatedCounter to={62000} />+
              </div>
              <div className="text-[var(--color-ldust)] uppercase tracking-wider text-xs font-bold">Families Helped</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-mono text-[var(--color-amber)] font-bold mb-2">
                <AnimatedCounter to={14200} />+
              </div>
              <div className="text-[var(--color-ldust)] uppercase tracking-wider text-xs font-bold">Books Available</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-mono text-[var(--color-amber)] font-bold mb-2">
                ₹<AnimatedCounter to={48} />L+
              </div>
              <div className="text-[var(--color-ldust)] uppercase tracking-wider text-xs font-bold">Total Savings</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-mono text-[var(--color-amber)] font-bold mb-2">
                <AnimatedCounter to={15} />
              </div>
              <div className="text-[var(--color-ldust)] uppercase tracking-wider text-xs font-bold">Trusted Vendors</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-mono text-[var(--color-amber)] font-bold mb-2">
                <AnimatedCounter to={50} />%
              </div>
              <div className="text-[var(--color-ldust)] uppercase tracking-wider text-xs font-bold">Average Savings</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-mono text-[var(--color-sage)] font-bold mb-2">
                ₹<AnimatedCounter to={0} />
              </div>
              <div className="text-[var(--color-ldust)] uppercase tracking-wider text-xs font-bold">Paid Advertising</div>
            </div>
          </div>
        </div>
      </section>

      {/* VENDORS SECTION */}
      <section className="py-20 bg-[var(--color-paper)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-3xl md:text-4xl text-[var(--color-ink)] mb-4">Our Local Heroes</h2>
            <p className="text-[var(--color-dust)] max-w-2xl mx-auto">15 trusted vendors across Hyderabad supporting affordable education.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredVendors.map(v => (
              <Link href={`/vendor/${v.id}`} key={v.id} className="bg-white rounded-sm overflow-hidden shadow-md group hover:-translate-y-1 transition-transform block">
                <div className="h-[140px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                  <img src={v.shopImage} alt={v.shopName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase flex items-center gap-1 border border-white/20">
                    {v.badge === 'Elite' && '🏆 '} {v.badge}
                  </div>
                  <div className="absolute top-3 right-3 z-20 bg-white text-[var(--color-ink)] text-xs font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-md">
                    ⭐ {v.rating}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-1">{v.shopName}</h3>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-rust)] mb-3">{v.speciality}</div>

                  <div className="flex items-center justify-between text-sm text-[var(--color-dust)] mb-5">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {v.area}</span>
                    <span className="font-mono">{v.totalBooks} Books</span>
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); window.open(waVendor(v), '_blank'); }}
                    className="w-full bg-[#25D366]/10 text-[#128c7e] hover:bg-[#25D366] hover:text-white py-2 rounded-sm font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle size={16} /> WhatsApp Vendor
                  </button>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/vendors" className="bg-white border border-[var(--color-ldust)] text-[var(--color-ink)] px-8 py-3 font-bold rounded-sm inline-block hover:border-[var(--color-ink)] transition-colors shadow-sm">
              See all 15 vendors →
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-[var(--color-ink)] text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-sm border border-white/10 backdrop-blur-sm relative">
              <div className="text-[var(--color-amber)] text-xl mb-4">★★★★★</div>
              <p className="font-display italic text-[var(--color-ldust)] mb-6 text-lg leading-relaxed">
                &quot;My son needed 6 MBBS books. New price ₹14,000. Rebook India ₹7,000. We saved ₹7,000 in one order.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-rust)] flex items-center justify-center font-bold">AR</div>
                <div>
                  <div className="font-bold text-sm">Asha Reddy</div>
                  <div className="text-xs text-white/50">Dilsukhnagar</div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-amber)]/10 p-8 rounded-sm border border-[var(--color-amber)]/30 backdrop-blur-sm relative transform md:-translate-y-4 shadow-xl shadow-black/50">
              <div className="text-[var(--color-amber)] text-xl mb-4">★★★★★</div>
              <p className="font-display italic text-[#ffe5b4] mb-6 text-lg leading-relaxed">
                &quot;BS Grewal, Galvin OS, CLRS — all 3 for ₹1,900 instead of ₹4,200. Honest platform.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-amber)] text-[var(--color-ink)] flex items-center justify-center font-bold">KR</div>
                <div>
                  <div className="font-bold text-sm">Karthik Rao</div>
                  <div className="text-xs text-white/50">JNTU Kukatpally</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-8 rounded-sm border border-white/10 backdrop-blur-sm relative">
              <div className="text-[var(--color-amber)] text-xl mb-4">★★★★★</div>
              <p className="font-display italic text-[var(--color-ldust)] mb-6 text-lg leading-relaxed">
                &quot;UPSC prep Laxmikant Bipin Chandra GC Leong all half price. Every rupee counts.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-sage)] flex items-center justify-center font-bold">RN</div>
                <div>
                  <div className="font-bold text-sm">Ramesh Naidu</div>
                  <div className="text-xs text-white/50">LB Nagar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SELL SECTION */}
      <section className="py-20 bg-[var(--color-cream)]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] mb-6 leading-tight">
              Got old books? <br />Turn them into <span className="text-[var(--color-sage)] border-b-4 border-[var(--color-sage)]">cash</span>.
            </h2>

            <div className="bg-white p-6 rounded-sm shadow-md border border-[var(--color-ldust)] mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Check what you&apos;ll earn:</label>
              <div className="flex items-center gap-4">
                <div className="relative w-1/2">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-mono text-[var(--color-dust)]">₹</span>
                  <input
                    type="number" min="100" placeholder="Book MRP"
                    value={sellMrp} onChange={e => setSellMrp(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-[var(--color-paper)] border border-[var(--color-ldust)] rounded-sm font-mono focus:outline-none focus:border-[var(--color-rust)]"
                  />
                </div>
                <div className="text-xl md:text-2xl font-mono font-bold text-[var(--color-sage)]">
                  → Earn ₹{sellMrp ? Math.round((sellMrp as number * 0.5) * 0.8) : '0'}
                </div>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {['Highest returns in market (80% of listing price)', 'Free pickup from your college or home', 'Trusted by 15,000+ students', 'Zero listing fee'].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-[var(--color-ink)] font-medium">
                  <CheckCircle2 className="text-[var(--color-sage)] shrink-0 mt-0.5" size={20} />
                  {text}
                </li>
              ))}
            </ul>

            <Link href="/sell" className="bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold shadow-lg transition-colors inline-block text-lg">
              Sell My Book Now
            </Link>
          </div>

          <div className="bg-[var(--color-ink)] p-8 md:p-10 rounded-sm shadow-2xl relative overflow-hidden text-white transform md:rotate-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-rust)] rounded-full blur-3xl opacity-20" />

            <h3 className="font-display font-black text-2xl text-[var(--color-cream)] mb-8">How the money flows:</h3>

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[var(--color-ldust)] text-sm">Original MRP</span>
                <span className="font-mono text-xl line-through opacity-50">₹1000</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white font-bold">Listed on Rebook</span>
                <span className="font-mono text-xl">₹500</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--color-amber)] font-bold text-lg">You Earn (80%)</span>
                <span className="font-mono text-3xl font-black text-[var(--color-sage)] bg-white/10 px-3 py-1 rounded-sm">₹400</span>
              </div>
              <div className="flex justify-between items-center mt-2 opacity-50">
                <span className="text-sm">Rebook Earns (20%)</span>
                <span className="font-mono">₹100</span>
              </div>
            </div>

            <p className="mt-8 text-xs text-white/40 italic">* Calculations based on standard complete condition books.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
