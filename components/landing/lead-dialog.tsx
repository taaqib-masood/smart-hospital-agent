"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, FileDown, Loader2, MessageSquare, ShieldCheck, Sparkles, Calendar, Building, User, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { trackCTA } from "@/lib/analytics";
import { useLang } from "./language-provider";

/** Plan ids double as the API payload value — always English. */
type PlanId = "Clinic Pro" | "Hospital Group" | "One-Pager" | "Starter" | "Walkthrough";

type Intent = "trial" | "consult" | "one-pager";

const SPECIALTIES_EN = [
  "Ophthalmology & LASIK",
  "Dental & Orthodontics",
  "Dermatology & Aesthetics",
  "Polyclinic / Multi-Specialty",
  "Day Surgery / Hospital",
  "Other Specialty",
];

const SPECIALTIES_AR = [
  "طب وجراحة العيون والليزك",
  "طب وجراحة الأسنان",
  "الجلدية والتجميل",
  "مجمع عيادات / متعدد التخصصات",
  "مركز جراحة اليوم الواحد / مستشفى",
  "تخصص طبي آخر",
];

const SLOTS_EN = [
  "Tomorrow at 10:00 AM",
  "Tomorrow at 3:00 PM",
  "Thursday at 11:30 AM",
  "Thursday at 4:00 PM",
  "Next week (flexible)",
];

const SLOTS_AR = [
  "غداً الساعة 10:00 صباحاً",
  "غداً الساعة 3:00 مساءً",
  "الخميس الساعة 11:30 صباحاً",
  "الخميس الساعة 4:00 مساءً",
  "الأسبوع القادم (مرن)",
];

