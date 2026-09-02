"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "./language-provider";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

/** Cell value: "yes" → green check, "no" → muted dash, otherwise render the text. */
function CellValue({ value }: { value: string }) {
  if (value === "yes")
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-aloka-50 text-aloka-600 ring-1 ring-aloka-100">
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    );
  if (value === "no")
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-50 text-slate-300 ring-1 ring-slate-100">
        <Minus className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-slate-50 px-2.5 text-[12px] font-bold text-slate-700 ring-1 ring-slate-100">
      {value}
    </span>
  );
}

export function PricingComparison() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto mt-8 max-w-4xl">
      {/* Toggle button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="pricing-compare"
          aria-label={t.pricing.compareAria}
          data-cta={open ? "Pricing — Hide comparison" : "Pricing — Compare all features"}
          data-cta-location="pricing-comparison"
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[13.5px] font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40",
            open
              ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
              : "border-aloka-200 bg-aloka-50/70 text-aloka-700 hover:border-aloka-300 hover:bg-aloka-50",
          )}
        >
          <span>{open ? t.pricing.compareToggleHide : t.pricing.compareToggle}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="rtl:rotate-180"
            aria-hidden
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="pricing-compare"
            key="compare"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
              {/* Header row (sticky on the table) */}
              <div className="grid grid-cols-[1.6fr_1fr_1fr] border-b border-slate-200 bg-slate-50/70">
                <div className="px-5 py-4 text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                  {t.pricing.compareColPlan}
                </div>
                <div className="flex items-center justify-center gap-1.5 border-s border-slate-200 px-3 py-4 text-center text-[13px] font-bold text-slate-900">
                  <span className="size-1.5 rounded-full bg-aloka-500" aria-hidden />
                  {t.pricing.compareColPro}
                </div>
                <div className="flex items-center justify-center gap-1.5 border-s border-slate-200 px-3 py-4 text-center text-[13px] font-bold text-slate-900">
                  <span className="size-1.5 rounded-full bg-slate-400" aria-hidden />
                  {t.pricing.compareColHospital}
                </div>
              </div>

              {/* Group rows */}
              {t.pricing.compareGroups.map((g, gi) => (
                <div key={g.name} className={cn(gi > 0 && "border-t border-slate-100")}>
                  <div className="bg-white px-5 py-2.5 sm:px-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-aloka-600">
                      {g.name}
                    </p>
                  </div>
                  <div>
                    {g.rows.map((r, ri) => (
                      <div
                        key={r.label}
                        className={cn(
                          "grid grid-cols-[1.6fr_1fr_1fr] items-center transition-colors duration-200 hover:bg-aloka-50/30",
                          ri > 0 && "border-t border-slate-100",
                        )}
                      >
                        <div className="px-5 py-3.5 text-[13.5px] font-medium leading-snug text-slate-700 sm:px-6">
                          {r.label}
                        </div>
                        <div className="flex items-center justify-center border-s border-slate-100 px-3 py-3.5">
                          <CellValue value={r.pro} />
                        </div>
                        <div className="flex items-center justify-center border-s border-slate-100 px-3 py-3.5">
                          <CellValue value={r.hospital} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Footnote */}
              <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 text-center sm:px-6">
                <p className="text-[12px] font-medium text-slate-500">
                  {t.pricing.compareFootnote}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
