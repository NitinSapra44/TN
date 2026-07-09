import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Stateless anon-key client for public, unauthenticated reads. Unlike
// lib/supabase/server.ts, this does not touch cookies(), so pages that use
// it stay eligible for static rendering / ISR (`revalidate` + revalidatePath).
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
