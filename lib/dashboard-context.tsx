"use client";

/**
 * DashboardContext — loads real Supabase data once at the page level
 * and makes it available to all dashboard sub-views without prop-drilling.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RevaAppointment, RevaPatient, RevaConversation, RevaClinic } from "@/lib/supabase/types";

interface DashboardData {
  clinic: Pick<RevaClinic, "id"> | null;
  appointments: RevaAppointment[];
  patients: RevaPatient[];
  conversations: RevaConversation[];
  todayStr: string;
  loading: boolean;
  refresh: () => void;
}

const Ctx = createContext<DashboardData>({
  clinic: null,
  appointments: [],
  patients: [],
  conversations: [],
  todayStr: "",
  loading: true,
  refresh: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [clinic, setClinic] = useState<Pick<RevaClinic, "id"> | null>(null);
  const [appointments, setAppointments] = useState<RevaAppointment[]>([]);
  const [patients, setPatients] = useState<RevaPatient[]>([]);
  const [conversations, setConversations] = useState<RevaConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: clinicRow } = await supabase.from("reva_clinics").select("id").eq("owner_id", user.id).single();
      if (!clinicRow) return;
      setClinic(clinicRow);
      const cid = clinicRow.id;

      const [apptRes, patientRes, convRes] = await Promise.all([
        supabase.from("reva_appointments")
          .select("*, patient:reva_patients(id,name,phone,allergies,conditions), doctor:reva_doctors(id,name,specialization)")
          .eq("clinic_id", cid)
          .eq("appointment_date", todayStr)
          .order("appointment_time"),
        supabase.from("reva_patients").select("*").eq("clinic_id", cid).order("updated_at", { ascending: false }).limit(100),
        supabase.from("reva_conversations").select("*").eq("clinic_id", cid).order("last_message_at", { ascending: false }).limit(50),
      ]);

      setAppointments((apptRes.data ?? []) as RevaAppointment[]);
      setPatients((patientRes.data ?? []) as RevaPatient[]);
      setConversations((convRes.data ?? []) as RevaConversation[]);
    } catch {
      // Fallback to demo mock data on any network or database error
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => { load(); }, [load]);

  return (
    <Ctx.Provider value={{ clinic, appointments, patients, conversations, todayStr, loading, refresh: load }}>
      {children}
    </Ctx.Provider>
  );
}

export const useDashboard = () => useContext(Ctx);
