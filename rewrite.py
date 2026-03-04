import re
import os

path = r"c:\Users\admin\Desktop\New folder (2)\app\admin\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Imports
text = text.replace("import { adminSupabase } from \"@/lib/supabase/admin-client\";",
                    "import { db } from \"@/lib/firebase/config\";\nimport { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, getDocs, setDoc } from \"firebase/firestore\";")

# Rewrite fetchData inside useEffect
fetchData_old = """    const fetchData = async () => {
        setOrdersLoading(true);
        try {
            const p1 = adminSupabase.from("orders").select("*").order("created_at", { ascending: false });
            const p2 = adminSupabase.from("book_listings").select("*").order("created_at", { ascending: false });
            const p3 = adminSupabase.from("users").select("*");
            const p4 = adminSupabase.from("vendors").select("*");
            const p5 = adminSupabase.from("categories").select("*");

            const [res1, res2, res3, res4, res5] = await Promise.all([p1, p2, p3, p4, p5]);

            if (res1.data) setAllOrders(res1.data);
            if (res2.data) setAllListings(res2.data);
            if (res3.data) setUsers(res3.data);
            if (res4.data) setVendors(res4.data);
            if (res5.data) setCategories(res5.data);

            // Derived stats
            setStats({
                totalOrders: res1.data?.length || 0,
                pendingOrders: res1.data?.filter((o: any) => ["pending", "placed", "reviewing"].includes(o.status)).length || 0,
                totalBooks: res4.data?.length || 0,  // We use vendor books as total or derived
                totalSellers: res3.data?.filter((u: any) => u.role === "seller").length || 0,
                totalListings: res2.data?.length || 0,
                totalRevenue: res1.data?.filter((o: any) => o.status === "delivered").reduce((sum: number, o: any) => sum + (o.price_paid || 0), 0) || 0,
            });

        } catch (err) {
            console.error(err);
        } finally {
            setOrdersLoading(false);
        }
    };"""

fetchData_new = """    const fetchData = () => {
        setOrdersLoading(true);
        const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('created_at', 'desc')), (snap) => {
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setAllOrders(data);
            setStats(prev => ({
                ...prev,
                totalOrders: data.length,
                pendingOrders: data.filter((o: any) => ["pending", "placed", "reviewing"].includes(o.status)).length,
                totalRevenue: data.filter((o: any) => o.status === "delivered").reduce((sum: number, o: any) => sum + (o.price_paid || 0), 0)
            }));
            setOrdersLoading(false);
        });

        const unsubListings = onSnapshot(query(collection(db, 'book_listings'), orderBy('created_at', 'desc')), (snap) => {
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setAllListings(data);
            setStats(prev => ({ ...prev, totalListings: data.length }));
        });

        const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setUsers(data);
            setStats(prev => ({ ...prev, totalSellers: data.filter((u: any) => u.role === "seller").length }));
        });

        const unsubVendors = onSnapshot(collection(db, 'vendors'), (snap) => {
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setVendors(data);
            setStats(prev => ({ ...prev, totalBooks: data.length }));
        });

        const unsubCats = onSnapshot(collection(db, 'categories'), (snap) => {
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setCategories(data);
        });

        return () => {
            unsubOrders();
            unsubListings();
            unsubUsers();
            unsubVendors();
            unsubCats();
        };
    };"""

if fetchData_old in text:
    text = text.replace(fetchData_old, fetchData_new)
    print("Replaced fetchData")
else:
    # Need to regex it because formatting might differ
    print("WARNING: Could not find exact match for fetchData_old, skipping main fetch replace")

# Actions

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("orders"\)\.update\(\{ status: newStatus \}\)\.eq\("id", orderId\);',
              r'await updateDoc(doc(db, "orders", orderId), { status: newStatus }); const error = null;', text)

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("orders"\)\.update\(\{ tracking_no: trackingNo \}\)\.eq\("id", selectedOrder\.id\);',
              r'await updateDoc(doc(db, "orders", selectedOrder.id), { tracking_no: trackingNo }); const error = null;', text)

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("book_listings"\)\.update\(\{ status: newStatus \}\)\.eq\("id", listingId\);',
              r'await updateDoc(doc(db, "book_listings", listingId), { status: newStatus }); const error = null;', text)

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("vendors"\)\.update\(\{ \.\.\.editVendorForm \}\)\.eq\("id", editVendorForm\.id\);',
              r'await updateDoc(doc(db, "vendors", editVendorForm.id), { ...editVendorForm }); const error = null;', text)

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("vendors"\)\.insert\(\[\{ \.\.\.newVendorForm, id: [^}]+ \}\]\);',
              r'const docId = crypto.randomUUID(); await setDoc(doc(db, "vendors", docId), { ...newVendorForm, id: docId }); const error = null;', text)

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("vendors"\)\.delete\(\)\.eq\("id", id\);',
              r'await deleteDoc(doc(db, "vendors", id)); const error = null;', text)

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("categories"\)\.update\(\{ name: editCategoryName \}\)\.eq\("id", editCategoryId\);',
              r'await updateDoc(doc(db, "categories", editCategoryId), { name: editCategoryName }); const error = null;', text)

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("categories"\)\.insert\(\[\{ id: newCategoryId, name: newCategoryName \}\]\);',
              r'await setDoc(doc(db, "categories", newCategoryId), { id: newCategoryId, name: newCategoryName }); const error = null;', text)

text = re.sub(r'const \{ error \} = await adminSupabase\.from\("categories"\)\.delete\(\)\.eq\("id", id\);',
              r'await deleteDoc(doc(db, "categories", id)); const error = null;', text)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("Rewrite complete!")
