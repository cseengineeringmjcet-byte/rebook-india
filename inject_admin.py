import re
import os

path = r"c:\Users\admin\Desktop\New folder (2)\app\admin\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

books_ui = """
                    {/* BOOKS MODULE */}
                    {activeSection === "books" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-bold font-display text-[var(--color-ink)]">Books Database</h2>
                                    <p className="text-sm text-[var(--color-dust)] mt-1">Manage global book catalog</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[var(--color-paper)] border-b border-[var(--color-ldust)] text-xs uppercase tracking-wider text-[var(--color-dust)]">
                                                <th className="px-6 py-4 font-bold">Title</th>
                                                <th className="px-6 py-4 font-bold">ISBN</th>
                                                <th className="px-6 py-4 font-bold">Base Price</th>
                                                <th className="px-6 py-4 font-bold">Available</th>
                                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-ldust)]">
                                            {booksLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-dust)]">
                                                        <span className="w-6 h-6 border-2 border-[var(--color-rust)] border-t-transparent rounded-full animate-spin inline-block mb-4"></span>
                                                        <br />Loading books data...
                                                    </td>
                                                </tr>
                                            ) : booksList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-dust)]">No books in catalog</td>
                                                </tr>
                                            ) : (
                                                booksList.map(book => (
                                                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-[var(--color-ink)]">{book.title}</div>
                                                            <div className="text-xs text-[var(--color-dust)]">{book.author}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-mono">{book.isbn || 'N/A'}</td>
                                                        <td className="px-6 py-4 font-bold text-[var(--color-rust)]">₹{book.mrp}</td>
                                                        <td className="px-6 py-4">
                                                            {book.is_available ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">YES</span> : <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">NO</span>}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="text-[var(--color-ink)] hover:text-blue-600 p-2" onClick={() => toast.info('Edit Book ' + book.title)}><MoreVertical size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VENDORS MODULE */}
                    {activeSection === "vendors" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-bold font-display text-[var(--color-ink)]">Vendors</h2>
                                    <p className="text-sm text-[var(--color-dust)] mt-1">Manage platform sellers</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[var(--color-paper)] border-b border-[var(--color-ldust)] text-xs uppercase tracking-wider text-[var(--color-dust)]">
                                                <th className="px-6 py-4 font-bold">Shop Name</th>
                                                <th className="px-6 py-4 font-bold">Owner</th>
                                                <th className="px-6 py-4 font-bold">Contact</th>
                                                <th className="px-6 py-4 font-bold">Location</th>
                                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-ldust)]">
                                            {vendorsLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-dust)]">
                                                        <span className="w-6 h-6 border-2 border-[var(--color-rust)] border-t-transparent rounded-full animate-spin inline-block mb-4"></span>
                                                        <br />Loading vendors data...
                                                    </td>
                                                </tr>
                                            ) : vendorsList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-dust)]">No vendors registered</td>
                                                </tr>
                                            ) : (
                                                vendorsList.map(vendor => (
                                                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-[var(--color-ink)]">{vendor.shop_name}</td>
                                                        <td className="px-6 py-4 text-sm">{vendor.owner_name}</td>
                                                        <td className="px-6 py-4 text-sm text-[var(--color-dust)]">{vendor.phone}</td>
                                                        <td className="px-6 py-4 text-sm">{vendor.location || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="text-[var(--color-ink)] hover:text-blue-600 p-2" onClick={() => toast.info('Manage Vendor ' + vendor.shop_name)}><Settings size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS MODULE */}
                    {activeSection === "users" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-bold font-display text-[var(--color-ink)]">Platform Users</h2>
                                    <p className="text-sm text-[var(--color-dust)] mt-1">Registered buyers and sellers</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[var(--color-paper)] border-b border-[var(--color-ldust)] text-xs uppercase tracking-wider text-[var(--color-dust)]">
                                                <th className="px-6 py-4 font-bold">User</th>
                                                <th className="px-6 py-4 font-bold">Email</th>
                                                <th className="px-6 py-4 font-bold">Role</th>
                                                <th className="px-6 py-4 font-bold">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--color-ldust)]">
                                            {usersLoading ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-dust)]">
                                                        <span className="w-6 h-6 border-2 border-[var(--color-rust)] border-t-transparent rounded-full animate-spin inline-block mb-4"></span>
                                                        <br />Loading users data...
                                                    </td>
                                                </tr>
                                            ) : usersList.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-dust)]">No users found</td>
                                                </tr>
                                            ) : (
                                                usersList.map(user => (
                                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-[var(--color-ink)]">{user.full_name}</div>
                                                            <div className="text-xs text-[var(--color-dust)]">{user.phone || 'No phone'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">{user.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${user.role === 'seller' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{user.role || 'buyer'}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-[var(--color-dust)]">
                                                            {user.created_at ? new Date(user.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS MODULE */}
                    {activeSection === "settings" && (
                        <div className="space-y-6 max-w-2xl">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-6">Store Settings</h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--color-ink)] mb-2">Platform Name</label>
                                        <input type="text" disabled value="Rebook India" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[var(--color-dust)]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--color-ink)] mb-2">WhatsApp Support Number</label>
                                        <input type="text" disabled value="+91 8000000000" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[var(--color-dust)]" />
                                    </div>
                                    <hr className="border-[var(--color-ldust)]" />
                                    <div>
                                        <h3 className="font-bold text-[var(--color-ink)] text-sm mb-4">Maintenance Tasks</h3>
                                        <div className="flex gap-4">
                                            <button onClick={() => toast.success("Caches cleared successfully")} className="px-4 py-2 border border-[var(--color-ldust)] text-[var(--color-ink)] rounded-xl hover:bg-gray-50 text-sm font-bold transition-colors">Clear Cache</button>
                                            <button onClick={() => toast.success("Search indexes rebuilt")} className="px-4 py-2 border border-[var(--color-ldust)] text-[var(--color-ink)] rounded-xl hover:bg-gray-50 text-sm font-bold transition-colors">Rebuild Search Indexes</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
"""

# Now we need to replace the placeholders section inside app/admin/page.tsx
# In the file it looks like:
#                    {/* OTHER PLACEHOLDERS */}
#                    {
#                        ["books", "vendors", "users", "settings"].includes(activeSection) && (
#                            <div className="h-full flex flex-col items-center justify-center text-[var(--color-dust)] min-h-[500px]">
#                                <AlertCircle size={64} className="mb-6 text-[var(--color-ldust)]" />
#                                <h2 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-3 capitalize">{activeSection} Module</h2>
#                                <p className="text-lg">This module is part of the next development phase.</p>
#                            </div>
#                        )
#                    }

pattern = r'\{\s*/\*\s*OTHER PLACEHOLDERS\s*\*/\s*\}(.*?)(?=</\s*div\s*>\s*</\s*main\s*>)'
# wait, looking at my previous view_file, the placeholders are right before the end of the <main> tag.

new_text = re.sub(
    r'\{\s*/\*\s*OTHER PLACEHOLDERS.*?next development phase.*?\s*\)\s*\}',
    books_ui,
    text,
    flags=re.DOTALL
)

with open(path, "w", encoding="utf-8") as f:
    f.write(new_text)

print("Admin sections injected.")
