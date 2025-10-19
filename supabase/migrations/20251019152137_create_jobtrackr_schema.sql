/*
  # JobTrackr Database Schema

  ## Overview
  Creates the complete database schema for JobTrackr - a job application tracking platform
  with support for job applications, behavioral interview stories, and notes.

  ## New Tables

  ### 1. `profiles`
  Extends auth.users with user preferences and settings
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `custom_columns` (jsonb) - stores user-defined custom columns for jobs table
  - `theme` (text) - light/dark theme preference
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `jobs`
  Stores job application tracking data
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `role` (text) - job title/role
  - `company` (text) - company name
  - `status` (text) - application status (Applied, Interview, Offer, Rejected, etc.)
  - `applied_date` (date) - when application was submitted
  - `job_link` (text) - URL to job posting
  - `notes` (text) - general notes about the application
  - `custom_data` (jsonb) - stores custom column values
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `stories`
  Behavioral interview stories using STAR framework
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text) - story title
  - `situation` (text) - STAR: Situation
  - `task` (text) - STAR: Task
  - `action` (text) - STAR: Action
  - `result` (text) - STAR: Result
  - `tags` (text[]) - array of tags (e.g., "Leadership", "Teamwork")
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `notes`
  General note-taking area for job search related notes
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text) - note title
  - `content` (text) - note content (supports markdown)
  - `tags` (text[]) - array of tags for organization
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with policies that ensure:
  - Users can only access their own data
  - All operations (SELECT, INSERT, UPDATE, DELETE) are restricted to authenticated users
  - Each policy validates auth.uid() matches the user_id
  
  ### Policies Created
  For each table (profiles, jobs, stories, notes):
  - SELECT policy: users can view only their own records
  - INSERT policy: users can create records for themselves
  - UPDATE policy: users can update only their own records
  - DELETE policy: users can delete only their own records

  ## Indexes
  Created for performance on frequently queried columns:
  - jobs: user_id, status, applied_date
  - stories: user_id, tags
  - notes: user_id, tags

  ## Functions
  - `handle_new_user()` - Trigger function that automatically creates a profile when a new user signs up
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  custom_columns jsonb DEFAULT '[]'::jsonb,
  theme text DEFAULT 'light',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  company text NOT NULL,
  status text DEFAULT 'Applied',
  applied_date date DEFAULT CURRENT_DATE,
  job_link text DEFAULT '',
  notes text DEFAULT '',
  custom_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  situation text DEFAULT '',
  task text DEFAULT '',
  action text DEFAULT '',
  result text DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_applied_date ON jobs(applied_date);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_tags ON stories USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING gin(tags);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Stories policies
CREATE POLICY "Users can view own stories"
  ON stories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
  ON stories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();