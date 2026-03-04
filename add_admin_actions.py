import re

path = r"c:\Users\admin\Desktop\New folder (2)\app\admin\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

funcs = """
    const toggleBookAvailability = async (bookId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "books", bookId), { is_available: !currentStatus });
            toast.success(`Book marked as ${!currentStatus ? 'Available' : 'Unavailable'}`);
            loadBooks();
        } catch (e) {
            toast.error("Failed to update book status");
        }
    };

    const toggleVendorApproval = async (vendorId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "vendors", vendorId), { is_approved: !currentStatus });
            toast.success(`Vendor marked as ${!currentStatus ? 'Approved' : 'Unapproved'}`);
            loadVendors();
        } catch (e) {
            toast.error("Failed to update vendor status");
        }
    };

    const toggleUserRole = async (userId: string, currentRole: string) => {
        try {
            const newRole = currentRole === 'seller' ? 'buyer' : 'seller';
            await updateDoc(doc(db, "users", userId), { role: newRole });
            toast.success(`User role updated to ${newRole}`);
            loadUsers();
        } catch (e) {
            toast.error("Failed to update user role");
        }
    };

    const deleteVendorRecord = async (vendorId: string) => {
        if(confirm("Are you sure you want to delete this vendor?")) {
            try {
                await deleteDoc(doc(db, "vendors", vendorId));
                toast.success("Vendor deleted successfully");
                loadVendors();
            } catch (e) {
                toast.error("Failed to delete vendor");
            }
        }
    };
    
"""

text = text.replace("    const exportCSV = () => {", funcs + "    const exportCSV = () => {")

# Books actions replacement
old_books_actions = r"<td className=\"px-6 py-4 text-right\">\s*<button className=\"text-\[var\(--color-ink\)\] hover:text-blue-600 p-2\" onClick=\{\(\) => toast\.info\('Edit Book ' \+ book\.title\)\}>\s*<MoreVertical size=\{16\} />\s*</button>\s*</td>"
new_books_actions = """<td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <button className="text-[var(--color-ink)] hover:text-blue-600 p-2" title="Toggle Availability" onClick={() => toggleBookAvailability(book.id, book.is_available)}>
                                                                <RefreshCw size={16} />
                                                            </button>
                                                        </td>"""
text = re.sub(old_books_actions, new_books_actions, text)

# Vendors actions replacement
old_vendors_actions = r"<td className=\"px-6 py-4 text-right\">\s*<button className=\"text-\[var\(--color-ink\)\] hover:text-blue-600 p-2\" onClick=\{\(\) => toast\.info\('Manage Vendor ' \+ vendor\.shop_name\)\}>\s*<Settings size=\{16\} />\s*</button>\s*</td>"
new_vendors_actions = """<td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <button className="text-green-600 hover:text-green-800 p-2" title="Toggle Approval" onClick={() => toggleVendorApproval(vendor.id, vendor.is_approved)}>
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button className="text-red-600 hover:text-red-800 p-2" title="Delete Vendor" onClick={() => deleteVendorRecord(vendor.id)}>
                                                                <XCircle size={16} />
                                                            </button>
                                                        </td>"""
text = re.sub(old_vendors_actions, new_vendors_actions, text)

# Users actions replacement
old_users_row_end = r"<td className=\"px-6 py-4 text-xs text-\[var\(--color-dust\)\]\">\s*\{user\.created_at \? new Date\(user\.created_at\.seconds \* 1000\)\.toLocaleDateString\(\) : 'N/A'\}\s*</td>\s*</tr>"
new_users_row_end = """<td className="px-6 py-4 text-xs text-[var(--color-dust)]">
                                                            {user.created_at ? new Date(user.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <button className="text-[var(--color-ink)] hover:text-blue-600 p-2" title="Change Role" onClick={() => toggleUserRole(user.id, user.role || 'buyer')}>
                                                                <RefreshCw size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>"""
text = re.sub(old_users_row_end, new_users_row_end, text)

# Also need to add th Actions to users table
old_users_thead = r"<th className=\"px-6 py-4 font-bold\">Joined</th>\s*</tr>"
new_users_thead = """<th className="px-6 py-4 font-bold">Joined</th>
                                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                                            </tr>"""
text = re.sub(old_users_thead, new_users_thead, text)
text = text.replace('colSpan={4}', 'colSpan={5}')

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("Updates applied")
