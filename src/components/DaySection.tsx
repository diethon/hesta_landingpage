"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { clamp, runWhileVisible, stickyProgress } from "@/lib/motion";
import { demo } from "@/lib/demoStore";
import VoiceTry from "./VoiceTry";
import { Story } from "./Story";
import { useTr } from "@/lib/i18n";

const PLAN: [number, string][] = [
  [6.5, "Rèm phòng ngủ tự mở"],
  [8, "Ra khỏi nhà · tắt toàn bộ đèn"],
  [12, "Điều hòa 26°C · có người ở nhà"],
  [18.5, "Trời tối · đèn phòng khách bật"],
  [23, "Khóa cửa chính · chế độ ngủ"],
  [2, "Chuyển động lạ · đã báo chủ nhà"],
];
const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`;

export default function DaySection() {
  const tr = useTr();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = ref.current!;
    const canvas = sec.querySelector("canvas")!;
    const clock = sec.querySelector<HTMLElement>(".clock")!, phase = sec.querySelector<HTMLElement>(".phase")!, ev = sec.querySelector<HTMLElement>(".events")!;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch { return; }
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    const fit = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(canvas);

    const hemi = new THREE.HemisphereLight(0xbfe6f7, 0x3a4a5a, 0.6); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1d6, 1); scene.add(sun);
    const M = (c: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...o });
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); scene.add(m); return m; };
    add(new THREE.CylinderGeometry(10, 10, 0.4, 56), M(0x9fe3c6), 0, -0.2, 0);
    add(new THREE.BoxGeometry(4, 2.6, 3.4), M(0xf4f8fb), 0, 1.3, 0);
    add(new THREE.ConeGeometry(3.6, 1.8, 4), M(0x24384c), 0, 3.5, 0).rotation.y = Math.PI / 4;
    const winM = M(0x22313f, { emissive: 0xf6c453, emissiveIntensity: 0 });
    [[-1.1, 1.6], [1.1, 1.6], [-1.1, 0.6]].forEach(([x, y]) => add(new THREE.PlaneGeometry(0.8, 0.7), winM, x, y, 1.71));
    const doorM = M(0x5a3a22);
    add(new THREE.PlaneGeometry(0.8, 1.3), doorM, 1.1, 0.65, 1.71);
    const lockLed = add(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: 0x2f9b68 }), 0.82, 0.7, 1.74);
    add(new THREE.PlaneGeometry(1, 0.7), winM, 2.01, 1.5, 0).rotation.y = Math.PI / 2;
    const glow = new THREE.PointLight(0xf6c453, 0, 9); glow.position.set(0, 1.4, 2.8); scene.add(glow);
    [[-4.5, -2], [4.8, -1.5], [-3.8, 3], [5.4, 3.2], [0, -5.5], [-6, 0.5]].forEach(([x, z], i) => add(new THREE.ConeGeometry(0.7, 2 + (i % 2), 6), M(0x4dba87), x, 1 + (i % 2) * 0.5, z));
    const ball = add(new THREE.SphereGeometry(0.55, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
    const moon = add(new THREE.SphereGeometry(0.35, 16, 8), new THREE.MeshBasicMaterial({ color: 0xf4f8fb }));
    const cDay = new THREE.Color(0xbfe6f7), cDusk = new THREE.Color(0xf5b27a), cNight = new THREE.Color(0x8fa9c4);
    let shown = -1;
    // Bắt đầu từ giờ thật của người xem, cuộn tiếp thì đi hết 24h.
    const now = new Date(), startH = now.getHours() + now.getMinutes() / 60;
    const off = (h: number) => (h - startH + 24) % 24;
    sec.querySelector<HTMLElement>(".day-start")!.textContent = tr("Bắt đầu từ giờ của bạn · {t}", { t: fmt(startH) });

    const stop = runWhileVisible(sec, () => {
      const p = stickyProgress(sec), el24 = p * 23.99, hours = (startH + el24) % 24, a = ((hours - 6) / 24) * Math.PI * 2; // 6h = mặt trời mọc
      const e = Math.sin(a), d = clamp(e * 2.2 + 0.15);
      sun.position.set(Math.cos(a) * 13, e * 11, 4); ball.position.copy(sun.position); moon.position.set(-sun.position.x, -sun.position.y, -4);
      sun.intensity = d * 1.6; hemi.intensity = 0.35 + d * 0.7;
      scene.background = cNight.clone().lerp(cDusk, Math.min(1, d * 2)).lerp(cDay, Math.max(0, d * 2 - 1));
      const { lights, locked } = demo.get();
      const target = lights === "on" ? 1.5 : lights === "off" ? 0 : hours >= 18.5 || hours < 6.3 ? 1.5 : 0;
      doorM.color.setHex(locked ? 0x24384c : 0x5a3a22);
      (lockLed.material as THREE.MeshBasicMaterial).color.setHex(locked ? 0xe86767 : 0x2f9b68);
      winM.emissiveIntensity += (target - winM.emissiveIntensity) * 0.08; glow.intensity = winM.emissiveIntensity * 4;
      clock.textContent = fmt(hours);
      phase.textContent = tr(hours < 5 ? "Đêm khuya" : hours < 7 ? "Bình minh" : hours < 17 ? "Ban ngày" : hours < 19 ? "Hoàng hôn" : "Ban đêm");
      const passed = PLAN.filter(([h]) => off(h) <= el24);
      if (passed.length !== shown) {
        shown = passed.length;
        ev.replaceChildren(...passed.slice(-3).reverse().map(([h, m]) => {
          const n = document.createElement("div"); const b = document.createElement("b");
          b.textContent = fmt(h); n.append(b, tr(m)); return n;
        }));
      }
      const wide = canvas.clientWidth > 860, ang = Math.atan2(11, 9) + p * 0.9;
      cam.position.set(Math.cos(ang) * 14.5, 6.2, Math.sin(ang) * 14.5); cam.lookAt(wide ? -2.5 : 0, 1.6, 0);
      r.render(scene, cam);
    });
    return () => { stop(); ro.disconnect(); r.dispose(); };
  }, [tr]);

  return (
    <section className="scrub day" id="automation" ref={ref} style={{ height: "340vh" }}>
      <div className="sticky">
        <canvas aria-hidden="true" />
        <div className="wrap day-over">
          <div className="day-top">
            <div className="glass"><div className="clock">--:--</div><div className="phase">&nbsp;</div><div className="day-start" /></div>
            <div className="events" aria-live="polite" />
          </div>
          <div className="glass day-copy">
            <div className="eyebrow eyebrow-on">{tr("Làm gì · 03 · Tự động hóa")}</div>
            <Story time="18:30">{tr("Trời tối, đèn phòng khách tự bật trước khi có người về.")}</Story>
            <h2>{tr("Ngôi nhà tự vận hành theo nhịp sống của bạn.")}</h2>
            <p className="lead">{tr("Cuộn để đi qua một ngày. Hoặc tự ra lệnh cho căn nhà:")}</p>
            <VoiceTry />
          </div>
        </div>
      </div>
    </section>
  );
}
