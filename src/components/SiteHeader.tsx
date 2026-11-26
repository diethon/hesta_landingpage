"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { DASHBOARD_URL } from "@/content/project";
import { useLang, useTr } from "@/lib/i18n";

/** Header dùng chung cho trang chủ và trang Bảng giá. Trên mobile nav gom vào nút 3 gạch. */
export default function SiteHeader({ page }: { page: "home" | "pricing" }) {
  const tr = useTr(), lang = useLang();
  const [open, setOpen] = useState(false);
  const home = lang === "vi" ? "/" : "/en";
  const pricing = lang === "vi" ? "/bao-gia" : "/en/pricing";
  // Trên trang Bảng giá, các anchor phải trỏ về trang chủ.
  const at = (hash: string) => (page === "home" ? hash : `${home}${hash}`);
  const langHref = page === "home" ? (lang === "vi" ? "/en" : "/") : (lang === "vi" ? "/en/pricing" : "/bao-gia");

  const links = [
    { href: at("#name"), label: tr("Câu chuyện") },
    { href: at("#twin"), label: tr("Làm gì") },
    { href: at("#playground"), label: tr("Thử ngay") },
    { href: at("#energy"), label: tr("Tiết kiệm") },
    { href: at("#install"), label: tr("Lắp đặt") },
    { href: pricing, label: tr("Bảng giá"), current: page === "pricing" },
    { href: at("#journey"), label: tr("Đồ án") },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="wrap">
        <a href={page === "home" ? "#top" : home} aria-label={tr(page === "home" ? "HESTA, về đầu trang" : "HESTA, về trang chủ")}><Logo tagline={false} /></a>
        <nav aria-label={tr("Mục lục")}>
          {links.map((l) => <a key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>{l.label}</a>)}
        </nav>
        <div className="head-actions">
          <a className="lang-switch" href={langHref} hrefLang={lang === "vi" ? "en" : "vi"} aria-label={lang === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}>
            <span data-on={lang === "vi"}>VI</span><span data-on={lang === "en"}>EN</span>
          </a>
          <a className="btn btn-ink btn-sm" href={`${DASHBOARD_URL}/login`}><span className="lbl-full">{tr("Vào Dashboard")}</span><span className="lbl-short">Dashboard</span></a>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" aria-label={tr(open ? "Đóng menu" : "Mở menu")} onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label={tr("Mục lục")}>
          {page === "pricing" && <a href={home} onClick={() => setOpen(false)}>{tr("Trang chủ")}</a>}
          {links.map((l) => <a key={l.href} href={l.href} aria-current={l.current ? "page" : undefined} onClick={() => setOpen(false)}>{l.label}</a>)}
          <a className="mm-dashboard" href={`${DASHBOARD_URL}/login`}>{tr("Vào Dashboard")}</a>
        </nav>
      )}
    </header>
  );
}
