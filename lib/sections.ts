import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Section } from "@/lib/types";

export async function getActiveSections(): Promise<Section[]> {
  // Uses the stateless anon client (not the cookie-bound one) so this stays
  // cacheable and driven by `revalidate` / on-demand revalidatePath('/').
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load sections: ${error.message}`);
  }

  return data ?? [];
}

export async function getAllSections(): Promise<Section[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load sections: ${error.message}`);
  }

  return data ?? [];
}
