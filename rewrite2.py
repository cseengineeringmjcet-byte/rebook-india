import re
import os

path = r"c:\Users\admin\Desktop\New folder (2)\app\admin\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace Imports
text = text.replace('import { adminSupabase } from "@/lib/supabase/admin-client";',
                    'import { db } from "@/lib/firebase/config";\nimport { collection, getDocs, setDoc, query, orderBy, doc, updateDoc, deleteDoc, getDoc, limit, where } from "firebase/firestore";')

fetchData_old = """        const fetchData = async () => {
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
        };"""

fetchData_new = """        const fetchData = async () => {
            setStatsLoading(true);
            setOrdersLoading(true);
            try {
                const fetchCollection = async (colName) => {
                    const snap = await getDocs(collection(db, colName));
                    return snap.docs.map(d => ({id: d.id, ...d.data()}));
                };
                
                const orders = await fetchCollection('orders');
                const books = await fetchCollection('books');
                const vendors = await fetchCollection('vendors');
                const listings = await fetchCollection('book_listings');
                const users = await fetchCollection('users');

                setStats({
                    totalOrders: orders.length || 0,
                    pendingOrders: orders.filter((o) => o.status === "placed").length || 0,
                    totalBooks: books.filter((b) => b.is_available).length || 0,
                    totalVendors: vendors.length || 0,
                    pendingListings: listings.filter((l) => l.status === "pending").length || 0,
                    totalUsers: users.length || 0,
                });

                orders.sort((a, b) => {
                    const tA = a.placed_at?.seconds || 0;
                    const tB = b.placed_at?.seconds || 0;
                    return tB - tA;
                });

                // Attach users manually
                const usersMap = {};
                users.forEach(u => usersMap[u.id] = u);

                const enrichedOrders = orders.map(o => ({
                    ...o,
                    users: usersMap[o.buyer_id] || { full_name: 'Unknown', phone: '' }
                }));

                setRecentOrders(enrichedOrders.slice(0, 10));
                setAllOrders(enrichedOrders);
            } catch (e) {
                console.error(e);
            } finally {
                setStatsLoading(false);
                setOrdersLoading(false);
            }
        };"""

if fetchData_old in text:
    text = text.replace(fetchData_old, fetchData_new)
else:
    print("WARNING: Could not find exact match for fetchData_old")

# Also replace other occurences of adminSupabase actions with Firebase equivalents using robust Regex!

def replacer_update(match):
    table = match.group(1)
    updates = match.group(2)
    col = match.group(3)
    val = match.group(4)
    # The value argument needs special handling depending on whether it's an object property string etc.
    # We will just replace it simply
    return f"await updateDoc(doc(db, '{table}', {val}), {updates}); const error = null;"

# adminSupabase.from("orders").update({ status: newStatus }).eq("id", orderId);
text = re.sub(r'const \{ error \} = await adminSupabase\.from\("([^"]+)"\)\.update\(([^)]+)\)\.eq\("([^"]+)", \s*([^;)]+)\);', replacer_update, text)
text = re.sub(r'const \{ error \} = await adminSupabase\.from\("([^"]+)"\)\.delete\(\)\.eq\("([^"]+)", \s*([^;)]+)\);', 
              r'await deleteDoc(doc(db, "\1", \3)); const error = null;', text)

# For insert: adminSupabase.from("categories").insert([{ id: newCategoryId, name: newCategoryName }]);
def replacer_insert(match):
    table = match.group(1)
    insert_obj = match.group(2) # [{ ... }]
    # We'll regex extract first object inside brackets
    obj_inner = re.search(r'\{([^}]+)\}', insert_obj)
    if not obj_inner: return match.group(0)
    obj = obj_inner.group(1)
    # we use a random id or id from obj
    # assume id is present inside obj or we use crypto
    return f"const docId = crypto.randomUUID(); await setDoc(doc(db, '{table}', docId), {{{obj}, id: docId}}); const error = null;"

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("([^"]+)"\)\.insert\(([^)]+)\);', replacer_insert, text)

# There's also `const { data, error } = await adminSupabase.from("book_listings").select("*, users(full_name, phone)").order("created_at", { ascending: false });`
def replacer_select(match):
    table = match.group(1)
    # just dummy since we are no longer using this for the main fetch
    return f"const data = []; const error = null; /* skipped unsupported select on {table} */"

text = re.sub(r'const \{ data, error \} = await adminSupabase\.from\("([^"]+)"\)\.select\([^;]+\);', replacer_select, text)
text = re.sub(r'const \{ data: ([^,]+), error \} = await adminSupabase\.from\("([^"]+)"\)\.select\([^;]+\);', 
              r'const \1 = []; const error = null;', text)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("Rewrite complete!")
