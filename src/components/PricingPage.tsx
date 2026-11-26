"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Cpu, Minus, Plus, ShieldCheck, ShoppingCart, Trash2, X } from "lucide-react";
import { Logo } from "./Logo";
import { DASHBOARD_URL, getRuntimeApiBaseUrl } from "@/content/project";
import { guideFor, pick, IMAGE_CREDITS } from "@/content/pricing";
import { useLang, useTr } from "@/lib/i18n";
import "./pricing.css";

interface CatalogItem {
  id: string;
  name: string;
  deviceType: string;
  modelCode: string;
  description?: string;
  imageUrl?: string;
  unitPrice: number;
  warrantyMonths: number;
}

const vnd = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

function ProductImage({ item }: { item: CatalogItem }) {
  // shortcut: seed rows carry generic Unsplash placeholders, so those are dropped in favour of our curated photo; admin uploads win.
  const local = guideFor(item.deviceType).image;
  const isPlaceholder = item.imageUrl?.includes("images.unsplash.com");
  const sources = (isPlaceholder ? [local] : [item.imageUrl, local]).filter((s): s is string => !!s);
  const [i, setI] = useState(0);
  if (i >= sources.length) return <div className="pr-img pr-img-empty" aria-hidden="true"><Cpu size={44} strokeWidth={1.5} /></div>;
  // eslint-disable-next-line @next/next/no-img-element -- static export, images are unoptimized anyway
  return <img className="pr-img" src={sources[i]} alt={item.name} loading="lazy" onError={() => setI(i + 1)} />;
}

function Qty({ name, value, onChange }: { name: string; value: number; onChange: (v: number) => void }) {
  const tr = useTr();
  return (
    <div className="pr-qty">
      <button type="button" aria-label={tr("Giảm số lượng {n}", { n: name })} disabled={value <= 0} onClick={() => onChange(value - 1)}><Minus size={16} aria-hidden="true" /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label={tr("Tăng số lượng {n}", { n: name })} disabled={value >= 99} onClick={() => onChange(value + 1)}><Plus size={16} aria-hidden="true" /></button>
    </div>
  );
}

