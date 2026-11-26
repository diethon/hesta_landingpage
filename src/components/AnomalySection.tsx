"use client";
import { useEffect, useRef } from "react";
import { canvasDpr, prefersReducedMotion, runWhileVisible } from "@/lib/motion";
import { triggerGas } from "@/lib/demoStore";
import { Story } from "./Story";
import { useTr } from "@/lib/i18n";

type Series = { name: string; unit: string; base: number; amp: number; max: number; color: string; v: number[]; spike: number; fired: boolean; mark: number };
const L = 240;

export default function AnomalySection() {
  const tr = useTr();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = ref.current!;
    const c = sec.querySelector("canvas")!, ctx = c.getContext("2d")!;
    const tk = sec.querySelector<HTMLElement>(".ticket")!;
    const [tTag, tTitle, tBody] = ["#tTag", "#tTitle", "#tBody"].map((s) => sec.querySelector<HTMLElement>(s)!);
    const series: Series[] = [
      { name: tr("Nhiệt độ phòng khách"), unit: "°C", base: 27, amp: 1.2, max: 31, color: "#38a9e0" },
      { name: tr("Độ ẩm phòng tắm"), unit: "%", base: 62, amp: 4, max: 80, color: "#2f9b68" },
      { name: tr("Công suất ổ cắm bếp"), unit: "W", base: 420, amp: 60, max: 900, color: "#f59e4a" },
    ].map((s) => ({ ...s, v: Array.from({ length: L }, (_, i) => s.base + Math.sin(i * 0.15) * s.amp * 0.5), spike: 0, fired: false, mark: -1 }));
    const step = prefersReducedMotion() ? 6 : 1; // giảm chuyển động: cập nhật thưa hơn
    let W = 0, H = 0, frame = 0, nextSpike = 80, ticketNo = 4127;
    const timers: number[] = [];
    const fit = () => {
      const d = canvasDpr(); W = c.clientWidth; H = c.clientHeight;
      c.width = W * d; c.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(c);

    const fire = (s: Series) => {
      tk.classList.remove("show"); tTag.className = "tag"; tTag.textContent = tr("Bất thường · {n}", { n: s.name });
      tTitle.textContent = tr("Vượt ngưỡng {v}", { v: `${s.max}${s.unit}` }); tBody.textContent = tr("Đang xác nhận qua nhiều lần đọc liên tiếp…");
      requestAnimationFrame(() => tk.classList.add("show"));
      timers.push(window.setTimeout(() => {
        tTag.className = "tag ok"; tTag.textContent = tr("Đã tạo phiếu");
        tTitle.textContent = tr("Phiếu bảo trì #MT-{n}", { n: ticketNo++ }); tBody.textContent = tr("Đã gửi kỹ thuật viên · chờ báo giá");
      }, 2200));
    };

    const stop = runWhileVisible(sec, () => {
      if (++frame % step === 0) {
        if (--nextSpike <= 0) { const s = series[Math.floor(Math.random() * 3)]; s.spike = 40; s.fired = false; nextSpike = 240; }
        series.forEach((s) => {
          let v = s.base + Math.sin(performance.now() * 0.002 + s.base) * s.amp * 0.5 + (Math.random() - 0.5) * s.amp * 0.6;
          if (s.spike > 0) {
            v += Math.sin(((40 - s.spike) / 40) * Math.PI) * (s.max - s.base) * 1.35; s.spike--;
            if (!s.fired && v > s.max) { s.fired = true; s.mark = L - 1; fire(s); }
          }
          s.v.push(v); s.v.shift(); if (s.mark >= 0) s.mark--;
        });
      }
      ctx.clearRect(0, 0, W, H);
      const lane = (H - 16) / 3, x0 = 16, x1 = W - 16;
      series.forEach((s, i) => {
        const y0 = 8 + i * lane, lo = s.base - s.amp * 2, hi = s.max + (s.max - s.base) * 0.6;
        const Y = (v: number) => y0 + lane - 12 - ((v - lo) / (hi - lo)) * (lane - 36), X = (j: number) => x0 + ((x1 - x0) * j) / (L - 1);
        ctx.strokeStyle = "#dceaf2"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 + lane - 6); ctx.lineTo(x1, y0 + lane - 6); ctx.stroke();
        ctx.setLineDash([5, 5]); ctx.strokeStyle = "#e86767"; ctx.beginPath(); ctx.moveTo(x0, Y(s.max)); ctx.lineTo(x1, Y(s.max)); ctx.stroke(); ctx.setLineDash([]);
        const grad = ctx.createLinearGradient(0, y0, 0, y0 + lane); grad.addColorStop(0, s.color + "40"); grad.addColorStop(1, s.color + "00");
        const path = () => { ctx.beginPath(); s.v.forEach((v, j) => (j ? ctx.lineTo(X(j), Y(v)) : ctx.moveTo(X(j), Y(v)))); };
        path(); ctx.lineTo(x1, y0 + lane - 6); ctx.lineTo(x0, y0 + lane - 6); ctx.fillStyle = grad; ctx.fill();
        path(); ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.stroke();
        const lv = s.v[L - 1]; ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(x1, Y(lv), 4, 0, 7); ctx.fill();
        if (s.mark > 0) { ctx.strokeStyle = "#e86767"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(s.mark), Y(s.v[s.mark]), 9, 0, 7); ctx.stroke(); }
        ctx.fillStyle = "#5f7184"; ctx.font = '12px "JetBrains Mono", monospace';
        const val = `${s.name} · ${lv.toFixed(s.unit === "W" ? 0 : 1)}${s.unit}`;
        ctx.fillText(W < 520 ? val : `${val} · ${tr("ngưỡng")} ${s.max}${s.unit}`, x0, y0 + 14); // màn hẹp: bỏ phần ngưỡng để không đè nhãn "Dữ liệu minh họa"
      });
    });
    return () => { stop(); ro.disconnect(); timers.forEach(clearTimeout); };
  }, [tr]);

  return (
    <section className="anomaly wrap" id="anomaly" ref={ref}>
      <div className="anomaly-text">
        <div className="eyebrow eyebrow-crit">{tr("Làm gì · 02 · Bất thường → bảo trì")}</div>
        <Story time="14:20">{tr("Nhà không có ai, độ ẩm phòng tắm tăng bất thường. Cảnh báo về ngay điện thoại chủ nhà.")}</Story>
        <h2>{tr("Phát hiện bất thường trước khi nó thành sự cố.")}</h2>
        <p className="lead">{tr("Nhiệt độ, độ ẩm, công suất được theo dõi liên tục. Ngưỡng có vùng trễ và cần nhiều lần đọc xác nhận để tránh báo nhầm. Khi chắc chắn có vấn đề, HESTA tạo phiếu bảo trì ngay từ cảnh báo.")}</p>
        <ul className="flow">{["Theo dõi", "Cảnh báo", "Phiếu bảo trì", "Báo giá", "Hoàn tất"].map((x) => <li key={x}>{tr(x)}</li>)}</ul>
        <button type="button" className="btn btn-danger" onClick={triggerGas}>{tr("Thử gây sự cố: mô phỏng rò gas")}</button>
      </div>
      <div className="chart-card">
        <canvas aria-label={tr("Biểu đồ telemetry minh họa với ngưỡng cảnh báo")} role="img" />
        <div className="ticket" aria-live="polite"><span className="tag" id="tTag">{tr("Bất thường")}</span><h4 id="tTitle">{tr("Đang theo dõi")}</h4><p id="tBody">{tr("Chờ dữ liệu vượt ngưỡng…")}</p></div>
        <span className="demo-note">{tr("Dữ liệu minh họa")}</span>
      </div>
    </section>
  );
}
