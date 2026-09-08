/**
 * /api/patients
 * GET  — list patients (?search=name)
 * POST — create patient
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClinicAccess } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  let query = supabase
    .from("reva_patients")
    .select("*")
    .eq("clinic_id", access.clinicId)
    .order("updated_at", { ascending: false });

  if (search) {
    const safeSearch = search.replace(/[^\p{L}\p{N}+\- ]/gu, "").trim();
    if (safeSearch) query = query.or(`name.ilike.%${safeSearch}%,phone.ilike.%${safeSearch}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ patients: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const access = await getClinicAccess(supabase);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, phone, notes } = body;

  if (!name || !phone) return NextResponse.json({ error: "name and phone required" }, { status: 400 });

  const { data, error } = await supabase
    .from("reva_patients")
    .upsert({ clinic_id: access.clinicId, name: String(name).trim(), phone: String(phone).trim(), notes: typeof notes === "string" ? notes : null }, { onConflict: "clinic_id,phone" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("reva_audit_events").insert({ clinic_id: access.clinicId, actor_user_id: access.userId, action: "contact.created", entity_type: "patient", entity_id: data.id });
  return NextResponse.json({ patient: data }, { status: 201 });
}
