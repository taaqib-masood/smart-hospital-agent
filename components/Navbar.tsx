"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setScrolled(latest > 20);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-[#CCD5DF] shadow-xs py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#00685f] text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
            R
          </div>
          <div>
            <span className="text-[#0F172A] font-bold text-xl tracking-tight leading-none block">
              Reva <span className="text-[#00685f]">AI</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Smart Clinic Agent
            </span>
          </div>
        </Link>

        {/* Nav Links — desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-slate-600 text-xs font-bold hover:text-[#00685f] transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex text-xs font-bold text-slate-700 hover:text-[#00685f] px-3 py-2 transition-colors"
          >
            Live Portal Demo
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-1.5"
          >
            Doctor Login <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
