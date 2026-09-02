"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Calculator, FileDown, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { LeadDialog } from "./lead-dialog";
import { useLang } from "./language-provider";

const REVA_PRICE = 1499;

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-[13px] font-semibold text-slate-700">{label}</Label>
        <span className="rounded-lg bg-aloka-50 px-2.5 py-1 text-[13px] font-bold tabular-nums text-aloka-700">
          {format(value)}
        </span>
      </div>
      <Slider
        className="mt-3.5"
        value={[value]}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onValueChange={(v) => onChange(v[0])}
      />
      {hint && (
        <p className="mt-2.5 text-[11.5px] leading-snug text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function RoiCalculator() {
  const { t } = useLang();
  const [calls, setCalls] = useState(120);
  const [value, setValue] = useState(450);
  const [rate, setRate] = useState(40);

  const { recoveredAppts, monthly, annual, roiMultiple, breakeven } = useMemo(() => {
    const appts = Math.round(calls * (rate / 100));
    const mo = appts * value;
    return {
      recoveredAppts: appts,
      monthly: mo,
      annual: mo * 12,
      roiMultiple: mo / REVA_PRICE,
      breakeven: Math.ceil(REVA_PRICE / Math.max(value, 1)),
    };
  }, [calls, value, rate]);

  const fmt = (n: number) =>
    n.toLocaleString("en-AE", { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <SliderRow
        label={t.roi.s1Label}
        value={calls}
        min={20}
        max={400}
        step={5}
        onChange={setCalls}
        format={(v) => t.roi.s1Format(fmt(v))}
        hint={t.roi.s1Hint}
      />
      <SliderRow
        label={t.roi.s2Label}
        value={value}
        min={100}
        max={3000}
        step={50}
        onChange={setValue}
        format={(v) => t.roi.s2Format(fmt(v))}
        hint={t.roi.s2Hint}
      />
      <SliderRow
        label={t.roi.s3Label}
        value={rate}
        min={10}
        max={90}
        step={5}
        onChange={setRate}
        format={(v) => t.roi.s3Format(v)}
        hint={t.roi.s3Hint}
      />

      {/* Result */}
      <div className="rounded-2xl border border-aloka-200 bg-gradient-to-b from-aloka-50/80 to-white p-5 ring-1 ring-aloka-500/15">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-aloka-700">
          {t.roi.resultLabel}
        </p>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-sm font-bold text-aloka-700">AED</span>
          <span className="text-[2.1rem] font-extrabold leading-none tracking-tight text-aloka-600 tabular-nums">
            {fmt(monthly)}
          </span>
          <span className="text-xs font-semibold text-slate-500">{t.roi.perMonth}</span>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-aloka-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {t.roi.visitsLabel}
            </p>
            <p className="mt-1 text-[15px] font-bold tabular-nums text-slate-800">
              {fmt(recoveredAppts)}
              <span className="ms-1 text-[11px] font-semibold text-slate-400">{t.roi.perMo}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {t.roi.annualLabel}
            </p>
            <p className="mt-1 text-[15px] font-bold tabular-nums text-slate-800">
              AED {fmt(annual)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-aloka-600 px-4 py-2.5 text-center text-[12.5px] font-bold text-white shadow-[0_6px_20px_rgba(0,126,127,0.3)]">
          <TrendingUp className="size-4 shrink-0" />
          {roiMultiple >= 1
            ? t.roi.paysForItself(roiMultiple.toFixed(roiMultiple >= 10 ? 0 : 1))
            : t.roi.breakeven(breakeven)}
        </div>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-slate-400">
        {t.roi.note}
      </p>
    </div>
  );
}

/** ROI calculator modal — pass any element as the trigger. */
export function RoiCalculatorDialog({ trigger }: { trigger: ReactNode }) {
  const { t } = useLang();
  const [roiOpen, setRoiOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  return (
    <>
      <Dialog open={roiOpen} onOpenChange={setRoiOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto rounded-2xl border-slate-200 p-0 sm:max-w-[480px]">
          <DialogHeader className="px-6 pb-3.5 pt-5 sm:px-7">
            <DialogTitle className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-slate-900">
              <span className="flex size-9 items-center justify-center rounded-xl bg-aloka-600 text-white shadow-[0_4px_14px_rgba(0,126,127,0.3)]">
                <Calculator className="size-[18px]" />
              </span>
              {t.roi.title}
            </DialogTitle>
            <DialogDescription className="text-[13.5px] leading-relaxed text-slate-500">
              {t.roi.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 sm:px-7">
            <RoiCalculator />

            {/* Highest-intent moment: hand the visitor the economics one-pager
                (closes this dialog, opens the gated lead form). */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <button
                type="button"
                data-cta="Get the economics one-pager"
                data-cta-location="roi-dialog"
                onClick={() => {
                  setRoiOpen(false);
                  // Let the ROI dialog close animation finish first.
                  window.setTimeout(() => setLeadOpen(true), 280);
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[13.5px] font-bold text-slate-700 transition-all duration-300 hover:-translate-y-px hover:border-aloka-300 hover:text-aloka-700 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40"
              >
                <FileDown className="size-4 shrink-0" />
                {t.roi.onePagerCta}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <LeadDialog open={leadOpen} onOpenChange={setLeadOpen} intent="one-pager" />
    </>
  );
}
