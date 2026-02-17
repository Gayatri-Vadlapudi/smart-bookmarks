// lib/supabaseClient.ts
let supabase: any | null = null;

export async function getSupabaseClient() {
	if (supabase) return supabase;

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			"Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables"
		);
	}

	const mod: any = await import("@supabase/supabase-js");
	const createClient = mod.createClient;
	supabase = createClient(supabaseUrl, supabaseAnonKey);
	return supabase;
}
