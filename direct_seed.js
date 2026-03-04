const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc, getDocs, deleteDoc, serverTimestamp } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Copying prices logic
const calcPricesFirebase = (mrp) => ({
    our_price: Math.round(mrp * 0.5),
    vendor_earn: Math.round(mrp * 0.4),
    ri_earn: Math.round(mrp * 0.1),
    savings: Math.round(mrp * 0.5),
});

const categories = [
    { id: 'engineering', name: 'B.Tech Engineering', icon: 'E', sort_order: 1 },
    { id: 'medical', name: 'MBBS Medical', icon: 'M', sort_order: 2 },
    { id: 'jee', name: 'JEE Mains & Advanced', icon: 'J', sort_order: 3 },
    { id: 'neet', name: 'NEET UG', icon: 'N', sort_order: 4 },
    { id: 'upsc', name: 'UPSC Civil Services', icon: 'U', sort_order: 5 },
    { id: 'bank', name: 'Bank PO & SSC', icon: 'B', sort_order: 6 },
    { id: 'science', name: 'Class 11-12 Science', icon: 'S', sort_order: 7 },
    { id: 'secondary', name: 'Class 9-10 CBSE', icon: 'C', sort_order: 8 },
    { id: 'school', name: 'Class 1-8 School', icon: 'P', sort_order: 9 },
    { id: 'mba', name: 'MBA & CAT', icon: 'A', sort_order: 10 },
    { id: 'ca', name: 'CA & CMA', icon: 'F', sort_order: 11 },
    { id: 'law', name: 'Law & CLAT', icon: 'L', sort_order: 12 },
    { id: 'selfhelp', name: 'Self-Help & Business', icon: 'H', sort_order: 13 },
    { id: 'fiction', name: 'Fiction & Literature', icon: 'R', sort_order: 14 },
    { id: 'regional', name: 'Telugu & Regional', icon: 'T', sort_order: 15 },
]

