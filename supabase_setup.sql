-- ═══════════════════════════════════════════════════════════
-- Photo Gallery App — Supabase Database Setup
-- Run this in your Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. PROFILES TABLE
-- Stores user metadata + role. Linked to auth.users via FK.
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.photos (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'uncategorized',
  url         TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_id    INTEGER NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, photo_id)
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════

-- ── Profiles ──────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles (needed for admin dashboard user list)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow inserts (needed for the trigger below)
CREATE POLICY "Enable insert for service role"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ── Photos ────────────────────────────────────────────────
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Everyone can view photos (public gallery)
CREATE POLICY "Photos are viewable by everyone"
  ON public.photos FOR SELECT
  USING (true);

-- Only admins can insert photos
CREATE POLICY "Admins can insert photos"
  ON public.photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update photos
CREATE POLICY "Admins can update photos"
  ON public.photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete photos
CREATE POLICY "Admins can delete photos"
  ON public.photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── Favorites ─────────────────────────────────────────────
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can see only their own favorites
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all favorites (for stats)
CREATE POLICY "Admins can view all favorites"
  ON public.favorites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGN-UP (Trigger)
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- SEED DATA — initial photos so the gallery isn't empty
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.photos (title, category, url) VALUES
  ('Misty Mountains',   'nature',  'https://picsum.photos/id/1018/600/400'),
  ('City Lights',       'urban',   'https://picsum.photos/id/1015/600/400'),
  ('Golden Retriever',  'animals', 'https://picsum.photos/id/1025/600/400'),
  ('Coastal Cliffs',    'nature',  'https://picsum.photos/id/1043/600/400'),
  ('Downtown Bridge',   'urban',   'https://picsum.photos/id/1031/600/400'),
  ('Curious Fox',       'animals', 'https://picsum.photos/id/1074/600/400'),
  ('Forest Trail',      'nature',  'https://picsum.photos/id/1040/600/400'),
  ('Night Skyline',     'urban',   'https://picsum.photos/id/1048/600/400'),
  ('Alpine Lake',       'nature',  'https://picsum.photos/id/1053/600/400');

-- ═══════════════════════════════════════════════════════════
-- MAKE YOURSELF AN ADMIN
-- After signing up, run this with your email:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ═══════════════════════════════════════════════════════════
