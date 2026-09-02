"use client";

import { Sparkles } from "lucide-react";
import { FadeUp } from "./motion-primitives";
import { LeadDialogButton } from "./lead-dialog";
import { useLang } from "./language-provider";

/**
 * "Starter" early-access teaser — a slim strip below the comparison matrix.
 *
 * The alternatives strip's "Do nothing" audience is exactly the solo-practitioner
 * segment a lighter tier would convert; this strip catches them without
 * re-architecting the two-plan pricing cards. The dashed border signals
 * "in progress / early access" against the solid borders of shipped tiers.
 */
export function PricingStarter() {
  const { t } = useLang();

  return (
    <FadeUp delay={0.15}>
      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-dashed border-aloka-300 bg-white/80 px-6 py-5 shadow-soft sm:flex-row sm:items-center sm:gap-5 sm:px-7">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-aloka-50 text-aloka-600 ring-1 ring-aloka-100"
        >
          <Sparkles className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] font-bold tracking-tight text-slate-900">
            {t.pricing.starterTitle}
            <span className="inline-flex items-center rounded-full bg-aloka-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-aloka-700 ring-1 ring-aloka-200">
              {t.pricing.starterBadge}
            </span>
          </p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">
            {t.pricing.starterBody}
          </p>
        </div>

        <LeadDialogButton
          label={t.pricing.starterCta}
          plan="Starter"
          variant="outline"
          cta="Ask about Starter"
          ctaLocation="pricing-starter"
          className="h-10 w-full shrink-0 rounded-xl border-aloka-300 bg-aloka-50/60 px-4 text-[13.5px] font-bold text-aloka-700 hover:bg-aloka-100/70 hover:text-aloka-800 sm:w-auto"
        />
      </div>
    </FadeUp>
  );
}
