import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getWhatsAppCredentials } from "@/lib/whatsapp-credentials";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase
    .from("reva_clinics").select("id,name")
    .eq("owner_id", user.id).single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const body = await req.json();

  const { data: fu, error } = await supabase
    .from("reva_follow_ups")
    .update({ ...body, ...(body.status === "Sent" ? { sent_at: new Date().toISOString() } : {}) })
    .eq("id", id)
    .eq("clinic_id", clinic.id)
    .select("*, patient:reva_patients(id,name,phone)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If marking as Sent, actually send the WhatsApp
  if (body.status === "Sent") {
    const patient = fu.patient as { name: string; phone: string } | null;
    if (patient?.phone) {
      const msg = fu.template_message
        .replace("{name}", patient.name)
        .replace("{clinic}", clinic.name);
      const wa = await getWhatsAppCredentials(clinic.id);
      await sendWhatsAppMessage(patient.phone, msg, wa.phoneId, wa.token).catch(() => {});
    }
  }

  return NextResponse.json({ follow_up: fu });
}
