import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeReturnPath } from "@/lib/auth-redirect";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = getSafeReturnPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: clinic } = await supabase.from("reva_clinics").select("id").eq("owner_id", user.id).maybeSingle();
        if (!clinic) {
          await supabase.from("reva_clinics").insert({
            owner_id: user.id,
            name: String(user.user_metadata?.clinic_name || "My Clinic").slice(0, 200),
          });
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
