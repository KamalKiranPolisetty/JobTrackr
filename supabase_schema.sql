-- ========================================================
-- JobTrackr (CareerCraft) - Complete Supabase Database Schema
-- ========================================================
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- to create tables, indexes, security policies (RLS), and automated triggers.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. PROFILES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  target_role TEXT DEFAULT 'Software Engineer',
  target_location TEXT DEFAULT 'Remote',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========================================================
-- 2. JOBS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Applied',
  salary TEXT DEFAULT '',
  location TEXT DEFAULT '',
  job_link TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  applied_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Indexes for high performance querying
CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs(status);

-- Enable RLS on Jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Jobs Policies
CREATE POLICY "Users can view own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================================
-- 3. PREPARATION ITEMS TABLE (STAR Stories & Tech Notes)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.prep_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'story',
  category TEXT NOT NULL DEFAULT 'Behavioral',
  title TEXT NOT NULL,
  situation TEXT DEFAULT '',
  task TEXT DEFAULT '',
  action TEXT DEFAULT '',
  result TEXT DEFAULT '',
  content TEXT DEFAULT '',
  folder_id TEXT DEFAULT 'ws-1',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS prep_items_user_id_idx ON public.prep_items(user_id);
CREATE INDEX IF NOT EXISTS prep_items_job_id_idx ON public.prep_items(job_id);
CREATE INDEX IF NOT EXISTS prep_items_category_idx ON public.prep_items(category);

-- Enable RLS on Prep Items
ALTER TABLE public.prep_items ENABLE ROW LEVEL SECURITY;

-- Prep Items Policies
CREATE POLICY "Users can view own prep items"
  ON public.prep_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prep items"
  ON public.prep_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prep items"
  ON public.prep_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prep items"
  ON public.prep_items FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ========================================================

-- Trigger to automatically populate public.profiles on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate Trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_jobs_updated_at ON public.jobs;
CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_prep_items_updated_at ON public.prep_items;
CREATE TRIGGER set_prep_items_updated_at
  BEFORE UPDATE ON public.prep_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
