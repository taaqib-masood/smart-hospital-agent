"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Check,
  CheckCheck,
  FileText,
  Download,
  Play,
  Pause,
  Clock,
  Calendar,
  CreditCard,
  MapPin,
  Sparkles,
  User,
  Shield,
  X,
  Plus,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Pill,
  Activity
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { sendMessage, markConversationRead, getMessages } from "@/lib/api";
import type { RevaConversation, RevaMessage } from "@/lib/supabase/types";

interface MessagesViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type MessageType = "text" | "booking_card" | "rx_attachment" | "voice_note" | "lab_attachment";

interface ChatMessage {
  id: string;
  from: "reva" | "patient";
  text?: string;
  time: string;
  type?: MessageType;
  meta?: {
    slots?: string[];
    fileName?: string;
    fileSize?: string;
    duration?: string;
    audioBars?: number[];
    reportType?: string;
  };
}

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
  initials: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  statusText: string;
  category: "appointment" | "followup" | "general";
  tag: string;
  upcomingAppt?: string;
  bloodGroup?: string;
  allergies?: string[];
  messages: ChatMessage[];
  _realId?: string;
}

const DEFAULT_CONTACTS: WhatsAppContact[] = [
  {
    id: "c1",
    name: "Sarah Al-Hashimi",
    phone: "+971 50 892 4110",
    avatarColor: "bg-[#00685f]",
    initials: "SA",
    lastMessage: "✅ Booked & Confirmed! Dental Implant Consultation tomorrow at 10:30 AM",
    lastMessageTime: "10:18 AM",
    unreadCount: 0,
    isOnline: true,
    statusText: "online",
    category: "appointment",
    tag: "Implant Consultation Booked",
    upcomingAppt: "Tomorrow, 10:30 AM (Dental Implant Consultation)",
    bloodGroup: "O+",
    allergies: ["None recorded"],
    messages: [
      {
        id: "m1",
        from: "patient",
        text: "I want to ask about dental implants.",
        time: "10:14 AM",
        type: "text",
      },
      {
        id: "m2",
        from: "reva",
        text: "Hello and welcome to Dar Basmah Dental Center, Dubai! 👋\n\nTo assist you promptly, please select your preferred language:\n1️⃣ English 🇬🇧\n2️⃣ العربية 🇦🇪",
        time: "10:14 AM",
        type: "text",
      },
      {
        id: "m3",
        from: "patient",
        text: "English 🇬🇧",
        time: "10:15 AM",
        type: "text",
      },
      {
        id: "m4",
        from: "reva",
        text: "Thank you! Which dental implant service can we help you with today?\n\n• Single Dental Implant (Swiss / Straumann)\n• Full Arch Reconstruction (All-on-4 / All-on-6)\n• Specialist Consultation & 3D CBCT Scan",
        time: "10:15 AM",
        type: "text",
      },
      {
        id: "m5",
        from: "patient",
        text: "Single Dental Implant & 3D Scan with Dr. Basmah.",
        time: "10:16 AM",
        type: "text",
      },
      {
        id: "m6",
        from: "reva",
        text: "Dr. Basmah (Lead Implantologist) is available at our Jumeirah 1 center this week.\n\nWould you prefer to lock in a consultation slot directly, or request a callback from our implant coordinator?",
        time: "10:16 AM",
        type: "text",
      },
      {
        id: "m7",
        from: "patient",
        text: "I'd like to book an appointment slot directly for tomorrow morning please.",
        time: "10:17 AM",
        type: "text",
      },
      {
        id: "m8",
        from: "reva",
        text: "Here are the open consultation slots with Dr. Basmah for tomorrow:",
        time: "10:17 AM",
        type: "booking_card",
        meta: {
          slots: ["Tomorrow 10:30 AM", "Tomorrow 11:45 AM", "Tomorrow 02:30 PM"],
        },
      },
      {
        id: "m9",
        from: "patient",
        text: "Tomorrow 10:30 AM works perfectly.",
        time: "10:18 AM",
        type: "text",
      },
      {
        id: "m10",
        from: "reva",
        text: "✅ Booked & Confirmed!\n\n📍 Patient: Sarah Al-Hashimi\n🩺 Service: Dental Implant Consultation & 3D CT Scan\n👩‍⚕️ Doctor: Dr. Basmah\n📅 Slot: Tomorrow at 10:30 AM\n🏢 Location: Dar Basmah Dental Clinic, Jumeirah 1, Dubai\n\nA confirmation SMS and calendar invite have been sent. Please arrive 10 minutes prior for initial scans.",
        time: "10:18 AM",
        type: "text",
      },
    ],
  },
  {
    id: "c2",
    name: "Rahul Gupta",
    phone: "+971 55 234 5678",
    avatarColor: "bg-teal-700",
    initials: "RG",
    lastMessage: "Thank you doctor! Should I take the Paracetamol after meals?",
    lastMessageTime: "08:45 AM",
    unreadCount: 1,
    isOnline: false,
    statusText: "last seen today at 8:45 AM",
    category: "followup",
    tag: "Digital Rx Dispatched",
    upcomingAppt: "In 2 weeks (Follow-up)",
    bloodGroup: "O+",
    allergies: [],
    messages: [
      {
        id: "rg1",
        from: "patient",
        text: "Hi doctor, I finished my consultation earlier today. Could you please send me a digital copy of my prescription?",
        time: "08:14 AM",
        type: "text",
      },
      {
        id: "rg2",
        from: "reva",
        text: "Hello Rahul! Here is your verified digital prescription PDF from Dr. Basmah:",
        time: "08:15 AM",
        type: "rx_attachment",
        meta: {
          fileName: "Rx_DarBasmah_RahulGupta_2026.pdf",
          fileSize: "1.2 MB",
        },
      },
      {
        id: "rg3",
        from: "patient",
        text: "Thank you doctor! Should I take the Paracetamol after meals?",
        time: "08:45 AM",
        type: "text",
      },
      {
        id: "rg4",
        from: "reva",
        text: "Yes, take 1 tablet Paracetamol 500mg after meals, 3 times a day. Stay well hydrated!",
        time: "08:46 AM",
        type: "text",
      },
    ],
  },
  {
    id: "c3",
    name: "Ananya Nair",
    phone: "+971 52 345 6789",
    avatarColor: "bg-emerald-700",
    initials: "AN",
    lastMessage: "Voice note received (0:42)",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    isOnline: true,
    statusText: "online",
    category: "general",
    tag: "Voice Inquiry",
    upcomingAppt: "Saturday, 11:30 AM (Dental)",
    bloodGroup: "A+",
    allergies: ["Penicillin"],
    messages: [
      {
        id: "an1",
        from: "patient",
        text: "Hello doctor, sending a quick audio message describing my wisdom tooth pain.",
        time: "Yesterday 4:10 PM",
        type: "voice_note",
        meta: {
          duration: "0:42",
          audioBars: [20, 45, 80, 60, 30, 90, 75, 40, 65, 85, 30, 50, 70, 95, 40, 25, 60, 80, 45, 30],
        },
      },
      {
        id: "an2",
        from: "reva",
        text: "We have reviewed your symptoms. Dr. Basmah recommends a dental extraction evaluation. We have reserved Saturday at 11:30 AM for you.",
        time: "Yesterday 4:12 PM",
        type: "text",
      },
    ],
  },
  {
    id: "c4",
    name: "Vikram Patel",
    phone: "+971 58 456 7890",
    avatarColor: "bg-[#005049]",
    initials: "VP",
    lastMessage: "Lab investigation report attached.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    statusText: "last seen yesterday at 6:00 PM",
    category: "appointment",
    tag: "Lab Reports Ready",
    upcomingAppt: "Monday, 12:00 PM",
    bloodGroup: "AB+",
    allergies: ["Aspirin"],
    messages: [
      {
        id: "vp1",
        from: "patient",
        text: "Good afternoon, are my diagnostic blood test and lipid reports from Al Zahra ready yet?",
        time: "Yesterday 3:28 PM",
        type: "text",
      },
      {
        id: "vp2",
        from: "reva",
        text: "Hi Vikram, your Fasting Blood Sugar and Lipid Profile reports from Al Zahra Diagnostics, Dubai are ready:",
        time: "Yesterday 3:30 PM",
        type: "lab_attachment",
        meta: {
          fileName: "LabReport_VikramPatel_CBC_Lipid.pdf",
          fileSize: "2.4 MB",
          reportType: "Lipid Profile & HbA1c",
        },
      },
      {
        id: "vp3",
        from: "patient",
        text: "Received, thank you! I will discuss the values with Dr. Basmah during my Monday visit.",
        time: "Yesterday 3:45 PM",
        type: "text",
      },
    ],
  },
];

