import os
import re

path = r"c:\Users\admin\Desktop\New folder (2)\app\admin\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace supabase realtime with nothing, since we already have onSnapshot
realtime = """        const channel = adminSupabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public' },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => { adminSupabase.removeChannel(channel); };"""
text = text.replace(realtime, "")

text = re.sub(r'const { data } = await adminSupabase\.from\("users"\)\.select\("full_name, phone"\)\.eq\("id", selectedOrder\.buyer_id\)\.single\(\);',
              r"const docSnap = await getDoc(doc(db, 'users', selectedOrder.buyer_id)); const data = docSnap.exists() ? docSnap.data() : null;", text)

# There's a setAdminNotes which had: `const { error } = await adminSupabase.from("orders").update({ admin_notes: adminNotes }).eq("id", selectedOrder.id);`
text = re.sub(r'const \{ error \} = await adminSupabase\.from\("([^"]+)"\)\.update\(\{ admin_notes: adminNotes \}\)\.eq\("id", selectedOrder\.id\);',
              r'await updateDoc(doc(db, "\1", selectedOrder.id), { admin_notes: adminNotes }); const error = null;', text)

# Remove any remaining raw adminSupabase
# Catch-all
text = re.sub(r'const \{ data: [^,]+, error \} = await adminSupabase\.from\("[^"]+"\)\.select\([^;]+\);',
              r"/* removed unsupported query */", text)


with open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("Rewrite 4 complete!")
