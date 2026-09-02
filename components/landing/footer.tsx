"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { RevaBrand, WhatsAppIcon } from "./brand";
import { useLang } from "./language-provider";

const PRODUCT_HREFS = ["#features", "#how-it-works", "#portal", "#chat", "#before-after", "#day", "#pricing", "#faq"] as const;
const COMPANY_HREFS = ["#security", "#top", "#security", "#faq"] as const;

export function Footer() {
  const { t } = useLang();

  const productLinks = t.footer.productLinks.map((label, i) => ({
    label,
    href: PRODUCT_HREFS[i],
  }));
  const companyLinks = t.footer.companyLinks.map((label, i) => ({
    label,
    href: COMPANY_HREFS[i],
  }));

  return (
    <footer className="mt-auto bg-[#000000] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.9fr_0.9fr_1.3fr] lg:gap-10">
          {/* Brand column */}
          <div>
            <RevaBrand dark />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-slate-400">
              {t.footer.tagline}
            </p>
            <div className="mt-6 flex flex-col items-start gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-semibold text-slate-200">
                <ShieldCheck className="size-4 text-aloka-400" />
                {t.footer.badge1}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-medium text-slate-300">
                <WhatsAppIcon className="size-3.5 text-slate-400" />
                {t.footer.badge2}
              </span>
              {/* Live status — pulsing dot (motion-reduce safe) */}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-medium text-slate-300">
                <span className="relative flex size-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aloka-400 opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-aloka-400 motion-reduce:animate-none" />
                </span>
                {t.footer.status}
              </span>
            </div>
          </div>

          {/* Product links */}
          <nav aria-label={t.footer.productAria}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {t.footer.product}
            </p>
            <ul className="mt-4 space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="rounded-sm text-[13.5px] font-medium text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-400/60"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company links */}
          <nav aria-label={t.footer.companyAria}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {t.footer.company}
            </p>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="rounded-sm text-[13.5px] font-medium text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-400/60"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-[15px] font-bold text-white">
              {t.footer.ctaH}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
              {t.footer.ctaP}
            </p>
            <a
              href="#pricing"
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-aloka-500 px-5 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(16,185,129,0.25)] transition-all hover:-translate-y-0.5 hover:bg-aloka-400 hover:shadow-[0_12px_32px_rgba(16,185,129,0.35)] sm:w-auto"
            >
              {t.footer.ctaBtn}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-xs text-slate-500">
            {t.footer.copyright}
          </p>
          <p className="text-xs text-slate-500">
            {t.footer.made}
          </p>
        </div>
      </div>
    </footer>
  );
}
