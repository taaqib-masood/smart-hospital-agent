"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Send,
  MessageSquare,
  TrendingUp,
  ThumbsUp,
  ExternalLink,
  CheckCircle,
  X,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: string;
  clinic_id: string;
  patient_id: string;
  appointment_id?: string;
  rating: number;
  comment: string | null;
  reply_text: string | null;
  replied_at: string | null;
  created_at: string;
  patient: { name: string; phone: string } | null;
}

interface ReviewsViewProps {
  clinicId: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    clinic_id: "",
    patient_id: "p1",
    rating: 5,
    comment: "Dr. Sharma was incredibly thorough and explained the entire treatment plan clearly. The clinic was spotless and the WhatsApp digital prescription was super convenient!",
    reply_text: "Thank you so much for your kind words, Priya! We are thrilled you had a seamless visit.",
    replied_at: "2026-04-20T10:00:00Z",
    created_at: "2026-04-19T14:30:00Z",
    patient: { name: "Priya Mehta", phone: "+971501234567" },
  },
  {
    id: "r2",
    clinic_id: "",
    patient_id: "p2",
    rating: 5,
    comment: "Got my lab reports delivered directly on WhatsApp in 2 hours. Consultation was precise and very reassuring. Highly recommend!",
    reply_text: null,
    replied_at: null,
    created_at: "2026-04-18T11:00:00Z",
    patient: { name: "Rahul Singh", phone: "+971552345678" },
  },
  {
    id: "r3",
    clinic_id: "",
    patient_id: "p3",
    rating: 4,
    comment: "Great experience overall. Slight 10 min waiting queue but the doctor took time to listen attentively.",
    reply_text: "Thank you for the constructive feedback, Arjun! We are continuously optimizing our queue flow.",
    replied_at: "2026-04-17T09:00:00Z",
    created_at: "2026-04-16T16:45:00Z",
    patient: { name: "Arjun Kapoor", phone: "+971523456789" },
  },
  {
    id: "r4",
    clinic_id: "",
    patient_id: "p4",
    rating: 5,
    comment: "Best digital healthcare experience in town. Zero paperwork and prompt automated follow-up messages.",
    reply_text: null,
    replied_at: null,
    created_at: "2026-04-15T13:20:00Z",
    patient: { name: "Sneha Patel", phone: "+971584567890" },
  },
];

export default function ReviewsView({ clinicId }: ReviewsViewProps) {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [filter, setFilter] = useState<"all" | "5" | "4" | "unreplied">("all");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const totalReviews = reviews.length;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1);
  const positiveRate = Math.round((reviews.filter((r) => r.rating >= 4).length / totalReviews) * 100);
  const repliedRate = Math.round((reviews.filter((r) => r.replied_at).length / totalReviews) * 100);

  const filteredReviews = reviews.filter((r) => {
    if (filter === "all") return true;
    if (filter === "unreplied") return !r.replied_at;
    return r.rating === Number(filter);
  });

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, reply_text: replyText.trim(), replied_at: new Date().toISOString() }
          : r
      )
    );
    setReplyingId(null);
    setReplyText("");
  };

  const handleGenerateAIReply = (review: Review) => {
    const patientName = review.patient?.name?.split(" ")[0] || "there";
    const suggested = `Hi ${patientName}, thank you so much for taking the time to share your feedback! We are honored to care for your health and look forward to seeing you at Dr. Sharma's Clinic.`;
    setReplyText(suggested);
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Patient Reviews & Reputation</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time Google reviews, post-consultation feedback scores, and 1-tap automated WhatsApp replies.
          </p>
        </div>

        <a
          href="https://google.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#CCD5DF] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <ExternalLink size={13} /> View on Google Maps
        </a>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Average Rating</span>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-[#00685f]">{avgRating}</p>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400" />
              ))}
            </div>
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">Top 5% in Dubai Healthcare City</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Total Reviews</span>
          <p className="text-3xl font-bold text-[#0F172A]">{totalReviews * 42 + 8}</p>
          <span className="text-xs text-slate-500">+14 this month</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Positive Score (4-5★)</span>
          <p className="text-3xl font-bold text-emerald-700">{positiveRate}%</p>
          <span className="text-xs text-emerald-700 font-bold">Excellent patient satisfaction</span>
        </div>

        <div className="bg-white border border-[#CCD5DF] rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Response Rate</span>
          <p className="text-3xl font-bold text-[#00685f]">{repliedRate}%</p>
          <span className="text-xs text-slate-500">Auto-reply enabled</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#CCD5DF] pb-2">
        {[
          { id: "all", label: "All Reviews" },
          { id: "5", label: "5 Stars Only ⭐" },
          { id: "4", label: "4 Stars ⭐" },
          { id: "unreplied", label: "Awaiting Reply" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filter === tab.id
                ? "bg-[#00685f] text-white"
                : "text-slate-600 hover:text-[#0F172A]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((r) => (
          <div key={r.id} className="bg-white border border-[#CCD5DF] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#00685f]/15 text-[#00685f] font-bold text-xs flex items-center justify-center">
                  {r.patient?.name?.split(" ").map((w) => w[0]).join("") || "P"}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">{r.patient?.name || "Verified Patient"}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < r.rating ? "fill-amber-400" : "text-slate-200"}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(r.created_at).toLocaleDateString("en-AE", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {!r.reply_text && replyingId !== r.id && (
                <button
                  onClick={() => {
                    setReplyingId(r.id);
                    handleGenerateAIReply(r);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#00685f] bg-[#00685f]/10 border border-[#00685f]/20 px-3 py-1.5 rounded-lg hover:bg-[#00685f]/20 transition-colors"
                >
                  <Sparkles size={12} /> Reply with AI
                </button>
              )}
            </div>

            <p className="text-xs text-[#0F172A] leading-relaxed font-medium">
              &quot;{r.comment}&quot;
            </p>

            {/* Existing reply */}
            {r.reply_text && (
              <div className="bg-[#F8FAFC] border-l-2 border-[#00685f] p-3 rounded-r-lg text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#00685f]">
                  <span>Dr. Sharma&apos;s Clinic (Official Reply)</span>
                  <span className="text-slate-400 font-normal">
                    {r.replied_at ? new Date(r.replied_at).toLocaleDateString("en-AE") : "Recent"}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{r.reply_text}</p>
              </div>
            )}

            {/* Replying Form */}
            {replyingId === r.id && (
              <div className="pt-3 border-t border-[#CCD5DF] space-y-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your clinic reply..."
                  className="w-full p-3 bg-[#F8FAFC] border border-[#CCD5DF] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:border-[#00685f]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReplyingId(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 font-bold hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendReply(r.id)}
                    className="px-4 py-1.5 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <Send size={12} /> Post Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
