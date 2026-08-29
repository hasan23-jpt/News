import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://inftzfvqtujcwmpwnvjl.supabase.co';

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZnR6ZnZxdHVqY3dtcHdudmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3Mjk2OTIsImV4cCI6MjEwMzMwNTY5Mn0.VrIbE19lTCocLUD5JwlDej7sXbJvp-4fLD1GX1eppN8';

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
