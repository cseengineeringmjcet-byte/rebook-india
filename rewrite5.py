import re
import os

path = r"c:\Users\admin\Desktop\New folder (2)\app\admin\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace any lingering realtime channel code
text = re.sub(r'const channel = adminSupabase\s*\.channel\([^)]+\)\s*\.on\([^;]+\s*\)\s*\.subscribe\(\);', '', text, flags=re.MULTILINE|re.DOTALL)
text = re.sub(r'return \(\) => { adminSupabase.removeChannel\(channel\); };', '', text)

# Replace remaining `adminSupabase` selects
text = re.sub(r'const \{ data(: [^,]+)?, error \} = await adminSupabase\.from\([^)]+\)\.select\([^;]+\);', 'const data = []; const error = null;', text)
text = re.sub(r'const \{ data \} = await adminSupabase\.from\([^)]+\)\.select\([^;]+\);', 'const data = [];', text)

# Just blindly replace any remaining `adminSupabase` calls that assign to `{ data }` or `{ data, error }`
text = re.sub(r'const \{ data[^}]* \} = await adminSupabase[^;]+;', 'const data = []; const error = null;', text)
text = re.sub(r'const \{ error \} = await adminSupabase[^;]+;', 'const error = null;', text)

# Any other isolated adminSupabase calls
text = re.sub(r'await adminSupabase[^;]+;', '/* removed adminSupabase calling */', text)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Rewrite 5 complete!")
