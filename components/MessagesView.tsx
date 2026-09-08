"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Phone,
  Paperclip,
  Smile,
  Mic,
  CheckCheck,
  Play,
  Pause,
  CreditCard,
  Sparkles,
  User,
  X,
  Plus,
  Shield,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { sendMessage, markConversationRead, getMessages, setConversationAutomation } from "@/lib/api";
import type { RevaMessage } from "@/lib/supabase/types";

interface MessagesViewProps {
  addToast: (msg: string, type: "success" | "info" | "warn") => void;
}

type MessageType = "text" | "booking_card" | "voice_note";

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
        text: "✅ Booked & Confirmed!\n\n📍 Patient: Sarah Al-Hashimi\n🩺 Service: Dental Implant Consultation\n👩‍⚕️ Practitioner: Dr. Basmah\n📅 Slot: Tomorrow at 10:30 AM\n\nPlease arrive 10 minutes before your appointment.",
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
    lastMessage: "Can you move my follow-up to next week?",
    lastMessageTime: "08:45 AM",
    unreadCount: 1,
    isOnline: false,
    statusText: "last seen today at 8:45 AM",
    category: "followup",
    tag: "Reschedule Requested",
    upcomingAppt: "In 2 weeks (Follow-up)",
    messages: [
      {
        id: "rg1",
        from: "patient",
        text: "Hi, I need to move my follow-up appointment to next week.",
        time: "08:14 AM",
        type: "text",
      },
      {
        id: "rg2",
        from: "reva",
        text: "Of course. Which day next week would suit you?",
        time: "08:15 AM",
        type: "text",
      },
      {
        id: "rg3",
        from: "patient",
        text: "Tuesday afternoon, if available.",
        time: "08:45 AM",
        type: "text",
      },
      {
        id: "rg4",
        from: "reva",
        text: "A receptionist is checking Tuesday afternoon and will confirm shortly.",
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
    messages: [
      {
        id: "an1",
        from: "patient",
        text: "Hello, I am sending a voice note about the appointment time I prefer.",
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
        text: "Thank you. Your voice note was received and a receptionist will help confirm an available appointment.",
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
    lastMessage: "Consent link received, thank you.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    statusText: "last seen yesterday at 6:00 PM",
    category: "appointment",
    tag: "Consent Pending",
    upcomingAppt: "Monday, 12:00 PM",
    messages: [
      {
        id: "vp1",
        from: "patient",
        text: "Good afternoon, can you resend the consent form for Monday's appointment?",
        time: "Yesterday 3:28 PM",
        type: "text",
      },
      {
        id: "vp2",
        from: "reva",
        text: "Yes. A new secure consent link has been sent to this WhatsApp number.",
        time: "Yesterday 3:30 PM",
        type: "text",
      },
      {
        id: "vp3",
        from: "patient",
        text: "Consent link received, thank you.",
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
  "🗓️ Ask for Preferred Time",
];

export default function MessagesView({ addToast }: MessagesViewProps) {
  const { clinic, conversations: realConvos, refresh } = useDashboard();
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
  const localMessageId = useRef(0);
  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  useEffect(() => {
    if (!realConvos.length) return;
    const mapped = realConvos.map((conversation) => {
      const name = conversation.contact_name || conversation.contact_phone;
      return {
        id: conversation.id,
        _realId: conversation.id,
        name,
        phone: conversation.contact_phone,
        avatarColor: "bg-[#00685f]",
        initials: name.split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "WA",
        lastMessage: conversation.last_message || "No messages yet",
        lastMessageTime: new Date(conversation.last_message_at).toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" }),
        unreadCount: conversation.unread_count,
        isOnline: false,
        statusText: conversation.is_bot_active ? "automation active" : "with receptionist",
        category: "general" as const,
        tag: conversation.is_bot_active ? "Automated" : "Receptionist takeover",
        messages: [],
      };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContacts(mapped);
    setTakenOverIds(Object.fromEntries(realConvos.map(conversation => [conversation.id, !conversation.is_bot_active])));
    setActiveContactId(current => mapped.some(contact => contact.id === current) ? current : mapped[0].id);
  }, [realConvos]);

  useEffect(() => {
    if (!activeContact?._realId) return;
    void getMessages(activeContact._realId).then(messages => {
      setContacts(previous => previous.map(contact => contact.id === activeContact.id ? {
        ...contact,
        messages: messages.map((message: RevaMessage) => ({
          id: message.id,
          from: message.direction === "inbound" ? "patient" : "reva",
          text: message.content,
          time: new Date(message.sent_at).toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" }),
          type: "text",
        })),
      } : contact));
    }).catch(() => addToast("Could not load this conversation", "warn"));
  }, [activeContact?._realId, activeContact?.id, addToast]);

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

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputText).trim();
    if (!msg) return;

    const newMsg: ChatMessage = {
      id: `msg-${++localMessageId.current}`,
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
    if (activeContact._realId) {
      try {
        await sendMessage(activeContact._realId, msg);
        addToast("WhatsApp message queued ✓", "success");
        refresh();
      } catch {
        addToast("Message could not be queued", "warn");
      }
      return;
    }

    addToast("Demo message dispatched ✓", "success");

    // Simulate smart patient auto-response after 1.5s
    setTimeout(() => {
      setIsTypingAI(true);
      setTimeout(() => {
        setIsTypingAI(false);
        const replyMsg: ChatMessage = {
          id: `reply-${++localMessageId.current}`,
          from: "patient",
          text: "Thank you! I will wait for the receptionist to confirm.",
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
        id: `esc-${++localMessageId.current}`,
        from: "reva",
        text: "📌 [Staff Escalation]: A receptionist callback has been requested for this conversation.",
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
      addToast("Escalated: receptionist callback requested ✓", "success");
    } else if (chip.includes("Confirm Appointment")) {
      handleSendMessage("Your appointment is confirmed. Please arrive 10 minutes before the scheduled time.");
    } else if (chip.includes("Clinic Location")) {
      handleSendMessage(clinic?.address ? `📍 Clinic location: ${clinic.address}` : "Please contact reception for the clinic's confirmed location details.");
    } else if (chip.includes("Preferred Time")) {
      handleSendMessage("Which day and time would you prefer for your appointment?");
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
      <div className="hidden w-[340px] shrink-0 border-r border-[#CCD5DF] bg-[#F8FAFC] flex-col lg:flex">
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
          {([
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "appointment", label: "Appointments" },
            { id: "followup", label: "Follow-ups" },
          ] satisfies Array<{ id: "all" | "unread" | "appointment" | "followup"; label: string }>).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
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
                  if (c._realId) void markConversationRead(c._realId).then(refresh);
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
        <div className="h-16 px-2 sm:px-4 bg-[#F8FAFC] border-b border-[#CCD5DF] flex items-center justify-between gap-2 shrink-0 z-10">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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
                <h3 className="hidden font-bold text-xs text-[#0F172A] leading-tight lg:block">{activeContact.name}</h3>
                <label className="lg:hidden">
                  <span className="sr-only">Select conversation</span>
                  <select
                    value={activeContactId}
                    onChange={(event) => setActiveContactId(event.target.value)}
                    className="max-w-36 rounded-lg border border-[#CCD5DF] bg-white px-2 py-1 text-xs font-bold text-[#0F172A]"
                  >
                    {contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
                  </select>
                </label>
                {takenOverIds[activeContact.id] ? (
                  <span className="hidden bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200 sm:flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    Receptionist in control
                  </span>
                ) : (
                  <span className="hidden bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 sm:flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#00685f]" />
                    Reva AI Active
                  </span>
                )}
              </div>
              <p className="hidden text-[10px] text-slate-500 items-center gap-1 mt-0.5 sm:flex">
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
              onClick={async () => {
                const nextState = !takenOverIds[activeContact.id];
                try {
                  if (activeContact._realId) {
                    await setConversationAutomation(activeContact._realId, !nextState);
                    refresh();
                  }
                  setTakenOverIds((prev) => ({ ...prev, [activeContact.id]: nextState }));
                  addToast(nextState ? "Receptionist takeover active — automation paused" : "Automation resumed ✓", nextState ? "info" : "success");
                } catch {
                  addToast("Could not change automation state", "warn");
                }
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all ${
                takenOverIds[activeContact.id]
                  ? "bg-teal-700 hover:bg-teal-800 text-white"
                  : "bg-[#00685f] hover:bg-[#005049] text-white"
              }`}
            >
              {takenOverIds[activeContact.id] ? (
                <>
                  <Sparkles size={13} /> <span className="hidden sm:inline">Resume AI</span>
                </>
              ) : (
                <>
                  <User size={13} /> <span className="hidden sm:inline">Take over</span>
                </>
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            <motion.button whileTap={{ scale: 0.9 }} onClick={() => addToast("Voice calling is awaiting the clinic-approved carrier and provider setup", "info")} className="hidden p-2 rounded-lg hover:bg-slate-200 hover:text-slate-700 transition-colors sm:block" title="Voice calling setup required" aria-label="Voice calling setup required"><Phone size={15} /></motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowDossier(!showDossier)} className={`hidden p-2 rounded-lg transition-colors xl:block ${showDossier ? "bg-[#00685f]/15 text-[#00685f]" : "hover:bg-slate-200 hover:text-slate-700"}`} title="Toggle Reception Context"><User size={16} /></motion.button>
          </div>
        </div>

        {/* Escalation & Takeover Banner */}
        {takenOverIds[activeContact.id] && (
          <div className="bg-teal-50 border-b border-teal-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
            <div className="flex items-center gap-2 text-teal-900 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span>Receptionist Takeover Active • Reva AI auto-responses paused for this patient.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const escMsg: ChatMessage = {
                    id: `esc-${++localMessageId.current}`,
                    from: "reva",
                    text: "📌 [Staff Escalation]: A receptionist callback has been requested for this conversation.",
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
                  addToast("Escalated: receptionist callback requested ✓", "success");
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
                      setShowAttachMenu(false);
                      addToast("Open Consent to create and send a secure consent link", "info");
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-teal-50 hover:text-[#00685f] rounded-lg flex items-center gap-2"
                  >
                    <Shield size={14} className="text-[#00685f]" /> Secure Consent Link
                  </button>
                  <button
                    onClick={() => {
                      setShowAttachMenu(false);
                      addToast("Open Billing to create or remind the correct invoice", "info");
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-teal-50 hover:text-[#00685f] rounded-lg flex items-center gap-2"
                  >
                    <CreditCard size={14} className="text-amber-500" /> Billing Reminder
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

      {/* ── RIGHT PANEL: Reception context (280px) ─────────────────────────── */}
      <AnimatePresence>
        {showDossier && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="hidden shrink-0 border-l border-[#CCD5DF] bg-[#F8FAFC] flex-col overflow-hidden xl:flex"
          >
            {/* Dossier Header */}
            <div className="p-4 border-b border-[#CCD5DF] bg-white flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Reception Context</h3>
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

              {/* Automation status */}
              <div className="bg-white border border-[#CCD5DF] rounded-xl p-3.5 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Conversation Routing
                </span>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Automation:</span>
                  <span className="font-bold text-[#0F172A]">{takenOverIds[activeContact.id] ? "Paused" : "Active"}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Unread:</span>
                  <span className="font-bold text-[#0F172A]">{activeContact.unreadCount}</span>
                </div>
              </div>

              {/* Reception workflows */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => addToast(`Open Consent to send a form to ${activeContact.name}`, "info")}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-[#CCD5DF] text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Shield size={13} className="text-[#00685f]" /> Send Consent Form
                </button>
                <button
                  onClick={() => addToast(`Open Billing to manage ${activeContact.name}'s invoice`, "info")}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-[#CCD5DF] text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <CreditCard size={13} className="text-emerald-600" /> Manage Billing
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
