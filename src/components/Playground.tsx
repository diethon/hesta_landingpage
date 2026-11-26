"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { demo, setLight, triggerGas, useDemo, type Room } from "@/lib/demoStore";
import { canvasDpr, isTouch, runWhileVisible, prefersReducedMotion } from "@/lib/motion";
import { useLang, useTr } from "@/lib/i18n";
import VoiceTry from "./VoiceTry";

// Căn hộ mẫu 3D cùng mặt bằng 8,4 × 5,6 m với bản vẽ ở section Digital twin (đơn vị: mét, tâm ở giữa).
const ROOMS: { key: Room; name: string; x: [number, number]; z: [number, number]; floor: number }[] = [
  { key: "living", name: "Phòng khách", x: [-4.2, 0], z: [-2.8, 0.17], floor: 0xf4f8fb },
  { key: "bed", name: "Phòng ngủ", x: [0, 4.2], z: [-2.8, 0.17], floor: 0xeef7fb },
  { key: "kitchen", name: "Bếp", x: [-4.2, 2.26], z: [0.17, 2.8], floor: 0xfff7e0 },
  { key: "wc", name: "WC", x: [2.26, 4.2], z: [0.17, 2.8], floor: 0xe8faf0 },
];
type Key = Room | "ac" | "lock";

