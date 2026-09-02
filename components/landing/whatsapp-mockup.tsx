"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryFull,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Lock,
  Mic,
  MoreVertical,
  Phone,
  PhoneIncoming,
  RotateCcw,
  Send,
  Signal,
  Video,
  Wifi,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "./language-provider";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

type Intent =
  | "lasik"
  | "book"
  | "price"
  | "insurance"
  | "location"
  | "hours"
  | "doctor"
  | "cataract"
  | "confirm"
  | "fallback";

interface MessageItem {
  id: string;
  side: "in" | "out";
  text: string;
  time: string;
  slots?: string[];
  isConfirmed?: boolean;
}

const QUICK_PROMPTS_EN = [
  "Book a LASIK consultation",
  "How much does LASIK cost?",
  "Do you accept Daman insurance?",
  "Where are you located in Dubai?",
];

const QUICK_PROMPTS_AR = [
  "حجز استشارة ليزك",
  "كم تكلفة عملية الليزك؟",
  "هل تقبلون تأمين ضمان؟",
  "أين موقع العيادة في دبي؟",
];

export function WhatsAppMockup() {
  const { t, isAr, lang } = useLang();

  // Active chat state
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeBooking, setActiveBooking] = useState<{
    title: string;
    slot: string;
    doctor: string;
  }>({
    title: isAr ? "استشارة ليزك" : "LASIK Consultation",
    slot: isAr ? "الخميس · 4:00 م" : "Thu · 4:00 PM",
    doctor: isAr ? "د. شارما" : "Dr. Sharma",
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  const formatTime = () => {
    return new Date().toLocaleTimeString(isAr ? "ar-AE" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  // Seed default conversation on mount or language toggle
  const resetConversation = () => {
    clearTimers();
    setIsTyping(false);
    if (isAr) {
      setMessages([
        {
          id: "m-1",
          side: "in",
          text: "مرحباً، أود حجز موعد لفحص واستشارة الليزك.",
          time: "4:01 م",
        },
        {
          id: "m-2",
          side: "out",
          text: "أهلاً بك في عيادة ألوكا للعيون! 👋 لدينا مواعيد متاحة لفحص الليزك مع الدكتورة شارما هذا الأسبوع. يُرجى اختيار الوقت الأنسب لك:",
          time: "4:02 م",
          slots: ["الخميس 4:00 م", "الجمعة 11:30 ص", "السبت 2:00 م"],
        },
      ]);
      setActiveBooking({
        title: "استشارة ليزك",
        slot: "الخميس · 4:00 م",
        doctor: "د. شارما",
      });
    } else {
      setMessages([
        {
          id: "m-1",
          side: "in",
          text: "Hi, I'd like to book a LASIK consultation.",
          time: "4:01 PM",
        },
        {
          id: "m-2",
          side: "out",
          text: "Hello! Welcome to Aloka Eye Clinic. 👋 We have open slots for comprehensive LASIK evaluation with Dr. Sharma this week. Please select your preferred time:",
          time: "4:02 PM",
          slots: ["Thu 4:00 PM", "Fri 11:30 AM", "Sat 2:00 PM"],
        },
      ]);
      setActiveBooking({
        title: "LASIK Consultation",
        slot: "Thu · 4:00 PM",
        doctor: "Dr. Sharma",
      });
    }
  };

  useEffect(() => {
    resetConversation();
    return () => clearTimers();
  }, [isAr]);

  // Auto-scroll chat area
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Intelligent intent detection with strict priority ordering
  const detectUserIntent = (text: string): Intent => {
    const q = text.toLowerCase();

    // 1. Specific information queries must be prioritized first
    if (
      q.includes("price") ||
      q.includes("cost") ||
      q.includes("fee") ||
      q.includes("how much") ||
      q.includes("rate") ||
      q.includes("quote") ||
      q.includes("pricing") ||
      q.includes("installment") ||
      q.includes("tabby") ||
      q.includes("tamara") ||
      q.includes("aed") ||
      q.includes("سعر") ||
      q.includes("تكلفة") ||
      q.includes("بكم") ||
      q.includes("كم") ||
      q.includes("تقسيط")
    ) {
      return "price";
    }

    if (
      q.includes("insurance") ||
      q.includes("daman") ||
      q.includes("thiqa") ||
      q.includes("axa") ||
      q.includes("gig") ||
      q.includes("nextcare") ||
      q.includes("cigna") ||
      q.includes("metlife") ||
      q.includes("sukoon") ||
      q.includes("coverage") ||
      q.includes("covered") ||
      q.includes("claim") ||
      q.includes("تأمين") ||
      q.includes("ضمان") ||
      q.includes("ثقة")
    ) {
      return "insurance";
    }

    if (
      q.includes("where") ||
      q.includes("location") ||
      q.includes("address") ||
      q.includes("direction") ||
      q.includes("dhcc") ||
      q.includes("healthcare city") ||
      q.includes("parking") ||
      q.includes("map") ||
      q.includes("building") ||
      q.includes("موقع") ||
      q.includes("عنوان") ||
      q.includes("وين") ||
      q.includes("مكان") ||
      q.includes("خريطة")
    ) {
      return "location";
    }

    if (
      q.includes("hour") ||
      q.includes("timing") ||
      q.includes("open") ||
      q.includes("close") ||
      q.includes("time") ||
      q.includes("friday") ||
      q.includes("weekend") ||
      q.includes("schedule") ||
      q.includes("دوام") ||
      q.includes("ساعات") ||
      q.includes("تفتحون") ||
      q.includes("أوقات") ||
      q.includes("مواعيد العمل")
    ) {
      return "hours";
    }

    if (
      q.includes("doctor") ||
      q.includes("dr.") ||
      q.includes("dr ") ||
      q.includes("sharma") ||
      q.includes("surgeon") ||
      q.includes("specialist") ||
      q.includes("consultant") ||
      q.includes("who is") ||
      q.includes("experience") ||
      q.includes("دكتور") ||
      q.includes("طبيب") ||
      q.includes("جراح") ||
      q.includes("شارما")
    ) {
      return "doctor";
    }

    if (
      q.includes("cataract") ||
      q.includes("phaco") ||
      q.includes("lens") ||
      q.includes("ماء أبيض") ||
      q.includes("مياه بيضاء") ||
      q.includes("عدسة")
    ) {
      return "cataract";
    }

    if (
      q.includes("confirm") ||
      q.includes("yes") ||
      q.includes("yeah") ||
      q.includes("sure") ||
      q.includes("ok") ||
      q.includes("okay") ||
      q.includes("نعم") ||
      q.includes("تأكيد") ||
      q.includes("تمام") ||
      q.includes("اوكي") ||
      q.includes("أكيد")
    ) {
      return "confirm";
    }

    // 2. Booking / LASIK Consultation queries
    if (
      q.includes("book") ||
      q.includes("appointment") ||
      q.includes("consult") ||
      q.includes("slot") ||
      q.includes("lasik") ||
      q.includes("laser") ||
      q.includes("femto") ||
      q.includes("prk") ||
      q.includes("smile") ||
      q.includes("vision") ||
      q.includes("refractive") ||
      q.includes("checkup") ||
      q.includes("exam") ||
      q.includes("حجز") ||
      q.includes("موعد") ||
      q.includes("استشارة") ||
      q.includes("ليزك") ||
      q.includes("فحص")
    ) {
      return "lasik";
    }

    return "fallback";
  };

  const handleSend = (textToSend?: string) => {
    const raw = (textToSend ?? inputText).trim();
    if (!raw) return;

    const time = formatTime();
    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      side: "in",
      text: raw,
      time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    const intent = detectUserIntent(raw);

    const tId = window.setTimeout(() => {
      setIsTyping(false);
      const replyTime = formatTime();
      let replyItem: MessageItem;

      switch (intent) {
        case "price":
          replyItem = {
            id: `reva-${Date.now()}`,
            side: "out",
            text: isAr
              ? "تبدأ عمليات الفيمتو ليزك المخصصة من 4,900 درهم للعينين شاملة فحوصات القرنية الطبوغرافية ثلاثية الأبعاد والمتابعة لمدة 3 أشهر مع د. شارما. فحص الملاءمة الشامل هو 500 درهم (يُخصم بالكامل عند إجراء العملية). تتوفر خطط تقسيط ميسرة 0% عبر تابي وتمارا."
              : "Custom Femto-LASIK at Aloka starts from AED 4,900 for both eyes, including all pre-op Pentacam 3D corneal scans and 3 months of follow-up care with Dr. Sharma. Initial suitability assessment is AED 500 (100% credited toward the procedure). Flexible 0% installments available via Tabby & Tamara.",
            time: replyTime,
            slots: isAr
              ? ["الخميس 4:00 م", "الجمعة 11:30 ص", "السبت 2:00 م"]
              : ["Thu 4:00 PM", "Fri 11:30 AM", "Sat 2:00 PM"],
          };
          break;

        case "insurance":
          replyItem = {
            id: `reva-${Date.now()}`,
            side: "out",
            text: isAr
              ? "نعم! نقبل المطالبات المباشرة مع تأمين ضمان (الدرجة المعززة وثقة)، وAXA / GIG Gulf، وNextCare، وMetLife، وCigna، وSukoon. تغطي معظم الباقات الاستشارات والفحوصات التشخيصية. يرجى إحضار الهوية الإماراتية للتحقق الفوري."
              : "Yes! We accept direct billing with Daman (Enhanced & Thiqa), AXA / GIG Gulf, NextCare, MetLife, and Cigna. Diagnostic scans and consultations are covered by select tiers. Please bring your Emirates ID for verification.",
            time: replyTime,
            slots: isAr
              ? ["الخميس 4:00 م", "الجمعة 11:30 ص", "موقع العيادة"]
              : ["Thu 4:00 PM", "Fri 11:30 AM", "Where are you located in Dubai?"],
          };
          break;

        case "location":
          replyItem = {
            id: `reva-${Date.now()}`,
            side: "out",
            text: isAr
              ? "📍 عيادة ألوكا للعيون: جناح 402، مبنى 64 (مجمع الرازي الطبي)، مدينة دبي للرعاية الصحية (DHCC)، دبي. تتوفر خدمة صف السيارات مجاناً أمام المدخل."
              : "📍 Aloka Eye Clinic: Suite 402, Building 64 (Al Razi Medical Complex), Dubai Healthcare City (DHCC), Dubai. Complimentary patient valet parking is available at the entrance.",
            time: replyTime,
            slots: isAr
              ? ["الخميس 4:00 م", "الجمعة 11:30 ص", "ساعات الدوام"]
              : ["Thu 4:00 PM", "Fri 11:30 AM", "What are your opening hours?"],
          };
          break;

        case "hours":
          replyItem = {
            id: `reva-${Date.now()}`,
            side: "out",
            text: isAr
              ? "ساعات العمل بالعيادة: من السبت إلى الخميس من 9:00 صباحاً حتى 8:00 مساءً (يوم الجمعة مخصص للعمليات الجراحية). مساعد واتساب الذكي متاح لخدمتكم 24/7."
              : "Clinic hours: Saturday to Thursday, 9:00 AM to 8:00 PM (Friday dedicated to elective surgeries). Our WhatsApp AI concierge operates 24/7 for instant bookings and queries.",
            time: replyTime,
            slots: isAr
              ? ["الخميس 4:00 م", "الجمعة 11:30 ص", "كم تكلفة عملية الليزك؟"]
              : ["Thu 4:00 PM", "Fri 11:30 AM", "How much does LASIK cost?"],
          };
          break;

        case "doctor":
          replyItem = {
            id: `reva-${Date.now()}`,
            side: "out",
            text: isAr
              ? "الدكتورة بريا شارما هي استشارية أولى لجراحة القرنية والليزك والعيون (مرخصة من هيئة الصحة بدبي DHA، بخبرة أكثر من 16 عاماً، وأجرت أكثر من 12,000 عملية ناجحة). هل ترغب في حجز استشارة معها؟"
              : "Dr. Priya Sharma is our Senior Consultant Cornea & Refractive Surgeon (DHA Licensed, 16+ years clinical experience, 12,000+ laser vision corrections performed). Shall I schedule your evaluation with her?",
            time: replyTime,
            slots: isAr
              ? ["الخميس 4:00 م", "الجمعة 11:30 ص", "السبت 2:00 م"]
              : ["Thu 4:00 PM", "Fri 11:30 AM", "Sat 2:00 PM"],
          };
          break;

        case "cataract":
          replyItem = {
            id: `reva-${Date.now()}`,
            side: "out",
            text: isAr
              ? "نقدم تقييم وعلاج المياه البيضاء بأحدث تقنيات الفاكو والعدسات المتقدمة مع د. شارما. اختر موعدك المناسب للاستشارة:"
              : "We provide advanced Phaco micro-incision cataract surgery and premium trifocal/toric IOL evaluations with Dr. Sharma. Please choose your slot:",
            time: replyTime,
            slots: isAr
              ? ["الأربعاء 10:00 ص", "الخميس 11:00 ص"]
              : ["Wed 10:00 AM", "Thu 11:00 AM"],
          };
          break;

        case "confirm":
          replyItem = {
            id: `reva-${Date.now()}`,
            side: "out",
            text: isAr
              ? "✅ تم تأكيد موعدك بنجاح في عيادة ألوكا للعيون مع د. شارما! تم إرسال رابط الاستبيان الطبي المسبق لهاتفك."
              : "✅ Confirmed! Your appointment is locked in with Dr. Sharma at Aloka Eye Clinic. A digital pre-consultation intake form has been sent.",
            time: replyTime,
            isConfirmed: true,
          };
          break;

        case "lasik":
        case "book":
        default:
          replyItem = {
            id: `reva-${Date.now()}`,
            side: "out",
            text: isAr
              ? "ممتاز! استشارة وتقييم الليزك تشمل فحص القرنية الطبوغرافي ثلاثي الأبعاد مع الدكتورة شارما. اختر موعدك المفضل أدناه:"
              : "Great! Our LASIK suitability assessment includes 3D corneal topography with Dr. Sharma. Please pick your preferred slot:",
            time: replyTime,
            slots: isAr
              ? ["الخميس 4:00 م", "الجمعة 11:30 ص", "السبت 2:00 م"]
              : ["Thu 4:00 PM", "Fri 11:30 AM", "Sat 2:00 PM"],
          };
          break;
      }

      setMessages((prev) => [...prev, replyItem]);
    }, 850);

    timersRef.current.push(tId);
  };

  const handleSlotClick = (slotText: string) => {
    // If clicked item is an inquiry rather than a specific time slot:
    const isQuestion =
      slotText.includes("?") ||
      slotText.includes("؟") ||
      slotText.includes("located") ||
      slotText.includes("hours") ||
      slotText.includes("cost") ||
      slotText.includes("ساعات") ||
      slotText.includes("تكلفة") ||
      slotText.includes("موقع");

    if (isQuestion) {
      handleSend(slotText);
      return;
    }

    const time = formatTime();
    const userMsg: MessageItem = {
      id: `slot-user-${Date.now()}`,
      side: "in",
      text: slotText,
      time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setActiveBooking({
      title: isAr ? "استشارة ليزك مؤكدة" : "LASIK Consultation",
      slot: slotText,
      doctor: isAr ? "د. شارما" : "Dr. Sharma",
    });

    const tId = window.setTimeout(() => {
      setIsTyping(false);
      const confirmReply: MessageItem = {
        id: `confirm-${Date.now()}`,
        side: "out",
        text: isAr
          ? `✅ تم حجز وتأكيد موعدك بنجاح (${slotText}) مع د. شارما! يُرجى الحضور قبل الموعد بـ 10 دقائق للفحوصات الحيوية.`
          : `✅ Booked & Confirmed! Your appointment for ${slotText} with Dr. Sharma is scheduled. Please arrive 10 minutes prior for vital signs.`,
        time: formatTime(),
        isConfirmed: true,
      };
      setMessages((prev) => [...prev, confirmReply]);
    }, 750);

    timersRef.current.push(tId);
  };

  const quickPrompts = isAr ? QUICK_PROMPTS_AR : QUICK_PROMPTS_EN;

  return (
    <div dir="ltr" className="relative mx-auto w-fit lg:justify-self-center">
      {/* Background glow effects */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-[118%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.18),rgba(16,185,129,0.07)_55%,transparent_78%)]"
      />
      <div
        aria-hidden
        className="absolute -right-10 -top-8 -z-10 size-44 rounded-full bg-aloka-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-10 -left-10 -z-10 size-48 rounded-full bg-aloka-100/60 blur-3xl"
      />

      {/* Floating Grounding Shadow */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 0.94, 1], opacity: [0.75, 0.55, 0.75] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-7 left-1/2 -z-10 h-10 w-[62%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(15,23,42,0.16),transparent)] blur-[6px]"
      />

      {/* Dynamic Floating Badge 1 — Recovered Call (Right Side completely outside phone) */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.5, ease: EASE }}
        className="group absolute left-[calc(100%+16px)] bottom-24 z-20 hidden xl:block"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300 group-hover:border-aloka-400 group-hover:shadow-[0_16px_40px_rgba(16,185,129,0.22)] group-hover:-translate-x-1"
        >
          {/* Interactive Connecting Arrow pointing left into the phone */}
          <div className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 flex items-center">
            <svg
              className="w-4 h-4 text-aloka-500 overflow-visible transition-transform duration-300 group-hover:scale-125 group-hover:-translate-x-0.5"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M 14 8 L 2 8"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 2"
              />
              <polygon
                points="4,5 0,8 4,11"
                fill="#059669"
              />
            </svg>
          </div>

          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aloka-50 text-aloka-600 ring-2 ring-aloka-100 group-hover:scale-105 transition-transform">
            <PhoneIncoming className="size-4" />
          </span>
          <div>
            <p className="text-[12px] font-bold text-slate-900 whitespace-nowrap">
              {t.mockup.cardRecoveredTitle}
            </p>
            <p className="text-[10.5px] font-medium text-slate-400 whitespace-nowrap">
              {t.mockup.cardRecoveredSub}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Dynamic Floating Badge 2 — Live Booking Badge (Left Side completely outside phone) */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
        className="group absolute right-[calc(100%+16px)] top-16 z-20 hidden xl:block"
      >
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-[215px] rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300 group-hover:border-aloka-400 group-hover:shadow-[0_16px_40px_rgba(16,185,129,0.22)] group-hover:translate-x-1"
        >
          {/* Interactive Connecting Arrow pointing right into the phone */}
          <div className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 flex items-center">
            <svg
              className="w-4 h-4 text-aloka-500 overflow-visible transition-transform duration-300 group-hover:scale-125 group-hover:translate-x-0.5"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M 2 8 L 14 8"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 2"
              />
              <polygon
                points="12,5 16,8 12,11"
                fill="#059669"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-[17px] shrink-0 text-aloka-500" />
            <p className="text-[12px] font-bold text-slate-900">
              {t.mockup.cardBookingTitle}
            </p>
          </div>
          <p className="mt-1 pl-[25px] text-[11px] font-medium text-slate-500 truncate">
            {activeBooking.title}
          </p>
          <div className="mt-2 ml-[25px] flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-aloka-50 px-2 py-0.5 text-[9.5px] font-bold text-aloka-700 ring-1 ring-aloka-200/50">
              {activeBooking.slot}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9.5px] font-bold text-slate-500">
              {activeBooking.doctor}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* iPhone frame */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: EASE }}
      >
        <div className="relative w-[310px] select-none sm:w-[340px]">
          <div className="rounded-[46px] bg-[#0F172A] p-[11px] shadow-[0_32px_90px_rgba(15,23,42,0.22)]">
            <div className="relative flex h-[620px] flex-col overflow-hidden rounded-[36px] bg-[#ECE5DD]">
              {/* Dynamic island */}
              <div className="absolute left-1/2 top-2.5 z-20 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-[#0F172A]" />

              {/* WhatsApp header */}
              <div className="bg-aloka-700 pb-2.5 text-white shadow-sm">
                <div className="flex items-center justify-between px-7 pt-2 text-[10.5px] font-semibold tracking-wide">
                  <span>4:03</span>
                  <span className="flex items-center gap-1.5">
                    <Signal className="size-3" />
                    <Wifi className="size-3" />
                    <BatteryFull className="size-4" />
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 pt-2.5">
                  <ChevronLeft className="size-[18px] text-white/90" />
                  <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                    <Eye className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="flex items-center gap-1.5 truncate text-[13px] font-bold">
                      Aloka Eye Clinic
                      <span className="rounded bg-white/15 px-1.5 py-px text-[8.5px] font-semibold tracking-wide text-white/90">
                        {t.mockup.business}
                      </span>
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-emerald-100/90">
                      <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      {t.mockup.online}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <button
                      onClick={resetConversation}
                      title="Reset chat"
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <RotateCcw className="size-[14px]" />
                    </button>
                    <Video className="size-[16px]" />
                    <Phone className="size-[14px]" />
                  </div>
                </div>
              </div>

              {/* Chat Scroll Area */}
              <div
                ref={chatContainerRef}
                className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3 no-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="mx-auto flex flex-col items-center gap-1 my-1">
                  <span className="rounded-md bg-white/75 px-2.5 py-0.5 text-[9px] font-semibold tracking-wide text-slate-500 shadow-xs">
                    {t.mockup.today}
                  </span>
                  <span className="flex items-center gap-1 text-[8.5px] font-medium text-slate-500/90">
                    <Lock className="size-2.5" />
                    {t.mockup.encrypted}
                  </span>
                </div>

                {/* Messages */}
                {messages.map((msg) => {
                  const isUser = msg.side === "in";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className={cn(
                        "max-w-[86%] px-3 py-2 shadow-xs",
                        isUser
                          ? "self-end rounded-2xl rounded-tr-xs bg-[#DCF8C6]"
                          : "self-start rounded-2xl rounded-tl-xs bg-white"
                      )}
                    >
                      <p className="text-[12.5px] leading-snug text-slate-800 break-words">
                        {msg.text}
                      </p>

                      {/* Interactive Slot Buttons if any */}
                      {msg.slots && msg.slots.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                          <p className="text-[10px] font-bold text-aloka-700 flex items-center gap-1">
                            <Sparkles className="size-3 text-aloka-600" />
                            {isAr ? "المواعيد المتاحة:" : "Select an available slot:"}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.slots.map((slot) => (
                              <button
                                key={slot}
                                onClick={() => handleSlotClick(slot)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-aloka-50 text-aloka-800 border border-aloka-200 hover:bg-aloka-600 hover:text-white hover:border-aloka-600 transition-all shadow-xs active:scale-95"
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <p
                        className={cn(
                          "mt-1 flex items-center gap-1 text-[9px] font-medium text-slate-400",
                          isUser ? "justify-end" : "justify-start"
                        )}
                      >
                        {msg.time}
                        {isUser && <CheckCheck className="size-3 text-aloka-500" />}
                      </p>
                    </motion.div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="self-start flex items-center gap-1 rounded-2xl rounded-tl-xs bg-white px-3.5 py-[11px] shadow-xs"
                  >
                    {[0, 0.18, 0.36].map((d) => (
                      <span
                        key={d}
                        className="size-[6px] animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: `${d}s` }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Quick suggestion chips (above input) */}
              <div className="bg-[#F0EBE3] px-2.5 pt-1.5 pb-1 border-t border-slate-200/60 overflow-x-auto flex gap-1.5 no-scrollbar">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-[10.5px] font-semibold text-slate-700 border border-slate-200/80 shadow-xs hover:border-aloka-300 hover:text-aloka-800 transition-all shrink-0 active:scale-95"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Interactive Input bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 bg-[#F0EBE3] px-2.5 pb-3 pt-1"
              >
                <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-3.5 shadow-xs border border-slate-200/80">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isAr
                        ? "اكتب رسالة (مثال: حجز موعد ليزك)..."
                        : "Type message (e.g. LASIK consultation)..."
                    }
                    className="flex-1 bg-transparent text-[12px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-all",
                    inputText.trim()
                      ? "bg-aloka-600 hover:bg-aloka-700 scale-105 active:scale-95 cursor-pointer"
                      : "bg-aloka-600/75 opacity-90 cursor-default"
                  )}
                >
                  {inputText.trim() ? (
                    <Send className="size-4 translate-x-0.5" />
                  ) : (
                    <Mic className="size-[17px]" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
