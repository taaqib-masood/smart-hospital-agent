"use client";

import { ArrowDown, ArrowRight, Check, X, Zap } from "lucide-react";
import { FadeUp, StaggerGroup, StaggerItem } from "./motion-primitives";
import { useLang } from "./language-provider";

/**
 * "The Transformation" — a before/after persuasion panel contrasting the
 * manual front desk with the Reva-assisted one. Deliberate visual metaphor:
 * the BEFORE card is static and muted; the AFTER card lifts, glows faintly
 * and carries the green accent system.
 */
export function BeforeAfter() {
  const { t } = useLang();

  return (
    <section
      id="before-after"
      aria-labelledby="before-after-heading"
      className="relative overflow-hidden bg-white py-20 md:py-28"
    >
      {/* Subtle dot-grid backdrop, fading toward the edges */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:radial-gradient(rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black_30%,transparent_78%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
            {t.compare.eyebrow}
          </p>
          <h2
            id="before-after-heading"
            className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.55rem] md:leading-[1.15]"
          >
            {t.compare.h2}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
            {t.compare.sub}
          </p>
        </FadeUp>

        <StaggerGroup className="relative mt-14 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-2 lg:gap-10">
          {/* BEFORE — the manual front desk (static, muted) */}
          <StaggerItem className="h-full">
            <article className="h-full rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-soft md:p-8">
              <header>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <X className="size-3" aria-hidden strokeWidth={3} />
                  {t.compare.beforeLabel}
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-700">
                  {t.compare.beforeTitle}
                </h3>
              </header>
              <ul className="mt-2 divide-y divide-slate-200/70">
                {t.compare.before.map((item) => (
                  <li key={item} className="flex items-start gap-3 py-3.5">
                    <span className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
                      <X className="size-3" aria-hidden strokeWidth={2.5} />
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-slate-500">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </StaggerItem>

          {/* Mobile connector between the stacked cards */}
          <div className="flex justify-center lg:hidden" aria-hidden>
            <span className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-aloka-600 shadow-soft">
              <ArrowDown className="size-5" />
            </span>
          </div>

          {/* AFTER — the Reva-assisted front desk (alive, elevated) */}
          <StaggerItem className="h-full">
            <article className="card-lift relative h-full overflow-hidden rounded-2xl border border-aloka-200/80 bg-white p-6 shadow-soft-lg md:p-8">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-aloka-400 via-aloka-500 to-aloka-400"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.04),transparent_260px)]"
              />
              <header className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-aloka-50 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-aloka-700 ring-1 ring-aloka-100">
                  <Check className="size-3" aria-hidden strokeWidth={3} />
                  {t.compare.afterLabel}
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900">
                  {t.compare.afterTitle}
                </h3>
              </header>
              <ul className="relative mt-2 divide-y divide-slate-100">
                {t.compare.after.map((item) => (
                  <li key={item.text} className="flex items-start gap-3 py-3.5">
                    <span className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-aloka-50 text-aloka-600 ring-1 ring-aloka-100">
                      <Check className="size-3" aria-hidden strokeWidth={3} />
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-slate-600">
                      {item.stat && (
                        <span className="font-extrabold text-slate-900">
                          {item.stat}
                        </span>
                      )}
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </StaggerItem>

          {/* Desktop medallion bridging the two cards */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
          >
            <span className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-aloka-600 shadow-soft-lg ring-8 ring-white">
              <ArrowRight className="size-5 rtl:rotate-180" aria-hidden />
            </span>
          </div>
        </StaggerGroup>

        <FadeUp delay={0.1} className="mx-auto mt-10 max-w-4xl md:mt-12">
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-soft sm:flex-row sm:items-center">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aloka-50 text-aloka-600 ring-1 ring-aloka-100">
              <Zap className="size-[18px]" aria-hidden />
            </span>
            <p className="flex-1 text-[13.5px] leading-relaxed text-slate-700">
              <span className="font-bold text-slate-900">
                {t.compare.stripBold}
              </span>
              {t.compare.stripRest}
            </p>
            <a
              href="#portal"
              data-cta="Before/After — See it live"
              data-cta-location="before-after"
              className="group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-700 transition-all hover:border-aloka-300 hover:text-aloka-700 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40"
            >
              {t.compare.cta}
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                aria-hidden
              />
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