export function LeadDialog({
  open,
  onOpenChange,
  plan: initialPlan = "Clinic Pro",
  intent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan?: PlanId;
  /** What the visitor is asking for; defaults from the plan. */
  intent?: Intent;
}) {
  const { t, lang, isAr } = useLang();
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [form, setForm] = useState({
    name: "",
    email: "",
    clinic: "",
    phone: "",
    slot: "",
    specialty: "",
    // Honeypot — humans never see or fill this field; bots usually do.
    company_website: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setPlan(initialPlan);
      setStatus("idle");
    }
  }, [open, initialPlan]);

  const isPro = plan === "Clinic Pro";
  const isStarter = plan === "Starter";
  const isHospital = plan === "Hospital Group" || plan === "Walkthrough";
  const mode: Intent = intent ?? (isPro ? "trial" : "consult");
  const isOnePager = mode === "one-pager";
  const isConsult = mode === "consult" || isHospital;

  /** Triggers a browser download of the one-pager PDF in the requested language. */
  const downloadPdf = useCallback(
    (pdfLang: "en" | "ar") => {
      const isArabic = pdfLang === "ar";
      const a = document.createElement("a");
      a.href = isArabic
        ? "/reva-clinic-economics-ar.pdf"
        : "/reva-clinic-economics.pdf";
      a.download = isArabic
        ? "reva-ai-clinic-economics-ar.pdf"
        : "reva-ai-clinic-economics.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    []
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const payloadPlan = isOnePager ? "One-Pager" : isConsult ? "Walkthrough" : plan;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: payloadPlan }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      trackCTA(
        isOnePager
          ? "Lead form submitted — one-pager download"
          : isStarter
            ? "Lead form submitted — Starter early-access request"
            : isConsult
              ? "Lead form submitted — 20-min Walkthrough & Consultation"
              : "Lead form submitted — Clinic Pro trial",
        "lead-dialog"
      );
      toast({
        title: isOnePager
          ? t.leadDialog.toastOnePager
          : isStarter
            ? t.leadDialog.toastStarter
            : isConsult
              ? isAr ? "تم حجز الجولة التعريفية بنجاح" : "Walkthrough Requested Successfully"
              : t.leadDialog.toastPro,
        description: isOnePager
          ? t.leadDialog.toastOnePagerDesc(
              form.clinic || t.leadDialog.toastClinicFallback
            )
          : isStarter
            ? t.leadDialog.toastStarterDesc(
                form.clinic || t.leadDialog.toastClinicFallback
              )
            : isAr
              ? `سيتواصل معك فريقنا في الإمارات لتأكيد الموعد لـ ${form.clinic || "عيادتك"}.`
              : `Our UAE team will send the calendar invite and WhatsApp details for ${form.clinic || "your clinic"}.`,
      });

      if (isOnePager) downloadPdf(lang);
    } catch {
      setStatus("idle");
      toast({
        variant: "destructive",
        title: t.leadDialog.toastErrTitle,
        description: t.leadDialog.toastErrDesc,
      });
    }
  }

  const specialties = isAr ? SPECIALTIES_AR : SPECIALTIES_EN;
  const slots = isAr ? SLOTS_AR : SLOTS_EN;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 rounded-2xl border-slate-200 p-0 sm:max-w-[480px] overflow-hidden max-h-[90vh] overflow-y-auto">
        {status === "success" ? (
          <div className="px-7 pb-8 pt-10 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-aloka-50 text-aloka-600 ring-8 ring-aloka-50/50">
              <CheckCircle2 className="size-7" />
            </span>
            <DialogTitle className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">
              {isConsult
                ? isAr ? "تم تأكيد طلب الجولة التعريفية!" : "Walkthrough Reserved!"
                : t.leadDialog.successTitle}
            </DialogTitle>
            
            <DialogDescription className="mx-auto mt-2.5 max-w-[360px] text-[14px] leading-relaxed text-slate-600">
              {isOnePager ? (
                t.leadDialog.successMsgOnePager(form.clinic || t.leadDialog.clinicFallback).map((seg, i) => (
                  <span key={i} className={seg.b ? "font-semibold text-slate-800" : ""}>{seg.t}</span>
                ))
              ) : isStarter ? (
                t.leadDialog.successMsgStarter(form.clinic || t.leadDialog.clinicFallback).map((seg, i) => (
                  <span key={i} className={seg.b ? "font-semibold text-slate-800" : ""}>{seg.t}</span>
                ))
              ) : isConsult ? (
                isAr ? (
                  <>
                    شكراً لك <span className="font-semibold text-slate-800">{form.name || "دكتور"}</span>. سيتواصل معك فريقنا في الإمارات لتأكيد مسار العمل لـ <span className="font-semibold text-slate-800">{form.clinic || "عيادتك"}</span> وإرسال رابط الاجتماع عبر واتساب والبريد خلال ساعة عمل واحدة.
                  </>
                ) : (
                  <>
                    Thank you, <span className="font-semibold text-slate-800">{form.name || "Doctor"}</span>. Our UAE clinical team will send the calendar invite and WhatsApp confirmation for <span className="font-semibold text-slate-800">{form.clinic || "your clinic"}</span> within 1 business hour.
                  </>
                )
              ) : (
                t.leadDialog.successMsg(plan, "trial", form.clinic || t.leadDialog.clinicFallback).map((seg, i) => (
                  <span key={i} className={seg.b ? "font-semibold text-slate-800" : ""}>{seg.t}</span>
                ))
              )}
            </DialogDescription>

            {/* Direct WhatsApp connect badge */}
            <div className="mt-6 rounded-xl border border-aloka-200/80 bg-aloka-50/70 p-4 text-start flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aloka-600 text-white">
                  <MessageSquare className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {isAr ? "تحتاج مساعدة فورية؟" : "Need immediate assistance?"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isAr ? "تواصل مباشرة مع فريق الإطلاق عبر واتساب" : "Direct WhatsApp with UAE Clinical Onboarding"}
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/971501234567?text=Hi%20Reva%20AI%20UAE%20Team%2C%20I%20would%20like%20to%20follow%20up%20on%20our%20clinic%20walkthrough."
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-aloka-300 text-[11.5px] font-bold text-aloka-700 hover:bg-aloka-600 hover:text-white transition-colors shrink-0 shadow-xs"
              >
                {isAr ? "محادثة واتساب" : "WhatsApp"}
              </a>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
              <ShieldCheck className="size-3.5 text-aloka-500" />
              {t.leadDialog.successBadge}
            </div>

            <Button
              variant="outline"
              className="mt-6 h-10 w-full rounded-xl border-slate-200"
              onClick={() => onOpenChange(false)}
            >
              {t.leadDialog.done}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="px-7 pb-4 pt-7 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex size-6 items-center justify-center rounded-md bg-aloka-100 text-aloka-700">
                  <Sparkles className="size-3.5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-aloka-700">
                  {isConsult
                    ? isAr ? "حجز جولة تعريفية (20 دقيقة)" : "20-Minute Clinical Walkthrough"
                    : isOnePager
                      ? "One-Pager PDF"
                      : "Clinical Pilot"}
                </span>
              </div>
              <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-900">
                {isOnePager
                  ? t.leadDialog.titleOnePager
                  : isStarter
                    ? t.leadDialog.titleStarter
                    : isConsult
                      ? isAr ? "احجز جولة تعريفية مدتها 20 دقيقة مع فريقنا" : "Book a 20-Minute Walkthrough with Our UAE Team"
                      : t.leadDialog.titlePro}
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-slate-500 mt-1">
                {isOnePager
                  ? t.leadDialog.descOnePager
                  : isStarter
                    ? t.leadDialog.descStarter
                    : isConsult
                      ? isAr
                        ? "سنستعرض معاً تشغيل ريفا للذكاء الاصطناعي على واتساب ونطابقها مع مسار عمل عيادتك وجداول الأطباء واستقبال المرضى."
                        : "We’ll demonstrate Reva AI live on WhatsApp and map it to your clinic’s exact specialty, doctor schedules, and patient intake workflow."
                      : t.leadDialog.desc}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="px-7 py-6 space-y-4">
              {/* Honeypot trap */}
              <input
                type="text"
                name="company_website"
                id="lead-company-website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                value={form.company_website}
                onChange={(e) =>
                  setForm((f) => ({ ...f, company_website: e.target.value }))
                }
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="lead-name" className="text-[12.5px] font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="size-3.5 text-slate-400" />
                    {t.leadDialog.fName}
                  </Label>
                  <Input
                    id="lead-name"
                    required
                    minLength={2}
                    placeholder={isAr ? "د. بريا شارما / مدير العيادة" : "Dr. Priya Sharma / Clinic Manager"}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-10 rounded-xl border-slate-200 text-[13.5px] focus-visible:ring-aloka-500"
                  />
                </div>

                {/* Clinic Name & Email */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-clinic" className="text-[12.5px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Building className="size-3.5 text-slate-400" />
                      {t.leadDialog.fClinic}
                    </Label>
                    <Input
                      id="lead-clinic"
                      required
                      minLength={2}
                      placeholder={isAr ? "عيادة ألوكا للعيون" : "Aloka Eye Clinic"}
                      value={form.clinic}
                      onChange={(e) => setForm((f) => ({ ...f, clinic: e.target.value }))}
                      className="h-10 rounded-xl border-slate-200 text-[13.5px] focus-visible:ring-aloka-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lead-email" className="text-[12.5px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="size-3.5 text-slate-400" />
                      {t.leadDialog.fEmail}
                    </Label>
                    <Input
                      id="lead-email"
                      type="email"
                      required
                      placeholder={isAr ? "doctor@clinic.ae" : "doctor@clinic.ae"}
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="h-10 rounded-xl border-slate-200 text-[13.5px] focus-visible:ring-aloka-500"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="lead-phone" className="text-[12.5px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-slate-400" />
                    {isAr ? "رقم الواتساب / الهاتف (الإمارات)" : "Official WhatsApp / Phone (UAE)"}
                  </Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    required
                    placeholder="+971 50 123 4567"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="h-10 rounded-xl border-slate-200 text-[13.5px] focus-visible:ring-aloka-500 font-mono"
                  />
                </div>

                {/* Walkthrough Preferred Slot & Specialty */}
                {isConsult && (
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="lead-slot" className="text-[12.5px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-slate-400" />
                        {isAr ? "الوقت المفضل للجولة" : "Preferred Time Slot"}
                      </Label>
                      <select
                        id="lead-slot"
                        value={form.slot}
                        onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-[12.5px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-aloka-500"
                      >
                        <option value="">{isAr ? "اختر موعداً مناسباً..." : "Select preferred slot..."}</option>
                        {slots.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="lead-specialty" className="text-[12.5px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-slate-400" />
                        {isAr ? "التخصص الطبي" : "Clinic Specialty"}
                      </Label>
                      <select
                        id="lead-specialty"
                        value={form.specialty}
                        onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-[12.5px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-aloka-500"
                      >
                        <option value="">{isAr ? "اختر تخصص العيادة..." : "Select specialty..."}</option>
                        {specialties.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={status === "loading"}
                data-cta={
                  isOnePager
                    ? "Send me the one-pager"
                    : isStarter
                      ? "Ask about Starter"
                      : isConsult
                        ? "Book 20-Minute Walkthrough"
                        : "Start 14-Day Free Trial"
                }
                data-cta-location="lead-dialog"
                className="mt-6 h-11 w-full rounded-xl text-[14.5px] font-bold shadow-soft hover:shadow-glow bg-aloka-600 hover:bg-aloka-700 text-white transition-all cursor-pointer"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t.leadDialog.submitting}
                  </>
                ) : isOnePager ? (
                  t.leadDialog.submitOnePager
                ) : isStarter ? (
                  t.leadDialog.submitStarter
                ) : isConsult ? (
                  isAr ? "احجز الجولة التعريفية (20 دقيقة)" : "Confirm 20-Minute Walkthrough"
                ) : (
                  t.leadDialog.submitPro
                )}
              </Button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-slate-400">
                <ShieldCheck className="size-3.5 text-aloka-500" />
                {t.leadDialog.reassurance}
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Button that opens the lead-capture dialog. */
export function LeadDialogButton({
  label,
  plan = "Clinic Pro",
  intent,
  variant = "default",
  size,
  className,
  leading,
  type = "button",
  ctaLocation = "lead-dialog",
  cta,
}: {
  label: string;
  plan?: PlanId;
  intent?: Intent;
  variant?:
    | "default"
    | "primary"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  leading?: ReactNode;
  type?: "button" | "submit" | "reset";
  ctaLocation?: string;
  cta?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type={type}
        variant={variant === "primary" ? "default" : variant}
        size={size}
        className={cn(
          variant === "primary" &&
            "bg-aloka-600 text-white shadow-soft hover:bg-aloka-700 hover:shadow-glow",
          className
        )}
        data-cta={cta ?? label}
        data-cta-location={ctaLocation}
        onClick={() => {
          trackCTA(cta ?? label, ctaLocation);
          setOpen(true);
        }}
      >
        {leading}
        {label}
      </Button>
      <LeadDialog
        open={open}
        onOpenChange={setOpen}
        plan={plan}
        intent={intent}
      />
    </>
  );
}
