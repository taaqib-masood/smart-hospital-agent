"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileDown,
  Flame,
  Link2,
  MessageCircle,
  Search,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FadeUp } from "./motion-primitives";
import { LeadDialogButton } from "./lead-dialog";
import { useLang } from "./language-provider";

type Cat = "all" | "compliance" | "setup" | "behavior";

/** Left-rail quick links into the accordion — the questions UAE clinic
 *  managers ask most (compliance first — it is the #1 objection in the UAE). */
const POPULAR = [0, 4, 1];

export function Faq() {
  const { t } = useLang();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Cat>("all");
  const [openValue, setOpenValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Shareable deep links: `…#faq-item-3` opens that exact question on load.
  // The open is deferred to a macrotask so the first paint stays
  // SSR-consistent. No ref guard — under StrictMode the double
  // setup→cleanup→setup cycle would clear the first timers and skip
  // re-scheduling; re-running is harmless because the early return below
  // makes this a no-op whenever an item is already open (e.g. after a
  // language switch).
  useEffect(() => {
    if (openValue) return; // an item is already open — leave it alone
    const m = window.location.hash.match(/^#faq-item-(\d+)$/);
    if (!m) return;
    const idx = Number(m[1]);
    if (Number.isNaN(idx) || !t.faq.faqs[idx]) return;
    const openTimer = window.setTimeout(() => setOpenValue(`faq-${idx}`), 0);
    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById(`faq-item-${idx}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 420);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(scrollTimer);
    };
  }, [t.faq.faqs, openValue]);

  // Keep the address bar shareable without polluting history: opening an
  // item mirrors it into the hash, closing clears it.
  const handleValueChange = (v: string) => {
    setOpenValue(v);
    window.history.replaceState(
      null,
      "",
      v
        ? `${window.location.pathname}#faq-item-${v.slice(4)}`
        : window.location.pathname
    );
  };

  /** Copies a per-question deep link to the clipboard. */
  const copyLink = async (idx: number) => {
    const url = `${window.location.origin}${window.location.pathname}#faq-item-${idx}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t.faq.copiedToast, description: t.faq.copiedDesc });
    } catch {
      toast({ title: t.faq.copyFailToast });
    }
  };

  // "/" anywhere on the page jumps to the FAQ search (Gmail/GitHub convention).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || el?.isContentEditable)
        return;
      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cats: { id: Cat; label: string; count: number }[] = useMemo(
    () => [
      { id: "all", label: t.faq.catAll, count: t.faq.faqs.length },
      {
        id: "compliance",
        label: t.faq.catCompliance,
        count: t.faq.faqs.filter((f) => f.cat === "compliance").length,
      },
      {
        id: "setup",
        label: t.faq.catSetup,
        count: t.faq.faqs.filter((f) => f.cat === "setup").length,
      },
      {
        id: "behavior",
        label: t.faq.catBehavior,
        count: t.faq.faqs.filter((f) => f.cat === "behavior").length,
      },
    ],
    [t],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return t.faq.faqs.filter((f) => {
      const matchCat = cat === "all" || f.cat === cat;
      const matchQ =
        !q ||
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [t.faq.faqs, query, cat]);

  const hasFilters = query.trim() !== "" || cat !== "all";

  const reset = () => {
    setQuery("");
    setCat("all");
  };

  /** Popular-question deep link: clear any active filters, open the item,
   *  then bring it into view once the accordion animation has settled. */
  const openPopular = (idx: number) => {
    setQuery("");
    setCat("all");
    setOpenValue(`faq-${idx}`);
    window.setTimeout(() => {
      document
        .getElementById(`faq-item-${idx}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 380);
  };

  return (
    <section id="faq" className="bg-[#F8FAFC] py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-8">
        {/* Left — sticky header + contact card */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-aloka-600">
              {t.faq.eyebrow}
            </p>
            <h2 className="mt-3.5 text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.55rem] md:leading-[1.15]">
              {t.faq.h2}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              {t.faq.sub}
            </p>
          </FadeUp>

          <FadeUp delay={0.12}>
            <div className="card-lift mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <span className="flex size-10 items-center justify-center rounded-xl bg-aloka-50 text-aloka-600">
                <MessageCircle className="size-5" />
              </span>
              <h3 className="mt-4 text-[16px] font-bold text-slate-900">
                {t.faq.cardH}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">
                {t.faq.cardP}
              </p>
              <LeadDialogButton
                label={t.faq.cardCta}
                plan="Hospital Group"
                intent="consult"
                variant="outline"
                cta="Talk to Our Team"
                ctaLocation="faq"
                className="mt-5 h-11 w-full rounded-xl border-slate-300 text-[14px] font-semibold text-slate-800 hover:bg-slate-50"
              />
              <LeadDialogButton
                label={t.faq.cardCta2}
                intent="one-pager"
                variant="ghost"
                cta="Get the economics one-pager"
                ctaLocation="faq-onepager"
                leading={<FileDown className="size-4 text-aloka-600" aria-hidden />}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 text-[13.5px] font-semibold text-slate-600 hover:border-aloka-300 hover:bg-aloka-50/50 hover:text-aloka-700"
              />
            </div>
          </FadeUp>

          {/* Popular questions — one-tap deep links into the accordion */}
          <FadeUp delay={0.16}>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-soft">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                <Flame className="size-3.5 text-aloka-500" aria-hidden />
                {t.faq.popularH}
              </p>
              <ul className="mt-3.5 space-y-1.5">
                {POPULAR.map((idx, i) => {
                  const f = t.faq.faqs[idx];
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        data-cta="FAQ — Popular question"
                        data-cta-location="faq-popular"
                        aria-label={`${t.faq.popularOpen}: ${f.q}`}
                        onClick={() => openPopular(idx)}
                        className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-start transition-colors duration-200 hover:bg-aloka-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-400"
                      >
                        <span
                          aria-hidden
                          className="mt-px flex size-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10.5px] font-extrabold tabular-nums text-slate-500 transition-colors duration-200 group-hover:bg-aloka-100 group-hover:text-aloka-700"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-slate-600 transition-colors duration-200 group-hover:text-aloka-800">
                          {f.q}
                        </span>
                        <ChevronRight
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-aloka-600 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </FadeUp>
        </div>

        {/* Right — search + filter chips + accordion */}
        <FadeUp delay={0.08}>
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
            style={{ backgroundImage: "radial-gradient(rgba(15,23,42,0.025) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
          >
            {/* Search bar */}
            <div className="border-b border-slate-100 bg-white/85 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
              <div className="flex flex-col gap-3.5">
                <div className="relative">
                  <Search
                    aria-hidden
                    className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.faq.searchPlaceholder}
                    aria-label={t.faq.searchAria}
                    aria-keyshortcuts="/"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 ps-10 pe-20 text-[14.5px] font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 transition-[border-color,box-shadow,background-color] duration-200 focus:border-aloka-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-aloka-500/15"
                  />
                  <span className="absolute end-2.5 top-1/2 -translate-y-1/2">
                    {hasFilters ? (
                      <button
                        type="button"
                        onClick={reset}
                        className="inline-flex h-7 items-center gap-1 rounded-full bg-slate-100 px-2.5 text-[11.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-400"
                        aria-label={t.faq.noResultsReset}
                      >
                        <X className="size-3" aria-hidden />
                        {t.faq.resultsLabel(filtered.length)}
                      </button>
                    ) : (
                      <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 text-[11.5px] font-semibold text-slate-400">
                        {t.faq.resultsLabel(filtered.length)}
                        <kbd
                          aria-hidden
                          title={t.faq.searchKbdAria}
                          className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-px font-mono text-[10.5px] font-bold text-slate-400 shadow-[0_1px_0_rgba(15,23,42,0.06)] sm:inline-block"
                        >
                          /
                        </kbd>
                      </span>
                    )}
                  </span>
                </div>
                {/* Category chips */}
                <div className="flex flex-wrap gap-1.5">
                  {cats.map((c) => {
                    const active = cat === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCat(c.id)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-400",
                          active
                            ? "bg-aloka-600 text-white shadow-[0_2px_8px_rgba(0,126,127,0.30)]"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900",
                        )}
                      >
                        {c.label}
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-white text-slate-500",
                          )}
                        >
                          {c.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Accordion */}
            <Accordion
              type="single"
              collapsible
              value={openValue}
              onValueChange={handleValueChange}
              className="bg-transparent px-5 sm:px-7"
            >
              {filtered.length > 0 ? (
                filtered.map((f, i) => {
                  const idx = t.faq.faqs.indexOf(f);
                  return (
                    <AccordionItem
                      key={f.q}
                      value={`faq-${idx}`}
                      id={`faq-item-${idx}`}
                      className={cn(
                        "group relative",
                        i === filtered.length - 1 && "border-b-0",
                      )}
                    >
                      <span
                        aria-hidden
                        className="absolute -start-5 inset-y-2.5 w-[3px] rounded-s bg-aloka-500 opacity-0 transition-opacity duration-300 sm:-start-7 group-data-[state=open]:opacity-100"
                      />
                      <AccordionTrigger className="-mx-5 px-5 py-5 text-start text-[15.5px] font-bold leading-snug tracking-tight text-slate-900 hover:bg-aloka-50/40 hover:no-underline hover:text-aloka-700 data-[state=open]:bg-aloka-50/60 data-[state=open]:text-aloka-700 focus-visible:ring-inset sm:-mx-7 sm:px-7 [&>svg]:size-4 [&>svg]:duration-300 [&[data-state=open]>svg]:text-aloka-600">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-[14.5px] leading-relaxed text-slate-600">
                        {f.a}
                        {/* Shareable-answer affordance: copies the #faq-item-N
                            deep link. The hash-on-load effect above honors it. */}
                        <div className="mt-4 flex border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            data-cta="FAQ — Copy answer link"
                            data-cta-location="faq-item"
                            onClick={() => copyLink(idx)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[11.5px] font-bold text-slate-500 transition-all duration-200 hover:border-aloka-300 hover:bg-aloka-50/60 hover:text-aloka-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-400"
                          >
                            <Link2 className="size-3.5" aria-hidden />
                            {t.faq.copyLink}
                          </button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-3 px-6 py-12 text-center sm:py-14">
                  <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Search className="size-5" aria-hidden />
                  </span>
                  <h3 className="text-[15px] font-bold text-slate-800">
                    {t.faq.noResultsH}
                  </h3>
                  <p className="max-w-xs text-[13.5px] leading-relaxed text-slate-500">
                    {t.faq.noResultsP}
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:border-aloka-300 hover:bg-aloka-50 hover:text-aloka-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aloka-400"
                  >
                    <X className="size-3.5" aria-hidden />
                    {t.faq.noResultsReset}
                  </button>
                </div>
              )}
            </Accordion>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
