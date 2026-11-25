"use client";
import { useRef, useState } from "react";
import { HMark } from "./Logo";
import { useTr } from "@/lib/i18n";

const APPS = ["Đèn", "Điều hòa", "Camera", "Khóa cửa", "Ổ cắm"];
const BILLS: [string, string][] = [["Tiền điện T9", "1.240.000đ"], ["Tiền điện T10", "1.580.000đ"], ["Sửa điều hòa", "850.000đ"]];

export default function BeforeAfter() {
  const tr = useTr();
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  const move = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <section className="wrap ba" id="before-after">
      <div className="sec-head">
        <div className="eyebrow">{tr("Trước / Sau HESTA")}</div>
        <h2>{tr("Kéo để thấy khác biệt.")}</h2>
      </div>
      <div
        className="ba-box" ref={box}
        onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX); }}
        onPointerMove={(e) => drag.current && move(e.clientX)}
        onPointerUp={() => (drag.current = false)}
        onPointerCancel={() => (drag.current = false)}
      >
        <div className="ba-before">
          <span className="ba-label">{tr("Trước")}</span>
          <div className="ba-apps">
            {APPS.map((a, i) => (
              <div className="ba-app" key={a} style={{ rotate: `${(i % 2 ? 1 : -1) * (4 + i * 2)}deg` }}>
                <i />{tr(a)}<small>{tr("app riêng")}</small>
              </div>
            ))}
          </div>
          <div className="ba-bills">
            {BILLS.map(([t, v]) => <div key={t}><span>{tr(t)}</span><b>{v}</b></div>)}
          </div>
          <div className="ba-broken"><b>{tr("Điều hòa phòng ngủ")}</b>{tr("Không lạnh · phát hiện sau 3 ngày")}</div>
        </div>
        <div className="ba-after" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <span className="ba-label ba-label-after">{tr("Sau")}</span>
          <div className="ba-dash">
            <div className="ba-dash-head"><HMark className="ba-mark" /> {tr("Nhà của tôi")} <span>{tr("12 thiết bị · tất cả ổn định")}</span></div>
            <div className="ba-tiles">
              <div><small>{tr("Năng lượng tháng này")}</small><b>−18%</b><span>{tr("so với tháng trước")}</span></div>
              <div><small>{tr("Cảnh báo")}</small><b>1</b><span>{tr("Điều hòa: hiệu suất giảm")}</span></div>
              <div><small>{tr("Phiếu bảo trì")}</small><b>#MT-5188</b><span>{tr("Đã có báo giá")}</span></div>
              <div><small>{tr("Kịch bản")}</small><b>6</b><span>{tr("đang tự chạy")}</span></div>
            </div>
          </div>
        </div>
        <div className="ba-handle" style={{ left: `${pos}%` }}><span><HMark className="ba-handle-mark" /></span></div>
        <label htmlFor="ba-range" className="sr-only">{tr("Kéo để so sánh trước và sau khi dùng HESTA")}</label>
        <input id="ba-range" className="ba-range" type="range" min={0} max={100} value={Math.round(pos)} onChange={(e) => setPos(Number(e.target.value))} />
      </div>
      <p className="ba-note">{tr("Số liệu minh họa.")}</p>
    </section>
  );
}
