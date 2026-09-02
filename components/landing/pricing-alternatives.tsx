"use client";

import { Headphones, TrendingDown, UserPlus, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeUp } from "./motion-primitives";
import { useLang } from "./language-provider";

const CARD_ICONS = [UserPlus, Headphones, TrendingDown] as const;

/**
 * "Considering the alternatives?" — objection-handling strip that sits right
 * after the pricing cards: what hiring / outsourcing / inaction really costs
 * versus Reva. Canon numbers (120 calls, 40% no-show, AED 52,920, AED 1,499)
 * match the one-pager and the ROI calculator.
 */
export function PricingAlternatives() {
  const { t } = useLang();

  return (
    <FadeUp delay={0.1}>
      <div className="mx-auto mt-14 max-w-5xl md:mt-16">
        <div className="text-center">
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900 md:text-xl">
            {t.pricing.altTitle}
          </h3>
          <p className="mt-1.5 text-[14px] font-medium text-slate-500">
            {t.pricing.altSub}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {t.pricing.alts.map((alt, i) => {
            const Icon = CARD_ICONS[i] ?? TrendingDown;
            const isDoNothing = i === 2;
            return (
              <article
                key={alt.name}
                className={cn(
                  "card-lift flex flex-col rounded-2xl border p-5 md:p-6",
                  isDoNothing
                    ? "border-rose-200/80 bg-[linear-gradient(to_bottom,rgba(244,63,94,0.035),transparent_180px)]"
                    : "border-slate-200 bg-white shadow-soft",
                )}
              >
                <header className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      isDoNothing
                        ? "bg-rose-50 text-rose-500 ring-1 ring-rose-100"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <h4 className="text-[14.5px] font-bold tracking-tight text-slate-800">
                    {alt.name}
                  </h4>
                </header>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "text-[1.65rem] font-extrabold leading-none tracking-tight tabular-nums",
                      isDoNothing ? "text-rose-600" : "text-slate-900",
                    )}
                  >
                    {alt.cost}
                  </span>
                  <span
                    className={cn(
                      "text-[12px] font-semibold",
                      isDoNothing ? "text-rose-500" : "text-slate-400",
                    )}
                  >
                    {alt.costSub}
                  </span>
                </div>

                <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                  {alt.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full",
                          isDoNothing
                            ? "bg-rose-50 text-rose-400"
                            : "bg-slate-100 text-slate-400",
                        )}
                      >
                        <X className="size-2.5" aria-hidden strokeWidth={3} />
                      </span>
                      <span className="text-[12.5px] leading-snug text-slate-500">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* Verdict strip — answers the strip above with the Reva line */}
        <div className="mt-5 flex items-center justify-center gap-2.5 rounded-xl border border-aloka-200 bg-aloka-50/70 px-5 py-3.5 text-center">
          <Zap className="size-4 shrink-0 text-aloka-600" aria-hidden />
          <p className="text-[13.5px] leading-relaxed text-slate-700">
            <span className="font-bold text-aloka-700">
              {t.pricing.altVerdictPrefix}
            </span>
            <span className="font-medium">{t.pricing.altVerdictRest}</span>
          </p>
        </div>
      </div>
    </FadeUp>
  );
}
