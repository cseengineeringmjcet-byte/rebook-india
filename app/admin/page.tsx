"use client";

import React, { useState, useEffect } from "react";
import { adminSupabase } from "@/lib/supabase/admin-client";
import RebookIndiaLogo from "@/components/Logo";
import {
    Grid, ClipboardList, Tag, BookOpen, Store, Users, Settings, Clock, LogOut,
    RefreshCw, Search, Eye, MessageCircle, X, Check, XCircle, EyeOff, AlertCircle, Download,
    Image as ImageIcon, MoreVertical, CheckCircle, Bell, Book
} from "lucide-react";
import { toast } from "sonner";

const ADMIN_USER = 'rebookindia';
const ADMIN_PASS = 'RebookAdmin@2025';

const statusColors: Record<string, string> = {
    placed: "bg-yellow-500",
    reviewing: "bg-blue-500",
    confirmed: "bg-purple-500",
    dispatched: "bg-orange-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
};

const listingStatusColors: Record<string, string> = {
    pending: "bg-amber-500 text-white",
    approved: "bg-sage-600 text-white",
    listed: "bg-blue-500 text-white",
    rejected: "bg-red-500 text-white",
    expired: "bg-gray-400 text-white",
    sold: "bg-[var(--color-ink)] text-white"
};

