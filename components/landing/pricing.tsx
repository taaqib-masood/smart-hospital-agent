"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGroup, StaggerItem } from "./motion-primitives";
import { LeadDialogButton } from "./lead-dialog";
import { PricingComparison } from "./pricing-comparison";
import { PricingAlternatives } from "./pricing-alternatives";
import { PricingStarter } from "./pricing-starter";
import { useLang } from "./language-provider";

function FeatureList({
  features,
  firstBold = false,
}: {
  features: string[];
  firstBold?: boolean;
}) {
  return (
    <ul className="flex-1 space-y-3.5">
      {features.map((f, i) => (
        <li key={f} className="flex items-start gap-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-aloka-50 text-aloka-600">
            <Check className="size-3" strokeWidth={3} />
          </span>
          <span
            className={cn(
              "text-[14.5px] leading-snug",
              firstBold && i === 0
                ? "font-semibold text-slate-800"
                : "font-medium text-slate-600"
            )}
          >
            {f}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Pricing() {
  const { t } = useLang();
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-[#F8FAFC] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
            {t.pricing.eyebrow}
          </p>
          <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.55rem] md:leading-[1.15]">
            {t.pricing.h2}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
            {t.pricing.sub}
          </p>
        </FadeUp>

        {/* Billing period toggle */}
        <FadeUp delay={0.08} className="mt-9 flex justify-center">
          <div
            role="radiogroup"
            aria-label={t.pricing.eyebrow}
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-soft"
          >
            <button
              type="button"
              role="radio"
              aria-checked={!annual}
              onClick={() => setAnnual(false)}
              data-cta="Pricing billing — Monthly"
              data-cta-location="pricing"
              className={cn(
                "h-10 rounded-full px-5 text-[13.5px] font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40",
                annual
                  ? "text-slate-500 hover:text-slate-700"
                  : "bg-aloka-600 text-white shadow-[0_4px_14px_rgba(0,126,127,0.30)]"
              )}
            >
              {t.pricing.billingMonthly}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={annual}
              onClick={() => setAnnual(true)}
              data-cta="Pricing billing — Annual"
              data-cta-location="pricing"
              className={cn(
                "flex h-10 items-center gap-2 rounded-full px-5 text-[13.5px] font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40",
                annual
                  ? "bg-aloka-600 text-white shadow-[0_4px_14px_rgba(0,126,127,0.30)]"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t.pricing.billingAnnual}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10.5px] font-bold transition-colors duration-300",
                  annual
                    ? "bg-white/20 text-white"
                    : "bg-aloka-50 text-aloka-600"
                )}
              >
                {t.pricing.annualSave}
              </span>
            </button>
          </div>
        </FadeUp>

        <StaggerGroup className="mx-auto mt-14 grid max-w-4xl grid-cols-1 items-stretch gap-6 md:mt-16 lg:grid-cols-2 lg:gap-8">
          {/* Clinic Pro — recommended */}
          <StaggerItem className="relative h-full lg:-translate-y-2">
            <span className="absolute -top-3.5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-aloka-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-glow">
              <Sparkles className="size-3" />
              {t.pricing.recommended}
            </span>
            <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-aloka-200 bg-white bg-[linear-gradient(to_bottom,rgba(16,185,129,0.035),transparent_240px)] p-8 shadow-[0_16px_56px_rgba(0,126,127,0.13)] ring-1 ring-aloka-500/20">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-aloka-500 via-aloka-400 to-aloka-500"
              />

              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                  {t.pricing.proTitle}
                </h3>
                <p className="mt-1 text-[13.5px] font-medium text-slate-500">
                  {t.pricing.proSub}
                </p>
              </div>

              <div className="mt-7 flex items-baseline gap-1.5">
                <span className="text-[15px] font-bold text-slate-500">{t.pricing.aed}</span>
                <motion.span
                  key={annual ? "annual" : "monthly"}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="text-[2.9rem] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums"
                >
                  {annual ? "1,249" : "1,499"}
                </motion.span>
                <span className="text-[15px] font-semibold text-slate-500">{t.pricing.perMonth}</span>
              </div>
              <p className="mt-2 text-[12.5px] font-medium text-slate-400" aria-live="polite">
                {annual ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-aloka-500" aria-hidden />
                    {t.pricing.billedNote}
                  </span>
                ) : (
                  t.pricing.monthlyNote
                )}
              </p>

              <div className="my-7 border-t border-slate-100" aria-hidden />

              <FeatureList features={t.pricing.proFeatures} />

              <LeadDialogButton
                label={t.pricing.proCta}
                plan="Clinic Pro"
                cta="Start 14-Day Free Trial"
                ctaLocation="pricing-clinic-pro"
                className="btn-shine mt-8 h-12 w-full rounded-xl text-[15px] font-semibold shadow-[0_8px_24px_rgba(0,126,127,0.30)] hover:shadow-[0_10px_32px_rgba(0,126,127,0.38)]"
              />
              <p className="mt-3.5 text-center text-xs font-medium text-slate-400">
                {t.pricing.proNote}
              </p>
            </article>
          </StaggerItem>

          {/* Hospital Group */}
          <StaggerItem className="h-full">
            <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                  {t.pricing.hospitalTitle}
                </h3>
                <p className="mt-1 text-[13.5px] font-medium text-slate-500">
                  {t.pricing.hospitalSub}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
                <span className="text-[2.9rem] font-extrabold leading-none tracking-tight text-slate-900">
                  {t.pricing.custom}
                </span>
                <span className="text-[13.5px] font-semibold text-slate-500">
                  {t.pricing.customSub}
                </span>
              </div>

              <div className="my-7 border-t border-slate-100" aria-hidden />

              <FeatureList features={t.pricing.hospitalFeatures} firstBold />

              <LeadDialogButton
                label={t.pricing.hospitalCta}
                plan="Hospital Group"
                intent="consult"
                variant="outline"
                cta="Book a Consultation"
                ctaLocation="pricing-hospital-group"
                className="mt-8 h-12 w-full rounded-xl border-slate-300 text-[15px] font-semibold text-slate-800 hover:bg-slate-50"
              />
              <p className="mt-3.5 text-center text-xs font-medium text-slate-400">
                {t.pricing.hospitalNote}
              </p>
            </article>
          </StaggerItem>
        </StaggerGroup>

        {/* "Considering the alternatives?" objection-handling strip */}
        <PricingAlternatives />

        <FadeUp delay={0.12}>
          <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3.5 rounded-xl border border-aloka-100 bg-aloka-50/60 px-5 py-4 md:items-center">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-aloka-600 shadow-[0_2px_10px_rgba(0,126,127,0.12)] ring-1 ring-aloka-100">
              <ShieldCheck className="size-[18px]" aria-hidden />
            </span>
            <p className="text-[13.5px] leading-relaxed text-slate-700">
              <span className="font-bold text-slate-900">
                {t.pricing.guaranteeBold}
              </span>
              {t.pricing.guaranteeRest}
            </p>
          </div>
        </FadeUp>

        {/* Feature comparison matrix (disclosure) */}
        <FadeUp delay={0.14}>
          <PricingComparison />
        </FadeUp>

        {/* Starter tier teaser — early access for solo practitioners */}
        <PricingStarter />

        <FadeUp delay={0.15}>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-center text-[13px] font-medium text-slate-500">
            <ShieldCheck className="size-4 text-aloka-500" />
            {t.pricing.footnote}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
