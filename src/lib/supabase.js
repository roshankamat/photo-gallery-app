import { createClient } from "@supabase/supabase-js";

// ──────────────────────────────────────────────────────────────
// Replace these with your own Supabase project credentials.
// You can find them in: Supabase Dashboard → Settings → API
// ──────────────────────────────────────────────────────────────
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    supabaseAnonKey &&
    !supabaseUrl.includes("YOUR_SUPABASE_URL")
);

// Fallback client to prevent crashes if env variables are not yet added
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder-project.supabase.co", "placeholder-anon-key");

