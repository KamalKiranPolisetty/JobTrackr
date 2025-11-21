/*
  # Add Preparation Folders and Items Schema

  ## Overview
  Creates hierarchical folder structure for preparation materials (stories and notes)
  replacing the separate stories and notes tables.

  ## New Tables

  ### 1. `prep_folders`
  Hierarchical folder structure for organizing preparation materials
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text) - folder name
  - `parent_id` (uuid, nullable, references prep_folders) - parent folder for nesting
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `prep_items`
  Items (stories or notes) stored inside folders
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `folder_id` (uuid, references prep_folders)
  - `type` (text) - 'story' or 'note'
  - `title` (text)
  - `situation` (text, nullable) - STAR: Situation (for stories)
  - `task` (text, nullable) - STAR: Task (for stories)
  - `action` (text, nullable) - STAR: Action (for stories)
  - `result` (text, nullable) - STAR: Result (for stories)
  - `content` (text, nullable) - content (for notes)
  - `tags` (text[]) - array of tags
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with policies that ensure:
  - Users can only access their own folders and items
  - Each policy validates auth.uid() matches the user_id
  
  ### Policies Created
  For each table (prep_folders, prep_items):
  - SELECT policy: users can view only their own records
  - INSERT policy: users can create records for themselves
  - UPDATE policy: users can update only their own records
  - DELETE policy: users can delete only their own records

  ## Indexes
  Created for performance:
  - prep_folders: user_id, parent_id
  - prep_items: user_id, folder_id, type

  ## Data Migration
  Existing stories and notes remain in their tables for reference.
  New preparation page uses the new folder/item structure.
*/

-- Create prep_folders table
CREATE TABLE IF NOT EXISTS prep_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_id uuid REFERENCES prep_folders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prep_items table
CREATE TABLE IF NOT EXISTS prep_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  folder_id uuid NOT NULL REFERENCES prep_folders(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('story', 'note')),
  title text NOT NULL,
  situation text DEFAULT '',
  task text DEFAULT '',
  action text DEFAULT '',
  result text DEFAULT '',
  content text DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prep_folders_user_id ON prep_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_prep_folders_parent_id ON prep_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_prep_items_user_id ON prep_items(user_id);
CREATE INDEX IF NOT EXISTS idx_prep_items_folder_id ON prep_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_prep_items_type ON prep_items(type);

-- Enable Row Level Security
ALTER TABLE prep_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_items ENABLE ROW LEVEL SECURITY;

-- Prep folders policies
CREATE POLICY "Users can view own folders"
  ON prep_folders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders"
  ON prep_folders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON prep_folders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON prep_folders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Prep items policies
CREATE POLICY "Users can view own prep items"
  ON prep_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prep items"
  ON prep_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prep items"
  ON prep_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prep items"
  ON prep_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
