import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// whatsapp_phone_id/whatsapp_token route inbound messages and are set by the operator, never by clinic owners.
const EDITABLE_FIELDS = ["name", "phone", "whatsapp_number", "address", "specialty", "registration_no", "greeting_message", "working_hours", "reminder_hours_before"] as const;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("reva_clinics").select("*").eq("owner_id", user.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clinic: data });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const r = body.reminder_hours_before;
  if (r !== undefined && !(Number.isInteger(r) && r >= 1 && r <= 168)) {
    return NextResponse.json({ error: "reminder_hours_before must be an integer between 1 and 168" }, { status: 400 });
  }
  const updates = Object.fromEntries(EDITABLE_FIELDS.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
  const { data, error } = await supabase
    .from("reva_clinics")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clinic: data });
}
