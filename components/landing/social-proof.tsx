"use client";

import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  PhoneMissed,
  Quote,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RevaMark } from "./brand";
import { Counter, FadeUp, StaggerGroup, StaggerItem } from "./motion-primitives";
import { useLang } from "./language-provider";
import { LeadDialogButton } from "./lead-dialog";

const METRIC_ICONS: LucideIcon[] = [PhoneMissed, CalendarCheck, Clock, ShieldCheck];

export function SocialProof() {
  const { t, isAr } = useLang();
  const s = t.social;

  return (
    <section id="launch-partner" className="relative bg-white py-20 md:py-28 overflow-hidden">
      {/* Background ambient accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[380px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.06),transparent)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeUp className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-aloka-200 bg-aloka-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-aloka-700">
            <Sparkles className="size-3.5 text-aloka-600" />
            {s.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.65rem] md:leading-[1.15]">
            {s.h2}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
            {s.sub}
          </p>
        </FadeUp>

        {/* Main Launch Partner Showcase Card */}
        <FadeUp delay={0.15} className="mt-12 md:mt-16">
          <div className="relative rounded-[2rem] border border-slate-200/90 bg-gradient-to-b from-[#F8FAFC] to-white p-6 shadow-soft sm:p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Aloka Partner Dossier (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-aloka-600 text-white shadow-xs">
                      <Eye className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                        {s.partnerTitle}
                      </h3>
                      <p className="text-xs font-medium text-slate-500">
                        {s.partnerLocation}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-aloka-200 bg-aloka-50/80 px-3 py-1 text-[11px] font-bold text-aloka-700">
                    <BadgeCheck className="size-3.5 text-aloka-600" />
                    {s.badgeLabel}
                  </span>
                </div>

                {/* Quote Box */}
                <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <Quote className="size-8 text-aloka-200 rotate-180 mb-3" aria-hidden />
                  <p className="text-[15.5px] font-medium leading-relaxed text-slate-800">
                    &ldquo;{s.partnerQuote}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3.5 border-t border-slate-100 pt-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-aloka-700 text-xs font-bold text-white">
                      {s.partnerLeadInitials}
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold text-slate-900">
                        {s.partnerLeadName}
                      </p>
                      <p className="text-[11.5px] font-medium text-slate-500">
                        {s.partnerLeadRole}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Core Pilot Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: MessageSquare,
                      title: isAr ? "استقبال واتساب 24/7" : "24/7 WhatsApp AI",
                      desc: isAr ? "فرز ثنائي اللغة فوري" : "Bilingual triage & booking",
                    },
                    {
                      icon: PhoneMissed,
                      title: isAr ? "استعادة المكالمات <30ث" : "Missed Call Recovery",
                      desc: isAr ? "تواصل تلقائي فوري" : "Under 30s auto outreach",
                    },
                    {
                      icon: FileText,
                      title: isAr ? "ملخصات طبية ذكية" : "DHA Doctor Briefs",
                      desc: isAr ? "جاهزة قبل دخول المريض" : "Pre-consultation intake",
                    },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 shadow-xs flex items-start gap-2.5"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-aloka-50 text-aloka-600">
                        <f.icon className="size-3.5" />
                      </span>
                      <div>
                        <p className="text-[12px] font-bold text-slate-900">{f.title}</p>
                        <p className="text-[10.5px] text-slate-500 mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Early Access Pilot Cohort for UAE Clinics (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-aloka-200/90 bg-gradient-to-br from-aloka-50/90 via-emerald-50/40 to-white p-6 sm:p-7 shadow-xs">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-aloka-600 text-white px-2.5 py-1 text-[10.5px] font-bold tracking-wide uppercase">
                  {isAr ? "مرحلة الوصول المبكر" : "Limited Early Access"}
                </span>
                
                <h4 className="mt-3.5 text-xl font-extrabold text-slate-900 tracking-tight">
                  {s.pilotCohortTitle}
                </h4>
                
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-600">
                  {s.pilotCohortBody}
                </p>

                <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-aloka-600 shrink-0" />
                    <span>{isAr ? "إعداد مسارات العمل المخصصة لتخصص عيادتك" : "Custom clinical workflow mapping for your specialty"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-aloka-600 shrink-0" />
                    <span>{isAr ? "إعداد متوافق تماماً مع هيئة الصحة بدبي واستضافة البيانات" : "Full DHA compliance & UAE data residency setup"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-aloka-600 shrink-0" />
                    <span>{isAr ? "تفعيل واتساب الرسمي الموثّق بالعلامة الخضراء" : "Official WhatsApp Green-Badge API onboarding"}</span>
                  </li>
                </ul>

                <div className="mt-6">
                  <LeadDialogButton
                    label={s.pilotCta}
                    plan="Hospital Group"
                    variant="primary"
                    cta="Apply for Clinical Pilot"
                    ctaLocation="social-proof-pilot"
                    className="w-full h-11 text-[13.5px] font-bold shadow-soft"
                  />
                  <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
                    {isAr ? "استجابة خلال يوم عمل واحد من فريقنا في الإمارات" : "Response within 1 business day from our UAE team"}
                  </p>
                </div>
              </div>

            </div>

            {/* Target Operational Impact Projections */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-4 mb-6">
                <span className="h-px flex-1 bg-slate-200" aria-hidden />
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-aloka-600">
                  {s.metricsTitle}
                </p>
                <span className="h-px flex-1 bg-slate-200" aria-hidden />
              </div>

              <StaggerGroup className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                {s.metrics.map((metric, i) => {
                  const Icon = METRIC_ICONS[i];
                  return (
                    <StaggerItem key={metric.label} className="h-full">
                      <div className="card-lift flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-soft sm:px-5 sm:py-6">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-aloka-50 text-aloka-600 ring-1 ring-aloka-100">
                          <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
                        </span>
                        <Counter
                          to={metric.value}
                          prefix={metric.prefix ?? ""}
                          suffix={metric.suffix ?? ""}
                          decimals={metric.decimals ?? 0}
                          className="mt-3.5 text-[1.85rem] font-extrabold leading-none tracking-tight text-aloka-600 tabular-nums sm:text-[2rem]"
                        />
                        <span className="mt-2 text-[12px] font-medium leading-snug text-slate-500 sm:text-[12.5px]">
                          {metric.label}
                        </span>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>

              <p className="mt-5 text-center text-[11.5px] font-medium text-slate-400">
                {s.metricsNote}
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
