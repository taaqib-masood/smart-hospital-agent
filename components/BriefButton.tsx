"use client";

import { motion } from "framer-motion";

interface BriefButtonProps {
  patientName: string;
  onViewBrief: () => void;
  submitted: boolean;
}

export default function BriefButton({ patientName, onViewBrief, submitted }: BriefButtonProps) {
  if (!submitted) {
    return (
      <div className="inline-flex items-center gap-1.5 border border-[#CCD5DF] bg-slate-50 text-slate-400 text-xs font-medium rounded-lg px-2.5 py-1 cursor-default select-none">
        <span className="text-[11px]">⏳</span>
        <span>Brief Pending</span>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onViewBrief}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center gap-1.5 bg-[#00685f]/10 hover:bg-[#00685f]/20 border border-[#00685f]/30 text-[#00685f] text-xs font-semibold rounded-lg px-2.5 py-1 transition-all shadow-xs"
    >
      <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00685f] opacity-60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00685f]" />
      </span>
      <span>📋 AI Brief</span>
    </motion.button>
  );
}
