const fs = require('fs');
let file = 'c:\\\\Users\\\\admin\\\\Desktop\\\\New folder (2)\\\\app\\\\admin\\\\page.tsx';
let c = fs.readFileSync(file, 'utf8');

const target1 = `    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);\r
    const [listingsStatusFilter, setListingsStatusFilter] = useState("All");\r
    const [listingsSearchQuery, setListingsSearchQuery] = useState("");`;

const repl1 = `    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
    const [listingsStatusFilter, setListingsStatusFilter] = useState("All");
    const [listingsSearchQuery, setListingsSearchQuery] = useState("");

    // Additional States
    const [booksList, setBooksList] = useState<any[]>([]);
    const [booksLoading, setBooksLoading] = useState(true);
    const [vendorsList, setVendorsList] = useState<any[]>([]);
    const [vendorsLoading, setVendorsLoading] = useState(true);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);`;

c = c.replace(target1, repl1);

const target1a = `    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);\n    const [listingsStatusFilter, setListingsStatusFilter] = useState("All");\n    const [listingsSearchQuery, setListingsSearchQuery] = useState("");`;

c = c.replace(target1a, repl1);


const target2 = `    useEffect(() => {\r
        fetchData();\r
        loadListings();\r
        loadVendorsForModal();\r
        loadCategoriesForModal();`;

const repl2 = `    useEffect(() => {
        fetchData();
        loadListings();
        loadVendorsForModal();
        loadCategoriesForModal();
        loadBooks();
        loadVendors();
        loadUsers();`;

c = c.replace(target2, repl2);

const target2a = `    useEffect(() => {\n        fetchData();\n        loadListings();\n        loadVendorsForModal();\n        loadCategoriesForModal();`;
c = c.replace(target2a, repl2);


fs.writeFileSync(file, c, 'utf8');
console.log('Fixed');
