"use client";
import { useTr } from "@/lib/i18n";
// Sơ đồ luồng dữ liệu; chấm sáng chạy dọc đường nối bằng SVG animateMotion (không cần JS).
const NODES: [number, string, string][] = [
  [70, "Thiết bị IoT", "Cảm biến · công tắc · khóa"],
  [250, "MQTT broker", "command · ack · state"],
  [430, "Spring Boot", "Java 21 · REST · rule engine"],
  [610, "PostgreSQL", "Lịch sử · cấu hình · phiếu"],
  [790, "WebSocket", "Đẩy sự kiện realtime"],
  [970, "Web & App", "React · Flutter"],
];

export default function TechFlow() {
  const tr = useTr();
  return (
    <section className="wrap tech" id="tech">
      <div className="sec-head">
        <div className="eyebrow">{tr("Công nghệ")}</div>
        <h2>{tr("Từ cảm biến tới màn hình của bạn.")}</h2>
      </div>
      <div className="tech-scroll">
        <svg viewBox="0 0 1040 220" className="tech-svg" role="img" aria-label={tr("Luồng dữ liệu: Thiết bị IoT, MQTT, Spring Boot, PostgreSQL, WebSocket, Web và App")}>
          <path id="flow" d="M70 90 H970" className="tech-line" />
          {NODES.map(([x, t, d]) => (
            <g key={t}>
              <circle cx={x} cy={90} r="26" className="tech-node" />
              <circle cx={x} cy={90} r="8" className="tech-dot" />
              <text x={x} y={150} className="tech-t">{tr(t)}</text>
              <text x={x} y={172} className="tech-d">{tr(d)}</text>
            </g>
          ))}
          {[0, 1.2, 2.4].map((b) => (
            <circle key={b} r="5" className="tech-pulse">
              <animateMotion dur="3.6s" begin={`${b}s`} repeatCount="indefinite"><mpath href="#flow" /></animateMotion>
            </circle>
          ))}
        </svg>
      </div>
    </section>
  );
}
