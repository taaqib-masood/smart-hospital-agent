"use client";

import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadDialogButton } from "./lead-dialog";
import { WhatsAppIcon } from "./brand";
import { WhatsAppMockup } from "./whatsapp-mockup";
import { Counter } from "./motion-primitives";
import { useLang } from "./language-provider";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

export function Hero() {
  const { t } = useLang();

  return (
    <section id="top" className="relative overflow-hidden bg-white">
      {/* Subtle dot texture, masked away at the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_38%,black,transparent)]"
      />
      {/* Faint mint wash from the top edge — gives the canvas depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[linear-gradient(to_bottom,rgba(240,253,250,0.65),transparent)]"
      />
      {/* Wide clinical-green glow anchoring the right column */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 top-1/4 hidden size-[620px] rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.09),transparent_72%)] lg:block"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 pb-20 pt-28 sm:px-6 md:pt-36 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:pb-28 lg:pt-40 xl:grid-cols-[1.05fr_0.95fr] xl:gap-20">
        {/* Left — copy */}
        <div className="max-w-xl">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
            className="mt-6 text-[2.45rem] font-extrabold leading-[1.07] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]"
          >
            <span className="relative inline-block">
              <span className="bg-[linear-gradient(to_right,transparent_1%,rgba(16,185,129,0.15)_3%,rgba(16,185,129,0.15)_97%,transparent_99%),linear-gradient(to_top,rgba(16,185,129,0.15)_0%,rgba(16,185,129,0.15)_30%,transparent_40%)]">
                {t.hero.h1a}
              </span>
              {/* Hand-drawn swoosh that draws in beneath the phrase */}
              <motion.svg
                aria-hidden
                className="pointer-events-none absolute -bottom-2 left-0 h-[10px] w-full"
                viewBox="0 0 300 10"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M3 7.5 C 70 3, 170 2, 297 6"
                  stroke="rgba(16,185,129,0.6)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { duration: 0.85, delay: 0.75, ease: EASE },
                    opacity: { duration: 0.25, delay: 0.75 },
                  }}
                />
              </motion.svg>
            </span>{" "}
            {t.hero.h1b}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
            className="mt-6 text-[17px] leading-relaxed text-slate-600 sm:text-lg"
          >
            {t.hero.p.map((seg, i) =>
              seg.b ? (
                <span key={i} className="font-semibold text-slate-800">
                  {seg.t}
                </span>
              ) : (
                <span key={i}>{seg.t}</span>
              )
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
            className="mt-9 flex flex-col gap-3.5 sm:flex-row"
          >
            <LeadDialogButton
              label={t.hero.ctaPrimary}
              plan="Clinic Pro"
              cta="Start 14-Day Free Trial"
              ctaLocation="hero"
              className="btn-shine h-12 rounded-xl px-7 text-[15px] font-semibold shadow-[0_8px_24px_rgba(0,126,127,0.30)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,126,127,0.42)]"
              leading={<ArrowRight className="size-4 rtl:rotate-180" />}
            />
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-xl border-slate-200 px-7 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            >
              <a href="#portal">
                <LayoutDashboard className="size-4" />
                {t.hero.ctaSecondary}
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500">
              <ShieldCheck className="size-4 text-aloka-600" />
              {t.hero.trust1}
            </span>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500">
              <WhatsAppIcon className="size-4 text-aloka-600" />
              {t.hero.trust2}
            </span>
          </motion.div>

          {/* Quick-stats strip — surfaces the three numbers that anchor the value prop */}
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42, ease: EASE }}
            aria-label={t.hero.statsAria}
            className="mt-9 grid max-w-md grid-cols-3 divide-x divide-slate-200/70 rtl:divide-x-reverse"
          >
            {t.hero.stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-start px-3 first:ps-0 last:pe-0"
              >
                <dd className="text-[1.6rem] font-extrabold leading-none tracking-tight text-slate-900 sm:text-[1.85rem]">
                  <Counter
                    to={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                  />
                </dd>
                <dt className="mt-1.5 text-[11.5px] font-medium leading-snug text-slate-500">
                  {s.label}
                </dt>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Right — interactive UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        >
          <WhatsAppMockup />
        </motion.div>
      </div>
    </section>
  );
}