const QUICK_REPLIES = [
  "⚡ Escalate to Coordinator",
  "✅ Confirm Appointment",
  "📍 Clinic Location & Directions",
  "💳 Send Digital Payment Link (AED)",
  "📄 Send Digital Rx PDF",
  "⭐ Request Google Review",
];

export default function MessagesView({ addToast }: MessagesViewProps) {
  const { conversations: realConvos, refresh } = useDashboard();
  const [contacts, setContacts] = useState<WhatsAppContact[]>(DEFAULT_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>("c1");
  const [takenOverIds, setTakenOverIds] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "appointment" | "followup">("all");
  const [inputText, setInputText] = useState("");
  const [isTypingAI, setIsTypingAI] = useState(false);
  const [showDossier, setShowDossier] = useState(true);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeContact?.messages, isTypingAI]);

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (filterTab === "all") return true;
    if (filterTab === "unread") return c.unreadCount > 0;
    return c.category === filterTab;
  });

  const handleSendMessage = (textToSend?: string) => {
    const msg = (textToSend || inputText).trim();
    if (!msg) return;

    const newMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      from: "reva",
      text: msg,
      time: new Date().toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };

    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? {
              ...c,
              lastMessage: msg,
              lastMessageTime: newMsg.time,
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setInputText("");
    setShowAttachMenu(false);
    addToast("WhatsApp message dispatched ✓", "success");

    // Simulate smart patient auto-response after 1.5s
    setTimeout(() => {
      setIsTypingAI(true);
      setTimeout(() => {
        setIsTypingAI(false);
        const replyMsg: ChatMessage = {
          id: "reply-" + Date.now(),
          from: "patient",
          text: "Thank you Dr. Sharma! I will follow these instructions.",
          time: new Date().toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" }),
          type: "text",
        };
        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContactId
              ? {
                  ...c,
                  lastMessage: replyMsg.text!,
                  lastMessageTime: replyMsg.time,
                  messages: [...c.messages, replyMsg],
                }
              : c
          )
        );
      }, 1800);
    }, 800);
  };

  const handleQuickReply = (chip: string) => {
    if (chip.includes("Escalate")) {
      const escMsg: ChatMessage = {
        id: "esc-" + Date.now(),
        from: "reva",
        text: "📌 [Staff Escalation]: Please have the implant coordinator call this patient regarding 3D CBCT scan review and bone graft evaluation.",
        time: new Date().toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      };
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? {
                ...c,
                tag: "Escalated: Coordinator Call",
                lastMessage: "📌 Escalation note dispatched to implant coordinator",
                lastMessageTime: escMsg.time,
                messages: [...c.messages, escMsg],
              }
            : c
        )
      );
      addToast("Escalated: Implant coordinator notified for patient callback ✓", "success");
    } else if (chip.includes("Confirm Appointment")) {
      handleSendMessage("Your appointment is confirmed with Dr. Basmah at Dar Basmah Clinic. Please arrive 10 minutes prior.");
    } else if (chip.includes("Clinic Location")) {
      handleSendMessage("📍 Dar Basmah Dental Center: Villa 12, Jumeirah 1 (near Jumeirah Mosque), Dubai, UAE. Complimentary valet parking available.");
    } else if (chip.includes("Payment Link")) {
      handleSendMessage("💳 Here is your secure digital consultation payment link: https://reva.ae/pay/inv_904 (AED 500)");
    } else if (chip.includes("Prescription")) {
      handleSendMessage("📄 Please find your digital prescription attached. Feel free to message here for any medication queries.");
    } else if (chip.includes("Google Review")) {
      handleSendMessage("⭐ We hope you had a great consultation! Would you take 30 seconds to rate Dar Basmah Clinic on Google? https://g.page/r/darbasmah");
    } else {
      handleSendMessage(chip);
    }
  };

  const toggleVoicePlayback = (id: string) => {
    setPlayingVoiceId(playingVoiceId === id ? null : id);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white border border-[#CCD5DF] rounded-2xl overflow-hidden shadow-xs">
      {/* ── LEFT PANEL: WhatsApp Chat List (340px) ─────────────────────────────────── */}
      <div className="w-[340px] shrink-0 border-r border-[#CCD5DF] bg-[#F8FAFC] flex flex-col">
        {/* User Header */}
        <div className="p-3.5 border-b border-[#CCD5DF] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00685f] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              DS
            </div>
            <div>
              <p className="font-bold text-xs text-[#0F172A] leading-tight">Dr. Sharma&apos;s Clinic</p>
              <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> WhatsApp Business Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => addToast("Starting new WhatsApp conversation", "info")}
              className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-colors"
              title="New Chat"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2.5 border-b border-[#CCD5DF] bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats or mobile..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#CCD5DF] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f] transition-all"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-3 py-2 border-b border-[#CCD5DF] bg-[#F8FAFC] flex gap-1.5 overflow-x-auto text-[11px]">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "appointment", label: "Appointments" },
            { id: "followup", label: "Follow-ups" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-all ${
                filterTab === tab.id
                  ? "bg-[#00685f] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-[#CCD5DF] hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conversations Scroll List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#CCD5DF]">
          {filteredContacts.map((c) => {
            const isSelected = activeContactId === c.id;
            return (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                key={c.id}
                onClick={() => {
                  setActiveContactId(c.id);
                  setContacts((prev) =>
                    prev.map((item) => (item.id === c.id ? { ...item, unreadCount: 0 } : item))
                  );
                }}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                  isSelected ? "bg-teal-50/70 border-l-4 border-[#00685f]" : "bg-white hover:bg-slate-50"
                }`}
              >
                {/* Avatar with Online indicator */}
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full ${c.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs`}
                  >
                    {c.initials}
                  </div>
                  {c.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <p className="font-bold text-xs text-[#0F172A] truncate">{c.name}</p>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0">{c.lastMessageTime}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate leading-tight mb-1">
                    {c.lastMessage}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#00685f] bg-[#00685f]/10 px-1.5 py-0.5 rounded">
                      {c.tag}
                    </span>

                    {c.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#00685f] text-white text-[10px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── CENTER PANEL: WhatsApp Chat Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5]/25 relative min-w-0">
        {/* WhatsApp Chat Top Header */}
        <div className="h-16 px-4 bg-[#F8FAFC] border-b border-[#CCD5DF] flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-9 h-9 rounded-full ${activeContact.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs`}
              >
                {activeContact.initials}
              </div>
              {activeContact.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-[#0F172A] leading-tight">{activeContact.name}</h3>
                {takenOverIds[activeContact.id] ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Receptionist Takeover
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#00685f]" />
                    Reva AI Active
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <span className="font-mono">{activeContact.phone}</span> •{" "}
                <span className={activeContact.isOnline ? "text-emerald-700 font-bold" : "text-slate-400"}>
                  {activeContact.statusText}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Take Over / Resume AI Button */}
            <button
              onClick={() => {
                const nextState = !takenOverIds[activeContact.id];
                setTakenOverIds((prev) => ({ ...prev, [activeContact.id]: nextState }));
                if (nextState) {
                  addToast("Receptionist Takeover Active — Reva AI paused for this chat", "info");
                } else {
                  addToast("Reva AI resumed for this conversation ✓", "success");
                }
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all ${
                takenOverIds[activeContact.id]
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-[#00685f] hover:bg-[#005049] text-white"
              }`}
            >
              {takenOverIds[activeContact.id] ? (
                <>
                  <Sparkles size={13} /> Resume AI
                </>
              ) : (
                <>
                  <User size={13} /> Take over
                </>
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            <motion.button whileTap={{ scale: 0.9 }} onClick={() => addToast(`Calling ${activeContact.name}...`, "info")} className="p-2 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-colors" title="Voice Call"><Phone size={15} /></motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => addToast(`Starting video consultation with ${activeContact.name}...`, "info")} className="p-2 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-colors" title="Video Consult"><Video size={16} /></motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowDossier(!showDossier)} className={`p-2 rounded-lg transition-colors ${showDossier ? "bg-[#00685f]/15 text-[#00685f]" : "hover:bg-slate-200 hover:text-slate-700"}`} title="Toggle Patient Dossier"><User size={16} /></motion.button>
          </div>
        </div>

        {/* Escalation & Takeover Banner */}
        {takenOverIds[activeContact.id] && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Receptionist Takeover Active • Reva AI auto-responses paused for this patient.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const escMsg: ChatMessage = {
                    id: "esc-" + Date.now(),
                    from: "reva",
                    text: "📌 [Staff Escalation]: Please have the implant coordinator call this patient regarding 3D CBCT scan review and bone graft evaluation.",
                    time: new Date().toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" }),
                    type: "text",
                  };
                  setContacts((prev) =>
                    prev.map((c) =>
                      c.id === activeContactId
                        ? {
                            ...c,
                            tag: "Escalated: Coordinator Call",
                            lastMessage: "📌 Escalation note dispatched to implant coordinator",
                            lastMessageTime: escMsg.time,
                            messages: [...c.messages, escMsg],
                          }
                        : c
                    )
                  );
                  addToast("Escalated: Implant coordinator notified for patient callback ✓", "success");
                }}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                ⚡ &ldquo;Please have the implant coordinator call this patient.&rdquo;
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp Chat Canvas with Authentic Doodle Wallpaper */}
        <div
          className="flex-1 overflow-y-auto p-5 space-y-3 relative"
          style={{
            backgroundImage: `radial-gradient(#00685f 0.4px, transparent 0.4px), radial-gradient(#CCD5DF 0.4px, #f7f9fb 0.4px)`,
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        >
          {/* Floating Date Badge */}
          <div className="flex justify-center my-2">
            <span className="bg-white/90 backdrop-blur-xs border border-[#CCD5DF] text-slate-500 font-bold text-[10px] px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
              Today
            </span>
          </div>

          {/* Messages */}
          <AnimatePresence initial={false}>
          {activeContact.messages.map((m) => {
            const isOutbound = m.from === "reva";

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.85, y: 15, originX: isOutbound ? 1 : 0, originY: 1 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                key={m.id} 
                className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-3.5 text-xs shadow-xs relative ${
                    isOutbound
                      ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-emerald-200/60"
                      : "bg-white text-[#111b21] rounded-tl-none border border-[#CCD5DF]"
                  }`}
                >
                  {/* Standard Text */}
                  {m.text && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}

                  {/* Interactive Booking Card */}
                  {m.type === "booking_card" && m.meta?.slots && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-300/50 space-y-2">
                      <p className="text-[11px] font-bold text-[#00685f]">Available Slots with Dr. Sharma:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.meta.slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => handleSendMessage(`I'd like to book ${slot}`)}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[10px] rounded-lg shadow-2xs transition-colors"
                          >
                            📅 {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rx Attachment Card */}
                  {m.type === "rx_attachment" && (
                    <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-[10px]">
                          PDF
                        </div>
                        <div>
                          <p className="font-bold text-[11px] text-[#0F172A] truncate max-w-[180px]">
                            {m.meta?.fileName || "Prescription.pdf"}
                          </p>
                          <p className="text-[9px] text-slate-400">{m.meta?.fileSize || "1.2 MB"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToast("Opening prescription preview...", "info")}
                        className="px-2 py-1 bg-[#00685f] hover:bg-[#005049] text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-2xs"
                      >
                        <Download size={11} /> View
                      </button>
                    </div>
                  )}

                  {/* Lab Attachment Card */}
                  {m.type === "lab_attachment" && (
                    <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[#00685f] flex items-center justify-center font-bold text-[10px]">
                          LAB
                        </div>
                        <div>
                          <p className="font-bold text-[11px] text-[#0F172A] truncate max-w-[180px]">
                            {m.meta?.reportType || "Diagnostic Report"}
                          </p>
                          <p className="text-[9px] text-slate-400">{m.meta?.fileSize || "2.4 MB"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToast("Opening diagnostic report...", "info")}
                        className="px-2 py-1 bg-[#00685f] hover:bg-[#005049] text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-2xs"
                      >
                        <Download size={11} /> PDF
                      </button>
                    </div>
                  )}

                  {/* Voice Note Player */}
                  {m.type === "voice_note" && (
                    <div className="mt-2.5 p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center gap-3">
                      <button
                        onClick={() => toggleVoicePlayback(m.id)}
                        className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center shrink-0 shadow-2xs"
                      >
                        {playingVoiceId === m.id ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                      </button>

                      {/* Equalizer Bars */}
                      <div className="flex-1 flex items-center gap-0.5 h-6">
                        {(m.meta?.audioBars || [30, 60, 40, 90, 70, 40, 80, 50, 60, 30]).map((h, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full transition-all ${
                              playingVoiceId === m.id ? "bg-[#00685f] animate-pulse" : "bg-slate-300"
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>

                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        {m.meta?.duration || "0:38"}
                      </span>
                    </div>
                  )}

                  {/* Timestamp & Double Checkmarks */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                    <span>{m.time}</span>
                    {isOutbound && <CheckCheck size={12} className="text-[#53bdeb]" />}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* AI Typing Simulator Indicator */}
          </AnimatePresence>

          <AnimatePresence>
          {isTypingAI && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, originX: 0, originY: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-[#CCD5DF] rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 shadow-xs">
                <span className="text-[11px] font-bold text-[#00685f]">Reva AI is typing</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Preset Chips Bar */}
        <div className="px-4 py-2 bg-[#F8FAFC] border-t border-[#CCD5DF] flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Quick Action:</span>
          {QUICK_REPLIES.map((chip) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              key={chip}
              onClick={() => handleQuickReply(chip)}
              className="px-2.5 py-1 bg-white hover:bg-teal-50/80 border border-[#CCD5DF] hover:border-[#00685f] text-slate-700 hover:text-[#00685f] font-bold rounded-lg whitespace-nowrap transition-colors shadow-2xs"
            >
              {chip}
            </motion.button>
          ))}
        </div>

        {/* WhatsApp Message Input Bar */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#CCD5DF] flex items-center gap-2 relative">
          {/* Emoji Trigger */}
          <button
            onClick={() => addToast("Emoji picker", "info")}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Smile size={18} />
          </button>

          {/* Attachment Paperclip */}
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`p-1.5 rounded-lg transition-colors ${
                showAttachMenu ? "bg-[#00685f]/15 text-[#00685f]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Paperclip size={18} />
            </button>

            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-12 left-0 w-48 bg-white border border-[#CCD5DF] rounded-xl shadow-xl p-2 z-30 space-y-1 text-xs font-bold text-slate-700"
                >
                  <button
                    onClick={() => {
                      handleSendMessage("📄 [Attachment]: Digital Prescription PDF");
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-teal-50 hover:text-[#00685f] rounded-lg flex items-center gap-2"
                  >
                    <FileText size={14} className="text-rose-500" /> Prescription (PDF)
                  </button>
                  <button
                    onClick={() => {
                      handleSendMessage("🔬 [Attachment]: Diagnostic Lab Investigation Report");
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-teal-50 hover:text-[#00685f] rounded-lg flex items-center gap-2"
                  >
                    <Activity size={14} className="text-teal-600" /> Lab Report
                  </button>
                  <button
                    onClick={() => {
                      handleSendMessage("💳 [Payment Link]: Digital Payment Request for AED 350");
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-teal-50 hover:text-[#00685f] rounded-lg flex items-center gap-2"
                  >
                    <CreditCard size={14} className="text-amber-500" /> Invoice Payment Link
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a WhatsApp message..."
            className="flex-1 px-4 py-2.5 bg-white border border-[#CCD5DF] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f] shadow-2xs transition-colors"
          />

          {/* Send or Voice Record Button */}
          {inputText.trim() ? (
            <button
              onClick={() => handleSendMessage()}
              className="px-4 py-2.5 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Send size={13} /> Send
            </button>
          ) : (
            <button
              onClick={() => addToast("Voice note recording started 🎙️", "info")}
              className="w-9 h-9 bg-white border border-[#CCD5DF] text-[#00685f] hover:bg-slate-100 flex items-center justify-center rounded-xl shadow-2xs transition-colors"
              title="Record Voice Note"
            >
              <Mic size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Collapsible Patient Dossier (280px) ─────────────────────────── */}
      <AnimatePresence>
        {showDossier && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="shrink-0 border-l border-[#CCD5DF] bg-[#F8FAFC] flex flex-col overflow-hidden"
          >
            {/* Dossier Header */}
            <div className="p-4 border-b border-[#CCD5DF] bg-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Patient Dossier</h3>
              <button onClick={() => setShowDossier(false)} className="text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              {/* Profile Card */}
              <div className="bg-white border border-[#CCD5DF] rounded-xl p-4 shadow-xs text-center space-y-2">
                <div
                  className={`w-14 h-14 rounded-full ${activeContact.avatarColor} text-white font-bold text-base mx-auto flex items-center justify-center shadow-xs`}
                >
                  {activeContact.initials}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">{activeContact.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">{activeContact.phone}</p>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00685f]/10 text-[#00685f] border border-[#00685f]/20">
                  {activeContact.tag}
                </span>
              </div>

              {/* Upcoming Appointment */}
              <div className="bg-white border border-[#CCD5DF] rounded-xl p-3.5 shadow-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Next Scheduled Visit
                </span>
                <p className="font-bold text-xs text-[#00685f]">
                  {activeContact.upcomingAppt || "No upcoming appointment"}
                </p>
              </div>

              {/* Clinical Vitals & Flags */}
              <div className="bg-white border border-[#CCD5DF] rounded-xl p-3.5 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Medical Summary
                </span>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Blood Group:</span>
                  <span className="font-bold text-[#0F172A]">{activeContact.bloodGroup || "B+"}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Allergies:</span>
                  {activeContact.allergies && activeContact.allergies.length > 0 ? (
                    <span className="font-bold text-rose-700 bg-rose-50 px-1.5 rounded">
                      {activeContact.allergies.join(", ")}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">None Reported</span>
                  )}
                </div>
              </div>

              {/* Quick Clinical Triggers */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => addToast(`Opening Rx Builder for ${activeContact.name}`, "info")}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-[#CCD5DF] text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Pill size={13} className="text-[#00685f]" /> Create Digital Rx
                </button>
                <button
                  onClick={() => addToast(`Collecting payment from ${activeContact.name}`, "info")}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-[#CCD5DF] text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <CreditCard size={13} className="text-emerald-600" /> Collect Deposit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