export default function Playground() {
  const tr = useTr(), lang = useLang();
  const s = useDemo();
  const ref = useRef<HTMLElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Key | null>(null);

  const toggle = (k: Key) => {
    const st = demo.get();
    if (k === "ac") demo.set({ ac: !st.ac });
    else if (k === "lock") demo.set({ locked: !st.locked });
    else setLight(!st.rooms[k], k);
  };
  const toggleRef = useRef(toggle);
  useEffect(() => { toggleRef.current = toggle; });

  useEffect(() => {
    const sec = ref.current!, canvas = sec.querySelector("canvas")!;
    let r: THREE.WebGLRenderer;
    try { r = new THREE.WebGLRenderer({ canvas, antialias: !isTouch(), alpha: true }); } catch { return; }
    r.setPixelRatio(canvasDpr());
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const fit = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(canvas);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe3ee, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.6); sun.position.set(4, 10, 6); scene.add(sun);
    const M = (c: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o });
    const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); mesh.position.set(x, y, z); scene.add(mesh); return mesh;
    };

    box(8.6, 0.2, 5.8, M(0xdceaf2), 0, -0.1, 0);
    const floors = new Map<Room, THREE.MeshStandardMaterial>();
    const lights = new Map<Room, { bulb: THREE.MeshStandardMaterial; pl: THREE.PointLight }>();
    const clickable: THREE.Object3D[] = [];
    for (const room of ROOMS) {
      const w = room.x[1] - room.x[0], d = room.z[1] - room.z[0], cx = (room.x[0] + room.x[1]) / 2, cz = (room.z[0] + room.z[1]) / 2;
      const fm = M(room.floor); floors.set(room.key, fm);
      box(w - 0.06, 0.02, d - 0.06, fm, cx, 0.01, cz);
      const bulb = M(0xffffff, { emissive: 0xf6c453, emissiveIntensity: 0 });
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 12), bulb); b.position.set(cx, 1.45, cz); b.userData.key = room.key; scene.add(b); clickable.push(b);
      const cord = box(0.02, 0.35, 0.02, M(0x94a3b8), cx, 1.72, cz); cord.userData.key = room.key;
      const pl = new THREE.PointLight(0xffd88a, 0, 6, 1.6); pl.position.set(cx, 1.3, cz); scene.add(pl);
      lights.set(room.key, { bulb, pl });
    }
    // Tường thấp (cắt ngang) để nhìn vào trong.
    const wallM = M(0xffffff), H = 0.9;
    box(8.4, H, 0.1, wallM, 0, H / 2, -2.8); box(0.1, H, 5.6, wallM, -4.2, H / 2, 0); box(0.1, H, 5.6, wallM, 4.2, H / 2, 0);
    box(2.2, H, 0.1, wallM, -3.1, H / 2, 2.8); box(5.4, H, 0.1, wallM, 1.5, H / 2, 2.8);
    box(0.1, H, 2.97, wallM, 0, H / 2, -1.31); box(6.46, H, 0.1, wallM, -0.97, H / 2, 0.17); box(0.1, H, 2.63, wallM, 2.26, H / 2, 1.49);
    // Nội thất tối giản.
    box(1.8, 0.35, 0.7, M(0x7a93a6), -2.4, 0.18, -2.2); box(1.6, 0.3, 2, M(0xcfe6f3), 2.4, 0.15, -1.6); box(1.6, 0.12, 0.5, M(0xffffff), 2.4, 0.36, -2.4);
    box(3.2, 0.8, 0.55, M(0xe9eff4), -2.5, 0.4, 2.45); box(1, 0.45, 0.6, M(0xffffff), 3.5, 0.23, 2.3);
    // Cửa chính + đèn khóa.
    const doorM = M(0x5a3a22); const door = box(0.85, 0.85, 0.06, doorM, -1.6, 0.43, 2.8); door.userData.key = "lock"; clickable.push(door);
    const ledM = new THREE.MeshBasicMaterial({ color: 0x2f9b68 }); const led = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), ledM); led.position.set(-1.3, 0.5, 2.86); led.userData.key = "lock"; scene.add(led); clickable.push(led);
    // Điều hòa phòng ngủ + luồng gió.
    const acM = M(0xffffff, { emissive: 0x38a9e0, emissiveIntensity: 0 }); const ac = box(1.1, 0.3, 0.22, acM, 2.2, 0.75, -2.62); ac.userData.key = "ac"; clickable.push(ac);
    const windM = new THREE.MeshBasicMaterial({ color: 0x8ed8f8, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const wind = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.2), windM); wind.rotation.x = -Math.PI / 2.6; wind.position.set(2.2, 0.45, -2.0); scene.add(wind);
    // Cảm biến gas ở bếp.
    const gasM = M(0xffffff, { emissive: 0xe86767, emissiveIntensity: 0 }); box(0.22, 0.22, 0.08, gasM, -3.6, 0.7, 2.73);

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    let az = 0.6, dragging = false, lastX = 0, moved = 0, idle = 0;
    const pick = (e: PointerEvent): Key | null => {
      const rc = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      return (ray.intersectObjects(clickable, false)[0]?.object.userData.key as Key) ?? null;
    };
    const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; moved = 0; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (dragging) { az -= (e.clientX - lastX) * 0.008; moved += Math.abs(e.clientX - lastX); lastX = e.clientX; idle = 0; }
      const k = pick(e); canvas.style.cursor = dragging && moved > 4 ? "grabbing" : k ? "pointer" : "grab"; setHover(k);
      if (tip.current) { const rc = sec.querySelector(".pg-stage")!.getBoundingClientRect(); tip.current.style.transform = `translate(${e.clientX - rc.left + 14}px, ${e.clientY - rc.top + 14}px)`; }
    };
    const onUp = (e: PointerEvent) => { dragging = false; if (moved < 5) { const k = pick(e); if (k) toggleRef.current(k); } };
    const onLeave = () => setHover(null);
    canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp); canvas.addEventListener("pointerleave", onLeave);

    const reduce = prefersReducedMotion();
    const stop = runWhileVisible(sec, (t) => {
      const st = demo.get();
      for (const room of ROOMS) {
        const on = st.rooms[room.key], L = lights.get(room.key)!;
        L.bulb.emissiveIntensity += ((on ? 1.4 : 0) - L.bulb.emissiveIntensity) * 0.15;
        L.pl.intensity += ((on ? 2.2 : 0) - L.pl.intensity) * 0.15;
      }
      const alarm = st.incident ? 0.5 + 0.5 * Math.sin(t * 0.012) : 0;
      floors.get("kitchen")!.emissive.setHex(0xe86767); floors.get("kitchen")!.emissiveIntensity = alarm * 0.5;
      gasM.emissiveIntensity = st.incident ? alarm * 1.5 : 0.15;
      acM.emissiveIntensity = st.ac ? 0.6 : 0;
      windM.opacity = st.ac ? 0.18 + 0.12 * Math.sin(t * 0.004) : 0;
      doorM.color.setHex(st.locked ? 0x24384c : 0x5a3a22); ledM.color.setHex(st.locked ? 0xe86767 : 0x2f9b68);
      if (!dragging && !reduce && ++idle > 240) az += 0.0015;
      cam.position.set(Math.sin(az) * 10.5, 10, Math.cos(az) * 10.5); cam.lookAt(0, 0, 0.3);
      r.render(scene, cam);
    });
    return () => {
      stop(); ro.disconnect(); r.dispose();
      canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp); canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const roomName = (k: Room) => {
    const n = tr(ROOMS.find((x) => x.key === k)!.name);
    // Tiếng Việt: "Đèn phòng khách" (viết thường chữ đầu, giữ nguyên "WC"); tiếng Anh giữ nguyên: "Living room light".
    return lang === "en" || n === n.toUpperCase() ? n : n[0].toLowerCase() + n.slice(1);
  };
  const label = (k: Key) => k === "ac" ? tr("Điều hòa phòng ngủ") : k === "lock" ? tr("Khóa cửa chính") : tr("Đèn {r}", { r: roomName(k) });
  const isOn = (k: Key) => k === "ac" ? s.ac : k === "lock" ? s.locked : s.rooms[k];
  const stateText = (k: Key) => k === "lock" ? (s.locked ? tr("Đã khóa") : tr("Đang mở")) : isOn(k) ? tr("Bật") : tr("Tắt");
  const KEYS: Key[] = ["living", "bed", "kitchen", "wc", "ac", "lock"];

  return (
    <section className="wrap playground" id="playground" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">{tr("Ngôi nhà mẫu")}</div>
        <h2>{tr("Tự tay điều khiển một căn hộ HESTA.")}</h2>
        <p className="lead">{tr("Bấm vào bóng đèn, điều hòa hay cửa chính trong mô hình. Kéo để xoay. Hoặc ra lệnh bằng giọng nói.")}</p>
      </div>
      <div className="pg-grid">
        <div className="pg-stage">
          <canvas aria-label={tr("Mô hình 3D căn hộ, có thể bấm vào thiết bị để bật tắt")} role="img" />
          <div className="pg-tip" ref={tip} hidden={!hover}>{hover && <><b>{label(hover)}</b>{stateText(hover)} · {tr("bấm để đổi")}</>}</div>
          {s.incident && <div className="pg-alert">{tr("Rò gas ở Bếp · đang xử lý")}</div>}
        </div>
        <div className="pg-panel">
          <ul className="pg-list">
            {KEYS.map((k) => (
              <li key={k}>
                <button type="button" className={`pg-dev ${isOn(k) ? "on" : ""}`} aria-pressed={isOn(k)} onClick={() => toggle(k)}>
                  <span><b>{label(k)}</b><small>{stateText(k)}</small></span><i className={`sw ${isOn(k) ? "on" : ""}`} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <VoiceTry id="pg" />
          <button type="button" className="btn btn-danger pg-gas" onClick={triggerGas}>{tr("Mô phỏng rò gas")}</button>
        </div>
      </div>
    </section>
  );
}
