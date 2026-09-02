import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: clinic } = await supabase
    .from("reva_clinics").select("id,name,whatsapp_phone_id,whatsapp_token")
    .eq("owner_id", user.id).single();
  if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = { ...body };
  if (body.status === "Paid") updates.paid_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("reva_invoices")
    .update(updates)
    .eq("id", id)
    .eq("clinic_id", clinic.id)
    .select("*, patient:reva_patients(id,name,phone)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send WhatsApp reminder if requested
  if (body.send_reminder) {
    const patient = data.patient as { name: string; phone: string } | null;
    if (patient?.phone) {
      await sendWhatsAppMessage(
        patient.phone,
        `Hi ${patient.name}, this is a reminder that you have an outstanding payment of AED ${data.amount.toLocaleString("en-AE")} at ${clinic.name}. Please contact us to clear the balance. Thank you! 🙏`,
        clinic.whatsapp_phone_id,
        clinic.whatsapp_token
      ).catch(() => {});
    }
  }

  return NextResponse.json({ invoice: data });
}
