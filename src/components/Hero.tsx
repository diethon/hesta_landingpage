"use client";
import { useEffect, useRef, useState } from "react";
import Particles, { type ShapeKey } from "./Particles";
import LocalGreeting from "./LocalGreeting";
import { prefersReducedMotion } from "@/lib/motion";
import { useTr } from "@/lib/i18n";
import { DASHBOARD_URL } from "@/content/project";

const NAMES: Record<ShapeKey, string> = { house: "Ngôi nhà", sphere: "Hệ sinh thái thiết bị", wave: "Dòng dữ liệu", logo: "HESTA" };

export default function Hero() {
  const tr = useTr();
  const ref = useRef<HTMLElement>(null);
  const packet = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<ShapeKey>("house");
  const [paused, setPaused] = useState(false);

  // Con trỏ ở hero: chấm nhỏ bám sát, vòng tròn trôi theo sau, quầng sáng trên nền đi theo chuột. Chỉ trên thiết bị có chuột.
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    const sec = ref.current!, el = packet.current!;
    const dot = el.querySelector<HTMLElement>(".cur-dot")!, ring = el.querySelector<HTMLElement>(".cur-ring")!;
    let x = 0, y = 0, tx = 0, ty = 0, id = 0;
    const move = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; el.dataset.on = "1";
      dot.style.transform = `translate(${tx}px, ${ty}px)`;
    };
    const leave = () => (el.dataset.on = "0");
    const down = () => (el.dataset.down = "1"), up = () => (el.dataset.down = "0");
    const loop = () => {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      ring.style.transform = `translate(${x}px, ${y}px)`;
      sec.style.setProperty("--cx", `${x}px`); sec.style.setProperty("--cy", `${y}px`);
      id = requestAnimationFrame(loop);
    };
    sec.addEventListener("pointermove", move); sec.addEventListener("pointerleave", leave);
    sec.addEventListener("pointerdown", down); addEventListener("pointerup", up);
    id = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id); sec.removeEventListener("pointermove", move); sec.removeEventListener("pointerleave", leave);
      sec.removeEventListener("pointerdown", down); removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <section className="hero" id="top" ref={ref}>
      <Particles className="hero-canvas" shapes={["house", "sphere", "wave", "logo"]} burstFrom={ref} paused={paused} onShape={setShape} offset={[3.4, 0]} interactive />
      <div className="cursor" ref={packet} aria-hidden="true"><i className="cur-ring" /><i className="cur-dot" /></div>
      <div className="wrap hero-copy">
        <LocalGreeting />
        <div className="eyebrow">Smart home platform · <span className="hero-shape">{tr(NAMES[shape])}</span></div>
        <h1>{tr("Ngôi nhà của bạn, sống trong từng điểm dữ liệu.")}</h1>
        <p className="lead">{tr("HESTA gom mọi cảm biến, thiết bị và kịch bản vào một bản sao số của ngôi nhà. Theo dõi theo thời gian thực, phát hiện bất thường và xử lý trước khi thành sự cố.")}</p>
        <div className="cta-row">
          <a className="btn btn-ink" href={DASHBOARD_URL}>{tr("Dùng bản web")}</a>
          <a className="btn btn-glass" href="#platforms">{tr("Tải app mobile")}</a>
        </div>
        <dl className="stats">
          <div><dt>Realtime</dt><dd>MQTT + WebSocket</dd></div>
          <div><dt>{tr("2 nền tảng")}</dt><dd>{tr("Web & Mobile")}</dd></div>
          <div><dt>24/7</dt><dd>{tr("Kịch bản tự chạy")}</dd></div>
        </dl>
      </div>
      <p className="hero-hint">{tr("Di chuột để đẩy dữ liệu · nhấn giữ để hút về")}</p>
      <button type="button" className="pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
        {paused ? tr("▶ Chạy hiệu ứng") : tr("❚❚ Tạm dừng hiệu ứng")}
      </button>
      <a className="scroll-cue" href="#name">{tr("Cuộn xuống")}</a>
    </section>
  );
}
