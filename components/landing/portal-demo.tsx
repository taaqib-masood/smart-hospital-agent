"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MessageCircle,
  PhoneMissed,
  Play,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FadeUp } from "./motion-primitives";
import { WhatsAppIcon } from "./brand";
import { useLang } from "./language-provider";
import type { Dict } from "@/lib/i18n/dictionary";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

/* ------------------------------------------------------------------ */
/* Tab definitions                                                     */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: "recovery", labelKey: "tabRecovery", icon: PhoneMissed, badge: "13" },
  { id: "briefs", labelKey: "tabBriefs", icon: FileText },
  { id: "noshow", labelKey: "tabNoshow", icon: CalendarCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ------------------------------------------------------------------ */
/* Tab 1 — Missed-call recovery feed                                   */
/* ------------------------------------------------------------------ */

type FeedKind = "missed" | "recovered" | "booked" | "handoff";

type FeedItem = {
  id: string;
  time: string;
  kind: FeedKind;
  title: string;
  detail?: string;
  fresh?: boolean;
};

const FEED_META: { time: string; kind: FeedKind }[] = [
  { time: "14:32", kind: "booked" },
  { time: "13:58", kind: "recovered" },
  { time: "13:21", kind: "handoff" },
  { time: "12:47", kind: "booked" },
  { time: "11:19", kind: "recovered" },
];

function buildFeed(t: Dict): FeedItem[] {
  return FEED_META.map((m, i) => ({
    id: `f${i + 1}`,
    time: m.time,
    kind: m.kind,
    title: t.portal.feed[i].title,
    detail: t.portal.feed[i].detail,
  }));
}

const KIND_STYLES: Record<FeedKind, { badge: string; icon: typeof PhoneMissed; ring: string }> = {
  missed: { badge: "bg-amber-50 text-amber-600 border-amber-200", icon: PhoneMissed, ring: "bg-amber-50 text-amber-500" },
  recovered: { badge: "bg-aloka-50 text-aloka-700 border-aloka-200", icon: MessageCircle, ring: "bg-aloka-50 text-aloka-600" },
  booked: { badge: "bg-aloka-50 text-aloka-700 border-aloka-200", icon: CheckCircle2, ring: "bg-aloka-600 text-white" },
  handoff: { badge: "bg-slate-100 text-slate-500 border-slate-200", icon: Bot, ring: "bg-slate-100 text-slate-500" },
};

function RecoveryFeed() {
  const { t } = useLang();
  const [feed, setFeed] = useState<FeedItem[]>(() => buildFeed(t));
  const [simulating, setSimulating] = useState(false);
  const simIndex = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t2 = timers.current;
    return () => t2.forEach(clearTimeout);
  }, []);

  // Re-seed the base feed when the language changes (labels are translated).
  useEffect(() => {
    const raf = requestAnimationFrame(() => setFeed(buildFeed(t)));
    return () => cancelAnimationFrame(raf);
  }, [t]);

  const simulate = useCallback(() => {
    if (simulating) return;
    setSimulating(true);
    const sim = t.portal.simulation[simIndex.current % t.portal.simulation.length];
    simIndex.current += 1;
    const stamp = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const uid = `sim-${Date.now()}`;

    const push = (item: FeedItem) =>
      setFeed((f) => [{ ...item, fresh: true }, ...f].slice(0, 7));

    timers.current.push(
      setTimeout(() => {
        push({
          id: `${uid}-m`,
          time: stamp,
          kind: "missed",
          title: t.portal.simMissedTitle(sim.name),
          detail: t.portal.simMissedDetail(sim.number),
        });
      }, 350),
      setTimeout(() => {
        push({
          id: `${uid}-r`,
          time: stamp,
          kind: "recovered",
          title: t.portal.simRecoveredTitle,
          detail: t.portal.simRecoveredDetail(sim.proc),
        });
      }, 1600),
      setTimeout(() => {
        push({
          id: `${uid}-b`,
          time: stamp,
          kind: "booked",
          title: t.portal.simBookedTitle(sim.proc),
          detail: t.portal.simBookedDetail(sim.slot, sim.doctor),
        });
        setSimulating(false);
      }, 2850)
    );
  }, [simulating, t]);

  return (
    <div className="flex h-full flex-col">
      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t.portal.statMissed, value: "14", tone: "text-slate-900" },
          { label: t.portal.statRecovered, value: "13", tone: "text-aloka-600" },
          { label: t.portal.statReply, value: "26s", tone: "text-slate-900" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
          >
            <p className={cn("text-xl font-extrabold tabular-nums tracking-tight", s.tone)}>
              {s.value}
            </p>
            <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="landing-scroll mt-4 flex-1 space-y-2 overflow-y-auto pr-1 md:max-h-[300px]">
        <AnimatePresence initial={false}>
          {feed.map((item) => {
            const k = KIND_STYLES[item.kind];
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-white px-3.5 py-3",
                  item.fresh
                    ? "border-aloka-200 bg-aloka-50/40 shadow-[0_4px_18px_rgba(0,126,127,0.08)]"
                    : "border-slate-100"
                )}
              >
                <span className="w-9 shrink-0 text-[10.5px] font-bold tabular-nums text-slate-400">
                  {item.time}
                </span>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    k.ring
                  )}
                >
                  <k.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-slate-800">{item.title}</p>
                  {item.detail && (
                    <p className="truncate text-[11px] font-medium text-slate-400">{item.detail}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Simulate */}
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
        <p className="text-[11.5px] font-medium leading-snug text-slate-500">
          {t.portal.simHint}
        </p>
        <Button
          type="button"
          size="sm"
          onClick={simulate}
          disabled={simulating}
          data-cta="Simulate missed call"
          data-cta-location="portal-demo"
          className={cn(
            "h-9 shrink-0 gap-1.5 rounded-lg px-4 text-[12.5px] font-bold",
            simulating && "opacity-80"
          )}
        >
          {simulating ? (
            <>
              <Activity className="size-3.5 animate-pulse" />
              {t.portal.simRecovering}
            </>
          ) : (
            <>
              <Play className="size-3.5" />
              {t.portal.simBtn}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 2 — Patient briefs                                              */
/* ------------------------------------------------------------------ */

function PatientBriefs() {
  const { t } = useLang();
  const [index, setIndex] = useState(0);
  const brief = t.portal.briefs[index % t.portal.briefs.length];

  return (
    <div className="flex h-full flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={brief.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex flex-1 flex-col"
        >
          {/* Patient header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-aloka-600 text-[14px] font-bold text-white">
                {brief.initials}
              </span>
              <div>
                <p className="text-[14.5px] font-bold text-slate-900">{brief.name}</p>
                <p className="text-[11px] font-medium text-slate-400">
                  {t.portal.ageLine(brief.age, brief.mrn, brief.lastVisit)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700">
                {brief.visit}
              </span>
              <p className="mt-1 text-[10.5px] font-medium text-slate-400">{brief.doctor}</p>
            </div>
          </div>

          {/* AI summary */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <Bot className="size-3.5 text-aloka-500" />
              {t.portal.summaryLabel}
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">{brief.summary}</p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                {t.portal.eligibilityLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-aloka-200 bg-aloka-50 px-2.5 py-1 text-[11px] font-bold text-aloka-700">
                <CheckCircle2 className="size-3.5" />
                {brief.eligibility}
              </span>
            </div>
          </div>

          {/* Talking points */}
          <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {t.portal.pointsLabel}
            </p>
            <ul className="mt-2.5 space-y-2">
              {brief.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-aloka-500" />
                  <span className="text-[12.5px] font-medium leading-snug text-slate-600">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
            <Clock className="size-3" />
            {t.portal.generatedNote}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIndex((i) => (i + 1) % t.portal.briefs.length)}
          data-cta="Next patient brief"
          data-cta-location="portal-demo"
          className="h-9 gap-1.5 rounded-lg border-slate-200 px-4 text-[12.5px] font-bold text-slate-700"
        >
          <RotateCcw className="size-3.5" />
          {t.portal.nextBrief}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 3 — No-show prevention (interactive)                            */
/* ------------------------------------------------------------------ */

function NoShowDemo() {
  const { t } = useLang();
  const [stage, setStage] = useState<"reminder" | "slots" | "done">("reminder");
  const [picked, setPicked] = useState<number | null>(null);
  const [confirmedIdx, setConfirmedIdx] = useState<number | null>(null);

  const reset = () => {
    setStage("reminder");
    setPicked(null);
    setConfirmedIdx(null);
  };

  // Language-stable: the confirmed slot is stored as an index, so switching
  // languages mid-demo keeps the calendar copy in the active language.
  const confirmedText =
    confirmedIdx === null
      ? t.portal.defaultConfirmed.replace(/^\w/, (c) => c.toUpperCase())
      : t.portal.slots[confirmedIdx];

  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* Reminder card */}
        <div className="rounded-2xl border border-slate-200 bg-[#ECE5DD] p-4">
          <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.07)]">
            <p className="text-[13px] leading-relaxed text-slate-700">
              {t.portal.reminder.map((seg, i) =>
                seg.b ? (
                  <span key={i} className="font-bold">
                    {seg.t}
                  </span>
                ) : (
                  <span key={i}>{seg.t}</span>
                )
              )}
            </p>
            <p className="mt-1.5 text-right text-[9.5px] font-medium text-slate-400">14:02</p>
          </div>

          <AnimatePresence mode="wait">
            {stage === "reminder" && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="mt-3 grid grid-cols-2 gap-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedIdx(null);
                    setStage("done");
                  }}
                  data-cta="Confirm appointment"
                  data-cta-location="portal-demo"
                  className="h-10 rounded-xl bg-aloka-600 text-[12.5px] font-bold text-white shadow-[0_4px_14px_rgba(0,126,127,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t.portal.confirm}
                </button>
                <button
                  type="button"
                  onClick={() => setStage("slots")}
                  data-cta="Reschedule appointment"
                  data-cta-location="portal-demo"
                  className="h-10 rounded-xl border border-slate-300 bg-white text-[12.5px] font-bold text-slate-700 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t.portal.reschedule}
                </button>
              </motion.div>
            )}

            {stage === "slots" && (
              <motion.div
                key="slots"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="mt-3 space-y-2"
              >
                {t.portal.slots.map((slot, i) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setPicked(i);
                      setConfirmedIdx(i);
                      setStage("done");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all",
                      picked === i
                        ? "border-aloka-400 bg-aloka-50"
                        : "border-slate-200 bg-white hover:border-aloka-300 hover:bg-aloka-50/50"
                    )}
                  >
                    <span className="text-[12.5px] font-bold text-slate-700">{slot}</span>
                    {i === 1 ? (
                      <span className="rounded bg-aloka-50 px-1.5 py-0.5 text-[9px] font-bold text-aloka-700">
                        {t.portal.bestFit}
                      </span>
                    ) : (
                      <ChevronRight className="size-4 text-slate-300" aria-hidden />
                    )}
                  </button>
                ))}
              </motion.div>
            )}

            {stage === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="mt-3 flex items-center gap-2.5 rounded-xl border border-aloka-200 bg-aloka-600 px-3.5 py-3 text-white shadow-[0_6px_20px_rgba(0,126,127,0.35)]"
              >
                <CheckCircle2 className="size-5 shrink-0" />
                <p className="text-[12.5px] font-bold leading-snug">
                  {t.portal.doneMsg(confirmedText)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Arrow */}
        <div className="hidden items-center gap-2 md:flex md:flex-col" aria-hidden>
          <span className="h-0.5 w-8 bg-aloka-300" />
          <span className="rounded-full bg-aloka-50 p-1.5 text-aloka-600">
            <WhatsAppIcon className="size-3.5" />
          </span>
          <span className="h-0.5 w-8 bg-aloka-300" />
        </div>

        {/* Calendar outcome */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
            <p className="text-[11px] font-bold text-slate-500">{t.portal.calendarTitle}</p>
          </div>
          <div className="space-y-2.5 p-4">
            <motion.div
              layout
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors duration-500",
                stage === "done"
                  ? "border-aloka-200 bg-aloka-50/60"
                  : "border-slate-200 bg-white"
              )}
            >
              <div>
                <p className="text-[12px] font-bold text-slate-800">{t.portal.cal1}</p>
                <p className="text-[10.5px] font-medium text-slate-400">
                  {stage === "done" ? confirmedText : t.portal.calendarDefault}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9.5px] font-bold",
                  stage === "done"
                    ? "bg-aloka-600 text-white"
                    : "bg-amber-50 text-amber-600"
                )}
              >
                {stage === "done" ? t.portal.statusConfirmed : t.portal.statusAwaiting}
              </span>
            </motion.div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 opacity-60">
              <div>
                <p className="text-[12px] font-bold text-slate-600">{t.portal.cal2}</p>
                <p className="text-[10.5px] font-medium text-slate-400">{t.portal.cal2Time}</p>
              </div>
              <span className="rounded-full bg-aloka-50 px-2 py-0.5 text-[9.5px] font-bold text-aloka-700">
                {t.portal.statusConfirmed}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer stats + reset */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
        <p className="text-[11.5px] font-medium leading-snug text-slate-500">
          {t.portal.tryHint.map((seg, i) =>
            seg.b ? (
              <span key={i} className="font-bold text-slate-700">
                {seg.t}
              </span>
            ) : (
              <span key={i}>{seg.t}</span>
            )
          )}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          data-cta="Reset demo"
          data-cta-location="portal-demo"
          className="h-8 shrink-0 gap-1.5 rounded-lg px-3 text-[12px] font-bold text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="size-3.5" />
          {t.portal.reset}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Portal shell                                                        */
