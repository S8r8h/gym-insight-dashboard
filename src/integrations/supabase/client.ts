import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Replace these with your Supabase project credentials
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

if (!SUPABASE_URL || SUPABASE_URL === "YOUR_SUPABASE_URL") {
  console.warn("⚠️ Supabase URL not configured. Please update src/integrations/supabase/client.ts");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
