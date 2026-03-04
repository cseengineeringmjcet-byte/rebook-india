"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

const AREAS = [
    "Abids",
    "Koti",
    "Ameerpet",
    "Kukatpally",
    "Dilsukhnagar",
    "LB Nagar",
    "Secunderabad",
    "Banjara Hills",
    "Himayatnagar",
    "SR Nagar",
    "Madhapur",
    "Tarnaka",
    "Afzalgunj",
    "Begumpet",
    "Mehdipatnam",
];

type Tab = "login" | "signup";

function Spinner() {
    return (
        <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    );
}

export default function AuthPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("login");

    // ── Login state ──────────────────────────────────────────────
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPw, setShowLoginPw] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [forgotSent, setForgotSent] = useState(false);

    // ── Sign-up state ────────────────────────────────────────────
    const [fullName, setFullName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [area, setArea] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showSignupPw, setShowSignupPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupError, setSignupError] = useState("");

    // ── Helpers ──────────────────────────────────────────────────
    const friendlyError = (code: string, message?: string) => {
        switch (code) {
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-credential":
                return "Invalid email or password.";
            case "auth/email-already-in-use":
                return "An account with this email already exists.";
            case "auth/weak-password":
                return "Password must be at least 6 characters.";
            case "auth/invalid-email":
                return "Please enter a valid email address.";
            case "auth/popup-closed-by-user":
                return "Google sign-in was cancelled.";
            case "auth/too-many-requests":
                return "Too many attempts. Please try again later.";
            case "auth/network-request-failed":
                return "Network error. Please check your connection.";
            case "auth/operation-not-allowed":
                return "Email/password sign-up is not enabled. Please contact support.";
            case "auth/internal-error":
                return "An internal error occurred. Please try again.";
            case "permission-denied":
                return "Permission denied saving your profile. Please try again.";
            default:
                // Show real message in dev so bugs surface faster
                if (message) return message;
                return "Something went wrong. Please try again.";
        }
    };

    // ── Login submit ─────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);
        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            router.push("/");
        } catch (err: any) {
            console.error("[Auth] Login error:", err.code, err.message);
            setLoginError(friendlyError(err.code, err.message));
        } finally {
            setLoginLoading(false);
        }
    };

    // ── Forgot password ──────────────────────────────────────────
    const handleForgotPassword = async () => {
        if (!loginEmail) {
            setLoginError("Enter your email above first, then click Forgot Password.");
            return;
        }
        setLoginLoading(true);
        setLoginError("");
        try {
            await sendPasswordResetEmail(auth, loginEmail);
            setForgotSent(true);
        } catch (err: any) {
            console.error("[Auth] Forgot password error:", err.code, err.message);
            setLoginError(friendlyError(err.code, err.message));
        } finally {
            setLoginLoading(false);
        }
    };

    // ── Google sign-in ───────────────────────────────────────────
    const handleGoogle = async () => {
        setLoginError("");
        setLoginLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(auth, provider);
            // Create user doc if first time
            const userRef = doc(db, "users", cred.user.uid);
            await setDoc(
                userRef,
                {
                    full_name: cred.user.displayName || "",
                    email: cred.user.email || "",
                    phone: "",
                    area: "",
                    role: "buyer",
                    created_at: serverTimestamp(),
                },
                { merge: true }
            );
            router.push("/");
        } catch (err: any) {
            setLoginError(friendlyError(err.code));
        } finally {
            setLoginLoading(false);
        }
    };

    // ── Sign-up submit ───────────────────────────────────────────
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError("");

        if (signupPassword !== confirmPassword) {
            setSignupError("Passwords do not match.");
            return;
        }
        if (!area) {
            setSignupError("Please select your area.");
            return;
        }

        setSignupLoading(true);

        // Step 1: Create Firebase Auth user
        let uid: string;
        try {
            const cred = await createUserWithEmailAndPassword(
                auth,
                signupEmail,
                signupPassword
            );
            uid = cred.user.uid;
        } catch (err: any) {
            console.error("[Auth] Sign-up error:", err.code, err.message);
            setSignupError(friendlyError(err.code, err.message));
            setSignupLoading(false);
            return;
        }

        // Step 2: Write Firestore user doc (non-blocking — auth already succeeded)
        try {
            await setDoc(doc(db, "users", uid), {
                full_name: fullName,
                email: signupEmail,
                phone,
                area,
                role: "buyer",
                created_at: serverTimestamp(),
            });
        } catch (err: any) {
            // Log but don't block — user is authenticated, profile can be fixed later
            console.error("[Firestore] User doc write error:", err.code, err.message);
        }

        setSignupLoading(false);
        router.push("/");
    };

    // ── Shared input classes ─────────────────────────────────────
    const inputCls =
        "w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] transition-colors bg-white text-[var(--color-ink)] placeholder-[var(--color-dust)] mt-1";

    const labelCls =
        "block text-xs font-bold text-[var(--color-dust)] uppercase tracking-wider";

    return (
        <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center py-16 px-4">
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <h1 className="font-display font-black text-4xl text-[var(--color-ink)]">
                        Rebook<span className="text-[var(--color-rust)]"> India</span>
                    </h1>
                    <p className="text-[var(--color-dust)] mt-1 text-sm">
                        Your neighbourhood book exchange
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-sm shadow-xl border border-[var(--color-ldust)] overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-[var(--color-ldust)]">
                        <button
                            type="button"
                            onClick={() => {
                                setTab("login");
                                setLoginError("");
                                setForgotSent(false);
                            }}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${tab === "login"
                                ? "text-[var(--color-rust)] border-b-2 border-[var(--color-rust)] bg-white"
                                : "text-[var(--color-dust)] hover:text-[var(--color-ink)] bg-[var(--color-cream)]"
                                }`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setTab("signup");
                                setSignupError("");
                            }}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${tab === "signup"
                                ? "text-[var(--color-rust)] border-b-2 border-[var(--color-rust)] bg-white"
                                : "text-[var(--color-dust)] hover:text-[var(--color-ink)] bg-[var(--color-cream)]"
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* ── LOGIN TAB ──────────────────────────────────── */}
                    {tab === "login" && (
                        <div className="p-8">
                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email */}
                                <div>
                                    <label className={labelCls}>Email Address</label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className={inputCls}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className={labelCls}>Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            id="login-password"
                                            type={showLoginPw ? "text" : "password"}
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 pr-12 focus:outline-none focus:border-[var(--color-rust)] transition-colors bg-white text-[var(--color-ink)] placeholder-[var(--color-dust)]"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPw((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
                                            tabIndex={-1}
                                            aria-label={showLoginPw ? "Hide password" : "Show password"}
                                        >
                                            {showLoginPw ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.95 9.95 0 015.764 1.824M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {/* Forgot password */}
                                    <div className="text-right mt-1">
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            className="text-xs text-[var(--color-rust)] hover:underline font-medium"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                </div>

                                {/* Error / success message */}
                                {loginError && (
                                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                                        {loginError}
                                    </p>
                                )}
                                {forgotSent && (
                                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-sm px-3 py-2">
                                        ✓ Password reset email sent! Check your inbox.
                                    </p>
                                )}

                                {/* Login button */}
                                <button
                                    type="submit"
                                    disabled={loginLoading}
                                    className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold shadow-md transition-colors text-base disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {loginLoading ? (
                                        <>
                                            <Spinner /> Signing in…
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="relative flex items-center py-1">
                                    <div className="flex-grow border-t border-[var(--color-ldust)]" />
                                    <span className="flex-shrink-0 mx-4 text-[var(--color-dust)] text-xs uppercase font-bold">
                                        or
                                    </span>
                                    <div className="flex-grow border-t border-[var(--color-ldust)]" />
                                </div>

                                {/* Google */}
                                <button
                                    type="button"
                                    onClick={handleGoogle}
                                    disabled={loginLoading}
                                    className="w-full bg-white border border-[var(--color-ldust)] hover:border-[var(--color-ink)] text-[var(--color-ink)] px-8 py-3 rounded-sm font-bold shadow-sm transition-colors text-base flex items-center justify-center gap-3 disabled:opacity-60"
                                >
                                    <GoogleIcon />
                                    Continue with Google
                                </button>
                            </form>

                            <p className="text-center text-sm text-[var(--color-dust)] mt-6">
                                Don&apos;t have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => setTab("signup")}
                                    className="font-bold text-[var(--color-rust)] hover:underline"
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>
                    )}

                    {/* ── SIGN-UP TAB ────────────────────────────────── */}
                    {tab === "signup" && (
                        <div className="p-8">
                            <form onSubmit={handleSignup} className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className={labelCls}>Full Name</label>
                                    <input
                                        id="signup-name"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={inputCls}
                                        placeholder="Rahul Sharma"
                                        required
                                        autoComplete="name"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={labelCls}>Email Address</label>
                                    <input
                                        id="signup-email"
                                        type="email"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        className={inputCls}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className={labelCls}>Phone Number</label>
                                    <input
                                        id="signup-phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className={inputCls}
                                        placeholder="+91 98765 43210"
                                        required
                                        autoComplete="tel"
                                    />
                                </div>

                                {/* Area */}
                                <div>
                                    <label className={labelCls}>Area (Hyderabad)</label>
                                    <select
                                        id="signup-area"
                                        value={area}
                                        onChange={(e) => setArea(e.target.value)}
                                        className={`${inputCls} cursor-pointer`}
                                        required
                                    >
                                        <option value="" disabled>
                                            Select your area…
                                        </option>
                                        {AREAS.map((a) => (
                                            <option key={a} value={a}>
                                                {a}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className={labelCls}>Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            id="signup-password"
                                            type={showSignupPw ? "text" : "password"}
                                            value={signupPassword}
                                            onChange={(e) => setSignupPassword(e.target.value)}
                                            className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 pr-12 focus:outline-none focus:border-[var(--color-rust)] transition-colors bg-white text-[var(--color-ink)] placeholder-[var(--color-dust)]"
                                            placeholder="Min. 6 characters"
                                            required
                                            minLength={6}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignupPw((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
                                            tabIndex={-1}
                                            aria-label={showSignupPw ? "Hide password" : "Show password"}
                                        >
                                            {showSignupPw ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.95 9.95 0 015.764 1.824M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className={labelCls}>Confirm Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            id="signup-confirm-password"
                                            type={showConfirmPw ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full border border-[var(--color-ldust)] rounded-sm px-4 py-3 pr-12 focus:outline-none focus:border-[var(--color-rust)] transition-colors bg-white text-[var(--color-ink)] placeholder-[var(--color-dust)]"
                                            placeholder="Repeat your password"
                                            required
                                            minLength={6}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPw((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
                                            tabIndex={-1}
                                            aria-label={showConfirmPw ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPw ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.95 9.95 0 015.764 1.824M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Error message */}
                                {signupError && (
                                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                                        {signupError}
                                    </p>
                                )}

                                {/* Sign Up button */}
                                <button
                                    type="submit"
                                    disabled={signupLoading}
                                    className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-rust)] text-[var(--color-cream)] px-8 py-4 rounded-sm font-bold shadow-md transition-colors text-base disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                                >
                                    {signupLoading ? (
                                        <>
                                            <Spinner /> Creating account…
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-sm text-[var(--color-dust)] mt-6">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => setTab("login")}
                                    className="font-bold text-[var(--color-rust)] hover:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
