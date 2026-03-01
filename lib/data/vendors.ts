export interface Vendor {
    id: string;
    shopName: string;
    area: string;
    whatsapp: string;
    established: number;
    totalBooks: number;
    rating: number;
    badge: 'Elite' | 'Premium' | 'Trusted' | 'Partner';
    isFeatured: boolean;
    speciality: string;
    shopImage: string;
}

export const vendors: Vendor[] = [
    { id: 'v1', shopName: 'Hyderabad Book Trust', area: 'Abids', whatsapp: '919876501001', established: 1987, totalBooks: 4200, rating: 4.8, badge: 'Elite', isFeatured: true, speciality: 'Academic & Competitive Exams', shopImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600' },
    { id: 'v2', shopName: 'Chetana Book House', area: 'Koti', whatsapp: '919876502002', established: 1994, totalBooks: 3100, rating: 4.7, badge: 'Premium', isFeatured: true, speciality: 'Telugu Medium & State Board', shopImage: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600' },
    { id: 'v3', shopName: 'Secunderabad Old Books', area: 'Secunderabad', whatsapp: '919876503003', established: 1979, totalBooks: 5800, rating: 4.9, badge: 'Elite', isFeatured: true, speciality: 'Engineering & Medical Books', shopImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600' },
    { id: 'v4', shopName: 'Student Corner Books', area: 'Ameerpet', whatsapp: '919876504004', established: 2003, totalBooks: 2900, rating: 4.6, badge: 'Trusted', isFeatured: false, speciality: 'IT CS & MBA Books', shopImage: 'https://images.unsplash.com/photo-1568667256549-094345857eff?w=600' },
    { id: 'v5', shopName: 'Osmania Book Depot', area: 'Tarnaka', whatsapp: '919876505005', established: 1965, totalBooks: 3600, rating: 4.7, badge: 'Elite', isFeatured: true, speciality: 'Law Arts & Commerce', shopImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600' },
    { id: 'v6', shopName: 'JNTU Book Bazaar', area: 'Kukatpally', whatsapp: '919876506006', established: 1998, totalBooks: 6400, rating: 4.8, badge: 'Elite', isFeatured: true, speciality: 'B.Tech All Branches All Sems', shopImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600' },
    { id: 'v7', shopName: 'Nizam Medical Books', area: 'Afzalgunj', whatsapp: '919876507007', established: 1971, totalBooks: 4100, rating: 4.9, badge: 'Elite', isFeatured: true, speciality: 'MBBS BDS & Nursing Books', shopImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600' },
    { id: 'v8', shopName: 'Saraswathi Book Store', area: 'Dilsukhnagar', whatsapp: '919876508008', established: 2001, totalBooks: 3800, rating: 4.6, badge: 'Partner', isFeatured: false, speciality: 'School CBSE ICSE State Board', shopImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600' },
    { id: 'v9', shopName: 'Gyan Ganga Books', area: 'LB Nagar', whatsapp: '919876509009', established: 2008, totalBooks: 2700, rating: 4.7, badge: 'Trusted', isFeatured: false, speciality: 'UPSC SSC & Bank PO Books', shopImage: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600' },
    { id: 'v10', shopName: 'Prasad Book Palace', area: 'Himayatnagar', whatsapp: '919876510010', established: 1983, totalBooks: 5200, rating: 4.8, badge: 'Premium', isFeatured: true, speciality: 'Fiction Self-Help & General', shopImage: 'https://images.unsplash.com/photo-1464982326199-86f32f81b211?w=600' },
    { id: 'v11', shopName: 'IIT-JEE Book Hub', area: 'SR Nagar', whatsapp: '919876511011', established: 2005, totalBooks: 4500, rating: 4.9, badge: 'Elite', isFeatured: true, speciality: 'JEE & NEET Coaching Material', shopImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600' },
    { id: 'v12', shopName: 'Telugu Sahityam Books', area: 'Abids', whatsapp: '919876512012', established: 1960, totalBooks: 2300, rating: 4.5, badge: 'Trusted', isFeatured: false, speciality: 'Telugu Literature & Poetry', shopImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600' },
    { id: 'v13', shopName: 'MBA Masters Books', area: 'Banjara Hills', whatsapp: '919876513013', established: 2010, totalBooks: 3100, rating: 4.7, badge: 'Partner', isFeatured: false, speciality: 'MBA CA & Finance Books', shopImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600' },
    { id: 'v14', shopName: 'Rainbow Children Books', area: 'Madhapur', whatsapp: '919876514014', established: 2012, totalBooks: 2800, rating: 4.8, badge: 'Partner', isFeatured: false, speciality: 'Kids Story & Activity Books', shopImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600' },
    { id: 'v15', shopName: 'KL Rao Technical Books', area: 'Ameerpet', whatsapp: '919876515015', established: 1992, totalBooks: 3900, rating: 4.8, badge: 'Premium', isFeatured: true, speciality: 'Civil Mech & Electrical Engg', shopImage: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=600' }
];
