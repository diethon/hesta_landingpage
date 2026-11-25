"use client";
import { createContext, useCallback, useContext, useEffect } from "react";
import { EN } from "@/content/en";

export type Lang = "vi" | "en";
const LangCtx = createContext<Lang>("vi");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return <LangCtx.Provider value={lang}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

/** Dịch theo câu gốc tiếng Việt. "{x}" trong câu được thay bằng vars.x. Thiếu bản dịch thì giữ tiếng Việt. */
export function translate(lang: Lang, vi: string, vars?: Record<string, string | number>) {
  let s = vi;
  if (lang === "en") {
    const hit = EN[vi];
    // Chuỗi thuần ASCII (tên kỹ thuật như "Spring Boot") dùng nguyên văn, không cần dịch.
    if (hit === undefined && /[^\x00-\x7f]/.test(vi) && process.env.NODE_ENV !== "production") console.warn("[i18n] thiếu bản dịch:", vi);
    s = hit ?? vi;
  }
  if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, String(vars[k]));
  return s;
}

export function useTr() {
  const lang = useLang();
  return useCallback((vi: string, vars?: Record<string, string | number>) => translate(lang, vi, vars), [lang]);
}
