"use client";

import { CalendarCheck, FileText, Phone } from "lucide-react";
import { Counter, FadeUp, StaggerGroup, StaggerItem } from "./motion-primitives";
import { useLang } from "./language-provider";

const FEATURE_ICONS = [Phone, CalendarCheck, FileText];
const FEATURE_PULSE = [true, false, false];

export function CoreOperations() {
  const { t } = useLang();

  return (
    <section id="features" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
            {t.features.eyebrow}
          </p>
          <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.55rem] md:leading-[1.15]">
            {t.features.h2}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
            {t.features.sub}
          </p>
        </FadeUp>

        <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.features.items.map((f, i) => (
            <StaggerItem key={f.title}>
              <article className="card-lift group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-soft hover:border-aloka-200">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-aloka-400 via-aloka-500 to-aloka-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div className="relative w-fit">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-aloka-50 text-aloka-600 ring-1 ring-aloka-100 transition-colors duration-300 group-hover:bg-aloka-100">
                    {(() => {
                      const Icon = FEATURE_ICONS[i];
                      return <Icon className="size-[22px]" strokeWidth={2.1} />;
                    })()}
                  </span>
                  {FEATURE_PULSE[i] && (
                    <span
                      className="absolute -right-1 -top-1 flex size-3"
                      aria-hidden
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aloka-400 opacity-60" />
                      <span className="relative inline-flex size-3 rounded-full bg-aloka-500" />
                    </span>
                  )}
                </div>
                <h3 className="mt-5 text-[17px] font-bold text-slate-900">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-slate-600">
                  {f.text}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Thin stats bar with animated counters */}
        <FadeUp delay={0.15} className="mt-12">
          <dl className="grid grid-cols-1 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {t.features.stats.map((s) => (
              <div key={s.label} className="pt-5 text-center sm:pt-0">
                <dd className="text-4xl font-extrabold tracking-tight text-aloka-600">
                  <Counter to={s.value} suffix={s.suffix} duration={1.7} />
                </dd>
                <dt className="mt-1.5 text-[13.5px] font-medium text-slate-500">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </FadeUp>
      </div>
    </section>
  );
}
