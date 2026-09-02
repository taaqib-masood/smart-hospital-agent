"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      router.push(next);
      return;
    }

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from("reva_clinics").insert({
            owner_id: data.user.id,
            name: clinicName || "My Clinic",
          });
        }

        setSuccess("Check your email to confirm your account, then log in.");
        setMode("login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="flex items-center gap-3 justify-center mb-8">
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <img src="/reva-icon.png" alt="Reva AI" className="w-full h-full object-contain" />
        </div>
        <div>
          <span className="text-[#0F172A] font-bold text-2xl tracking-tight">Reva AI</span>
          <p className="text-xs font-semibold text-slate-500">Autonomous Clinic Portal</p>
        </div>
      </div>

      <div className="bg-white border border-[#CCD5DF] rounded-2xl p-8 shadow-sm space-y-5">
        {/* Tabs */}
        <div className="flex bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === m
                  ? "bg-[#00685f] text-white shadow-xs"
                  : "text-slate-500 hover:text-[#0F172A]"
              }`}
            >
              {m === "login" ? "Sign In" : "Register Clinic"}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2 font-medium"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-emerald-800 text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2 font-medium"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Clinic Name</label>
              <input
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Dr. Sharma's Clinic"
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl text-[#0F172A] text-xs focus:outline-none focus:border-[#00685f] focus:bg-white transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Doctor Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="doctor@clinic.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl text-[#0F172A] text-xs focus:outline-none focus:border-[#00685f] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl text-[#0F172A] text-xs focus:outline-none focus:border-[#00685f] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : mode === "login" ? "Sign In to Portal" : "Complete Registration"}
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 font-sans antialiased">
      <Suspense fallback={<div className="text-slate-500 text-xs font-bold">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
