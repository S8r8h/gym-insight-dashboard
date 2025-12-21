import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_URL = "https://rmjzeuzqsnjonxkvrkdn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UHSVVCpkW2vTY7KDLqSGcw_12osKeLf";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
