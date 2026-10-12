/*
# Create forum_posts table for Student Community Forum

1. New Tables
- `forum_posts`: Stores student discussion posts in the community Q&A board.
  - `id` (uuid, primary key)
  - `author` (text, display name of poster — no auth, freely entered)
  - `subject_tag` (text, subject category like Physics, Mathematics, etc.)
  - `title` (text, post title)
  - `body` (text, post content)
  - `upvotes` (int, default 0, vote count)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `forum_posts`.
- This is a single-tenant app with NO sign-in screen — the community forum is
  intentionally public/shared. All CRUD operations are open to anon + authenticated.
- `USING (true)` / `WITH CHECK (true)` is correct here because the data is
  deliberately shared (public discussion board).

3. Notes
- No user_id column since no authentication is required.
- Upvotes are incremented via UPDATE — any visitor can upvote.
*/

CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL,
  subject_tag text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  upvotes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_forum_posts" ON forum_posts;
CREATE POLICY "anon_select_forum_posts" ON forum_posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_forum_posts" ON forum_posts;
CREATE POLICY "anon_insert_forum_posts" ON forum_posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_forum_posts" ON forum_posts;
CREATE POLICY "anon_update_forum_posts" ON forum_posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_forum_posts" ON forum_posts;
CREATE POLICY "anon_delete_forum_posts" ON forum_posts FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_forum_posts_subject_tag ON forum_posts(subject_tag);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
