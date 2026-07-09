import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const hasValidSecret =
    !!body && body.secret === process.env.REVALIDATE_SECRET;

  if (!hasValidSecret) {
    // Fall back to the admin's own session, so the admin panel can trigger
    // revalidation without ever needing REVALIDATE_SECRET in the browser.
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  revalidatePath("/");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
