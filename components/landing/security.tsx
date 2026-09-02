"use client";

import { useEffect } from "react";
import {
  KeyRound,
  Lock,
  ScrollText,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import { FadeUp, StaggerGroup, StaggerItem } from "./motion-primitives";
import { initCtaTracking } from "@/lib/analytics";
import { useLang } from "./language-provider";

const SAFEGUARD_ICONS = [ShieldCheck, Lock, Server, KeyRound, Users, ScrollText];

export function Security() {
  const { t } = useLang();

  // Install the global delegated [data-cta] click listener once, on first
  // client mount of the landing page.
  useEffect(() => {
    initCtaTracking();
  }, []);

  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      className="border-y border-slate-200 bg-[#F8FAFC] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
            {t.security.eyebrow}
          </p>
          <h2
            id="security-heading"
            className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.55rem] md:leading-[1.15]"
          >
            {t.security.h2}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
            {t.security.sub}
          </p>
        </FadeUp>

        <StaggerGroup className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 lg:gap-6">
          {t.security.items.map((s, i) => (
            <StaggerItem key={s.title} className="h-full">
              <article className="card-lift h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <span className="flex size-11 items-center justify-center rounded-xl bg-aloka-50 text-aloka-600 ring-1 ring-aloka-100">
                  {(() => {
                    const Icon = SAFEGUARD_ICONS[i];
                    return <Icon className="size-[22px]" strokeWidth={2} />;
                  })()}
                </span>
                <h3 className="mt-4 text-[15px] font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                  {s.text}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <FadeUp delay={0.1} className="mx-auto mt-10 max-w-4xl md:mt-12">
          <div className="flex items-start gap-3.5 rounded-xl border border-aloka-100 bg-aloka-50/60 px-5 py-4 md:items-center">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-aloka-600 shadow-[0_2px_10px_rgba(0,126,127,0.12)] ring-1 ring-aloka-100">
              <ShieldCheck className="size-[18px]" />
            </span>
            <p className="text-[13.5px] leading-relaxed text-slate-700">
              <span className="font-bold text-slate-900">
                {t.security.stripBold}
              </span>
              {t.security.stripRest}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
