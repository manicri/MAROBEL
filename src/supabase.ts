import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urrbofvaftsfeiasrceo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycmJvZnZhZnRzZmVpYXNyY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYyMzksImV4cCI6MjA5MTUxMjIzOX0.1q2IikxXCH7X95U93GKGj8WI-7pZPyMFLtwBLxnyhiI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});
