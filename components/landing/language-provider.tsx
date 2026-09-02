"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "framer-motion";
import { dict, type Dict, type Lang } from "@/lib/i18n/dictionary";

const STORAGE_KEY = "reva-lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Active dictionary (namespaced per component). */
  t: Dict;
  isAr: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** useLayoutEffect on the client, useEffect during the SSR prerender (avoids the React warning). */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function applyToDocument(lang: Lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";
}

/**
 * Client-side EN ⇄ AR language context.
 *
 * - Choice persists in `localStorage` under "reva-lang" ("en" | "ar").
 * - `document.documentElement.lang` / `.dir` are kept in sync (the inline
 *   <head> script in layout.tsx applies them before hydration to avoid FOUC).
 * - The server always renders English; the persisted choice is adopted in a
 *   pre-paint layout effect right after hydration.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Adopt the persisted choice before the first post-hydration paint.
  useIsoLayoutEffect(() => {
    let saved: Lang = "en";
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "ar") saved = "ar";
    } catch {
      /* storage unavailable (private mode) — stay on EN */
    }
    if (saved !== "en") {
      setLangState(saved);
      applyToDocument(saved);
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore persistence failures */
    }
    applyToDocument(next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: dict[lang], isAr: lang === "ar" }),
    [lang, setLang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {/* Honour the OS-level reduced-motion preference for every framer-motion
          component on the page (entrances collapse to their final state). */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang must be used within a <LanguageProvider>");
  }
  return ctx;
}
