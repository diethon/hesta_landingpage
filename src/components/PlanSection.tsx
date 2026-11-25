"use client";
import { useEffect, useRef } from "react";
import { clamp, runWhileVisible, stickyProgress } from "@/lib/motion";
import { Story } from "./Story";
import { useTr } from "@/lib/i18n";

const STEPS = ["Dựng tường bao và vách ngăn", "Đặt cửa, ghi kích thước", "Đặt tên phòng", "Gắn thiết bị, trạng thái hiện trực tiếp"];
const DEVICES: [number, number, string, string, number, number][] = [
  [200, 96, "#e0a51f", "Đèn · BẬT", 216, 100],
  [500, 90, "#2f9b68", "Điều hòa 26°C", 404, 74],
  [90, 276, "#e86767", "Gas · cảnh báo", 106, 280],
  [500, 362, "#38a9e0", "Độ ẩm 71%", 452, 350],
  [260, 190, "#2f9b68", "Gateway MQTT", 140, 194],
];

export default function PlanSection() {
  const tr = useTr();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = ref.current!;
    const groups = [...sec.querySelectorAll<SVGGElement>("[data-step]")];
    const steps = [...sec.querySelectorAll<HTMLElement>(".steps li")];
    const bar = sec.querySelector<HTMLElement>(".bar i")!;
    return runWhileVisible(sec, () => {
      const p = stickyProgress(sec);
      bar.style.transform = `scaleX(${p})`;
      groups.forEach((g, gi) => {
        const a = (gi / groups.length) * 0.92, b = ((gi + 1) / groups.length) * 0.92, lp = clamp((p - a) / (b - a));
        steps[gi].classList.toggle("on", p > a);
        const strokes = g.querySelectorAll<SVGElement>(".s"), fades = g.querySelectorAll<SVGElement>(":scope > .f");
        strokes.forEach((s, i) => (s.style.strokeDashoffset = String(1 - clamp(lp * strokes.length - i))));
        fades.forEach((f, i) => {
          const k = clamp(lp * fades.length - i);
          f.style.opacity = String(k);
          f.style.transform = `scale(${0.5 + 0.5 * k})`;
        });
      });
    });
  }, []);

  return (
    <section className="scrub plan" id="twin" ref={ref} style={{ height: "320vh" }}>
      <div className="sticky"><div className="wrap split">
        <div>
          <div className="eyebrow">{tr("Làm gì · 01 · Digital twin")}</div>
          <Story time="07:00">{tr("Dựng mặt bằng căn hộ, gắn 12 thiết bị vào đúng phòng.")}</Story>
          <h2>{tr("Vẽ nhà một lần. Quản lý mãi mãi.")}</h2>
          <p className="lead">{tr("Dựng mặt bằng, chia phòng, gắn thiết bị vào đúng vị trí. Mọi trạng thái hiện ngay trên bản vẽ, cả dạng 2D lẫn 3D.")}</p>
          <ol className="steps">{STEPS.map((s, i) => <li key={s}><span>{String(i + 1).padStart(2, "0")}</span>{tr(s)}</li>)}</ol>
          <div className="bar"><i /></div>
        </div>
        <div className="bp-box">
          <svg className="bp" viewBox="0 0 640 460" aria-label={tr("Mặt bằng căn hộ 8,4 × 5,6 m với các thiết bị HESTA")}>
            <rect className="zone-alert" x="42" y="232" width="396" height="156" />
            <g data-step="0">
              <rect className="s" x="40" y="50" width="520" height="340" pathLength={1} />
              <line className="s" x1="300" y1="50" x2="300" y2="230" pathLength={1} />
              <line className="s" x1="40" y1="230" x2="440" y2="230" pathLength={1} />
              <line className="s" x1="440" y1="230" x2="440" y2="390" pathLength={1} />
            </g>
            <g data-step="1">
              <path className="s thin" d="M190 230 a44 44 0 0 1 44 -44" pathLength={1} />
              <path className="s thin" d="M440 300 a40 40 0 0 0 -40 40" pathLength={1} />
              <path className="s thin" d="M300 140 a40 40 0 0 1 40 40" pathLength={1} />
              <line className="s thin" x1="40" y1="26" x2="560" y2="26" pathLength={1} />
              <line className="s thin" x1="584" y1="50" x2="584" y2="390" pathLength={1} />
              <text className="f" x="276" y="20">8 400</text>
              <text className="f" x="590" y="224">5 600</text>
            </g>
            <g data-step="2">
              <text className="f room" x="96" y="140">{tr("Phòng khách")}</text>
              <text className="f room" x="372" y="140">{tr("Phòng ngủ")}</text>
              <text className="f room" x="150" y="320">{tr("Bếp")}</text>
              <text className="f room" x="476" y="320">WC</text>
            </g>
            <g data-step="3">
              {DEVICES.map(([cx, cy, c, label, tx, ty]) => (
                <g className="f" key={label}>
                  <circle className="ring" cx={cx} cy={cy} r="18" stroke={c} />
                  <circle cx={cx} cy={cy} r="8" fill={c} />
                  <text x={tx} y={ty}>{tr(label)}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div></div>
    </section>
  );
}
