import { NextRequest, NextResponse } from "next/server";
import { getClinicAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const RULE_SELECT = "*,template:reva_whatsapp_templates(id,purpose,template_name,language_code,status,components)";

export async function GET() {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [{ data: rules, error }, { data: templates, error: templateError }] = await Promise.all([
    supabase.from("reva_automation_rules").select(RULE_SELECT).eq("clinic_id", access.clinicId).order("created_at"),
    supabase.from("reva_whatsapp_templates").select("id,purpose,template_name,language_code,status,components").eq("clinic_id", access.clinicId).order("purpose"),
  ]);
  const failure = error ?? templateError;
  if (failure) return NextResponse.json({ error: failure.message }, { status: 500 });
  return NextResponse.json({ rules, templates });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const delay = Number(body?.delay_minutes);
  if (typeof body?.name !== "string" || !body.name.trim() || !["after_completed", "after_no_show"].includes(body.trigger_type) || !Number.isInteger(delay) || delay < 0 || typeof body.whatsapp_template_id !== "string") {
    return NextResponse.json({ error: "name, trigger_type, delay_minutes and whatsapp_template_id are required" }, { status: 400 });
  }
  const { data: template } = await supabase.from("reva_whatsapp_templates")
    .select("id,status")
    .eq("id", body.whatsapp_template_id)
    .eq("clinic_id", access.clinicId)
    .single();
  if (!template) return NextResponse.json({ error: "WhatsApp template not found" }, { status: 404 });
  const { data, error } = await supabase.from("reva_automation_rules").insert({
    clinic_id: access.clinicId,
    name: body.name.trim(),
    trigger_type: body.trigger_type,
    delay_minutes: delay,
    whatsapp_template_id: template.id,
    enabled: body.enabled !== false,
  }).select(RULE_SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: "automation_rule.created", entity_type: "automation_rule", entity_id: data.id });
  return NextResponse.json({ rule: data }, { status: 201 });
}
