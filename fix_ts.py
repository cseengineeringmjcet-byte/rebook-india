import re
import os

path = r"c:\Users\admin\Desktop\New folder (2)\app\admin\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Fix fetchCollection `colName`
text = text.replace("const fetchCollection = async (colName)", "const fetchCollection = async (colName: string)")

# Fix filter conditions typing
text = text.replace("orders.filter((o) => o.status === \"placed\")", "orders.filter((o: any) => o.status === \"placed\")")
text = text.replace("books.filter((b) => b.is_available)", "books.filter((b: any) => b.is_available)")
text = text.replace("listings.filter((l) => l.status === \"pending\")", "listings.filter((l: any) => l.status === \"pending\")")

# Fix orders map sort
text = text.replace("orders.sort((a, b) => {", "orders.sort((a: any, b: any) => {")
text = text.replace("const enrichedOrders = orders.map(o => ({", "const enrichedOrders = orders.map((o: any) => ({")

# Fix loadListings data
text = text.replace("const data = []; const error = null;", "const data: any[] = []; const error = null;")

# Fix usersMap
text = text.replace("const usersMap = {};\n            users.forEach(u => usersMap[u.id] = u);",
                    "const usersMap: Record<string, any> = {};\n            users.forEach((u: any) => usersMap[u.id] = u);")

text = re.sub(r'const data = \[\];', r'const data: any[] = [];', text)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("TypeScript fix complete!")
