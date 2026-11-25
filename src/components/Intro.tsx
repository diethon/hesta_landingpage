"use client";
import { useEffect, useState } from "react";
import { HMark } from "./Logo";
import { prefersReducedMotion } from "@/lib/motion";
import { useTr } from "@/lib/i18n";

// Màn mở đầu: 2 khối logo trượt vào, bậc nối ghép lại, chữ HESTA hiện từng ký tự. Chỉ chạy 1 lần mỗi phiên.
export default function Intro() {
  const tr = useTr();
  const [state, setState] = useState<"play" | "leave" | "done">("play");

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("hesta-intro") === "1"; sessionStorage.setItem("hesta-intro", "1"); } catch {}
    const skip = seen || prefersReducedMotion();
    if (!skip) document.documentElement.style.overflow = "hidden";
    const a = setTimeout(() => setState(skip ? "done" : "leave"), skip ? 0 : 2500);
    const b = setTimeout(() => setState("done"), skip ? 0 : 3200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    if (state !== "play") document.documentElement.style.overflow = "";
  }, [state]);

  if (state === "done") return null;
  return (
    <div className={`intro ${state === "leave" ? "intro-leave" : ""}`} onClick={() => setState("leave")} role="presentation">
      <div className="intro-inner">
        <HMark className="intro-mark" title="HESTA" />
        <div>
          <div className="intro-name">{"HESTA".split("").map((c, i) => <span key={i} style={{ animationDelay: `${0.9 + i * 0.09}s` }}>{c}</span>)}</div>
          <div className="intro-tag">SMART HOME SYSTEM</div>
        </div>
      </div>
      <span className="intro-skip">{tr("Bấm để bỏ qua")}</span>
    </div>
  );
}
