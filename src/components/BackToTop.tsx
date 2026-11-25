"use client";
import { useEffect, useRef, useState } from "react";
import { useTr } from "@/lib/i18n";

// Nút về đầu trang: chữ H tô đầy từ dưới lên theo phần trăm đã cuộn.
export default function BackToTop() {
  const tr = useTr();
  const [show, setShow] = useState(false);
  const fill = useRef<SVGRectElement>(null);
  useEffect(() => {
    let id = 0;
    const onScroll = () => {
      cancelAnimationFrame(id);
      id = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? scrollY / max : 0;
        fill.current?.setAttribute("y", String(624 * (1 - p)));
        setShow(scrollY > 600);
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(id); };
  }, []);
  return (
    <button type="button" className={`to-top ${show ? "show" : ""}`} onClick={() => scrollTo({ top: 0, behavior: "smooth" })} aria-label={tr("Về đầu trang")} tabIndex={show ? 0 : -1}>
      <svg viewBox="0 0 399 624" aria-hidden="true">
        <defs><clipPath id="toTopFill"><rect ref={fill} x="0" y="624" width="399" height="624" /></clipPath></defs>
        <path className="tt-base" d="M0 0H124V234H249V296H274V62H399V624H274V421H149V359H124V562H0Z" />
        <path className="tt-fill" clipPath="url(#toTopFill)" d="M0 0H124V234H249V296H274V62H399V624H274V421H149V359H124V562H0Z" />
      </svg>
      <span>{tr("Lên đầu")}</span>
    </button>
  );
}
