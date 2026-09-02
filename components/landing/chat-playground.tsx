"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  Banknote,
  CalendarCheck2,
  CheckCheck,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  Moon,
  RotateCcw,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackCTA } from "@/lib/analytics";
import { FadeUp, StaggerGroup, StaggerItem } from "./motion-primitives";
import { useLang } from "./language-provider";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

type Intent =
  | "book"
  | "price"
  | "reschedule"
  | "insurance"
  | "hours"
  | "doctor"
  | "location"
  | "human"
  | "fallback";

/**
 * Keyword routing for the simulated agent — EN + AR keywords per intent.
 * Priority order matters (e.g. "reschedule my appointment" must beat "book").
 */
const INTENT_ORDER: Exclude<Intent, "fallback">[] = [
  "reschedule",
  "insurance",
  "price",
  "location",
  "doctor",
  "human",
  "hours",
  "book",
];

const KEYWORDS: Record<Exclude<Intent, "fallback">, string[]> = {
  reschedule: ["reschedule", "change", "move my", "cancel", "postpone", "تغيير", "إلغاء", "نقل", "أجّل", "اجل"],
  insurance: ["insurance", "insur", "cover", "daman", "axa", "cigna", "metlife", "تأمين", "تغطية"],
  price: ["price", "cost", "how much", "fee", "charge", "rate", "سعر", "أسعار", "اسعار", "تكلفة", "كم"],
  location: ["where", "location", "address", "direction", "park", "map", "located", "موقع", "عنوان", "أين", "اين", "وين", "مكان"],
  doctor: ["doctor", "dr.", "sharma", "surgeon", "specialist", "طبيب", "دكتور", "شارما", "جراح"],
  human: ["human", "agent", "person", "staff", "someone", "call me", "speak", "talk", "بشري", "موظف", "اتصل", "أتكلم", "اتكلم"],
  hours: ["hour", "open", "close", "timing", "working", "دوام", "ساعات", "تفتحون", "تغلقون", "متى"],
  book: ["book", "appointment", "consult", "schedule", "slot", "visit", "see dr", "احجز", "حجز", "موعد", "استشارة"],
};

function detectIntent(text: string): Intent {
  const q = text.toLowerCase();
  for (const intent of INTENT_ORDER) {
    if (KEYWORDS[intent].some((k) => q.includes(k))) return intent;
  }
  return "fallback";
}

type Msg =
  | { id: number; role: "user"; text: string; time: string; kind?: undefined }
  | { id: number; role: "reva"; text: string; time: string; kind?: "text" }
  | { id: number; role: "reva"; kind: "slots"; time: string; booked?: string }
  | { id: number; role: "reva"; kind: "confirm"; slot: string; time: string };

const CAN_ICONS = [CalendarCheck2, Banknote, Clock, Moon];

