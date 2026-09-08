import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("reva_conversations")
    .select("*, patient:reva_patients(id,name,phone)")
    .eq("clinic_id", access.clinicId)
    .order("last_message_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data });
}
