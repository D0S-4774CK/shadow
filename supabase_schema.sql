-- =======================================================
-- ✦ SHADOW LASER CRAFT STOREFRONT - RE-RUNNABLE SQL ✦
-- =======================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
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

-- 3. Quotes Table
CREATE TABLE IF NOT EXISTS public.quotes (
  id TEXT PRIMARY KEY,
  "customerName" TEXT,
  customername TEXT,
  email TEXT NOT NULL,
  material TEXT DEFAULT '3mm Premium Natural Baltic Birch Wood',
  "widthMm" INTEGER,
  widthmm INTEGER,
  "heightMm" INTEGER,
  heightmm INTEGER,
  quantity INTEGER NOT NULL,
  "estimatedPrice" NUMERIC(10,2),
  estimatedprice NUMERIC(10,2),
  "formattedPrice" TEXT,
  formattedprice TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Pending',
  "createdAt" DATE DEFAULT CURRENT_DATE,
  createdat DATE DEFAULT CURRENT_DATE
);

-- 4. Orders Table (with Customer Contact Columns)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  shipping_address TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'Processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all contact columns exist if orders table was created earlier
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- 5. Row Level Security (RLS) Policies (Safely Re-runnable)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public quote submissions" ON public.quotes;
DROP POLICY IF EXISTS "Allow public read quotes" ON public.quotes;
DROP POLICY IF EXISTS "Allow public order checkout" ON public.orders;
DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow admin full access to quotes" ON public.quotes;
DROP POLICY IF EXISTS "Allow admin full access to orders" ON public.orders;

-- Public & Admin Policies (allowing read, insert, update, upsert)
CREATE POLICY "Allow public full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public quote submissions" ON public.quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public order checkout" ON public.orders FOR ALL USING (true) WITH CHECK (true);