function AdminLogin({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(false);

        setTimeout(() => {
            if (username === ADMIN_USER && password === ADMIN_PASS) {
                sessionStorage.setItem('ri_admin_logged_in', 'true');
                toast.success("Welcome back, Admin!");
                onLogin();
            } else {
                setError(true);
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[var(--color-ink)] flex items-center justify-center p-4">
            <div className={`bg-white w-full max-w-[400px] rounded-2xl shadow-2xl p-8 overflow-hidden transition-transform ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                <div className="flex justify-center mb-6">
                    <RebookIndiaLogo variant="nav" darkBg={false} />
                </div>
                <div className="text-center mb-6">
                    <h1 className="font-display font-bold text-2xl text-[var(--color-ink)] mb-1">Admin Panel</h1>
                    <p className="font-sans text-[13px] text-[var(--color-dust)]">Rebook India Control Center</p>
                </div>

                <div className="h-[1px] w-12 mx-auto bg-[var(--color-amber)] mb-8"></div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter admin username"
                            className="w-full border border-[var(--color-ldust)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-rust)] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dust)] mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="w-full border border-[var(--color-ldust)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-rust)] focus:outline-none pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dust)] hover:text-[var(--color-ink)]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 font-bold text-sm text-center">
                            Wrong username or password
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-rust)] hover:bg-[#A93C23] text-[var(--color-cream)] rounded-xl py-[14px] font-sans font-semibold text-[15px] transition-colors flex justify-center items-center"
                    >
                        {loading ? (
                            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> Logging in...</>
                        ) : "Login to Admin Panel"}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-[var(--color-dust)]">
                    Rebook India © 2025 | Admin Access Only
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}} />
        </div>
    );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [currentTime, setCurrentTime] = useState("");

    const [stats, setStats] = useState({
        totalOrders: 0, pendingOrders: 0, totalBooks: 0,
        totalVendors: 0, pendingListings: 0, totalUsers: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    // Orders Section State
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [trackingNo, setTrackingNo] = useState("");

    // Listings State
    const [listings, setListings] = useState<any[]>([]);
    const [listingsLoading, setListingsLoading] = useState(true);
    const [vendorOptions, setVendorOptions] = useState<any[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
    const [listingsStatusFilter, setListingsStatusFilter] = useState("All");
    const [listingsSearchQuery, setListingsSearchQuery] = useState("");

    // Additional States
    const [booksList, setBooksList] = useState<any[]>([]);
    const [booksLoading, setBooksLoading] = useState(true);
    const [vendorsList, setVendorsList] = useState<any[]>([]);
    const [vendorsLoading, setVendorsLoading] = useState(true);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        setStatsLoading(true);
        setOrdersLoading(true);
        try {
            const p1 = adminSupabase.from("orders").select("*", { count: "exact", head: true });
            const p2 = adminSupabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "placed");
            const p3 = adminSupabase.from("books").select("*", { count: "exact", head: true }).eq("is_available", true);
            const p4 = adminSupabase.from("vendors").select("*", { count: "exact", head: true });
            const p5 = adminSupabase.from("book_listings").select("*", { count: "exact", head: true }).eq("status", "pending");
            const p6 = adminSupabase.from("users").select("*", { count: "exact", head: true });

            const { data: recent } = await adminSupabase.from("orders").select("*, users(full_name)").order("placed_at", { ascending: false }).limit(10);
            const { data: allOrd } = await adminSupabase.from("orders").select("*, users(full_name, phone)").order("placed_at", { ascending: false });

            const [r1, r2, r3, r4, r5, r6] = await Promise.all([p1, p2, p3, p4, p5, p6]);

            setStats({
                totalOrders: r1.count || 0,
                pendingOrders: r2.count || 0,
                totalBooks: r3.count || 0,
                totalVendors: r4.count || 0,
                pendingListings: r5.count || 0,
                totalUsers: r6.count || 0,
            });

            if (recent) setRecentOrders(recent);
            if (allOrd) setAllOrders(allOrd);
        } catch (e) {
            console.error(e);
        } finally {
            setStatsLoading(false);
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        loadListings();
        loadVendorsForModal();
        loadCategoriesForModal();
        loadBooks();
        loadVendors();
        loadUsers();
        loadBooks();
        loadVendors();
        loadUsers();

        const channel = adminSupabase
            .channel('admin-listings-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'book_listings'
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    toast.success('New sell request received!');
                    fetchData(); // Update dash counts
                    loadListings();
                }
                if (payload.eventType === 'UPDATE') {
                    setListings(prev => prev.map(l =>
                        l.id === payload.new.id ? { ...l, ...payload.new } : l
                    ));
                }
            })
            .subscribe();

        return () => { adminSupabase.removeChannel(channel); };
    }, []);

    const loadListings = async () => {
        setListingsLoading(true);
        try {
            const { data, error } = await adminSupabase
                .from('book_listings')
                .select(`
        *,
        users!seller_id (
          id,
          full_name,
          phone,
          email
        ),
        categories (
          id,
          name,
          slug
        )
      `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (err: any) {
            toast.error('Failed to load listings: ' + err.message);
        } finally {
            setListingsLoading(false);
        }
    };

    const loadVendorsForModal = async () => {
        const { data } = await adminSupabase
            .from('vendors')
            .select('id, shop_name, area')
            .order('shop_name');
        setVendorOptions(data || []);
    };

    const loadBooks = async () => {
        setBooksLoading(true);
        const { data } = await adminSupabase.from('books').select('*, categories(name)').order('created_at', { ascending: false });
        setBooksList(data || []);
        setBooksLoading(false);
    };

    const loadVendors = async () => {
        setVendorsLoading(true);
        const { data } = await adminSupabase.from('vendors').select('*').order('created_at', { ascending: false });
        setVendorsList(data || []);
        setVendorsLoading(false);
    };

    const loadUsers = async () => {
        setUsersLoading(true);
        const { data } = await adminSupabase.from('users').select('*').order('created_at', { ascending: false });
        setUsersList(data || []);
        setUsersLoading(false);
    };

    const loadCategoriesForModal = async () => {
        const { data } = await adminSupabase
            .from('categories')
            .select('id, name, slug')
            .order('sort_order');
        setCategoryOptions(data || []);
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const updateData: any = { status: newStatus };
        if (newStatus === "confirmed") updateData.confirmed_at = new Date().toISOString();
        if (newStatus === "dispatched") updateData.dispatched_at = new Date().toISOString();
        if (newStatus === "delivered") updateData.delivered_at = new Date().toISOString();

        const { error } = await adminSupabase.from("orders").update(updateData).eq("id", orderId);
        if (error) {
            toast.error("Failed to update status");
            return;
        }

        toast.success(`Order status updated to ${newStatus}`);
        fetchData();
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, ...updateData });
        }
    };

    const handleListingStatusChange = async (listingId: string, newStatus: string) => {
        const { error } = await adminSupabase.from("book_listings").update({ status: newStatus }).eq("id", listingId);
        if (error) {
            toast.error("Failed to update listing status");
            return;
        }
        toast.success(`Listing status updated to ${newStatus}`);
        loadListings();
        fetchData(); // update stats
    };

    const saveAdminNotes = async () => {
        if (!selectedOrder) return;
        const { error } = await adminSupabase.from("orders").update({ admin_notes: adminNotes }).eq("id", selectedOrder.id);
        if (error) toast.error("Failed to save notes");
        else {
            toast.success("Notes saved");
            fetchData();
        }
    };

    const saveTracking = async () => {
        if (!selectedOrder) return;
        const { error } = await adminSupabase.from("orders").update({ tracking_no: trackingNo }).eq("id", selectedOrder.id);
        if (error) toast.error("Failed to save tracking");
        else {
            toast.success("Tracking saved");
            fetchData();
        }
    };

    const exportCSV = () => {
        if (!allOrders.length) return;
        const headers = ["Order No", "Buyer", "Title", "MRP", "Paid", "Status", "Placed At"];
        const rows = filteredOrders.map(o => [
            o.order_number,
            o.users?.full_name || o.buyer_id,
            `"${o.book_title}"`,
            o.mrp,
            o.price_paid,
            o.status,
            new Date(o.placed_at).toLocaleString()
        ]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "rebook_orders_export.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const filteredOrders = allOrders.filter(o => {
        if (statusFilter !== "All" && o.status !== statusFilter.toLowerCase()) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!o.order_number?.toLowerCase().includes(q) &&
                !o.users?.full_name?.toLowerCase().includes(q) &&
                !o.book_title?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const filteredListings = listings.filter(l => {
        if (listingsStatusFilter !== "All" && l.status !== listingsStatusFilter.toLowerCase()) return false;
        if (listingsSearchQuery) {
            const q = listingsSearchQuery.toLowerCase();
            if (!l.title?.toLowerCase().includes(q) &&
                !l.users?.full_name?.toLowerCase().includes(q) &&
                !l.author?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: <Grid size={20} /> },
        { id: "orders", label: "Orders", icon: <ClipboardList size={20} /> },
        { id: "listings", label: "Listings", icon: <Tag size={20} /> },
        { id: "books", label: "Books", icon: <BookOpen size={20} /> },
        { id: "vendors", label: "Vendors", icon: <Store size={20} /> },
        { id: "users", label: "Users", icon: <Users size={20} /> },
        { id: "settings", label: "Settings", icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex flex-row h-screen overflow-hidden bg-[var(--color-cream)]">

            {/* LEFT SIDEBAR */}
            <aside className="w-[260px] h-full bg-[var(--color-ink)] flex flex-col shrink-0 flex-none z-20 shadow-xl">
                <div className="p-6">
                    <RebookIndiaLogo variant="nav" darkBg={true} />
                    <div className="text-[var(--color-amber)] text-[11px] font-bold uppercase tracking-widest mt-2">Admin Panel</div>
                    <div className="h-[1px] w-full bg-[var(--color-amber)]/20 mt-4" />
                </div>

                <nav className="flex flex-col gap-1 mt-2 flex-1 overflow-y-auto w-full px-2">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 font-bold transition-all duration-200 ${activeSection === item.id
                                ? 'bg-[var(--color-rust)] text-[var(--color-cream)]'
                                : 'text-[var(--color-ldust)] hover:bg-white/5 hover:text-[var(--color-cream)]'
                                }`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto px-6 py-4">
                    <div className="h-[1px] w-full bg-[var(--color-ldust)]/20 mb-4" />
                    <div className="mb-4">
                        <div className="text-[var(--color-cream)] font-bold">{ADMIN_USER}</div>
                        <div className="text-[var(--color-dust)] text-xs">Administrator</div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full border border-[var(--color-rust)]/30 text-[var(--color-rust)] hover:bg-[var(--color-rust)] hover:text-[var(--color-cream)] py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* RIGHT CONTENT AREA */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--color-cream)]">

                {/* TOP BAR */}
                <header className="sticky top-0 bg-[var(--color-paper)] border-b border-[var(--color-ldust)] px-6 py-4 z-10 flex justify-between items-center shrink-0">
                    <h1 className="font-display font-bold text-[22px] text-[var(--color-ink)] capitalize">
                        {activeSection}
                    </h1>
                    <div className="flex items-center gap-6 text-[var(--color-dust)] text-sm font-bold">
                        <div className="flex items-center gap-2">
                            <Clock size={16} /> {currentTime}
                        </div>
                        <button onClick={fetchData} className="hover:text-[var(--color-rust)] transition-colors p-1" title="Refresh Data">
                            <RefreshCw size={18} className={statsLoading ? "animate-spin text-[var(--color-rust)]" : ""} />
                        </button>
                        <button className="relative hover:text-[var(--color-rust)] transition-colors p-1" title="Notifications">
                            <Bell size={18} />
                            {stats.pendingListings > 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    </div>
                </header>

                {/* SECTION CONTENT */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* DASHBOARD SECTION */}
                    {activeSection === "dashboard" && (
                        <div className="space-y-8 max-w-7xl mx-auto">

                            {/* 6 Grid Stats Area */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {/* Card 1: Total Orders */}
                                <div className="bg-[var(--color-ink)] p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col">
                                    <ClipboardList className="absolute -right-4 -bottom-4 text-white/5" size={120} />
                                    <div className="text-[var(--color-ldust)] text-sm font-bold tracking-wider uppercase mb-2">Total Orders</div>
                                    <div className="text-[var(--color-amber)] text-4xl font-black font-mono relative z-10">{statsLoading ? '-' : stats.totalOrders}</div>
                                </div>

                                {/* Card 2: Pending Orders */}
                                <div className="bg-yellow-100 p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col">
                                    <Clock className="absolute -right-4 -bottom-4 text-yellow-500/10" size={120} />
                                    <div className="text-yellow-800 text-sm font-bold tracking-wider uppercase mb-2">Pending Orders</div>
                                    <div className="text-yellow-600 text-4xl font-black font-mono relative z-10">{statsLoading ? '-' : stats.pendingOrders}</div>
                                </div>

                                {/* Card 3: Total Books */}
                                <div className="bg-[var(--color-sage)] p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col">
                                    <Book className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                                    <div className="text-white/80 text-sm font-bold tracking-wider uppercase mb-2">Total Books</div>
                                    <div className="text-white text-4xl font-black font-mono relative z-10">{statsLoading ? '-' : stats.totalBooks}</div>
                                </div>

                                {/* Card 4: Total Vendors */}
                                <div className="bg-[var(--color-dust)] p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col">
                                    <Store className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                                    <div className="text-white/80 text-sm font-bold tracking-wider uppercase mb-2">Total Vendors</div>
                                    <div className="text-white text-4xl font-black font-mono relative z-10">{statsLoading ? '-' : stats.totalVendors}</div>
                                </div>

                                {/* Card 5: Pending Listings */}
                                <div className={`p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col ${stats.pendingListings > 0 ? 'bg-[var(--color-rust)]' : 'bg-[var(--color-paper)] border border-[var(--color-ldust)]'}`}>
                                    <Tag className={`absolute -right-4 -bottom-4 ${stats.pendingListings > 0 ? 'text-white/10' : 'text-[var(--color-ldust)]/30'}`} size={120} />
                                    <div className={`${stats.pendingListings > 0 ? 'text-white/80' : 'text-[var(--color-dust)]'} text-sm font-bold tracking-wider uppercase mb-2`}>Pending Listings</div>
                                    <div className={`${stats.pendingListings > 0 ? 'text-white' : 'text-[var(--color-ink)]'} text-4xl font-black font-mono relative z-10`}>{statsLoading ? '-' : stats.pendingListings}</div>
                                </div>

                                {/* Card 6: Total Users */}
                                <div className="bg-amber-100 p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col">
                                    <Users className="absolute -right-4 -bottom-4 text-amber-500/10" size={120} />
                                    <div className="text-amber-800 text-sm font-bold tracking-wider uppercase mb-2">Total Users</div>
                                    <div className="text-amber-600 text-4xl font-black font-mono relative z-10">{statsLoading ? '-' : stats.totalUsers}</div>
                                </div>
                            </div>

                            {/* Pending Alert Area */}
                            {stats.pendingListings > 0 && (
                                <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <AlertCircle className="text-amber-600" size={28} />
                                        <div>
                                            <h4 className="font-bold text-amber-800 text-lg">{stats.pendingListings} books waiting for your review!</h4>
                                            <p className="text-amber-700 text-sm">Please review the condition proofs submitted by users.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveSection("listings")} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 text-sm font-bold rounded-xl transition-colors shadow-sm">
                                        Review Now
                                    </button>
                                </div>
                            )}

                            {/* Add Elements Actions */}
                            <div className="flex gap-4 mb-6">
                                <button className="bg-[var(--color-ink)] text-white px-5 py-3 text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-sm" onClick={() => toast.info('Add Book - Coming Soon')}>Add New Book</button>
                                <button className="bg-[var(--color-ink)] text-white px-5 py-3 text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-sm" onClick={() => toast.info('Add Vendor - Coming Soon')}>Add Vendor</button>
                                <button className="border-2 border-[var(--color-ink)] text-[var(--color-ink)] px-5 py-3 text-sm font-bold rounded-xl hover:bg-[var(--color-paper)] transition-colors shadow-sm" onClick={exportCSV}>Export Orders</button>
                            </div>

                            {/* Recent Orders Area */}
                            <div>
                                <h2 className="font-display text-xl font-bold text-[var(--color-ink)] mb-4">Recent Orders</h2>
                                <div className="bg-white rounded-xl border border-[var(--color-ldust)] overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-[var(--color-paper)] text-[var(--color-dust)] font-bold uppercase tracking-wider text-[11px] border-b border-[var(--color-ldust)]">
                                            <tr>
                                                <th className="px-5 py-4">Order No</th>
                                                <th className="px-5 py-4">Buyer Name</th>
                                                <th className="px-5 py-4">Book Title</th>
                                                <th className="px-5 py-4">Price Paid</th>
                                                <th className="px-5 py-4">Status</th>
                                                <th className="px-5 py-4">Date</th>
                                                <th className="px-5 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-ldust)]">
                                            {recentOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-[var(--color-paper)] transition-colors">
                                                    <td className="px-5 py-4 font-mono font-bold text-[var(--color-rust)]">{order.order_number}</td>
                                                    <td className="px-5 py-4 font-bold text-[var(--color-ink)]">{order.users?.full_name || 'Guest'}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="truncate max-w-[200px]" title={order.book_title}>{order.book_title}</div>
                                                    </td>
                                                    <td className="px-5 py-4 font-mono text-[var(--color-sage)] font-bold">₹{order.price_paid}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold text-white ${statusColors[order.status] || "bg-gray-500"}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-[var(--color-dust)] text-xs">{new Date(order.placed_at).toLocaleDateString()}</td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={() => { setSelectedOrder(order); setAdminNotes(order.admin_notes || ""); setTrackingNo(order.tracking_no || ""); }} className="inline-flex text-[var(--color-ink)] hover:text-[var(--color-rust)] p-2 rounded-lg bg-gray-50 hover:bg-gray-200 border border-gray-100 transition-colors">
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {recentOrders.length === 0 && (
                                        <div className="p-8 text-center text-[var(--color-dust)] py-12">No recent orders found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ORDERS SECTION */}
                    {activeSection === "orders" && (
                        <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
                            <div className="flex flex-col md:flex-row gap-4 justify-between shrink-0 mb-2">
                                <div className="flex gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-72">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dust)]" size={18} />
                                        <input type="text" placeholder="Search orders, buyer, title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-[var(--color-ldust)] bg-white shadow-sm rounded-xl text-sm font-medium focus:outline-none focus:border-[var(--color-rust)] transition-colors" />
                                    </div>
                                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-[var(--color-ldust)] bg-white shadow-sm rounded-xl text-sm font-bold text-[var(--color-ink)] px-4 py-3 focus:outline-none focus:border-[var(--color-rust)] cursor-pointer">
                                        <option value="All">All Statuses</option>
                                        <option value="placed">Placed</option>
                                        <option value="reviewing">Reviewing</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="dispatched">Dispatched</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <button onClick={exportCSV} className="bg-[var(--color-ink)] text-white hover:bg-black px-6 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                                    <Download size={18} /> Export CSV
                                </button>
                            </div>

                            <div className="bg-white border border-[var(--color-ldust)] rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left whitespace-nowrap">
                                        <thead className="bg-[var(--color-paper)] text-[var(--color-dust)] font-bold uppercase tracking-wider text-[11px] border-b border-[var(--color-ldust)]">
                                            <tr>
                                                <th className="px-6 py-4" style={{ width: "15%" }}>Order No</th>
                                                <th className="px-6 py-4" style={{ width: "20%" }}>Buyer</th>
                                                <th className="px-6 py-4" style={{ width: "25%" }}>Book</th>
                                                <th className="px-6 py-4" style={{ width: "10%" }}>Price</th>
                                                <th className="px-6 py-4" style={{ width: "10%" }}>Status</th>
                                                <th className="px-6 py-4" style={{ width: "10%" }}>Date</th>
                                                <th className="px-6 py-4 text-right" style={{ width: "10%" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-ldust)]">
                                            {filteredOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-[var(--color-paper)] transition-colors">
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="font-mono font-bold text-[var(--color-rust)] cursor-pointer hover:underline" onClick={() => { setSelectedOrder(order); setAdminNotes(order.admin_notes || ""); setTrackingNo(order.tracking_no || ""); }}>{order.order_number}</div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="font-bold text-[var(--color-ink)]">{order.users?.full_name || order.delivery_name || 'Guest'}</div>
                                                        <div className="text-[11px] text-[var(--color-dust)] mt-1">{order.users?.phone || order.delivery_phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="truncate max-w-[220px] font-bold text-[var(--color-ink)]" title={order.book_title}>{order.book_title}</div>
                                                        <div className="text-[11px] text-[var(--color-dust)] mt-1">{order.delivery_area}</div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top font-mono">
                                                        <div className="text-[10px] text-[var(--color-dust)] line-through">₹{order.mrp}</div>
                                                        <div className="font-bold text-[var(--color-sage)] text-[15px]">₹{order.price_paid}</div>
                                                        <div className="text-[10px] text-[var(--color-dust)]">Save ₹{order.savings}</div>
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                            className={`text-[11px] uppercase tracking-wider font-bold rounded-full px-3 py-1.5 outline-none border-none cursor-pointer text-white appearance-none ${statusColors[order.status] || "bg-gray-500"}`}
                                                        >
                                                            <option value="placed">Placed</option>
                                                            <option value="reviewing">Reviewing</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="dispatched">Dispatched</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 align-top text-xs font-medium text-[var(--color-dust)]">
                                                        {new Date(order.placed_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setSelectedOrder(order); setAdminNotes(order.admin_notes || ""); setTrackingNo(order.tracking_no || ""); }} className="bg-[var(--color-paper)] border border-[var(--color-ldust)] text-[var(--color-ink)] p-2 rounded-lg hover:bg-[var(--color-ldust)] transition-colors shadow-sm">
                                                                <Eye size={16} />
                                                            </button>
                                                            <a href={`https://wa.me/91${order.users?.phone || order.delivery_phone}?text=Regarding your Rebook India order ${order.order_number}...`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] p-2 rounded-lg hover:bg-[#25D366] hover:text-white transition-colors shadow-sm">
                                                                <MessageCircle size={16} />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!ordersLoading && filteredOrders.length === 0 && (
                                        <div className="p-16 text-center text-[var(--color-dust)] text-lg">
                                            No orders match your filter criteria.
                                        </div>
                                    )}
                                    {ordersLoading && (
                                        <div className="p-16 text-center text-[var(--color-dust)] text-lg">
                                            Loading orders...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div >
                    )
                    }

                    {/* LISTINGS SECTION */}
                    {
                        activeSection === "listings" && (
                            <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
                                <div className="flex flex-col md:flex-row gap-4 justify-between shrink-0 mb-2">
                                    <div className="flex bg-white border border-[var(--color-ldust)] p-1 rounded-xl shadow-sm text-sm font-bold w-full md:w-auto overflow-x-auto">
                                        {['All', 'Pending', 'Approved', 'Listed', 'Rejected', 'Expired'].map(tab => {
                                            const count = tab === 'All' ? listings.length : listings.filter(l => l.status === tab.toLowerCase()).length;
                                            const colors: any = {
                                                "Pending": "bg-amber-100 text-amber-800",
                                                "Approved": "bg-sage-100 text-sage-800",
                                                "Listed": "bg-blue-100 text-blue-800",
                                                "Rejected": "bg-red-100 text-red-800",
                                                "Expired": "bg-gray-100 text-gray-800"
                                            };
                                            return (
                                                <button
                                                    key={tab}
                                                    onClick={() => setListingsStatusFilter(tab)}
                                                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${listingsStatusFilter === tab ? "bg-[var(--color-rust)] text-white shadow-sm" : "text-[var(--color-dust)] hover:text-[var(--color-ink)] hover:bg-gray-50"}`}
                                                >
                                                    {tab} <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white text-[var(--color-ink)]`}>{count}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="relative md:w-72 shrink-0">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-dust)]" size={18} />
                                        <input type="text" placeholder="Search by title or seller name" value={listingsSearchQuery} onChange={e => setListingsSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-[var(--color-ldust)] bg-white shadow-sm rounded-xl text-sm font-medium focus:outline-none focus:border-[var(--color-rust)] transition-colors" />
                                    </div>
                                </div >

                                <div className="bg-white border border-[var(--color-ldust)] rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-[var(--color-paper)] text-[var(--color-dust)] font-bold uppercase tracking-wider text-[11px] border-b border-[var(--color-ldust)]">
                                                <tr>
                                                    <th className="px-6 py-4 w-[220px]">Book</th>
                                                    <th className="px-6 py-4 w-[160px]">Seller</th>
                                                    <th className="px-6 py-4 w-[140px]">Details</th>
                                                    <th className="px-6 py-4 w-[120px]">Area</th>
                                                    <th className="px-6 py-4 w-[80px]">Photos</th>
                                                    <th className="px-6 py-4 w-[120px]">Status</th>
                                                    <th className="px-6 py-4 w-[200px] text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--color-ldust)] text-[13px]">
                                                {listingsLoading ? (
                                                    [...Array(5)].map((_, i) => (
                                                        <tr key={i} className="animate-pulse">
                                                            <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded-md"></div></td>
                                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div><div className="h-3 bg-gray-200 rounded-md w-1/2"></div></td>
                                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-md w-1/2"></div></td>
                                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-md w-full"></div></td>
                                                            <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-200 rounded-md"></div></td>
                                                            <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                                                            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded-md w-full"></div></td>
                                                        </tr>
                                                    ))
                                                ) : filteredListings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-16 text-center text-[var(--color-dust)]">
                                                            <Tag size={32} className="mx-auto mb-3 opacity-20" />
                                                            <div className="text-lg mb-2">No listings found</div>
                                                            <button onClick={loadListings} className="text-[var(--color-rust)] hover:underline font-bold text-sm">Refresh list</button>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredListings.map(listing => (
                                                        <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 flex gap-3 items-center">
                                                                {listing.photo_1 ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={listing.photo_1} alt="Cover" className="w-[44px] h-[60px] object-cover rounded-md shadow-sm border border-[var(--color-ldust)] shrink-0" />
                                                                ) : (
                                                                    <div className="w-[44px] h-[60px] bg-gray-100 rounded-md border border-[var(--color-ldust)] flex items-center justify-center shrink-0 text-xl">📚</div>
                                                                )}
                                                                <div>
                                                                    <div className="font-bold text-[var(--color-ink)] line-clamp-2 leading-tight" title={listing.title}>{listing.title}</div>
                                                                    <div className="text-[11px] text-[var(--color-dust)] mt-1">{listing.author}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-[var(--color-ink)]">{listing.users?.full_name || 'Unknown Seller'}</div>
                                                                <div className="text-[11px] text-[var(--color-dust)] mt-1">{listing.users?.phone || '-'}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-[var(--color-sage)] font-mono">₹{listing.mrp}</div>
                                                                <div className="text-[10px] mt-1 flex gap-1 items-center flex-wrap">
                                                                    <span className={`px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold ${listing.condition === 'like_new' ? 'bg-green-100 text-green-700' : listing.condition === 'good' ? 'bg-blue-100 text-blue-700' : listing.condition === 'fair' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {listing.condition?.replace('_', ' ')}
                                                                    </span>
                                                                    <span className="text-[var(--color-dust)] block truncate max-w-[100px]" title={listing.categories?.name}>{listing.categories?.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-[var(--color-ink)] truncate max-w-[100px]" title={listing.area}>{listing.area}</div>
                                                                <div className="text-[10px] text-[var(--color-dust)] mt-1">{new Date(listing.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex gap-1 items-center">
                                                                    {listing.photo_1 ? (
                                                                        <ImageIcon className="text-[var(--color-sage)]" size={16} />
                                                                    ) : (
                                                                        <ImageIcon className="text-[var(--color-ldust)]" size={16} />
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-[var(--color-dust)] mt-1">{[listing.photo_1, listing.photo_2, listing.photo_3].filter(Boolean).length} photos</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${listingStatusColors[listing.status] || 'bg-gray-200 text-gray-800'}`}>
                                                                    {listing.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    {listing.status === 'pending' && (
                                                                        <>
                                                                            <button className="text-white bg-green-500 hover:bg-green-600 p-1.5 rounded-md transition-colors shadow-sm" title="Approve" onClick={() => handleListingStatusChange(listing.id, 'approved')}>
                                                                                <Check size={16} />
                                                                            </button>
                                                                            <button className="text-white bg-red-500 hover:bg-red-600 p-1.5 rounded-md transition-colors shadow-sm" title="Reject" onClick={() => handleListingStatusChange(listing.id, 'rejected')}>
                                                                                <X size={16} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {(listing.status === 'approved' || listing.status === 'listed') && (
                                                                        <button className="text-white bg-orange-500 hover:bg-orange-600 p-1.5 rounded-md transition-colors shadow-sm" title="Mark Sold" onClick={() => handleListingStatusChange(listing.id, 'expired')}>
                                                                            <Tag size={16} />
                                                                        </button>
                                                                    )}
                                                                    {listing.status === 'rejected' && (
                                                                        <button className="text-white bg-amber-500 hover:bg-amber-600 p-1.5 rounded-md transition-colors shadow-sm" title="Reconsider" onClick={() => handleListingStatusChange(listing.id, 'pending')}>
                                                                            <RefreshCw size={16} />
                                                                        </button>
                                                                    )}
                                                                    <button className="text-[var(--color-ink)] bg-gray-100 border border-gray-200 hover:bg-gray-200 p-1.5 rounded-md transition-colors shadow-sm" title="View Details" onClick={() => toast.info("View listing details")}>
                                                                        <Eye size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div >
                                </div >
                            </div >
                        )
                    }

                    {/* OTHER PLACEHOLDERS */}
                    {
                        ["books", "vendors", "users", "settings"].includes(activeSection) && (
                            <div className="h-full flex flex-col items-center justify-center text-[var(--color-dust)] min-h-[500px]">
                                <AlertCircle size={64} className="mb-6 text-[var(--color-ldust)]" />
                                <h2 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-3 capitalize">{activeSection} Module</h2>
                                <p className="text-lg">This module is part of the next development phase.</p>
                            </div>
                        )
                    }

                </div >
            </main >

            {/* ORDER DETAIL MODAL */}
            {
                selectedOrder && (
                    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                            {/* Modal Header */}
                            <div className="px-8 py-5 border-b border-[var(--color-ldust)] flex justify-between items-center bg-[var(--color-paper)]">
                                <h3 className="font-display text-[var(--color-ink)] text-2xl flex items-center gap-4">
                                    <span className="font-black text-[var(--color-rust)] font-mono">{selectedOrder.order_number}</span>
                                    <span className={`px-3 py-1 text-[11px] uppercase tracking-wider font-bold text-white rounded-full ${statusColors[selectedOrder.status]}`}>{selectedOrder.status}</span>
                                </h3>
                                <button onClick={() => setSelectedOrder(null)} className="text-[var(--color-dust)] bg-white border border-[var(--color-ldust)] rounded-full p-2 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"><X size={20} /></button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-10">

                                {/* Timeline Action Bar */}
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink)] mb-4">Set Latest Status</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {["placed", "reviewing", "confirmed", "dispatched", "delivered", "cancelled"].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(selectedOrder.id, status)}
                                                className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl border transition-colors ${selectedOrder.status === status ? statusColors[status] + ' border-transparent text-white shadow-md' : 'bg-white text-[var(--color-dust)] border-[var(--color-ldust)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Buyer details */}
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink)] mb-4 border-l-4 border-[var(--color-sage)] pl-3">Buyer & Delivery Profile</h4>
                                        <div className="bg-[var(--color-paper)] border border-[var(--color-ldust)] p-6 rounded-2xl text-[15px] space-y-3">
                                            <div className="flex items-center gap-3"><Users className="text-[var(--color-dust)]" size={18} /> <span className="font-bold">{selectedOrder.delivery_name}</span></div>
                                            <div className="flex items-center gap-3"><MessageCircle className="text-[var(--color-dust)]" size={18} /> <span className="text-[var(--color-dust)]">{selectedOrder.delivery_phone}</span></div>
                                            <p className="mt-4"><strong className="block text-xs uppercase text-[var(--color-dust)] mb-1">Shipping Address</strong> {selectedOrder.delivery_addr}</p>
                                            <p><strong className="block text-xs uppercase text-[var(--color-dust)] mb-1">Locality/Pin</strong> {selectedOrder.delivery_area} - {selectedOrder.delivery_pin}</p>

                                            {selectedOrder.buyer_notes && (
                                                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                                    <strong className="block text-xs uppercase text-amber-800 mb-1">Note from Buyer:</strong>
                                                    <span className="text-amber-900 text-sm italic">"{selectedOrder.buyer_notes}"</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Book Details */}
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink)] mb-4 border-l-4 border-[var(--color-rust)] pl-3">Financial Allocation</h4>
                                        <div className="bg-[var(--color-paper)] border border-[var(--color-ldust)] p-6 rounded-2xl space-y-4">
                                            <p><strong className="block text-xs uppercase text-[var(--color-dust)] mb-1">Items Requested</strong> <span className="font-bold text-[15px]">{selectedOrder.book_title}</span></p>

                                            <div className="mt-6 font-mono bg-white p-4 rounded-xl border border-[var(--color-ldust)] shadow-inner-sm">
                                                <div className="flex justify-between mb-3 text-sm text-[var(--color-dust)]"><span>Current Market MSRP:</span> <span>₹{selectedOrder.mrp}</span></div>
                                                <div className="flex justify-between mb-3 text-[15px] font-bold text-[var(--color-sage)]"><span>Net Price to Collect:</span> <span>₹{selectedOrder.price_paid}</span></div>
                                                <div className="w-full h-[1px] bg-[var(--color-ldust)] my-3"></div>
                                                <div className="flex justify-between text-xs text-[var(--color-dust)] italic"><span>Buyer's Total Savings:</span> <span>₹{selectedOrder.savings}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Data Tracking */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[var(--color-ldust)] pt-8">
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink)] mb-4">Internal Tracking (AWB)</h4>
                                        <div className="flex gap-2">
                                            <input type="text" value={trackingNo} onChange={e => setTrackingNo(e.target.value)} className="flex-1 border border-[var(--color-ldust)] px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-[var(--color-rust)] shadow-inner-sm bg-white" placeholder="Enter tracking / reference number..." />
                                            <button onClick={saveTracking} className="bg-[var(--color-ink)] text-white px-6 py-3 text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-sm focus:outline-none flex items-center gap-2"><Check size={16} /> Save</button>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink)] mb-4">Administrative Log</h4>
                                        <div className="flex flex-col gap-3">
                                            <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="w-full border border-[var(--color-ldust)] px-4 py-3 text-sm rounded-xl min-h-[100px] focus:outline-none focus:border-[var(--color-rust)] shadow-inner-sm bg-white" placeholder="Add private notes. Buyer will never see these." />
                                            <button onClick={saveAdminNotes} className="bg-[var(--color-ink)] text-white px-6 py-3 text-sm font-bold rounded-xl self-end hover:bg-black transition-colors shadow-sm focus:outline-none flex items-center gap-2"><Check size={16} /> Save Notes</button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div >
                    </div >
                )
            }
        </div >
    );
}

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loggedIn = sessionStorage.getItem('ri_admin_logged_in');
        if (loggedIn === 'true') {
            setIsLoggedIn(true);
        }
        setLoading(false);
    }, []);

    if (loading) return null;

    return isLoggedIn ? (
        <AdminDashboard onLogout={() => {
            sessionStorage.removeItem('ri_admin_logged_in');
            setIsLoggedIn(false);
            toast.success("Logged out successfully");
        }} />
    ) : (
        <AdminLogin onLogin={() => setIsLoggedIn(true)} />
    );
}
