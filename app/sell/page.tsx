"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { db, storage } from "@/lib/firebase/config";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";

const CATEGORIES = [
    { id: "engineering", name: "B.Tech Engineering" },
    { id: "medical", name: "MBBS Medical" },
    { id: "jee", name: "JEE Mains & Advanced" },
    { id: "neet", name: "NEET UG" },
    { id: "upsc", name: "UPSC Civil Services" },
    { id: "bank", name: "Bank PO & SSC" },
    { id: "science", name: "Class 11-12 Science" },
    { id: "secondary", name: "Class 9-10 CBSE" },
    { id: "school", name: "Class 1-8 School" },
    { id: "mba", name: "MBA & CAT" },
    { id: "ca", name: "CA & CMA" },
    { id: "law", name: "Law & CLAT" },
    { id: "selfhelp", name: "Self-Help & Business" },
    { id: "fiction", name: "Fiction & Literature" },
    { id: "regional", name: "Telugu & Regional" },
];

const AREAS = [
    "Abids", "Koti", "Ameerpet", "Kukatpally", "Dilsukhnagar",
    "LB Nagar", "Secunderabad", "Banjara Hills", "Himayatnagar",
    "SR Nagar", "Madhapur", "Tarnaka", "Afzalgunj", "Begumpet", "Mehdipatnam",
];

const CONDITIONS = [
    { id: "Like New", label: "Like New" },
    { id: "Good", label: "Good" },
    { id: "Fair", label: "Fair" },
    { id: "Acceptable", label: "Acceptable" },
];

