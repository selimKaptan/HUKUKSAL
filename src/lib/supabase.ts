import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Supabase client - URL yoksa dummy client oluşturulur
export const supabase: SupabaseClient<Database> = supabaseUrl
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>("https://placeholder.supabase.co", "placeholder-key");
