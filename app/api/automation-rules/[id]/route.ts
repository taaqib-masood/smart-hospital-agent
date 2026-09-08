import { NextRequest, NextResponse } from "next/server";
import { getClinicAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const allowed = ["name", "trigger_type", "delay_minutes", "whatsapp_template_id", "enabled"] as const;
  const updates = Object.fromEntries(allowed.filter(key => body?.[key] !== undefined).map(key => [key, body[key]]));
  if (updates.trigger_type && !["after_completed", "after_no_show"].includes(String(updates.trigger_type))) {
    return NextResponse.json({ error: "Invalid trigger_type" }, { status: 400 });
  }
  if (updates.delay_minutes !== undefined && (!Number.isInteger(Number(updates.delay_minutes)) || Number(updates.delay_minutes) < 0)) {
    return NextResponse.json({ error: "Invalid delay_minutes" }, { status: 400 });
  }
  const { data, error } = await supabase.from("reva_automation_rules")
    .update(updates)
    .eq("id", id)
    .eq("clinic_id", access.clinicId)
    .select("*,template:reva_whatsapp_templates(id,purpose,template_name,language_code,status)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: "automation_rule.updated", entity_type: "automation_rule", entity_id: id, metadata: { fields: Object.keys(updates) } });
  return NextResponse.json({ rule: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await supabase.from("reva_automation_rules").delete().eq("id", id).eq("clinic_id", access.clinicId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: "automation_rule.deleted", entity_type: "automation_rule", entity_id: id });
  return NextResponse.json({ ok: true });
}
