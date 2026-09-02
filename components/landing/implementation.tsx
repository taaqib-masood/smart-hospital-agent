"use client";

import { motion } from "framer-motion";
import { Calculator, Plug, TrendingUp, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGroup, StaggerItem } from "./motion-primitives";
import { RoiCalculatorDialog } from "./roi-calculator";
import { useLang } from "./language-provider";

const STEP_ICONS = [Plug, Workflow, TrendingUp];

export function Implementation() {
  const { t } = useLang();

  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
            {t.implementation.eyebrow}
          </p>
          <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.55rem] md:leading-[1.15]">
            {t.implementation.h2}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
            {t.implementation.sub}
          </p>
        </FadeUp>

        {/* Timeline */}
        {/* dir="ltr" — the numbered 1 → 2 → 3 timeline visual keeps its
            left-to-right progression (icons, connector draw, step order). */}
        <div dir="ltr" className="relative mx-auto mt-16 max-w-5xl md:mt-20">
          {/* Desktop connector — draws itself left to right */}
          <motion.div
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], delay: 0.35 }}
            className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-[2px] origin-left rounded-full bg-gradient-to-r from-aloka-200 via-aloka-400 to-aloka-600 md:block"
          />

          <StaggerGroup className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {t.implementation.steps.map((s, i) => (
              <StaggerItem
                key={s.title}
                className={cn(
                  "relative flex gap-5 md:flex-col md:items-center md:text-center"
                )}
              >
                {/* Mobile connector */}
                {i < t.implementation.steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[27px] top-[64px] -bottom-12 w-0.5 bg-aloka-100 md:hidden"
                  />
                )}
                <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-aloka-600 text-white shadow-[0_8px_24px_rgba(0,126,127,0.35)] ring-[6px] ring-aloka-50">
                  {(() => {
                    const Icon = STEP_ICONS[i];
                    return <Icon className="size-[22px]" strokeWidth={2.1} />;
                  })()}
                </span>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.16em] text-aloka-600">
                    {t.implementation.stepLabel(i + 1)}
                  </p>
                  <h3 className="mt-1.5 text-[17px] font-bold text-slate-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 md:mx-auto">
                    {s.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

        {/* CTA box */}
        <FadeUp delay={0.1} className="mx-auto mt-20 max-w-4xl md:mt-24">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-soft md:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(50%_50%_at_50%_100%,rgba(16,185,129,0.10),transparent)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_62%_72%_at_50%_30%,black,transparent)]"
            />
            <div className="relative">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-aloka-600 text-white shadow-glow">
                <Calculator className="size-[22px]" />
              </span>
              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 md:text-[2rem]">
                {t.implementation.ctaH}
              </h3>
              <p className="mx-auto mt-3.5 max-w-md text-[15.5px] leading-relaxed text-slate-600">
                {t.implementation.ctaP}
              </p>
              <RoiCalculatorDialog
                trigger={
                  <button
                    type="button"
                    className="mt-8 inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-aloka-600 px-7 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(0,126,127,0.30)] transition-all hover:bg-aloka-700 hover:shadow-[0_10px_32px_rgba(0,126,127,0.38)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-aloka-500/40"
                  >
                    <Calculator className="size-4" />
                    {t.implementation.ctaBtn}
                  </button>
                }
              />
              <p className="mt-4 text-xs font-medium text-slate-400">
                {t.implementation.ctaNote}
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
