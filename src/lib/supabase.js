import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createBrowserSupabaseClient({
  supabaseUrl,  
  supabaseKey: supabaseAnonKey,
});

export const createServerClient = () =>
  createClient(supabaseUrl, supabaseAnonKey);