export default function PricingPage() {
  const tr = useTr(), lang = useLang();
  const home = lang === "vi" ? "/" : "/en";
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [detail, setDetail] = useState<CatalogItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let active = true;
    fetch(`${getRuntimeApiBaseUrl()}/api/v1/public/installation-packages`)
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((json) => { if (active) { setItems(json?.result?.catalogItems ?? []); setStatus("ready"); } })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (detail && !d.open) d.showModal();
    if (!detail && d.open) d.close();
  }, [detail]);

  const types = useMemo(() => [...new Set(items.map((i) => i.deviceType))], [items]);
  const visible = filter === "ALL" ? items : items.filter((i) => i.deviceType === filter);
  const selected = items.filter((i) => (qty[i.id] ?? 0) > 0);
  const count = selected.reduce((s, i) => s + qty[i.id], 0);
  const total = selected.reduce((s, i) => s + qty[i.id] * Number(i.unitPrice || 0), 0);
  const setItemQty = (id: string, v: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(99, v)) }));
  const retry = () => { setStatus("loading"); setAttempt((a) => a + 1); };

  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <a href={home} aria-label={tr("HESTA, về trang chủ")}><Logo tagline={false} /></a>
          <div className="head-actions">
            <a className="lang-switch" href={lang === "vi" ? "/en/pricing" : "/bao-gia"} hrefLang={lang === "vi" ? "en" : "vi"} aria-label={lang === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}>
              <span data-on={lang === "vi"}>VI</span><span data-on={lang === "en"}>EN</span>
            </a>
            <a className="btn btn-ink btn-sm" href={`${DASHBOARD_URL}/login`}><span className="lbl-full">{tr("Vào Dashboard")}</span><span className="lbl-short">Dashboard</span></a>
          </div>
        </div>
      </header>

      <main className="pr-page">
        <div className="wrap">
          <div className="eyebrow">{tr("Bảng giá tham khảo")}</div>
          <h1 className="pr-title">{tr("Thiết bị nhà thông minh HESTA")}</h1>
          <p className="lead">{tr("Xem từng thiết bị là gì, hoạt động ra sao và giá bao nhiêu. Chọn số lượng để tự tính chi phí thiết bị cho ngôi nhà của bạn.")}</p>

          {status === "loading" && <p className="pr-note" role="status">{tr("Đang tải bảng giá…")}</p>}
          {status === "error" && (
            <div className="pr-note pr-error" role="alert">
              <span>{tr("Chưa tải được bảng giá. Kiểm tra kết nối rồi thử lại.")}</span>
              <button type="button" className="btn btn-glass btn-sm" onClick={retry}>{tr("Thử lại")}</button>
            </div>
          )}
          {status === "ready" && items.length === 0 && <p className="pr-note">{tr("Hiện chưa có thiết bị nào được mở bán.")}</p>}

          {status === "ready" && items.length > 0 && (
            <div className="pr-layout">
              <div>
                <div className="pr-chips" role="group" aria-label={tr("Lọc theo loại thiết bị")}>
                  <button type="button" aria-pressed={filter === "ALL"} onClick={() => setFilter("ALL")}>{tr("Tất cả")}</button>
                  {types.map((ty) => (
                    <button key={ty} type="button" aria-pressed={filter === ty} onClick={() => setFilter(ty)}>{pick(guideFor(ty).label, lang)}</button>
                  ))}
                </div>
                <ul className="pr-grid">
                  {visible.map((item) => (
                    <li key={item.id} className="pr-card">
                      <button type="button" className="pr-open" onClick={() => setDetail(item)} aria-label={tr("Xem chi tiết {n}", { n: item.name })}>
                        <div className="pr-img-box"><ProductImage item={item} /></div>
                        <div className="pr-card-body">
                          <span className="pr-type">{pick(guideFor(item.deviceType).label, lang)}</span>
                          <h2>{item.name}</h2>
                          <span className="pr-model">{item.modelCode}</span>
                        </div>
                      </button>
                      <div className="pr-card-foot">
                        <div>
                          <strong>{vnd(item.unitPrice)}</strong>
                          <small className="pr-warranty"><ShieldCheck size={13} aria-hidden="true" />{tr("Bảo hành {m} tháng", { m: item.warrantyMonths })}</small>
                        </div>
                        <Qty name={item.name} value={qty[item.id] ?? 0} onChange={(v) => setItemQty(item.id, v)} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="pr-quote" aria-label={tr("Báo giá tạm tính")}>
                <h2><ShoppingCart size={19} aria-hidden="true" />{tr("Báo giá tạm tính")}</h2>
                {selected.length === 0 ? (
                  <p className="pr-hint">{tr("Bấm + ở thiết bị để thêm vào báo giá.")}</p>
                ) : (
                  <ul className="pr-lines">
                    {selected.map((i) => (
                      <li key={i.id}><span>{qty[i.id]} × {i.name}</span><b>{vnd(qty[i.id] * i.unitPrice)}</b></li>
                    ))}
                  </ul>
                )}
                <div className="pr-total"><span>{tr("Tổng thiết bị ({c})", { c: count })}</span><strong>{vnd(total)}</strong></div>
                <p className="pr-hint">{tr("Chưa gồm phí lắp đặt. Giá chính thức được chốt trong hợp đồng sau khi khảo sát.")}</p>
                <div className="pr-actions">
                  <a className="btn btn-ink btn-sm" href={`${home}#install`}>{tr("Đăng ký khảo sát & lắp đặt")}</a>
                  {selected.length > 0 && <button type="button" className="btn btn-glass btn-sm" onClick={() => setQty({})} aria-label={tr("Xóa hết báo giá")}><Trash2 size={16} aria-hidden="true" /></button>}
                </div>
              </aside>
            </div>
          )}

          <p className="pr-credits">
            {tr("Ảnh minh họa từ Wikimedia Commons:")}{" "}
            {IMAGE_CREDITS.map((c, i) => (
              <span key={c.url}>{i > 0 && " · "}<a href={c.url} target="_blank" rel="noreferrer">{pick(c.item, lang)} — {c.author} ({c.license})</a></span>
            ))}
          </p>
        </div>
      </main>

      <dialog ref={dialogRef} className="pr-dialog" aria-labelledby="pr-dialog-title" onClose={() => setDetail(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
        {detail && (() => {
          const g = guideFor(detail.deviceType);
          return (
            <div>
              <button type="button" className="pr-close" aria-label={tr("Đóng")} onClick={() => setDetail(null)}><X size={18} aria-hidden="true" /></button>
              <div className="pr-dialog-head">
                <div className="pr-img-box"><ProductImage key={detail.id} item={detail} /></div>
                <div>
                  <span className="pr-type">{pick(g.label, lang)} · {detail.modelCode}</span>
                  <h2 id="pr-dialog-title">{detail.name}</h2>
                  <p className="pr-price">{vnd(detail.unitPrice)}</p>
                  <small className="pr-warranty"><ShieldCheck size={14} aria-hidden="true" />{tr("Bảo hành {m} tháng", { m: detail.warrantyMonths })}</small>
                  <Qty name={detail.name} value={qty[detail.id] ?? 0} onChange={(v) => setItemQty(detail.id, v)} />
                </div>
              </div>
              <div className="pr-dialog-body">
                <section>
                  <h3>{tr("Thiết bị này là gì?")}</h3>
                  <p>{pick(g.what, lang)}</p>
                  {lang === "vi" && detail.description && <p>{detail.description}</p>}
                </section>
                <section>
                  <h3>{tr("Hoạt động như thế nào?")}</h3>
                  <ol className="pr-steps">{g.how.map((s) => <li key={s.vi}>{pick(s, lang)}</li>)}</ol>
                </section>
                <section>
                  <h3>{tr("Dùng để làm gì?")}</h3>
                  <ul className="pr-uses">{g.uses.map((u) => <li key={u.vi}>{pick(u, lang)}</li>)}</ul>
                </section>
              </div>
            </div>
          );
        })()}
      </dialog>
    </>
  );
}
