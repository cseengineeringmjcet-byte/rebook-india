"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import BookCoverImage from "@/components/BookCoverImage";
import { Check, ShieldCheck, Truck, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useCart } from "@/store/useCart";

export default function CheckoutPage() {
  const router = useRouter();
  const { clear } = useCart();
  const { user, userDoc, isLoading } = useAuth();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    landmark: "",
    area: "Kukatpally",
    city: "Hyderabad",
    pincode: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [finalOrderNumber, setFinalOrderNumber] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (userDoc) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || userDoc.full_name || "",
        phone: prev.phone || userDoc.phone || "",
        area: userDoc.area || "Kukatpally"
      }));
    }
  }, [userDoc]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      setLoadingCart(true);
      try {
        const snap = await getDocs(
          query(collection(db, "cart"), where("user_id", "==", user.uid))
        );

        const fetchPromises = snap.docs.map(async (itemDoc) => {
          const bookId = itemDoc.data().book_id;
          if (!bookId) return null;

          const bookSnap = await getDoc(doc(db, "books", bookId));
          if (!bookSnap.exists()) return null;

          return {
            cartItemId: itemDoc.id,
            ...bookSnap.data(),
            id: bookSnap.id
          };
        });

        const items = (await Promise.all(fetchPromises)).filter(b => b !== null);
        setCartItems(items);
      } catch (err) {
        console.error("Failed to load cart for checkout", err);
      } finally {
        setLoadingCart(false);
      }
    };

    if (user) {
      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !loadingCart && user && cartItems.length === 0 && step !== 3) {
      router.push("/cart");
    }
  }, [isLoading, loadingCart, user, cartItems.length, step, router]);

  if (isLoading || loadingCart) {
    return (
      <div className="bg-[var(--color-cream)] min-h-screen py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-rust)] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  if (cartItems.length === 0 && step !== 3) {
    return null;
  }

  let total = 0;
  let savings = 0;
  cartItems.forEach(item => {
    total += Number(item.our_price || item.ourPrice || 0);
    savings += Number(item.savings || 0);
  });

  const submitOrder = async () => {
    if (!formData.name || !formData.phone || !formData.line1 || !formData.area || !formData.pincode) {
      toast.error("Please fill all required delivery details");
      return;
    }

    setSubmitting(true);
    try {
      const validateOrder = (books: any[]) => {
        if (!books || books.length === 0) {
          return 'Your cart is empty';
        }
        return null;
      }

      const orderError = validateOrder(cartItems);
      if (orderError) {
        toast.error(orderError);
        setSubmitting(false);
        return;
      }

      // 1. Generate order number
      const d = new Date();
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `RI${yy}${mm}${dd}-${random}`;

      // 2. Save to orders collection (one doc per item if multiple items, to match requested schema)
      const deliveryAddr = [formData.line1, formData.line2, formData.landmark].filter(Boolean).join(", ");

      for (const item of cartItems) {
        await addDoc(collection(db, "orders"), {
          order_number: orderNumber,
          buyer_id: user.uid,
          buyer_name: formData.name,
          buyer_phone: formData.phone,
          book_id: item.id,
          book_title: item.title || "",
          vendor_id: item.vendorId || item.vendor_id || "",
          vendor_name: item.vendorName || item.vendor_name || "",
          mrp: Number(item.mrp || 0),
          price_paid: Number(item.our_price || item.ourPrice || 0),
          savings: Number(item.savings || 0),
          delivery_name: formData.name,
          delivery_phone: formData.phone,
          delivery_addr: deliveryAddr,
          delivery_area: formData.area,
          delivery_pin: formData.pincode,
          buyer_notes: formData.notes,
          status: 'placed',
          placed_at: serverTimestamp(),
        });
      }

      // 3. Clear local Zustand and Remote Cart completely simultaneously 
      clear();

      // 4. Show success modal
      setFinalOrderNumber(orderNumber);
      setStep(3);
    } catch (e: any) {
      console.error("Order error", e);
      toast.error("Failed to place order: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 3) {
    const orderSummaryTitle = cartItems.length === 1 ? cartItems[0].title : `${cartItems[0].title} and ${cartItems.length - 1} more`;
    const waText = encodeURIComponent(`Hi! Order ${finalOrderNumber}.\nBook: ${orderSummaryTitle}.\nPrice: Rs${total}.\nPlease confirm!`);
    return (
      <div className="bg-[var(--color-cream)] min-h-screen py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-[var(--color-sage)] rounded-full flex items-center justify-center shadow-lg border-4 border-white mx-auto mb-6 text-white border-opacity-10">
            <Check size={48} strokeWidth={3} />
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] mb-4">
            Order Placed!
          </h1>
          <p className="text-[var(--color-dust)] mb-4 text-lg">
            Your Order Number is <span className="font-mono text-[var(--color-rust)] font-bold">{finalOrderNumber}</span>
          </p>

          <div className="bg-white p-6 rounded-sm border border-[var(--color-ldust)] mb-8 text-left shadow-sm flex items-start gap-4">
            <ShieldCheck className="text-[var(--color-sage)] shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-[var(--color-ink)] mb-1">Zero Risk Payment</h4>
              <p className="text-xs text-[var(--color-dust)] leading-relaxed">
                You haven't paid anything online. You will pay directly to the vendor only when you pick up the book or upon delivery.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="bg-[var(--color-ink)] hover:bg-[#1a1c23] text-white px-8 py-4 rounded-sm font-bold shadow-md transition-colors flex justify-center items-center"
            >
              View Orders
            </Link>
            <button
              onClick={() => window.open(`https://wa.me/916301038443?text=${waText}`, "_blank")}
              className="bg-[#25D366] text-white hover:bg-[#20bd5a] px-8 py-4 rounded-sm font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
            >
              Message on WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-cream)] min-h-screen py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4">

        <div className="flex items-center justify-center mb-10 gap-2 md:gap-4 text-xs md:text-sm font-bold uppercase tracking-wider">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-[var(--color-rust)]" : "text-[var(--color-dust)]"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? "bg-[var(--color-rust)] text-white" : "bg-[var(--color-ldust)]"}`}>1</span>
            <span className="hidden sm:inline">Delivery Form</span>
          </div>
          <ChevronRight size={16} className="text-[var(--color-ldust)]" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-[var(--color-rust)]" : "text-[var(--color-dust)]"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? "bg-[var(--color-rust)] text-white" : "bg-[var(--color-ldust)]"}`}>2</span>
            <span className="hidden sm:inline">Confirm Order</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-[var(--color-ldust)]">
              <h2 className="font-display font-black text-2xl text-[var(--color-ink)] mb-6 border-b border-[var(--color-ldust)] pb-4">
                {step === 1 ? "Delivery Details" : "Review Details"}
              </h2>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Address Line 1 *</label>
                    <input
                      type="text"
                      value={formData.line1}
                      onChange={e => setFormData({ ...formData, line1: e.target.value })}
                      placeholder="House No, Building, Street"
                      className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.line2}
                      onChange={e => setFormData({ ...formData, line2: e.target.value })}
                      placeholder="Apartment, Suite, Unit, etc."
                      className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Landmark</label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                        className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Area *</label>
                      <select
                        value={formData.area}
                        onChange={e => setFormData({ ...formData, area: e.target.value })}
                        className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                      >
                        {["Kukatpally", "Ameerpet", "Abids", "Koti", "Dilsukhnagar", "LB Nagar", "Secunderabad", "Madhapur", "Banjara Hills", "Himayatnagar", "SR Nagar", "Tarnaka", "Afzalgunj", "Begumpet", "Mehdipatnam"].map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        readOnly
                        value={formData.city}
                        className="w-full border border-[var(--color-ldust)] bg-[var(--color-ldust)]/20 text-[var(--color-dust)] rounded-sm px-4 py-3 focus:outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Pincode *</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special delivery instructions?"
                      className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] min-h-[80px]"
                    />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-white px-8 py-4 rounded-sm font-bold transition-colors mt-4 text-lg"
                  >
                    Proceed
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-[var(--color-paper)] border border-[var(--color-ldust)] p-4 rounded-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[var(--color-ink)]">{formData.name}</h4>
                      <button onClick={() => setStep(1)} className="text-xs font-bold text-[var(--color-rust)] hover:underline">
                        Edit
                      </button>
                    </div>
                    <p className="text-sm text-[var(--color-dust)] leading-relaxed">
                      {formData.line1}, {formData.line2 && formData.line2 + ", "}{formData.landmark && formData.landmark + ", "}{formData.area}, {formData.city} - {formData.pincode}
                      <br />
                      Phone: {formData.phone}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-ink)] uppercase tracking-wider border-b border-[var(--color-ldust)] pb-2 mb-4">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.cartItemId} className="flex items-center gap-3">
                          <div className="w-[40px] shrink-0 border border-[var(--color-ldust)]">
                            <BookCoverImage isbn={item.isbn || ''} title={item.title || ''} category={item.category || item.category_id} coverUrl={item.photo_url || item.cover_url || item.coverUrl} />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-sm text-[var(--color-ink)] line-clamp-1">{item.title}</div>
                            <div className="text-xs text-[var(--color-dust)] italic">{item.vendorName || item.vendor_name || "Vendor"}</div>
                          </div>
                          <div className="font-mono font-bold text-[var(--color-sage)] text-sm">₹{item.our_price || item.ourPrice}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#25D366]/10 border border-[#25D366]/30 p-4 rounded-sm flex items-start gap-3 mt-4">
                    <Truck className="text-[#128c7e] shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-bold text-[#128c7e] text-sm mb-1">WhatsApp Confirmation</h4>
                      <p className="text-xs text-[#128c7e]/80">If confirmed with vendors, we arrange pickup.</p>
                    </div>
                  </div>

                  <button
                    onClick={submitOrder}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--color-rust)] hover:bg-[#A93C23] text-white py-4 rounded-sm font-bold shadow-md transition-colors text-lg disabled:opacity-50"
                  >
                    {submitting ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm shadow-sm border border-[var(--color-ldust)] p-6 sticky top-24">
              <h3 className="font-display font-bold text-xl text-[var(--color-ink)] mb-6 border-b border-[var(--color-ldust)] pb-4">
                Cart Summary
              </h3>
              <div className="space-y-4 mb-2 border-b border-[var(--color-ldust)] pb-6">
                <div className="flex justify-between text-[var(--color-dust)] text-sm">
                  <span>Total Items</span>
                  <span className="font-mono">{cartItems.length}</span>
                </div>
                <div className="flex justify-between text-[var(--color-rust)] font-bold text-sm">
                  <span>Your Savings</span>
                  <span className="font-mono">- ₹{savings}</span>
                </div>
                <div className="flex justify-between text-[var(--color-dust)] text-sm">
                  <span>Delivery Charge</span>
                  <span className="font-mono text-[var(--color-sage)]">₹0</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="font-bold text-[var(--color-ink)] text-lg">Total</span>
                <span className="font-mono font-black text-[var(--color-sage)] text-2xl">₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
