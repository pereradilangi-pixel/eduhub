/*
# Create monetization, video lectures, marketplace, and paper marking tables

1. New Tables
- `affiliate_products` — Daraz affiliate product recommendations (image, title, price, affiliate URL)
- `video_lectures` — Sponsored YouTube video lectures (thumbnail, title, teacher, YouTube link)
- `marketplace_resources` — Digital resources for sale (title, price, description, cover image, type)
- `paper_submissions` — Student paper marking submissions (file URL, subject, status, feedback, marked file URL)
- `unlock_codes` — Owner-generated unlock codes mapping features to students

2. Security
- All tables are single-tenant (no auth) with anon+authenticated CRUD since the app has no sign-in screen.
- RLS enabled on every table with full anon CRUD policies.
*/

-- Affiliate Products
CREATE TABLE IF NOT EXISTS affiliate_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  affiliate_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'stationery',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_affiliate" ON affiliate_products;
CREATE POLICY "anon_select_affiliate" ON affiliate_products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_affiliate" ON affiliate_products;
CREATE POLICY "anon_insert_affiliate" ON affiliate_products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_affiliate" ON affiliate_products;
CREATE POLICY "anon_update_affiliate" ON affiliate_products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_affiliate" ON affiliate_products;
CREATE POLICY "anon_delete_affiliate" ON affiliate_products FOR DELETE TO anon, authenticated USING (true);

-- Video Lectures
CREATE TABLE IF NOT EXISTS video_lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  teacher_name text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  youtube_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE video_lectures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_videos" ON video_lectures;
CREATE POLICY "anon_select_videos" ON video_lectures FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_videos" ON video_lectures;
CREATE POLICY "anon_insert_videos" ON video_lectures FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_videos" ON video_lectures;
CREATE POLICY "anon_update_videos" ON video_lectures FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_videos" ON video_lectures;
CREATE POLICY "anon_delete_videos" ON video_lectures FOR DELETE TO anon, authenticated USING (true);

-- Marketplace Resources
CREATE TABLE IF NOT EXISTS marketplace_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  resource_type text NOT NULL DEFAULT 'notes',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE marketplace_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_marketplace" ON marketplace_resources;
CREATE POLICY "anon_select_marketplace" ON marketplace_resources FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_marketplace" ON marketplace_resources;
CREATE POLICY "anon_insert_marketplace" ON marketplace_resources FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_marketplace" ON marketplace_resources;
CREATE POLICY "anon_update_marketplace" ON marketplace_resources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_marketplace" ON marketplace_resources;
CREATE POLICY "anon_delete_marketplace" ON marketplace_resources FOR DELETE TO anon, authenticated USING (true);

-- Paper Submissions
CREATE TABLE IF NOT EXISTS paper_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  feedback text NOT NULL DEFAULT '',
  marked_file_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE paper_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_papers" ON paper_submissions;
CREATE POLICY "anon_select_papers" ON paper_submissions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_papers" ON paper_submissions;
CREATE POLICY "anon_insert_papers" ON paper_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_papers" ON paper_submissions;
CREATE POLICY "anon_update_papers" ON paper_submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_papers" ON paper_submissions;
CREATE POLICY "anon_delete_papers" ON paper_submissions FOR DELETE TO anon, authenticated USING (true);

-- Unlock Codes
CREATE TABLE IF NOT EXISTS unlock_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  contact text NOT NULL DEFAULT '',
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE unlock_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_unlock" ON unlock_codes;
CREATE POLICY "anon_select_unlock" ON unlock_codes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_unlock" ON unlock_codes;
CREATE POLICY "anon_insert_unlock" ON unlock_codes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_unlock" ON unlock_codes;
CREATE POLICY "anon_update_unlock" ON unlock_codes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_unlock" ON unlock_codes;
CREATE POLICY "anon_delete_unlock" ON unlock_codes FOR DELETE TO anon, authenticated USING (true);

-- Seed default affiliate products
INSERT INTO affiliate_products (title, price, image_url, affiliate_url, category, sort_order) VALUES
('Scientific Calculator Casio fx-991EX', 'Rs. 4,500', '', '', 'electronics', 1),
('Geometry Box Pro Set', 'Rs. 850', '', '', 'stationery', 2),
('A4 Exam Paper Bundle (500 sheets)', 'Rs. 1,200', '', '', 'stationery', 3),
('Highlighter Pen Set (6 colors)', 'Rs. 650', '', '', 'stationery', 4),
('O/L Past Paper Collection 2020-2024', 'Rs. 2,500', '', '', 'books', 5),
('A/L Physics Revision Guide', 'Rs. 1,800', '', '', 'books', 6)
ON CONFLICT DO NOTHING;

-- Seed default video lectures
INSERT INTO video_lectures (title, teacher_name, thumbnail_url, youtube_url, description, sort_order) VALUES
('O/L Science - Photosynthesis Master Class', 'Mr. Sunil Perera', '', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Complete breakdown of photosynthesis for O/L Biology students', 1),
('A/L Physics - Newton''s Laws Deep Dive', 'Ms. Niluka Fernando', '', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Advanced Newton''s Laws concepts with past paper solutions', 2),
('O/L Maths - Algebra Crash Course', 'Mr. Chamara Silva', '', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Quick revision of algebra fundamentals for O/L exam', 3)
ON CONFLICT DO NOTHING;

-- Seed default marketplace resources
INSERT INTO marketplace_resources (title, price, description, cover_url, resource_type, sort_order) VALUES
('O/L Science Complete Short Notes', 'Rs. 500', 'Concise notes covering entire O/L Science syllabus — 120 pages', '', 'notes', 1),
('A/L Physics Model Papers (10 sets)', 'Rs. 750', '10 model papers with marking schemes for A/L Physics', '', 'model-papers', 2),
('O/L Chemistry Revision Pack', 'Rs. 400', 'Quick revision pack with key formulas, reactions, and diagrams', '', 'revision-pack', 3),
('A/L Biology Full Notes Bundle', 'Rs. 900', 'Complete A/L Biology notes — all units with diagrams', '', 'notes', 4),
('O/L Maths Past Paper Solutions', 'Rs. 600', 'Step-by-step solutions for 5 years of O/L Maths past papers', '', 'model-papers', 5)
ON CONFLICT DO NOTHING;
