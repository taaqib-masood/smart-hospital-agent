"use client";

import { ArrowRight, BellRing, Clock, Moon, PhoneMissed, Sunrise, Sunset } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGroup, StaggerItem } from "./motion-primitives";
import { useLang } from "./language-provider";

const EVENT_ICONS = [Sunrise, PhoneMissed, BellRing, Sunset, Moon, Clock];

/**
 * "A Day with Reva" — an hour-by-hour vertical timeline proving the 24/7
 * claim with concrete moments. Daytime events carry the green accent;
 * after-hours events stay slate so the green keeps its "live/active"
 * semantics. Desktop: alternating cards around a centre rail. Mobile:
 * single rail on the start edge.
 */
export function DayTimeline() {
  const { t } = useLang();

  return (
    <section
      id="day"
      aria-labelledby="day-heading"
      className="relative overflow-hidden bg-white py-20 md:py-28"
    >
      {/* Faint green ambience anchoring the rail */}
      <div
        aria-hidden
        className="absolute start-1/2 top-1/3 -z-10 size-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.05),rgba(16,185,129,0.02)_55%,transparent_78%)]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
            {t.day.eyebrow}
          </p>
          <h2
            id="day-heading"
            className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.55rem] md:leading-[1.15]"
          >
            {t.day.h2}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
            {t.day.sub}
          </p>
        </FadeUp>

        <div className="relative mt-14 md:mt-16">
          <StaggerGroup className="relative space-y-6 md:space-y-8" stagger={0.14}>
            {/* The rail — fades out at both ends */}
            <div
              aria-hidden
              className="absolute inset-y-1 start-5 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent lg:start-1/2"
            />

            {t.day.events.map((e, i) => {
              const Icon = EVENT_ICONS[i];
              const during = e.during;
              return (
                <StaggerItem key={e.time} className="relative ps-14 lg:ps-0">
                  {/* Rail dot — vertically centred on the card's icon tile */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute start-5 top-[31px] z-10 size-3.5 -translate-x-1/2 rounded-full ring-4 ring-white rtl:translate-x-1/2 lg:start-1/2 md:top-[35px]",
                      during ? "bg-aloka-500" : "bg-slate-400"
                    )}
                  />

                  {/* Card — alternates sides of the centre rail on desktop */}
                  <div
                    className={cn(
                      "lg:w-1/2",
                      i % 2 === 0 ? "lg:pe-14" : "lg:ms-auto lg:ps-14"
                    )}
                  >
                    <article
                      className={cn(
                        "card-lift rounded-2xl border bg-white p-5 shadow-soft md:p-6",
                        during ? "border-slate-200" : "border-slate-200/80"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1",
                              during
                                ? "bg-aloka-50 text-aloka-600 ring-aloka-100"
                                : "bg-slate-100 text-slate-500 ring-slate-200"
                            )}
                          >
                            <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
                          </span>
                          <div className="min-w-0 leading-tight">
                            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                              <span className="tabular-nums">{e.time}</span>
                            </p>
                            <h3 className="mt-1 text-[15px] font-bold tracking-tight text-slate-900">
                              {e.title}
                            </h3>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                            during
                              ? "bg-aloka-50 text-aloka-700 ring-1 ring-aloka-100"
                              : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                          )}
                        >
                          {during ? t.day.chipDuring : t.day.chipAfter}
                        </span>
                      </div>
                      <p className="mt-3 text-[13.5px] leading-relaxed text-slate-600">
                        {e.text}
                      </p>
                    </article>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>

        <FadeUp delay={0.1} className="mx-auto mt-12 max-w-4xl md:mt-14">
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-soft sm:flex-row sm:items-center">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aloka-50 text-aloka-600 ring-1 ring-aloka-100">
              <Clock className="size-[18px]" aria-hidden />
            </span>
            <p className="flex-1 text-[13.5px] leading-relaxed text-slate-700">
              <span className="font-bold text-slate-900">{t.day.stripBold}</span>
              {t.day.stripRest}
            </p>
            <a
              href="#chat"
              data-cta="Day timeline — Try it yourself"
              data-cta-location="day-timeline"
              className="group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-700 transition-all hover:border-aloka-300 hover:text-aloka-700 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40"
            >
              {t.day.cta}
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
