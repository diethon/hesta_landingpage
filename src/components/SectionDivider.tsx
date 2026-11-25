"use client";
import { useEffect, useRef } from "react";
import { HMark } from "./Logo";
import { clamp, passProgress, runWhileVisible } from "@/lib/motion";

// Phân cách giữa 2 section: nền chuyển màu mềm, ở giữa là dấu H nhỏ với 2 nét kẻ mọc ra khi cuộn tới.
export default function SectionDivider({ top, bottom }: { top: string; bottom: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const lines = el.querySelectorAll<HTMLElement>(".sd-line"), mark = el.querySelector<HTMLElement>(".sd-mark")!;
    return runWhileVisible(el, () => {
      const k = clamp((passProgress(el) - 0.15) / 0.4);
      lines.forEach((l) => (l.style.transform = `scaleX(${k})`));
      mark.style.transform = `translateY(${(1 - k) * 10}px) rotate(${(1 - k) * -12}deg)`;
      mark.style.opacity = String(0.25 + k * 0.75);
    });
  }, []);
  const dark = bottom.toLowerCase() === "#0f1b26";
  return (
    <div className={`sd ${dark ? "sd-dark" : ""}`} ref={ref} style={{ background: `linear-gradient(${top}, ${bottom})` }} aria-hidden="true">
      <span className="sd-line sd-l" />
      <HMark className="sd-mark" />
      <span className="sd-line sd-r" />
    </div>
  );
}
