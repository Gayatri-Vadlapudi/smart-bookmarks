import { createBrowserClient } from "@supabase/ssr";

// Create a Supabase client using environment variables
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
