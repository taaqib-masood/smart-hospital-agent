"use client";

/**
 * DashboardContext — loads real Supabase data once at the page level
 * and makes it available to all dashboard sub-views without prop-drilling.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAppointments, getClinic, getConversations, getPatients } from "@/lib/api";
import type { RevaAppointment, RevaPatient, RevaConversation, RevaClinic } from "@/lib/supabase/types";

interface DashboardData {
  clinic: RevaClinic | null;
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
  const [clinic, setClinic] = useState<RevaClinic | null>(null);
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
      const [clinicRes, apptRes, patientRes, convRes] = await Promise.all([
        getClinic(),
        getAppointments({ date: todayStr }),
        getPatients(),
        getConversations(),
      ]);

      setClinic(clinicRes);
      setAppointments(apptRes);
      setPatients(patientRes);
      setConversations(convRes);
    } catch {
      // Fallback to demo mock data on any network or database error
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    // Loading remote state is the synchronization this effect owns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <Ctx.Provider value={{ clinic, appointments, patients, conversations, todayStr, loading, refresh: load }}>
      {children}
    </Ctx.Provider>
  );
}

export const useDashboard = () => useContext(Ctx);
