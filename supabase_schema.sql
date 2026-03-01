-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'vendor', 'admin')),
  avatar_url TEXT,
  area TEXT,
  total_saved DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vendors (
  id UUID PRIMARY KEY,
  shop_name TEXT,
  shop_image TEXT,
  speciality TEXT,
  area TEXT,
  phone TEXT,
  whatsapp TEXT,
  established INT,
  total_books INT DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  badge TEXT DEFAULT 'Partner' CHECK (badge IN ('Partner', 'Trusted', 'Premium', 'Elite')),
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  slug TEXT UNIQUE,
  icon TEXT,
  sort_order INT DEFAULT 0
);

INSERT INTO categories (id, name, slug) VALUES 
  (gen_random_uuid(), 'Engineering', 'engineering'),
  (gen_random_uuid(), 'Medical', 'medical'),
  (gen_random_uuid(), 'JEE', 'jee'),
  (gen_random_uuid(), 'NEET', 'neet'),
  (gen_random_uuid(), 'UPSC', 'upsc'),
  (gen_random_uuid(), 'Bank PO', 'bank'),
  (gen_random_uuid(), 'Science', 'science'),
  (gen_random_uuid(), 'Secondary School', 'secondary'),
  (gen_random_uuid(), 'School', 'school'),
  (gen_random_uuid(), 'MBA', 'mba'),
  (gen_random_uuid(), 'CA', 'ca'),
  (gen_random_uuid(), 'Law', 'law'),
  (gen_random_uuid(), 'Self-Help', 'selfhelp'),
  (gen_random_uuid(), 'Fiction', 'fiction'),
  (gen_random_uuid(), 'Regional Languages', 'regional');

CREATE TABLE books (
  id UUID PRIMARY KEY,
  title TEXT,
  author TEXT,
  publisher TEXT,
  isbn TEXT,
  edition TEXT,
  category_id UUID REFERENCES categories(id),
  subject TEXT,
  mrp DECIMAL NOT NULL,
  our_price DECIMAL GENERATED ALWAYS AS (ROUND(mrp * 0.50, 2)) STORED,
  vendor_earn DECIMAL GENERATED ALWAYS AS (ROUND((mrp * 0.50) * 0.80, 2)) STORED,
  ri_earn DECIMAL GENERATED ALWAYS AS (ROUND((mrp * 0.50) * 0.20, 2)) STORED,
  savings DECIMAL GENERATED ALWAYS AS (mrp - ROUND(mrp * 0.50, 2)) STORED,
  cover_url TEXT,
  condition TEXT CHECK (condition IN ('like_new', 'good', 'fair', 'acceptable')),
  description TEXT,
  vendor_id UUID REFERENCES vendors(id),
  stock INT DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_books_search ON books USING GIN (to_tsvector('english', title || ' ' || author || ' ' || COALESCE(subject, '')));
CREATE INDEX idx_books_cat_avail ON books (category_id, is_available);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number TEXT UNIQUE,
  buyer_id UUID REFERENCES users(id),
  book_id UUID REFERENCES books(id),
  vendor_id UUID REFERENCES vendors(id),
  book_title TEXT,
  mrp DECIMAL,
  price_paid DECIMAL,
  savings DECIMAL,
  vendor_earning DECIMAL,
  ri_commission DECIMAL,
  delivery_name TEXT NOT NULL,
  delivery_phone TEXT NOT NULL,
  delivery_addr TEXT NOT NULL,
  delivery_area TEXT,
  delivery_pin TEXT,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'reviewing', 'confirmed', 'dispatched', 'delivered', 'cancelled')),
  buyer_notes TEXT,
  admin_notes TEXT,
  tracking_no TEXT,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  dispatched_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE cart (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

CREATE TABLE wishlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

CREATE TABLE book_listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  author TEXT,
  category_id UUID REFERENCES categories(id),
  mrp DECIMAL,
  condition TEXT,
  description TEXT,
  photo_1 TEXT,
  photo_2 TEXT,
  photo_3 TEXT,
  seller_area TEXT,
  seller_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'listed', 'sold', 'rejected', 'expired')),
  reject_reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  name TEXT,
  phone TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  landmark TEXT,
  area TEXT,
  city TEXT DEFAULT 'Hyderabad',
  state TEXT DEFAULT 'Telangana',
  pincode TEXT,
  is_default BOOLEAN DEFAULT false
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  reviewer_id UUID REFERENCES users(id),
  book_id UUID REFERENCES books(id),
  vendor_id UUID REFERENCES vendors(id),
  order_id UUID REFERENCES orders(id),
  type TEXT CHECK (type IN ('book', 'vendor')),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage their own orders" ON orders FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Users can fully manage their own cart" ON cart FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can fully manage their own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can fully manage their own book_listings" ON book_listings FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Users can fully manage their own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Books are publicly viewable" ON books FOR SELECT USING (true);
CREATE POLICY "Vendors are publicly viewable" ON vendors FOR SELECT USING (true);
CREATE POLICY "Categories are publicly viewable" ON categories FOR SELECT USING (true);
