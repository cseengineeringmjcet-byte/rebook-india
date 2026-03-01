const fs = require('fs');
let file = 'c:\\\\Users\\\\admin\\\\Desktop\\\\New folder (2)\\\\app\\\\admin\\\\page.tsx';
let c = fs.readFileSync(file, 'utf8');

const stateBlock = `    // Listings State
    const [listings, setListings] = useState<any[]>([]);
    const [listingsLoading, setListingsLoading] = useState(true);
    const [vendorOptions, setVendorOptions] = useState<any[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
    const [listingsStatusFilter, setListingsStatusFilter] = useState("All");
    const [listingsSearchQuery, setListingsSearchQuery] = useState("");

    // New States
    const [booksList, setBooksList] = useState<any[]>([]);
    const [booksLoading, setBooksLoading] = useState(true);
    const [vendorsList, setVendorsList] = useState<any[]>([]);
    const [vendorsLoading, setVendorsLoading] = useState(true);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);`;

c = c.replace(/    \/\/ Listings State[\s\S]*?setListingsSearchQuery\(""\);/, stateBlock);

const loadBlock = `    const loadBooks = async () => {
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

    const loadCategoriesForModal`;

c = c.replace(/    const loadCategoriesForModal/, loadBlock);

const useBlock = `        loadVendorsForModal();
        loadCategoriesForModal();
        loadBooks();
        loadVendors();
        loadUsers();`;

c = c.replace(/        loadVendorsForModal\(\);\n        loadCategoriesForModal\(\);/, useBlock);


const sectionsBlock = `
        {/* BOOKS SECTION */}
        {activeSection === "books" && (
            <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
                <div className="flex justify-between shrink-0 mb-2">
                    <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">Platform Books</h2>
                    <button className="bg-[var(--color-ink)] text-white hover:bg-black px-6 py-2 text-sm font-bold rounded-xl transition-colors shadow-sm">
                        + Add Book
                    </button>
                </div>
                <div className="bg-white border border-[var(--color-ldust)] rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--color-paper)] text-[var(--color-dust)] font-bold uppercase tracking-wider text-[11px] border-b border-[var(--color-ldust)]">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Author</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Availability</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-ldust)] text-[13px]">
                                {booksLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--color-dust)]">Loading books...</td></tr>
                                ) : booksList.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--color-dust)]">No books found.</td></tr>
                                ) : booksList.map(book => (
                                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-[var(--color-ink)]">{book.title}</td>
                                        <td className="px-6 py-4 text-[var(--color-dust)]">{book.author}</td>
                                        <td className="px-6 py-4 text-[var(--color-dust)]">{book.categories?.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={\`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider \${book.is_available ? 'bg-sage-100 text-sage-800' : 'bg-red-100 text-red-800'}\`}>
                                                {book.is_available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[var(--color-ink)] bg-gray-100 border border-gray-200 hover:bg-gray-200 p-1.5 rounded-md shadow-sm transition-colors" onClick={() => toast.info("Edit book")}>
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* VENDORS SECTION */}
        {activeSection === "vendors" && (
            <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
                <div className="flex justify-between shrink-0 mb-2">
                    <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">Platform Vendors</h2>
                    <button className="bg-[var(--color-ink)] text-white hover:bg-black px-6 py-2 text-sm font-bold rounded-xl transition-colors shadow-sm">
                        + Add Vendor
                    </button>
                </div>
                <div className="bg-white border border-[var(--color-ldust)] rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--color-paper)] text-[var(--color-dust)] font-bold uppercase tracking-wider text-[11px] border-b border-[var(--color-ldust)]">
                                <tr>
                                    <th className="px-6 py-4">Shop Name</th>
                                    <th className="px-6 py-4">Area</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-ldust)] text-[13px]">
                                {vendorsLoading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-[var(--color-dust)]">Loading vendors...</td></tr>
                                ) : vendorsList.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-[var(--color-dust)]">No vendors found.</td></tr>
                                ) : vendorsList.map(vendor => (
                                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-[var(--color-ink)]">{vendor.shop_name}</td>
                                        <td className="px-6 py-4 text-[var(--color-dust)]">{vendor.area}</td>
                                        <td className="px-6 py-4">
                                            <span className={\`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider \${vendor.is_active ? 'bg-sage-100 text-sage-800' : 'bg-red-100 text-red-800'}\`}>
                                                {vendor.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[var(--color-ink)] bg-gray-100 border border-gray-200 hover:bg-gray-200 p-1.5 rounded-md shadow-sm transition-colors" onClick={() => toast.info("View vendor")}>
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* USERS SECTION */}
        {activeSection === "users" && (
            <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
                <div className="flex justify-between shrink-0 mb-2">
                    <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">Registered Users</h2>
                </div>
                <div className="bg-white border border-[var(--color-ldust)] rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--color-paper)] text-[var(--color-dust)] font-bold uppercase tracking-wider text-[11px] border-b border-[var(--color-ldust)]">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-ldust)] text-[13px]">
                                {usersLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--color-dust)]">Loading users...</td></tr>
                                ) : usersList.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--color-dust)]">No users found.</td></tr>
                                ) : usersList.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-[var(--color-ink)]">{u.full_name}</td>
                                        <td className="px-6 py-4 text-[var(--color-dust)]">{u.phone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={\`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider \${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}\`}>
                                                {u.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--color-dust)]">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[var(--color-ink)] bg-gray-100 border border-gray-200 hover:bg-gray-200 p-1.5 rounded-md shadow-sm transition-colors" onClick={() => toast.info("Manage user")}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* OTHER PLACEHOLDERS */}
        {
            ["settings"].includes(activeSection) && (
                <div className="h-full flex flex-col items-center justify-center text-[var(--color-dust)] min-h-[500px]">
                    <AlertCircle size={64} className="mb-6 text-[var(--color-ldust)]" />
                    <h2 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-3 capitalize">{activeSection} Module</h2>
                    <p className="text-lg">This module is part of the next development phase.</p>
                </div>
            )
        }
`;

c = c.replace(/\{\/\* OTHER PLACEHOLDERS \*\/ \} \n\{[\s\S]*?\)\n\s*\}/m, sectionsBlock);
fs.writeFileSync(file, c, 'utf8');
console.log('Sections added successfully');
