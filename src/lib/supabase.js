// src/lib/supabase.js  ← ONLY BROWSER CLIENT
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createPagesBrowserClient();

