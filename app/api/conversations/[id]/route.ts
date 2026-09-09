import { NextRequest, NextResponse } from "next/server";
import { getClinicAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.is_bot_active !== "boolean") {
    return NextResponse.json({ error: "is_bot_active is required" }, { status: 400 });
  }

  const updates = body.is_bot_active
    ? { is_bot_active: true, assigned_to: null, handoff_reason: null }
    : { is_bot_active: false, assigned_to: access.userId, handoff_reason: String(body.handoff_reason ?? "Receptionist takeover").slice(0, 300) };

  const { data, error } = await supabase.from("reva_conversations")
    .update(updates)
    .eq("id", id)
    .eq("clinic_id", access.clinicId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("reva_audit_events").insert({
    clinic_id: access.clinicId,
    actor_user_id: access.userId,
    action: body.is_bot_active ? "conversation.automation_resumed" : "conversation.taken_over",
    entity_type: "conversation",
    entity_id: id,
  });

  return NextResponse.json({ conversation: data });
}