/* ------------------------------------------------------------------ */

export function PortalDemo() {
  const { t } = useLang();
  const [tab, setTab] = useState<TabId>("recovery");

  // Deep-link: ?demo=recovery|briefs|noshow activates that tab on load.
  // The URL is an external system — read it after mount (SSR-safe) and apply
  // via rAF (before first paint) so there is no visible tab flash.
  useEffect(() => {
    const demo = new URLSearchParams(window.location.search).get("demo");
    if (demo !== "recovery" && demo !== "briefs" && demo !== "noshow") return;
    const raf = requestAnimationFrame(() => setTab(demo));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="portal" className="overflow-hidden bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
            {t.portal.eyebrow}
          </p>
          <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.55rem] md:leading-[1.15]">
            {t.portal.h2}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
            {t.portal.sub}
          </p>
        </FadeUp>

        <FadeUp delay={0.12}>
          {/* Browser frame */}
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[36px] bg-[radial-gradient(60%_60%_at_50%_20%,rgba(16,185,129,0.08),transparent)]"
            />
            {/* dir="ltr" — the dashboard product UI keeps its LTR layout while
                all labels, feed entries and briefs are translated. */}
            <div
              dir="ltr"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft-lg"
            >
              {/* Chrome bar */}
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-slate-200" />
                  <span className="size-2.5 rounded-full bg-slate-200" />
                  <span className="size-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-1 text-[11px] font-semibold text-slate-500">
                    <span className="size-1.5 rounded-full bg-aloka-500" />
                    portal.reva-ai.ae/aloka
                  </span>
                </div>
                <span className="hidden items-center gap-1.5 rounded-full border border-aloka-200 bg-aloka-50 px-2.5 py-1 text-[10px] font-bold text-aloka-700 sm:flex">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aloka-500 opacity-70" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-aloka-600" />
                  </span>
                  {t.portal.liveDemo}
                </span>
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Sidebar */}
                <aside className="shrink-0 border-b border-slate-100 bg-slate-50/50 md:w-60 md:border-b-0 md:border-r">
                  <div className="hidden items-center gap-2.5 px-4 py-4 md:flex">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-aloka-600 text-[10px] font-extrabold text-white">
                      A
                    </span>
                    <div className="leading-tight">
                      <p className="text-[12px] font-bold text-slate-800">{t.portal.clinicName}</p>
                      <p className="text-[10px] font-medium text-slate-400">{t.portal.clinicSub}</p>
                    </div>
                  </div>

                  {/* Mobile tabs */}
                  <nav
                    aria-label={t.portal.tabsAria}
                    className="landing-scroll flex gap-1 overflow-x-auto px-3 py-2.5 md:flex-col md:gap-0.5 md:overflow-visible md:px-3 md:py-2"
                  >
                    {TABS.map((tb) => (
                      <button
                        key={tb.id}
                        type="button"
                        onClick={() => setTab(tb.id)}
                        aria-current={tab === tb.id ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[12.5px] font-semibold transition-all md:min-h-0 md:w-full md:px-3 md:py-2",
                          tab === tb.id
                            ? "bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)] ring-1 ring-slate-200/80"
                            : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                        )}
                      >
                        <tb.icon
                          className={cn(
                            "size-4",
                            tab === tb.id ? "text-aloka-600" : "text-slate-400"
                          )}
                        />
                        <span className="truncate">{t.portal[tb.labelKey]}</span>
                        {"badge" in tb && tb.badge && (
                          <span className="ml-auto hidden rounded-full bg-aloka-600 px-1.5 py-px text-[9px] font-bold text-white md:inline">
                            {tb.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>

                  <div className="hidden px-3 pb-4 md:block">
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        <Bot className="size-3 text-aloka-500" />
                        {t.portal.agentTitle}
                      </p>
                      <p className="mt-1 text-[10.5px] font-medium text-slate-500">
                        {t.portal.agentStatus}
                      </p>
                    </div>
                  </div>
                </aside>

                {/* Content */}
                <div className="min-h-[520px] flex-1 bg-slate-50/40 p-4 md:p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="h-full"
                    >
                      {tab === "recovery" && <RecoveryFeed />}
                      {tab === "briefs" && <PatientBriefs />}
                      {tab === "noshow" && <NoShowDemo />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
