"use client";
import { useEffect, useRef, useState } from "react";
import { triggerGas, endIncident } from "@/lib/demoStore";
import { useTr } from "@/lib/i18n";

// Chế độ trình chiếu cho buổi bảo vệ: P bật/tắt, ←/→ (hoặc PageUp/PageDown) nhảy từng điểm dừng,
// G mô phỏng rò gas, V tới ô ra lệnh, D chạy nhanh qua 24h. Section cuộn dính có 3 điểm dừng.
const HEADER = 64;

function stops() {
  const out: { y: number; id: string }[] = [];
  document.querySelectorAll<HTMLElement>("main > section[id]").forEach((s) => {
    const top = s.getBoundingClientRect().top + scrollY - HEADER;
    if (s.classList.contains("scrub")) {
      const span = s.offsetHeight - (innerHeight - HEADER);
      [0, 0.5, 1].forEach((k) => out.push({ y: top + span * k, id: s.id }));
    } else out.push({ y: top, id: s.id });
  });
  return out;
}

export default function Presenter() {
  const tr = useTr();
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState({ i: 0, n: 0 });
  const anim = useRef(0);

  useEffect(() => {
    const go = (dir: 1 | -1) => {
      const list = stops(), y = scrollY;
      const i = dir > 0 ? list.findIndex((s) => s.y > y + 4) : list.findLastIndex((s) => s.y < y - 4);
      if (i < 0) return;
      scrollTo({ top: list[i].y, behavior: "smooth" });
      setPos({ i: i + 1, n: list.length });
    };
    const runDay = () => {
      const s = document.getElementById("automation"); if (!s) return;
      const top = s.getBoundingClientRect().top + scrollY - HEADER, span = s.offsetHeight - (innerHeight - HEADER), t0 = performance.now();
      cancelAnimationFrame(anim.current);
      const step = (t: number) => { const k = Math.min(1, (t - t0) / 7000); scrollTo(0, top + span * k); if (k < 1) anim.current = requestAnimationFrame(step); };
      anim.current = requestAnimationFrame(step);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable]") || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "p") { setOn((v) => !v); return; }
      if (!on) return;
      if (k === "arrowright" || k === "pagedown" || k === " ") { e.preventDefault(); go(1); }
      else if (k === "arrowleft" || k === "pageup") { e.preventDefault(); go(-1); }
      else if (k === "g") triggerGas();
      else if (k === "d") runDay();
      else if (k === "v") {
        const input = document.querySelector<HTMLInputElement>("#pg-input") ?? document.querySelector<HTMLInputElement>(".vt-input");
        input?.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => input?.focus({ preventScroll: true }), 500);
      } else if (k === "escape") { endIncident(); setOn(false); }
    };
    addEventListener("keydown", onKey);
    return () => { removeEventListener("keydown", onKey); cancelAnimationFrame(anim.current); };
  }, [on]);

  useEffect(() => { document.documentElement.dataset.present = on ? "1" : ""; }, [on]);

  if (!on) return null;
  return (
    <div className="presenter" role="status">
      <b>{tr("Trình chiếu")}{pos.n ? ` · ${pos.i}/${pos.n}` : ""}</b>
      <span><kbd>←</kbd><kbd>→</kbd> {tr("chuyển")}</span>
      <span><kbd>G</kbd> {tr("rò gas")}</span>
      <span><kbd>V</kbd> {tr("giọng nói")}</span>
      <span><kbd>D</kbd> {tr("chạy 24h")}</span>
      <span><kbd>Esc</kbd> {tr("thoát")}</span>
    </div>
  );
}
