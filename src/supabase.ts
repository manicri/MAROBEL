import { createClient } from '@supabase/supabase-js';

// El hosting puede sobrescribir estos valores mediante variables VITE_*.
// El respaldo permite que GitHub Pages funcione sin .env.local.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://urrbofvaftsfeiasrceo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_oCLGtDIvO9XrAfsk7CyQxA_MzHmW1rz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});
