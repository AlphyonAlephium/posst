
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lbfizzuxmnhblksmhwgn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZml6enV4bW5oYmxrc21od2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNDI1NjIsImV4cCI6MjA1NTYxODU2Mn0.tuZ775NJhbkDZ0rebZdmTarTJpqeE40jiqiv_Cd2n7M";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Enable debug logging for development
if (import.meta.env.DEV) {
  console.log('Supabase client initialized');
}
