-- =======================================================
-- ✦ SHADOW LASER CRAFT STOREFRONT - RE-RUNNABLE SQL ✦
-- =======================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT NOT NULL,
  "categoryLabel" TEXT,
  categorylabel TEXT,
  price NUMERIC(10,2) NOT NULL,
  "formattedPrice" TEXT,
  formattedprice TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  "reviewsCount" INTEGER DEFAULT 0,
  reviewscount INTEGER DEFAULT 0,
  badge TEXT,
  "isCustomizable" BOOLEAN DEFAULT FALSE,
  iscustomizable BOOLEAN DEFAULT FALSE,
  description TEXT,
  "imageUrl" TEXT,
  imageurl TEXT,
  "inStock" INTEGER DEFAULT 20,
  instock INTEGER DEFAULT 20,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all product columns exist if products table was created earlier
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS imageurl TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "inStock" INTEGER DEFAULT 20;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS instock INTEGER DEFAULT 20;

-- 3. Categories Table (Dynamic Admin Categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT DEFAULT '🪵',
  "isPillAccent" BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Roles Table (Admin vs Customer Role Management)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer', -- 'admin' | 'customer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders Table (with Customer Contact & Order Status Columns)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  shipping_address TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'Processing', -- 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  payment_status TEXT DEFAULT 'Pending', -- 'Pending' | 'Paid'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Product Reviews & Comments Table (Public Customer Reviews)
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Settings
INSERT INTO public.store_settings (setting_key, setting_value)
VALUES 
  ('store_name', 'Shadow Studio'),
  ('support_email', 'harsha.stratcrowd@gmail.com'),
  ('free_shipping_threshold', '999'),
  ('hero_tagline', 'Precision Cut Wood Crafts, Designed for Everyday Moments.')
ON CONFLICT (setting_key) DO NOTHING;

-- 8. Row Level Security (RLS) Policies (Safely Re-runnable)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public full access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow public full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public full access to product_reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Allow public full access to store_settings" ON public.store_settings;

CREATE POLICY "Allow public full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to user_roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to product_reviews" ON public.product_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
