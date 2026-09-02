"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PhoneIncoming, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Counter,
  FadeUp,
  StaggerGroup,
  popItemVariants,
} from "./motion-primitives";
import { RoiCalculatorDialog } from "./roi-calculator";
import { useLang } from "./language-provider";

const TAG_STYLES = [
  "bg-emerald-50 text-emerald-700",
  "bg-teal-50 text-teal-700",
  "bg-slate-100 text-slate-600",
];

function ScheduleCard() {
  const { t } = useLang();

  return (
    // dir="ltr" — dashboard card keeps its LTR product layout; text is translated.
    <div dir="ltr" className="relative">
      <div
        aria-hidden
        className="absolute -inset-5 -z-10 rounded-[32px] bg-gradient-to-br from-aloka-100/50 via-transparent to-transparent"
      />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-bold text-slate-900">
                {t.tailored.scheduleTitle}
              </h3>
              <span className="flex items-center gap-1.5 rounded-full bg-aloka-50 px-2 py-0.5 text-[10px] font-bold text-aloka-700">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aloka-500 opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-aloka-600" />
                </span>
                {t.tailored.scheduleLive}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {t.tailored.scheduleDate}
            </p>
          </div>
          <div className="flex -space-x-2" aria-hidden>
            {["DM", "SS", "AK"].map((i) => (
              <span
                key={i}
                className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9.5px] font-bold text-slate-500"
              >
                {i}
              </span>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="landing-scroll max-h-[326px] divide-y divide-slate-50 overflow-y-auto">
          {t.tailored.schedule.map((r) => (
            <div
              key={r.time + r.name}
              className="flex items-center gap-3 px-5 py-3.5 odd:bg-slate-50/60 transition-colors hover:bg-aloka-50/50"
            >
              <span className="w-10 shrink-0 text-[11px] font-bold tabular-nums text-slate-400">
                {r.time}
              </span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aloka-50 text-[10.5px] font-bold text-aloka-700">
                {r.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-slate-800">
                  <span className="truncate">{r.name}</span>
                  {r.recovered && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded bg-aloka-50 px-1.5 py-px text-[9px] font-bold tracking-wide text-aloka-700 ring-1 ring-aloka-100">
                      <PhoneIncoming className="size-2.5" />
                      {t.tailored.recovered}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-[10.5px] font-medium text-slate-400">
                  {r.sub}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold",
                    TAG_STYLES[r.tone]
                  )}
                >
                  {r.tag}
                </span>
                {r.confirmed && (
                  <CheckCircle2
                    className="size-4 text-aloka-500"
                    aria-label={t.tailored.confirmedAria}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3">
          <span className="text-[11px] font-medium text-slate-500">
            {t.tailored.scheduleFooter}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-aloka-600">
            <Sparkles className="size-3" />
            {t.tailored.scheduleFooterAi}
          </span>
        </div>
      </div>
    </div>
  );
}

/** The animated revenue equation — draws itself left to right on scroll. */
function RevenueEquation() {
  const { t } = useLang();

  return (
    // dir="ltr" — the × / = equation reads left-to-right in both languages
    // (numerals stay Western inside the product-style card).
    <div dir="ltr">
      <StaggerGroup
        stagger={0.22}
        className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
      >
        <motion.div
          variants={popItemVariants}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center shadow-soft"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
            {t.tailored.eqMissed}
          </p>
          <p className="mt-1.5 text-[26px] font-extrabold tabular-nums tracking-tight text-slate-900">
            <Counter to={120} duration={1.2} />
          </p>
        </motion.div>

        <motion.span
          variants={popItemVariants}
          className="self-center px-1 text-[26px] font-light leading-none text-slate-300"
          aria-hidden
        >
          ×
        </motion.span>

        <motion.div
          variants={popItemVariants}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center shadow-soft"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
            {t.tailored.eqValue}
          </p>
          <p className="mt-1.5 text-[26px] font-extrabold tabular-nums tracking-tight text-slate-900">
            <Counter to={450} duration={1.2} />
            <span className="ml-1 text-sm font-bold text-slate-400">AED</span>
          </p>
        </motion.div>

        <motion.span
          variants={popItemVariants}
          className="self-center px-1 text-[26px] font-light leading-none text-slate-300"
          aria-hidden
        >
          =
        </motion.span>

        <motion.div
          variants={popItemVariants}
          className="flex-[1.25] rounded-2xl border border-aloka-200 bg-white px-5 py-4 text-center shadow-[0_10px_40px_rgba(0,126,127,0.14)] ring-1 ring-aloka-500/20"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-aloka-700">
            {t.tailored.eqRecovered}
          </p>
          <p className="mt-1.5 text-[26px] font-extrabold tabular-nums tracking-tight text-aloka-600">
            <Counter to={54000} duration={1.6} />
            <span className="ml-1 text-sm font-bold text-aloka-600/70">AED</span>
          </p>
          <p className="mt-1 text-[11px] font-semibold text-aloka-600/80">
            {t.tailored.eqAnnual}
          </p>
        </motion.div>
      </StaggerGroup>
    </div>
  );
}

export function TailoredForAloka() {
  const { t } = useLang();

  return (
    <section id="journey" className="overflow-hidden bg-[#F8FAFC] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Block 1 — text + dashboard */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
              {t.tailored.eyebrow1}
            </p>
            <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.4rem] md:leading-[1.15]">
              {t.tailored.h2a}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              {t.tailored.p1}
            </p>
            <ul className="mt-7 space-y-3">
              {t.tailored.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-aloka-500" />
                  <span className="text-[15px] font-medium text-slate-700">{b}</span>
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp delay={0.12}>
            <ScheduleCard />
          </FadeUp>
        </div>

        {/* Block 2 — equation + text */}
        <div className="mt-24 grid grid-cols-1 items-center gap-12 md:mt-32 lg:grid-cols-2 lg:gap-20">
          <FadeUp className="order-2 lg:order-1">
            <RevenueEquation />
            <p className="mt-5 text-center text-[12.5px] font-medium text-slate-400">
              {t.tailored.eqCaption}
            </p>
          </FadeUp>

          <FadeUp delay={0.12} className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
              {t.tailored.eyebrow2}
            </p>
            <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.4rem] md:leading-[1.15]">
              {t.tailored.h2b}
            </h2>
            <p className="mt-4 text-[17px] font-semibold leading-relaxed text-slate-800">
              {t.tailored.p2a}
            </p>
            <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
              {t.tailored.p2b}
            </p>
            <RoiCalculatorDialog
              trigger={
                <button
                  type="button"
                  className="group mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-bold text-aloka-600 transition-colors hover:text-aloka-700"
                >
                  {t.tailored.roiLink}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </button>
              }
            />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
