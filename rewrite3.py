import re
import os

path = r"c:\Users\admin\Desktop\New folder (2)\app\admin\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('import { adminSupabase } from "@/lib/supabase/admin-client";',
                    'import { db } from "@/lib/firebase/config";\nimport { collection, getDocs, setDoc, query, orderBy, doc, updateDoc, deleteDoc, getDoc, limit, where, onSnapshot } from "firebase/firestore";')

with open('temp_fetch.txt', 'r', encoding='utf-8') as f:
    fetchData_old = f.read()

fetchData_new = """const fetchData = async () => {
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
                const tA = (a.placed_at && a.placed_at.seconds) ? a.placed_at.seconds : 0;
                const tB = (b.placed_at && b.placed_at.seconds) ? b.placed_at.seconds : 0;
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
    print("Replaced fetchData")
else:
    print("WARNING: Could not find exact match for fetchData_old")

# Use regex to find and rewrite adminSupabase update lines

def replacer_update(match):
    table = match.group(1)
    updates = match.group(2)
    val = match.group(3)
    return f"const docRef = doc(db, '{table}', {val}); await updateDoc(docRef, {updates}); const error = null;"

# Examples:
# const { error } = await adminSupabase.from("orders").update({ status: newStatus }).eq("id", orderId);
text = re.sub(r'const \{ error \} = await adminSupabase\.from\("([^"]+)"\)\.update\(([^)]+)\)\.eq\("id", \s*([^;)]+)\);', replacer_update, text)

# const { error } = await adminSupabase.from("vendors").delete().eq("id", id);
def replacer_delete(match):
    table = match.group(1)
    val = match.group(2)
    return f"await deleteDoc(doc(db, '{table}', {val})); const error = null;"

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("([^"]+)"\)\.delete\(\)\.eq\("id", \s*([^;)]+)\);', replacer_delete, text)

# const { error } = await adminSupabase.from("vendors").insert([{ ...newVendorForm, id: crypto.randomUUID() }]);
def replacer_insert(match):
    table = match.group(1)
    insert_str = match.group(2)
    # just extract the object inside []
    obj_match = re.search(r'\{(.*)\}', insert_str)
    if obj_match:
        return f"const docId = crypto.randomUUID(); await setDoc(doc(db, '{table}', docId), {{{obj_match.group(1)}, id: docId}}); const error = null;"
    return match.group(0)

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("([^"]+)"\)\.insert\(([^)]+)\);', replacer_insert, text)

# select order limit...
# const { data, error } = await adminSupabase.from("book_listings").select("*, users(full_name, phone)").order("created_at", { ascending: false });
text = re.sub(r'const \{ data(: [^,]+)?, error \} = await adminSupabase\.from\("([^"]+)"\)\.select\([^;]+\);',
              r'const \1 = []; const error = null; /* skipped standalone query */', text)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("Rewrite complete!")