const vendors = [
    { id: 'v1', shop_name: 'Hyderabad Book Trust', area: 'Abids', whatsapp: '919876501001', established: 1987, total_books: 4200, rating: 4.8, badge: 'Elite', is_verified: true, is_featured: true, speciality: 'Academic & Competitive Exams', shop_image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600' },
    { id: 'v3', shop_name: 'Secunderabad Old Books', area: 'Secunderabad', whatsapp: '919876503003', established: 1979, total_books: 5800, rating: 4.9, badge: 'Elite', is_verified: true, is_featured: true, speciality: 'Engineering & Medical Books', shop_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600' },
    { id: 'v4', shop_name: 'Student Corner Books', area: 'Ameerpet', whatsapp: '919876504004', established: 2003, total_books: 2900, rating: 4.6, badge: 'Trusted', is_verified: true, is_featured: false, speciality: 'IT CS & MBA Books', shop_image: 'https://images.unsplash.com/photo-1568667256549-094345857eff?w=600' },
    { id: 'v6', shop_name: 'JNTU Book Bazaar', area: 'Kukatpally', whatsapp: '919876506006', established: 1998, total_books: 6400, rating: 4.8, badge: 'Elite', is_verified: true, is_featured: true, speciality: 'B.Tech All Branches All Sems', shop_image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600' },
    { id: 'v7', shop_name: 'Nizam Medical Books', area: 'Afzalgunj', whatsapp: '919876507007', established: 1971, total_books: 4100, rating: 4.9, badge: 'Elite', is_verified: true, is_featured: true, speciality: 'MBBS BDS & Nursing Books', shop_image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600' },
    { id: 'v8', shop_name: 'Saraswathi Book Store', area: 'Dilsukhnagar', whatsapp: '919876508008', established: 2001, total_books: 3800, rating: 4.6, badge: 'Partner', is_verified: false, is_featured: false, speciality: 'School CBSE ICSE State Board', shop_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600' },
    { id: 'v9', shop_name: 'Gyan Ganga Books', area: 'LB Nagar', whatsapp: '919876509009', established: 2008, total_books: 2700, rating: 4.7, badge: 'Trusted', is_verified: true, is_featured: false, speciality: 'UPSC SSC & Bank PO Books', shop_image: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600' },
    { id: 'v10', shop_name: 'Prasad Book Palace', area: 'Himayatnagar', whatsapp: '919876510010', established: 1983, total_books: 5200, rating: 4.8, badge: 'Premium', is_verified: true, is_featured: true, speciality: 'Fiction Self-Help & General', shop_image: 'https://images.unsplash.com/photo-1464982326199-86f32f81b211?w=600' },
    { id: 'v11', shop_name: 'IIT-JEE Book Hub', area: 'SR Nagar', whatsapp: '919876511011', established: 2005, total_books: 4500, rating: 4.9, badge: 'Elite', is_verified: true, is_featured: true, speciality: 'JEE & NEET Coaching Material', shop_image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600' },
    { id: 'v13', shop_name: 'MBA Masters Books', area: 'Banjara Hills', whatsapp: '919876513013', established: 2010, total_books: 3100, rating: 4.7, badge: 'Partner', is_verified: false, is_featured: false, speciality: 'MBA CA & Finance Books', shop_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600' },
    { id: 'v15', shop_name: 'KL Rao Technical Books', area: 'Ameerpet', whatsapp: '919876515015', established: 1992, total_books: 3900, rating: 4.8, badge: 'Premium', is_verified: true, is_featured: true, speciality: 'Civil Mech & Electrical Engg', shop_image: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=600' },
]

const books_data = [
    { id: 'b1', title: 'BS Grewal Higher Engineering Mathematics', author: 'B.S. Grewal', isbn: '9788174091956', mrp: 950, condition: 'good', category_id: 'engineering', vendorKey: 'v6', category_name: 'B.Tech Engineering' },
    { id: 'b2', title: 'CLRS Introduction to Algorithms', author: 'Cormen et al', isbn: '9780262033848', mrp: 1850, condition: 'good', category_id: 'engineering', vendorKey: 'v4', category_name: 'B.Tech Engineering' },
    { id: 'b3', title: 'Galvin Operating System Concepts', author: 'Abraham Silberschatz', isbn: '9781119800361', mrp: 1150, condition: 'good', category_id: 'engineering', vendorKey: 'v4', category_name: 'B.Tech Engineering' },
    { id: 'b4', title: 'Kreyszig Advanced Engineering Mathematics', author: 'Erwin Kreyszig', isbn: '9788126554232', mrp: 1250, condition: 'like_new', category_id: 'engineering', vendorKey: 'v6', category_name: 'B.Tech Engineering' },
    { id: 'b5', title: 'Hibbeler Engineering Mechanics', author: 'R.C. Hibbeler', isbn: '9780133918922', mrp: 1380, condition: 'good', category_id: 'engineering', vendorKey: 'v15', category_name: 'B.Tech Engineering' },
    { id: 'b6', title: 'Korth Database System Concepts', author: 'Silberschatz Korth', isbn: '9780078022159', mrp: 1350, condition: 'like_new', category_id: 'engineering', vendorKey: 'v4', category_name: 'B.Tech Engineering' },
    { id: 'b7', title: 'Tanenbaum Computer Networks', author: 'Andrew Tanenbaum', isbn: '9780132126953', mrp: 1200, condition: 'good', category_id: 'engineering', vendorKey: 'v4', category_name: 'B.Tech Engineering' },
    { id: 'b8', title: 'Sedra Smith Microelectronic Circuits', author: 'Sedra and Smith', isbn: '9780199476299', mrp: 1450, condition: 'good', category_id: 'engineering', vendorKey: 'v6', category_name: 'B.Tech Engineering' },
    { id: 'b9', title: 'Cengel Thermodynamics', author: 'Yunus Cengel', isbn: '9780073398174', mrp: 1550, condition: 'good', category_id: 'engineering', vendorKey: 'v15', category_name: 'B.Tech Engineering' },
    { id: 'b10', title: 'Oppenheim Signals and Systems', author: 'Alan Oppenheim', isbn: '9780138147570', mrp: 1300, condition: 'good', category_id: 'engineering', vendorKey: 'v6', category_name: 'B.Tech Engineering' },
    { id: 'b11', title: 'HC Verma Concepts of Physics Part 1', author: 'H.C. Verma', isbn: '9788177091878', mrp: 500, condition: 'good', category_id: 'jee', vendorKey: 'v11', category_name: 'JEE Mains & Advanced' },
    { id: 'b12', title: 'HC Verma Concepts of Physics Part 2', author: 'H.C. Verma', isbn: '9788177092080', mrp: 500, condition: 'good', category_id: 'jee', vendorKey: 'v11', category_name: 'JEE Mains & Advanced' },
    { id: 'b13', title: 'DC Pandey Mechanics Part 1', author: 'D.C. Pandey', isbn: '9789313191797', mrp: 695, condition: 'good', category_id: 'jee', vendorKey: 'v11', category_name: 'JEE Mains & Advanced' },
    { id: 'b14', title: 'MS Chauhan Organic Chemistry', author: 'M.S. Chauhan', isbn: '9789385576607', mrp: 750, condition: 'good', category_id: 'jee', vendorKey: 'v11', category_name: 'JEE Mains & Advanced' },
    { id: 'b15', title: 'Grays Anatomy 42nd Edition', author: 'Henry Gray', isbn: '9780702052309', mrp: 2500, condition: 'good', category_id: 'medical', vendorKey: 'v7', category_name: 'MBBS Medical' },
    { id: 'b16', title: 'BD Chaurasia Human Anatomy Vol 1', author: 'B.D. Chaurasia', isbn: '9788123924854', mrp: 850, condition: 'good', category_id: 'medical', vendorKey: 'v7', category_name: 'MBBS Medical' },
    { id: 'b17', title: 'Guyton Hall Medical Physiology', author: 'Guyton and Hall', isbn: '9780323597128', mrp: 2300, condition: 'good', category_id: 'medical', vendorKey: 'v7', category_name: 'MBBS Medical' },
    { id: 'b18', title: 'Robbins Basic Pathology', author: 'Kumar Abbas', isbn: '9780323353175', mrp: 2600, condition: 'like_new', category_id: 'medical', vendorKey: 'v3', category_name: 'MBBS Medical' },
    { id: 'b19', title: 'Harrisons Principles Internal Medicine', author: 'Kasper et al', isbn: '9781259644030', mrp: 4500, condition: 'good', category_id: 'medical', vendorKey: 'v7', category_name: 'MBBS Medical' },
    { id: 'b20', title: 'KD Tripathi Medical Pharmacology', author: 'K.D. Tripathi', isbn: '9789352704996', mrp: 1550, condition: 'good', category_id: 'medical', vendorKey: 'v7', category_name: 'MBBS Medical' },
    { id: 'b21', title: 'Bailey and Love Surgery', author: 'Williams Ronan', isbn: '9781138295773', mrp: 3200, condition: 'good', category_id: 'medical', vendorKey: 'v7', category_name: 'MBBS Medical' },
    { id: 'b22', title: 'Laxmikant Indian Polity', author: 'M. Laxmikant', isbn: '9789353168933', mrp: 950, condition: 'good', category_id: 'upsc', vendorKey: 'v9', category_name: 'UPSC Civil Services' },
    { id: 'b23', title: 'Bipin Chandra Indias Struggle', author: 'Bipin Chandra', isbn: '9780143031345', mrp: 499, condition: 'good', category_id: 'upsc', vendorKey: 'v9', category_name: 'UPSC Civil Services' },
    { id: 'b24', title: 'GC Leong Certificate Geography', author: 'G.C. Leong', isbn: '9780195668452', mrp: 660, condition: 'good', category_id: 'upsc', vendorKey: 'v9', category_name: 'UPSC Civil Services' },
    { id: 'b25', title: 'RS Aggarwal Quantitative Aptitude', author: 'R.S. Aggarwal', isbn: '9789352535057', mrp: 595, condition: 'good', category_id: 'upsc', vendorKey: 'v9', category_name: 'UPSC Civil Services' },
    { id: 'b26', title: 'RS Aggarwal Verbal Reasoning', author: 'R.S. Aggarwal', isbn: '9789352530878', mrp: 595, condition: 'good', category_id: 'upsc', vendorKey: 'v9', category_name: 'UPSC Civil Services' },
    { id: 'b27', title: 'RD Sharma Mathematics Class 12', author: 'R.D. Sharma', isbn: '9788190804547', mrp: 680, condition: 'good', category_id: 'secondary', vendorKey: 'v8', category_name: 'Class 9-10 CBSE' },
    { id: 'b28', title: 'NCERT Physics Class 12 Part 1', author: 'NCERT', isbn: '9788174506160', mrp: 250, condition: 'good', category_id: 'science', vendorKey: 'v8', category_name: 'Class 11-12 Science' },
    { id: 'b29', title: 'RS Aggarwal Maths Class 10', author: 'R.S. Aggarwal', isbn: '9789352530892', mrp: 540, condition: 'good', category_id: 'secondary', vendorKey: 'v8', category_name: 'Class 9-10 CBSE' },
    { id: 'b30', title: 'Lakhmir Singh Physics Class 10', author: 'Lakhmir Singh', isbn: '9789352530977', mrp: 440, condition: 'good', category_id: 'secondary', vendorKey: 'v8', category_name: 'Class 9-10 CBSE' },
    { id: 'b31', title: 'Atomic Habits', author: 'James Clear', isbn: '9781847941831', mrp: 599, condition: 'good', category_id: 'selfhelp', vendorKey: 'v10', category_name: 'Self-Help & Business' },
    { id: 'b32', title: 'Wings of Fire', author: 'APJ Abdul Kalam', isbn: '8173711461', mrp: 250, condition: 'good', category_id: 'selfhelp', vendorKey: 'v10', category_name: 'Self-Help & Business' },
    { id: 'b33', title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', mrp: 350, condition: 'like_new', category_id: 'fiction', vendorKey: 'v10', category_name: 'Fiction & Literature' },
    { id: 'b34', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', isbn: '9781612680194', mrp: 399, condition: 'good', category_id: 'selfhelp', vendorKey: 'v10', category_name: 'Self-Help & Business' },
    { id: 'b35', title: 'Zero to One', author: 'Peter Thiel', isbn: '9780804139021', mrp: 699, condition: 'like_new', category_id: 'selfhelp', vendorKey: 'v13', category_name: 'Self-Help & Business' },
]

async function run() {
    try {
        console.log('Seeding categories...');
        for (const cat of categories) {
            await setDoc(doc(db, 'categories', cat.id), {
                name: cat.name,
                slug: cat.id,
                icon: cat.icon,
                sort_order: cat.sort_order,
            });
        }
        console.log('Categories seeded!');

        console.log('Seeding vendors...');
        const vendorMap = {};
        for (const vendor of vendors) {
            const docRef = doc(collection(db, 'vendors'));
            await setDoc(docRef, { ...vendor, created_at: serverTimestamp() });
            vendorMap[vendor.id] = docRef.id;
        }
        console.log('Vendors seeded!');

        console.log('Seeding books...');
        for (const book of books_data) {
            const vendor_id = vendorMap[book.vendorKey] || '';
            const docRef = doc(db, 'books', book.id); // specifically use b1, b2, etc formatting for the ID!

            await setDoc(docRef, {
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                mrp: book.mrp,
                condition: book.condition,
                category_id: book.category_id,
                category_name: book.category_name,
                vendor_id: vendor_id,
                vendor_name: '',
                vendor_area: '',
                is_available: true,
                is_featured: false,
                stock: 1,
                views: 0,
                ...calcPricesFirebase(book.mrp),
                created_at: serverTimestamp()
            });
        }
        console.log('Books seeded successfully with explicitly defined IDs to fix heroBooks!');

        // Let's also create default users if possible

    } catch (err) {
        console.error("Failed", err);
    }
    process.exit(0);
}

run();
