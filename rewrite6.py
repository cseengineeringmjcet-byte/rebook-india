import re
import os

path = r"c:\Users\admin\Desktop\New folder (2)\app\admin\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace the broken functions with proper Firestore fetch functions

def loadListings_replacement():
    return """const loadListings = async () => {
        setListingsLoading(true);
        try {
            const snap = await getDocs(query(collection(db, 'book_listings'), orderBy('created_at', 'desc')));
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setListings(data);
        } catch (err: any) {
            toast.error('Failed to load listings: ' + err.message);
        } finally {
            setListingsLoading(false);
        }
    };"""

text = re.sub(
    r'const loadListings = async \(\) => \{[\s\S]*?setListingsLoading\(false\);\n\s*?\};\n\s*\};',
    loadListings_replacement(),
    text
)

text = re.sub(
    r'const loadListings = async \(\) => \{[\s\S]*?setListingsLoading\(false\);\n\s*?\};',
    loadListings_replacement(),
    text
)


def loadVendorsForModal_replacement():
    return """const loadVendorsForModal = async () => {
        const snap = await getDocs(collection(db, 'vendors'));
        const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setVendorOptions(data);
    };"""

text = re.sub(
    r'const loadVendorsForModal = async \(\) => \{[^}]+\};',
    loadVendorsForModal_replacement(),
    text
)

def loadBooks_replacement():
    return """const loadBooks = async () => {
        setBooksLoading(true);
        try {
            const snap = await getDocs(query(collection(db, 'books'), orderBy('created_at', 'desc')));
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setBooksList(data);
        } catch(e) {}
        setBooksLoading(false);
    };"""

text = re.sub(
    r'const loadBooks = async \(\) => \{[^}]+\};',
    loadBooks_replacement(),
    text
)

def loadVendors_replacement():
    return """const loadVendors = async () => {
        setVendorsLoading(true);
        try {
            const snap = await getDocs(query(collection(db, 'vendors'), orderBy('created_at', 'desc')));
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setVendorsList(data);
        } catch(e) {}
        setVendorsLoading(false);
    };"""

text = re.sub(
    r'const loadVendors = async \(\) => \{[^}]+\};',
    loadVendors_replacement(),
    text
)

def loadUsers_replacement():
    return """const loadUsers = async () => {
        setUsersLoading(true);
        try {
            const snap = await getDocs(query(collection(db, 'users'), orderBy('created_at', 'desc')));
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setUsersList(data);
        } catch(e) {}
        setUsersLoading(false);
    };"""

text = re.sub(
    r'const loadUsers = async \(\) => \{[^}]+\};',
    loadUsers_replacement(),
    text
)

def loadCategoriesForModal_replacement():
    return """const loadCategoriesForModal = async () => {
        try {
            const snap = await getDocs(collection(db, 'categories'));
            const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setCategoryOptions(data);
        } catch(e) {}
    };"""

text = re.sub(
    r'const loadCategoriesForModal = async \(\) => \{[^}]+\};',
    loadCategoriesForModal_replacement(),
    text
)

# And fix the remaining supabase broken stuff
# `const channel = adminSupabase... .subscribe();` in useEffect
channel_rx = r'const channel = adminSupabase[\s\S]*?\.subscribe\(\);'
text = re.sub(channel_rx, '', text)
text = re.sub(r'return \(\) => \{ adminSupabase\.removeChannel\(channel\); \};?', '', text)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Rewrite 6 run")
