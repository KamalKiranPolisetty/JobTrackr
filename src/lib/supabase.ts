import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && url !== 'https://placeholder.supabase.co' && !url.includes('placeholder'));
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          target_role: string
          target_location: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          target_role?: string
          target_location?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          target_role?: string
          target_location?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          company: string
          role: string
          status: string
          salary: string
          location: string
          job_link: string
          notes: string
          applied_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          role: string
          status?: string
          salary?: string
          location?: string
          job_link?: string
          notes?: string
          applied_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          role?: string
          status?: string
          salary?: string
          location?: string
          job_link?: string
          notes?: string
          applied_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      prep_items: {
        Row: {
          id: string
          user_id: string
          type: string
          category: string
          title: string
          situation: string
          task: string
          action: string
          result: string
          content: string
          folder_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: string
          category?: string
          title: string
          situation?: string
          task?: string
          action?: string
          result?: string
          content?: string
          folder_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          category?: string
          title?: string
          situation?: string
          task?: string
          action?: string
          result?: string
          content?: string
          folder_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
