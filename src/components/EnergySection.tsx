"use client";
import { useState } from "react";
import { BASELINE, billVnd, hourlyKw, monthlyKwh, type Plan } from "@/lib/energy";
import { useLang, useTr } from "@/lib/i18n";

const AC_STOPS = [22, 23, 0, 1, 2, 3, 4, 5, 6];
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

export default function EnergySection() {
  const tr = useTr(), lang = useLang();
  const [plan, setPlan] = useState<Plan>({ acOff: 0, lightsAuto: true, heaterSchedule: true, standbyCut: false });
  const base = hourlyKw(BASELINE), now = hourlyKw(plan);
  const max = Math.max(...base);
  const kBase = monthlyKwh(BASELINE), kNow = monthlyKwh(plan);
  const vBase = billVnd(kBase), vNow = billVnd(kNow);
  const fmt = (n: number) => n.toLocaleString(lang === "en" ? "en-US" : "vi-VN");
  const toggle = (k: keyof Omit<Plan, "acOff">) => setPlan((p) => ({ ...p, [k]: !p[k] }));
  const acIdx = AC_STOPS.indexOf(plan.acOff);

  const OPTIONS: [keyof Omit<Plan, "acOff">, string, string][] = [
    ["lightsAuto", tr("Đèn tự tắt khi phòng không có người"), tr("Cảm biến hiện diện")],
    ["heaterSchedule", tr("Bình nóng lạnh hẹn giờ"), tr("Chỉ bật trước giờ tắm")],
    ["standbyCut", tr("Ngắt điện thiết bị chờ"), tr("TV, sạc… qua ổ cắm thông minh")],
  ];

  return (
    <section className="wrap energy" id="energy">
      <div className="sec-head">
        <div className="eyebrow">{tr("Tiết kiệm điện")}</div>
        <h2>{tr("Kéo thử, xem hóa đơn giảm bao nhiêu.")}</h2>
      </div>
      <div className="en-grid">
        <div className="en-controls">
          <label className="en-ac" htmlFor="ac-off">
            <span><b>{tr("Điều hòa phòng ngủ tự tắt lúc")}</b><output htmlFor="ac-off">{hh(plan.acOff)}</output></span>
            <input id="ac-off" type="range" min={0} max={AC_STOPS.length - 1} step={1} value={acIdx} onChange={(e) => setPlan((p) => ({ ...p, acOff: AC_STOPS[Number(e.target.value)] }))} />
            <small>{tr("Bật từ 21:00. Không có HESTA: chạy tới 06:00 sáng.")}</small>
          </label>
          {OPTIONS.map(([k, t, d]) => (
            <label className="en-opt" key={k} htmlFor={`en-${k}`}>
              <input id={`en-${k}`} type="checkbox" checked={plan[k]} onChange={() => toggle(k)} />
              <span className="en-sw" aria-hidden="true" />
              <span><b>{t}</b><small>{d}</small></span>
            </label>
          ))}
        </div>
        <div className="en-result">
          <div className="en-big">
            <small>{tr("Tiết kiệm mỗi tháng")}</small>
            <b>{fmt(vBase - vNow)} đ</b>
            <span>{tr("{a} kWh → {b} kWh · hóa đơn {c} đ → {d} đ", { a: kBase, b: kNow, c: fmt(vBase), d: fmt(vNow) })}</span>
          </div>
          <div className="en-chart" role="img" aria-label={tr("Biểu đồ công suất theo giờ, trước và sau khi dùng HESTA")}>
            {base.map((b, h) => (
              <div className="en-col" key={h} title={`${hh(h)} · ${b.toFixed(2)} → ${now[h].toFixed(2)} kW`}>
                <i className="en-base" style={{ height: `${(b / max) * 100}%` }} />
                <i className="en-now" style={{ height: `${(now[h] / max) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="en-axis"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span></div>
          <div className="en-legend"><span><i className="en-base" />{tr("Không có HESTA")}</span><span><i className="en-now" />{tr("Có HESTA")}</span></div>
          <p className="en-note">{tr("Mô hình minh họa cho căn hộ 2 phòng. Giá điện sinh hoạt bậc thang của EVN, chưa gồm VAT.")}</p>
        </div>
      </div>
    </section>
  );
}
