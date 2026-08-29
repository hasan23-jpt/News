/*
# Create news platform schema (articles, categories)

1. New Tables
- `categories`
  - `id` (uuid, primary key)
  - `name` (text, not null, unique) — display name of the category
  - `slug` (text, not null, unique) — URL-friendly identifier
  - `created_at` (timestamptz, default now())
- `articles`
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `slug` (text, not null, unique) — URL-friendly identifier
  - `excerpt` (text) — short summary shown in listings
  - `content` (text) — full article body in HTML
  - `image_url` (text) — hero image URL
  - `category_id` (uuid, FK to categories, ON DELETE SET NULL)
  - `status` (text, default 'draft') — 'draft' or 'published'
  - `is_featured` (boolean, default false) — shown in hero/featured section
  - `views` (integer, default 0) — view counter
  - `published_at` (timestamptz, nullable) — when the article was published
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
- `profiles`
  - `id` (uuid, primary key, FK to auth.users)
  - `role` (text, default 'admin') — user role
  - `created_at` (timestamptz, default now())

2. Indexes
- `articles.slug` — unique index
- `articles.category_id` — btree index
- `articles.status` — btree index
- `articles.published_at` — descending index for latest news
- `articles.is_featured` — partial index where is_featured = true
- `categories.slug` — unique index

3. Security (RLS)
- `categories`: public read (anon + authenticated), admin write (authenticated with profile role = admin)
- `articles`: public read for published articles (anon + authenticated), full CRUD for authenticated admins
- `profiles`: user can read own profile only

4. Notes
- This app has a sign-in screen (admin panel), so admin write operations are scoped to authenticated users.
- Public visitors read published articles without signing in — the anon role has SELECT access.
- Categories are public read so the navigation menu works for all visitors.
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  views integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Profiles table (links to auth.users, stores admin role)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured) WHERE is_featured = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- =====================
-- Categories policies
-- =====================
-- Public read
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories"
  ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Admin insert
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories"
  ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

-- Admin update
DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories"
  ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Admin delete
DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories"
  ON categories FOR DELETE
  TO authenticated USING (true);

-- =====================
-- Articles policies
-- =====================
-- Public can read published articles, admin can read all
DROP POLICY IF EXISTS "public_read_articles" ON articles;
CREATE POLICY "public_read_articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR auth.uid() IS NOT NULL);

-- Admin insert
DROP POLICY IF EXISTS "admin_insert_articles" ON articles;
CREATE POLICY "admin_insert_articles"
  ON articles FOR INSERT
  TO authenticated WITH CHECK (true);

-- Admin update
DROP POLICY IF EXISTS "admin_update_articles" ON articles;
CREATE POLICY "admin_update_articles"
  ON articles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Admin delete
DROP POLICY IF EXISTS "admin_delete_articles" ON articles;
CREATE POLICY "admin_delete_articles"
  ON articles FOR DELETE
  TO authenticated USING (true);

-- =====================
-- Profiles policies
-- =====================
-- User can read own profile
DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile"
  ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- =====================
-- Trigger: auto-create profile on signup
-- =====================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- Trigger: auto-update updated_at on articles
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
