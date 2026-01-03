// External Supabase client for accessing existing Metrics and Transactions tables
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const EXTERNAL_SUPABASE_URL = 'https://rmjzeuzqsnjonxkvrkdn.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'sb_publishable_UHSVVCpkW2vTY7KDLqSGcw_12osKeLf';

export const externalSupabase = createClient<Database>(
  EXTERNAL_SUPABASE_URL, 
  EXTERNAL_SUPABASE_ANON_KEY
);