export default function SellPage() {
    const { user, userDoc, isLoading } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1); // 1 = form, 2 = success
    const [loadingMsg, setLoadingMsg] = useState("");

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0].id);
    const [mrp, setMrp] = useState("");
    const [condition, setCondition] = useState("Like New");
    const [description, setDescription] = useState("");
    const [area, setArea] = useState("");

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    // 1: Require login. If not logged in redirect to /auth.
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/auth");
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--color-rust)] border-t-transparent"></div>
            </div>
        );
    }

    // Set default area if available from userProfile
    useEffect(() => {
        if (userDoc?.area && !area) {
            setArea(userDoc.area);
        }
    }, [userDoc, area]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files).slice(0, 3);
            setFiles(selectedFiles);

            const newPreviews = selectedFiles.map((file) =>
                URL.createObjectURL(file)
            );
            setPreviews(newPreviews);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !author || !mrp) {
            toast.error("Please fill in all required book details.");
            return;
        }
        if (!area) {
            toast.error("Please select your area.");
            return;
        }
        if (files.length === 0) {
            toast.error("Please upload at least one photo of the book.");
            return;
        }

        setLoadingMsg("Uploading photo...");
        try {
            // Step 1: Upload photos to Firebase Storage
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const timestamp = Date.now();
                const path = `book-photos/${user.uid}/${timestamp}-${file.name}`;
                const storageRef = ref(storage, path);
                try {
                    await uploadBytes(storageRef, file);
                    const downloadUrl = await getDownloadURL(storageRef);
                    uploadedUrls.push(downloadUrl);
                } catch (uploadErr) {
                    console.error("Storage Error:", uploadErr);
                    toast.error("Photo upload failed. Please try again.");
                    setLoadingMsg("");
                    return; // Stop the process
                }
            }

            // Step 2: Save listing to Firestore book_listings collection
            const docId = crypto.randomUUID();
            const listingData = {
                seller_id: user.uid,
                seller_name: userDoc?.full_name || user.displayName || "Unknown Seller",
                seller_phone: userDoc?.phone || "",
                title: title,
                author: author,
                category_id: category,
                mrp: Number(mrp),
                condition: condition,
                description: description,
                seller_area: area,
                photo_url: uploadedUrls[0], // Firebase Storage URL
                photo_1: uploadedUrls[0],   // same URL saved here too
                status: "pending",
                created_at: serverTimestamp(),
            };

            try {
                await setDoc(doc(db, "book_listings", docId), listingData);
            } catch (firestoreErr: any) {
                console.error("Firestore Error:", firestoreErr);
                toast.error("Firestore Save Failed: " + firestoreErr.message);
                setLoadingMsg("");
                return;
            }

            // Step 3: Show success message:
            setLoadingMsg("");
            setStep(2);
            toast.success("Your book has been submitted for review!");
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
            setLoadingMsg("");
        }
    };

    if (step === 2) {
        return (
            <div className="bg-[var(--color-cream)] min-h-screen py-20 flex flex-col justify-center">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white mx-auto mb-6 text-white">
                        <CheckCircle2 size={48} strokeWidth={3} />
                    </div>
                    <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-ink)] mb-4 animate-in fade-in slide-in-from-bottom-4">
                        Your book has been submitted for review!
                    </h1>
                    <p className="text-[var(--color-dust)] mb-12 text-lg font-bold">
                        Admin will contact you within 24 hours.
                    </p>
                    <button
                        onClick={() => {
                            setStep(1);
                            setTitle("");
                            setAuthor("");
                            setMrp("");
                            setDescription("");
                            setFiles([]);
                            setPreviews([]);
                        }}
                        className="bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold shadow-md transition-colors inline-flex justify-center flex-col items-center text-lg w-full max-w-sm"
                    >
                        Sell Another Book
                    </button>
                </div>
            </div>
        );
    }

    const earnAmount = mrp ? Math.round(Number(mrp) * 0.4) : 0;

    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-12">
            <div className="max-w-3xl mx-auto px-4">

                <div className="mt-4 bg-white shadow-sm border border-[var(--color-ldust)] rounded-sm overflow-hidden">
                    <div className="bg-[var(--color-ink)] p-6 md:p-8 text-white text-center">
                        <h1 className="font-display font-black text-3xl md:text-5xl text-[var(--color-cream)] mb-2">List a Book</h1>
                        <p className="text-[var(--color-ldust)] text-sm md:text-base font-bold">Clear out your shelves and earn cash instantly.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider block">Book Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                                    placeholder="e.g. Operating System Concepts"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider block">Author *</label>
                                <input
                                    type="text"
                                    required
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                                    placeholder="e.g. Abraham Silberschatz"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider block">Category *</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider block">Your Area *</label>
                                <select
                                    required
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                                >
                                    <option value="" disabled>Select your area</option>
                                    {AREAS.map((a) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider block">MRP (Original Price) *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={mrp}
                                onChange={(e) => setMrp(e.target.value)}
                                className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)]"
                                placeholder="e.g. 500"
                            />
                            {mrp && (
                                <div className="text-sm text-green-700 font-bold bg-green-50 px-4 py-2 mt-2 rounded-sm border border-green-200 shadow-sm inline-block">
                                    You earn Rs {earnAmount} when this sells
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider block">Condition *</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {CONDITIONS.map((cond) => (
                                    <label key={cond.id} className={`flex items-center gap-2 cursor-pointer border p-3 rounded-sm justify-center transition-colors ${condition === cond.id ? 'border-[var(--color-rust)] bg-[var(--color-rust)]/5' : 'border-[var(--color-ldust)] bg-[var(--color-paper)] hover:border-[var(--color-rust)]'}`}>
                                        <input
                                            type="radio"
                                            name="condition"
                                            value={cond.id}
                                            checked={condition === cond.id}
                                            onChange={() => setCondition(cond.id)}
                                            className="accent-[var(--color-rust)] w-4 h-4 cursor-pointer"
                                        />
                                        <span className="font-bold text-sm text-[var(--color-ink)]">{cond.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider block">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border border-[var(--color-ldust)] bg-[var(--color-paper)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] min-h-[90px] resize-y"
                                placeholder="Any highlights, missing pages, or bent corners? Let buyers know..."
                            />
                        </div>

                        <hr className="border-[var(--color-ldust)] my-6" />

                        <div className="space-y-3">
                            <label className="text-sm font-black text-[var(--color-ink)] tracking-wider block uppercase">Upload Book Photo *</label>
                            <p className="text-xs text-[var(--color-dust)] font-bold">Please upload clear photos. Multiple photos optional (up to 3).</p>

                            <div className="border-2 border-dashed border-[var(--color-ldust)] hover:border-[var(--color-rust)] bg-[var(--color-paper)] rounded-sm p-8 text-center transition-colors relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                    disabled={loadingMsg !== ""}
                                />
                                <Camera className="mx-auto text-[var(--color-dust)] mb-3" size={36} />
                                <p className="font-bold text-[var(--color-ink)] mb-1">Click to select photos</p>
                                <p className="text-xs text-[var(--color-dust)]">Accepts JPEG, PNG.</p>
                            </div>

                            {previews.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-xs text-green-700 font-bold bg-green-50 px-3 py-2 rounded-sm border border-green-200 inline-block mb-3 shadow-sm">
                                        ✔ Photo ready to upload ({previews.length}/3)
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {previews.map((preview, i) => (
                                            <div key={i} className="relative w-28 h-28 rounded-sm overflow-hidden border border-[var(--color-ldust)] shadow-sm">
                                                <img src={preview} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[10px] text-center py-1 font-bold truncate px-1">
                                                    {files[i]?.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loadingMsg !== ""}
                            className="w-full bg-[var(--color-ink)] text-white hover:bg-[var(--color-rust)] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed py-5 rounded-sm font-black text-xl shadow-md transition-all flex items-center justify-center gap-3 overflow-hidden mt-8"
                        >
                            {loadingMsg !== "" && (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            )}
                            {loadingMsg || "Submit Listing"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