export function ChatPlayground() {
  const { t, isAr, lang } = useLang();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [dubaiTime, setDubaiTime] = useState<string | null>(null);

  const idRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const now = () =>
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const nextId = () => ++idRef.current;

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  // Seed the greeting (also re-seeds when the language changes so the demo
  // stays coherent — a transcript should not mix languages).
  useEffect(() => {
    clearTimers();
    const raf = requestAnimationFrame(() => {
      setTyping(false);
      setInput("");
      setMessages([{ id: nextId(), role: "reva", text: t.chat.greeting, time: now() }]);
    });
    return () => cancelAnimationFrame(raf);
  }, [lang]);

  // Unmount cleanup.
  useEffect(() => clearTimers, []);

  // Live Dubai clock — “Right now in Dubai · 3:42 PM — Reva is on duty”.
  // rAF seeds the first paint (SSR-stable placeholder); an interval keeps the
  // minute fresh. Latin digits forced per the site numeral convention.
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(
      lang === "ar" ? "ar-AE-u-nu-latn" : "en-AE",
      { hour: "numeric", minute: "2-digit", timeZone: "Asia/Dubai" }
    );
    const tick = () => setDubaiTime(fmt.format(new Date()));
    const raf = requestAnimationFrame(tick);
    const id = window.setInterval(tick, 10_000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, [lang]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const pushUser = (text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: "user", text, time: now() }]);
  };

  /** Simulated agent reply: typing indicator → text bubble (+ slot picker). */
  const agentReply = (intent: Intent) => {
    const text = t.chat.responses[intent];
    setTyping(true);
    const delay = 750 + Math.min(text.length * 4, 700);
    const timer = window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => {
        const next: Msg[] = [...m, { id: nextId(), role: "reva", text, time: now() }];
        if (intent === "book" || intent === "reschedule") {
          next.push({ id: nextId(), role: "reva", kind: "slots", time: now() });
        }
        return next;
      });
    }, delay);
    timersRef.current.push(timer);
  };

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    pushUser(text);
    setInput("");
    agentReply(detectIntent(text));
  };

  const sendQuick = (text: string) => {
    if (typing) return;
    trackCTA("Chat demo — quick reply", "chat-playground");
    pushUser(text);
    agentReply(detectIntent(text));
  };

  const pickSlot = (slot: string) => {
    if (typing) return;
    trackCTA("Chat demo — slot booked", "chat-playground");
    setMessages((m) =>
      m.map((msg) =>
        "kind" in msg && msg.kind === "slots" && !msg.booked ? { ...msg, booked: slot } : msg
      )
    );
    pushUser(slot);
    setTyping(true);
    const timer = window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "reva", kind: "confirm", slot, time: now() },
      ]);
    }, 1100);
    timersRef.current.push(timer);
  };

  const resetChat = () => {
    trackCTA("Chat demo — reset", "chat-playground");
    clearTimers();
    setTyping(false);
    setInput("");
    setMessages([{ id: nextId(), role: "reva", text: t.chat.greeting, time: now() }]);
  };

  // The chat frame is an LTR-isolated product UI (like the hero phone); bubble
  // alignment mirrors under RTL exactly like the hero mockup.
  const userAlign = isAr ? "start" : "end";
  const revaAlign = isAr ? "end" : "start";

  return (
    <section id="chat" className="relative overflow-hidden bg-white py-20 md:py-28">
      {/* Soft clinical-green ambience anchoring the chat card */}
      <div
        aria-hidden
        className="absolute end-0 top-1/2 -z-10 h-[560px] w-[560px] -translate-y-1/2 translate-x-1/4 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.10),rgba(16,185,129,0.04)_55%,transparent_78%)]"
      />
      <div
        aria-hidden
        className="absolute -start-24 bottom-0 -z-10 size-72 rounded-full bg-aloka-100/50 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          {/* Left — copy + capability grid */}
          <div>
            <FadeUp>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
                {t.chat.eyebrow}
              </p>
              <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.55rem] md:leading-[1.15]">
                {t.chat.h2}
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
                {t.chat.sub}
              </p>
            </FadeUp>

            <FadeUp delay={0.12}>
              <p className="mt-8 text-[12px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {t.chat.canLabel}
              </p>
            </FadeUp>
            <StaggerGroup className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {t.chat.can.map((item, i) => {
                const Icon = CAN_ICONS[i];
                return (
                  <StaggerItem key={item} className="h-full">
                    <div className="card-lift flex h-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-soft">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-aloka-50 text-aloka-600 ring-1 ring-aloka-100">
                        <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="text-[13.5px] font-semibold leading-snug text-slate-700">
                        {item}
                      </span>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>

            {/* Live Dubai clock — proof the agent never sleeps */}
            <FadeUp delay={0.18}>
              <div
                dir={isAr ? "rtl" : "ltr"}
                className="mt-6 inline-flex max-w-full items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pe-4 ps-2.5 shadow-soft"
              >
                <span className="relative flex size-2.5 shrink-0" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aloka-400 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-aloka-500" />
                </span>
                <p className="truncate text-[12.5px] font-medium text-slate-500">
                  {t.chat.dubaiNow}
                  <span className="mx-1.5 text-slate-300" aria-hidden>
                    ·
                  </span>
                  <span className="tabular-nums font-bold text-slate-900">
                    {dubaiTime ?? "—:—"}
                  </span>
                  <span className="mx-1.5 text-slate-300" aria-hidden>
                    —
                  </span>
                  <span className="font-semibold text-aloka-700">
                    {t.chat.onDuty}
                  </span>
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Right — the live chat card */}
          <FadeUp delay={0.08}>
            <div
              dir="ltr"
              className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft-lg"
            >
              {/* Agent header */}
              <div className="bg-aloka-700 px-4 pb-3 pt-3.5 text-white sm:px-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                    <Eye className="size-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="flex items-center gap-1.5 truncate text-[14px] font-bold">
                      Aloka Eye Clinic
                      <span className="rounded bg-white/15 px-1.5 py-px text-[8.5px] font-semibold tracking-wide text-white/90">
                        {t.mockup.business}
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-emerald-100/90">
                      <span className="relative flex size-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-300" />
                      </span>
                      {t.chat.repliesIn}
                    </p>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white sm:inline-flex">
                    {t.chat.liveChip}
                  </span>
                  <button
                    type="button"
                    onClick={resetChat}
                    aria-label={t.chat.resetAria}
                    title={t.chat.resetAria}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <RotateCcw className="size-4" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Conversation */}
              <MotionConfig reducedMotion="user">
                <div
                  ref={scrollRef}
                  aria-live="polite"
                  aria-label={t.chat.quickAria}
                  className="landing-scroll flex h-[400px] flex-col gap-2.5 overflow-y-auto bg-[#ECE5DD] px-3 py-4 sm:h-[440px] sm:px-4"
                >
                  <p className="mx-auto flex items-center gap-1.5 text-center text-[9.5px] font-medium text-slate-500/90">
                    <Lock className="size-3 shrink-0" aria-hidden />
                    {t.chat.demoNote}
                  </p>

                  {messages.map((msg) => {
                    if (msg.role === "user") {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 12, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="max-w-[85%] rounded-2xl rounded-tr-md bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.07)]"
                          style={{ alignSelf: userAlign === "end" ? "flex-end" : "flex-start" }}
                        >
                          <p dir="auto" className="whitespace-pre-wrap text-[13.5px] leading-snug text-slate-800">
                            {msg.text}
                          </p>
                          <p className="mt-1 text-end text-[9.5px] font-medium text-slate-400">
                            {msg.time}
                          </p>
                        </motion.div>
                      );
                    }

                    if ("kind" in msg && msg.kind === "slots") {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 12, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#DCF8C6] px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.07)]"
                          style={{ alignSelf: revaAlign === "end" ? "flex-end" : "flex-start" }}
                        >
                          <p className="text-[12px] font-semibold text-slate-600">
                            {t.chat.slotsTitle}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {t.chat.slots.map((slot) => {
                              const booked = msg.booked === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={!!msg.booked}
                                  onClick={() => pickSlot(slot)}
                                  className={cn(
                                    "rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all",
                                    booked
                                      ? "bg-aloka-600 text-white shadow-[0_2px_8px_rgba(0,126,127,0.35)]"
                                      : !msg.booked
                                        ? "border border-aloka-300/70 bg-white/80 text-aloka-800 hover:border-aloka-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40"
                                        : "hidden"
                                  )}
                                >
                                  {booked && (
                                    <CheckCheck className="me-1 inline size-3.5 align-[-2px]" aria-hidden />
                                  )}
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                          <p className="mt-1.5 text-end text-[9.5px] font-medium text-slate-400">
                            {msg.time}
                          </p>
                        </motion.div>
                      );
                    }

                    if ("kind" in msg && msg.kind === "confirm") {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 12, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#DCF8C6] px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.07)]"
                          style={{ alignSelf: revaAlign === "end" ? "flex-end" : "flex-start" }}
                        >
                          <div className="rounded-xl bg-white/75 p-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="size-[18px] shrink-0 text-aloka-600" aria-hidden />
                              <p className="text-[12.5px] font-bold text-slate-900">
                                {t.chat.confirmTitle}
                              </p>
                            </div>
                            <div className="mt-2 ms-[26px] flex flex-wrap items-center gap-1.5">
                              <span className="rounded-md bg-aloka-50 px-2 py-0.5 text-[10.5px] font-bold text-aloka-700">
                                {msg.slot}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600">
                                {t.chat.confirmSub}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600">
                                {t.chat.confirmWith}
                              </span>
                            </div>
                          </div>
                          <p dir="auto" className="mt-2 text-[13.5px] leading-snug text-slate-800">
                            {t.chat.confirmMsg}
                          </p>
                          <p className="mt-1 flex items-center justify-end gap-1 text-[9.5px] font-medium text-slate-400">
                            {msg.time}
                            <CheckCheck className="size-3.5 text-aloka-500" aria-hidden />
                          </p>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="max-w-[85%] rounded-2xl rounded-tl-md bg-[#DCF8C6] px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.07)]"
                        style={{ alignSelf: revaAlign === "end" ? "flex-end" : "flex-start" }}
                      >
                        <p dir="auto" className="whitespace-pre-wrap text-[13.5px] leading-snug text-slate-800">
                          {msg.text}
                        </p>
                        <p className="mt-1 flex items-center justify-end gap-1 text-[9.5px] font-medium text-slate-400">
                          {msg.time}
                          <CheckCheck className="size-3.5 text-aloka-500" aria-hidden />
                        </p>
                      </motion.div>
                    );
                  })}

                  <AnimatePresence>
                    {typing && (
                      <motion.div
                        key="typing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        aria-label={t.chat.typingAria}
                        className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-[#DCF8C6] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.07)]"
                        style={{ alignSelf: revaAlign === "end" ? "flex-end" : "flex-start" }}
                      >
                        {[0, 0.18, 0.36].map((d) => (
                          <span
                            key={d}
                            className="size-[7px] animate-typing rounded-full bg-slate-500/70"
                            style={{ animationDelay: `${d}s` }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </MotionConfig>

              {/* Quick replies + input */}
              <div className="border-t border-slate-100 bg-white px-3 pb-3.5 pt-3 sm:px-4">
                <div
                  role="group"
                  aria-label={t.chat.quickAria}
                  className="landing-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-2.5"
                >
                  {t.chat.quick.map((qr) => (
                    <button
                      key={qr}
                      type="button"
                      onClick={() => sendQuick(qr)}
                      disabled={typing}
                      className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:border-aloka-300 hover:text-aloka-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    trackCTA("Chat demo — message sent", "chat-playground");
                    send(input);
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.chat.inputPh}
                    dir="auto"
                    maxLength={200}
                    aria-label={t.chat.inputPh}
                    className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:border-aloka-400 focus:outline-none focus:ring-2 focus:ring-aloka-500/25"
                  />
                  <button
                    type="submit"
                    aria-label={t.chat.sendAria}
                    disabled={typing || !input.trim()}
                    data-cta="Chat demo — send"
                    data-cta-location="chat-playground"
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-aloka-600 text-white shadow-[0_2px_10px_rgba(0,126,127,0.4)] transition-all hover:bg-aloka-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Send className={cn("size-[17px]", isAr && "-scale-x-100")} aria-hidden />
                  </button>
                </form>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
