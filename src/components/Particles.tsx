"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { canvasDpr, clamp, isTouch, prefersReducedMotion, runWhileVisible, viewRect } from "@/lib/motion";

export type ShapeKey = "house" | "sphere" | "wave" | "logo";
const COLORS: Record<ShapeKey, number> = { house: 0x38a9e0, sphere: 0x4dba87, wave: 0xf59e4a, logo: 0x0f1b26 };
const HOT: Record<ShapeKey, number> = { house: 0xf59e4a, sphere: 0x38a9e0, wave: 0xe86767, logo: 0x38a9e0 };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// Điểm nằm trong chữ H của logo (khung 399×624).
const inH = (x: number, y: number) =>
  (x <= 124 && y <= 562) || (x >= 274 && y >= 62) || (x >= 124 && x <= 249 && y >= 234 && y <= 359) || (x >= 149 && x <= 274 && y >= 296 && y <= 421);

function build(shape: ShapeKey, n: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0;
    if (shape === "house") {
      if (Math.random() < 0.62) {
        const f = Math.floor(Math.random() * 4);
        x = rnd(-2.2, 2.2); y = rnd(-2, 0.6); z = rnd(-1.8, 1.8);
        if (f === 0) x = -2.2; else if (f === 1) x = 2.2; else if (f === 2) z = -1.8; else z = 1.8;
      } else {
        const u = Math.random();
        x = rnd(-2.4, 2.4); z = (Math.random() < 0.5 ? -1 : 1) * 2 * (1 - u); y = 0.6 + u * 1.8;
      }
    } else if (shape === "sphere") {
      const th = Math.random() * Math.PI * 2, ph = Math.acos(rnd(-1, 1));
      x = 2.8 * Math.sin(ph) * Math.cos(th); y = 2.8 * Math.cos(ph); z = 2.8 * Math.sin(ph) * Math.sin(th);
    } else if (shape === "wave") {
      const cols = 100, rows = Math.ceil(n / cols);
      x = ((i % cols) / cols) * 8 - 4; z = (Math.floor(i / cols) / rows) * 6 - 3;
      y = Math.sin(x * 1.4) * 0.5 + Math.cos(z * 1.6) * 0.4;
    } else {
      let hx = 0, hy = 0;
      do { hx = rnd(0, 399); hy = rnd(0, 624); } while (!inH(hx, hy));
      const s = 5.4 / 624;
      x = (hx - 199.5) * s; y = (312 - hy) * s;
      z = Math.random() < 0.7 ? (Math.random() < 0.5 ? -0.35 : 0.35) : rnd(-0.35, 0.35);
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

type Props = {
  shapes: ShapeKey[];
  count?: number;
  cycleMs?: number;
  /** Section cha: cuộn ra khỏi nó thì hạt bung ra. */
  burstFrom?: React.RefObject<HTMLElement | null>;
  paused?: boolean;
  onShape?: (s: ShapeKey) => void;
  offset?: [number, number];
  className?: string;
  /** Con trỏ đẩy hạt, nhấn giữ để hút. */
  interactive?: boolean;
};

export default function Particles({ shapes, count: countProp = 8000, cycleMs = 4500, burstFrom, paused = false, onShape, offset = [0, 0], className, interactive = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const onShapeRef = useRef(onShape);
  useEffect(() => {
    pausedRef.current = paused;
    onShapeRef.current = onShape;
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true }); // điểm ảnh không cần MSAA
    } catch {
      return; // không có WebGL: section vẫn đọc được nhờ nền CSS
    }
    renderer.setPixelRatio(canvasDpr());
    const count = isTouch() ? Math.round(countProp * 0.55) : countProp; // vòng lặp CPU cập nhật từng hạt mỗi khung hình
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    cam.position.set(0, 0.6, 11.5);
    const fit = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(canvas);

    const targets = shapes.map((s) => build(s, count));
    const jitter = Float32Array.from({ length: count * 3 }, () => rnd(-1, 1));
    const reduce = prefersReducedMotion();
    const pos = reduce ? targets[0].slice() : Float32Array.from({ length: count * 3 }, () => rnd(-6, 6));
    const vel = new Float32Array(count * 3), heat = new Float32Array(count), col = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false });
    const group = new THREE.Group();
    group.add(new THREE.Points(geo, mat));
    scene.add(group);
    // Màu nền chuyển dần sang màu của hình mới; hạt đang chuyển động "nóng" lên thành màu nhấn.
    const base = new THREE.Color(COLORS[shapes[0]]), baseTo = base.clone(), hot = new THREE.Color(HOT[shapes[0]]);

    // Tương tác: khuấy (di chuyển), nhấp/chạm = sóng xung kích + đổi hình, giữ = hố xoáy rồi thả ra nổ, nghiêng máy = xoay.
    const mouse = { x: 0, y: 0 }, look = { x: 0, y: 0 }, tilt = { x: 0, y: 0, on: false };
    const ptr = { ndc: new THREE.Vector2(), inside: false, down: false, downAt: 0, sx: 0, sy: 0, moved: 0, has: false, px: 0, py: 0 };
    const waves: { x: number; y: number; t: number; f: number }[] = [];
    let charge = 0, cur = 0, last = 0, clock = 0, prev = 0, asked = false, shake = 0, lastShake = 0;
    let acc: { x: number; y: number; z: number } | null = null;
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
    const locate = () => {
      ray.setFromCamera(ptr.ndc, cam);
      if (!ray.ray.intersectPlane(plane, hit)) return false;
      group.updateMatrixWorld(); group.worldToLocal(hit);
      return true;
    };
    const next = () => {
      last = clock; cur = (cur + 1) % shapes.length;
      baseTo.setHex(COLORS[shapes[cur]]); hot.setHex(HOT[shapes[cur]]); onShapeRef.current?.(shapes[cur]);
    };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1;
      const r = canvas.getBoundingClientRect();
      ptr.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      ptr.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      if (ptr.down) ptr.moved = Math.max(ptr.moved, Math.hypot(e.clientX - ptr.sx, e.clientY - ptr.sy));
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      tilt.on = true; tilt.x = clamp(e.gamma / 30, -1, 1); tilt.y = clamp(((e.beta ?? 45) - 45) / 30, -1, 1);
    };
    // Lắc máy: gia tốc đổi đột ngột → hạt văng tung như quả cầu tuyết rồi đổi hình.
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (a?.x == null || a.y == null || a.z == null) return;
      const now = performance.now();
      if (acc && Math.abs(a.x - acc.x) + Math.abs(a.y - acc.y) + Math.abs(a.z - acc.z) > 26 && now - lastShake > 900 && !document.hidden) {
        lastShake = now; shake = 1; waves.push({ x: 0, y: 0, t: now, f: 2.5 });
        if (shapes.length > 1) next();
      }
      acc = { x: a.x, y: a.y, z: a.z };
    };
    // Cảm biến chỉ chạy trên HTTPS; iOS còn phải xin quyền sau một lần chạm của người dùng.
    type Perm = { requestPermission?: () => Promise<string> };
    const DOEv = typeof DeviceOrientationEvent === "undefined" ? undefined : (DeviceOrientationEvent as unknown as Perm);
    const DMEv = typeof DeviceMotionEvent === "undefined" ? undefined : (DeviceMotionEvent as unknown as Perm);
    // Safari chỉ hiện hộp thoại khi gọi trong touchend/click (pointerdown không tính là thao tác người dùng).
    // Gọi ở lần chạm bất kỳ trên trang; bị từ chối/lỗi thì lần chạm sau hỏi lại.
    const askTilt = () => {
      if (asked) return;
      asked = true;
      const ask = (P: Perm | undefined, type: "deviceorientation" | "devicemotion", fn: EventListener) =>
        P?.requestPermission?.().then((s) => {
          if (s === "granted") { addEventListener(type, fn); removeEventListener("touchend", askTilt); }
          else asked = false;
        }).catch(() => (asked = false));
      ask(DOEv, "deviceorientation", onTilt as EventListener);
      ask(DMEv, "devicemotion", onMotion as EventListener);
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      if (!ptr.inside || (e.target as Element).closest?.("a, button")) return;
      Object.assign(ptr, { down: true, downAt: performance.now(), sx: e.clientX, sy: e.clientY, moved: 0 });
    };
    const onUp = (e: PointerEvent) => {
      if (!ptr.down) return;
      ptr.down = false;
      const held = performance.now() - ptr.downAt;
      if (ptr.moved < 12 && locate()) {
        waves.push({ x: hit.x, y: hit.y, t: performance.now(), f: held < 280 ? 1 : 1 + charge * 3 });
        if (held < 280 && shapes.length > 1) next();
      }
      charge = 0;
      if (e.pointerType !== "mouse") ptr.inside = false; // nhấc ngón tay thì không còn "con trỏ"
    };
    const onCancel = () => { ptr.down = false; ptr.inside = false; charge = 0; }; // trình duyệt chuyển sang cuộn trang
    addEventListener("pointermove", onMove);
    if (interactive) {
      addEventListener("pointerdown", onDown); addEventListener("pointerup", onUp); addEventListener("pointercancel", onCancel);
      if (DOEv && !DOEv.requestPermission) addEventListener("deviceorientation", onTilt);
      if (DMEv && !DMEv.requestPermission) addEventListener("devicemotion", onMotion);
      if (DOEv?.requestPermission || DMEv?.requestPermission) addEventListener("touchend", askTilt, { passive: true });
    }

    onShapeRef.current?.(shapes[0]);
    const stop = runWhileVisible(canvas, (t) => {
      const dt = prev ? Math.min(50, t - prev) : 16; prev = t;
      if (!pausedRef.current && !reduce) clock += dt;
      if (shapes.length > 1 && clock - last > cycleMs) next();
      const sec = burstFrom?.current;
      const burst = sec ? (({ top, height }) => clamp(-top / height) * 6)(viewRect(sec)) : 0;
      const w = canvas.clientWidth, wide = w > 860, phone = w < 600;
      // Điện thoại: thu nhỏ và đẩy hình lên nửa trên để không đè chữ hero.
      group.position.set(wide ? offset[0] : 0, wide ? offset[1] : phone ? 2.85 : 1.1, 0);
      group.scale.setScalar(phone ? 0.42 : 1);
      const aim = tilt.on ? tilt : mouse;
      look.x += (aim.x - look.x) * 0.08; look.y += (aim.y - look.y) * 0.08;
      group.rotation.y = (shapes[cur] === "logo" ? Math.sin(clock * 0.0006) * 0.5 : clock * 0.00025) + look.x * 0.5;
      group.rotation.x = look.y * 0.2;
      base.lerp(baseTo, 0.06);

      const tg = targets[cur], now = performance.now();
      if (reduce) {
        pos.set(tg);
      } else {
        const act = interactive && ptr.inside && locate();
        let px = 0, py = 0, pvx = 0, pvy = 0;
        if (act) {
          px = hit.x; py = hit.y;
          if (ptr.has) { pvx = px - ptr.px; pvy = py - ptr.py; }
          ptr.px = px; ptr.py = py;
        }
        ptr.has = act;
        const speed = Math.min(0.5, Math.hypot(pvx, pvy));
        const holding = act && ptr.down && ptr.moved < 12 && now - ptr.downAt > 280;
        if (holding) charge = Math.min(1, charge + dt / 1500);
        for (let k = waves.length - 1; k >= 0; k--) if (now - waves[k].t > 1400) waves.splice(k, 1);
        // Lò xo có quán tính (thay cho nội suy thẳng): hạt vọt quá rồi lắc về, cảm giác như vật chất thật.
        const s = Math.min(2, dt / 16.7), damp = 0.87 ** s, K = 0.014 * s;
        const kick = shake * 0.3; shake = 0;
        const gx = tilt.on ? tilt.x * 0.006 * s : 0, gy = tilt.on ? -tilt.y * 0.006 * s : 0; // nghiêng: hạt trĩu về phía thấp
        for (let i = 0, j = 0; i < pos.length; i += 3, j++) {
          const x = pos[i], y = pos[i + 1];
          let vx = vel[i] + (tg[i] + jitter[i] * burst - x) * K;
          let vy = vel[i + 1] + (tg[i + 1] + jitter[i + 1] * burst - y) * K;
          let vz = vel[i + 2] + (tg[i + 2] + jitter[i + 2] * burst - pos[i + 2]) * K;
          vx += gx + jitter[i] * kick; vy += gy + jitter[i + 1] * kick; vz += jitter[i + 2] * kick;
          if (act) {
            const dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
            if (holding && d2 < 9) { // hố xoáy: hút vào + quay quanh điểm giữ
              const d = Math.sqrt(d2) + 0.05, f = ((1 - d / 3) * (0.6 + charge) * s) / d;
              vx += (-dx * 0.02 - dy * 0.035) * f; vy += (-dy * 0.02 + dx * 0.035) * f;
            } else if (speed > 0.002 && d2 < 1.44) { // khuấy: kéo theo hướng con trỏ + xoáy nhẹ
              const d = Math.sqrt(d2) + 0.05, f = 1 - d / 1.2;
              vx += (pvx * 0.35 - (dy / d) * speed * 0.25) * f; vy += (pvy * 0.35 + (dx / d) * speed * 0.25) * f;
              vz += jitter[i + 2] * speed * 0.3 * f;
            }
          }
          for (const wv of waves) { // vòng sóng lan ra 7 đơn vị/giây, đẩy hạt nằm trên mép sóng
            const age = now - wv.t, dx = x - wv.x, dy = y - wv.y, d = Math.sqrt(dx * dx + dy * dy) + 0.001, g = Math.abs(d - age * 0.007);
            if (g < 0.45) {
              const f = (1 - g / 0.45) * 0.05 * wv.f * (1 - age / 1400) * s;
              vx += (dx / d) * f; vy += (dy / d) * f; vz += jitter[i + 2] * f;
            }
          }
          vx *= damp; vy *= damp; vz *= damp;
          vel[i] = vx; vel[i + 1] = vy; vel[i + 2] = vz;
          pos[i] += vx * s; pos[i + 1] += vy * s; pos[i + 2] += vz * s;
          heat[j] = Math.max(heat[j] * 0.95, Math.min(1, (Math.abs(vx) + Math.abs(vy) + Math.abs(vz)) * 7));
        }
      }
      for (let i = 0, j = 0; i < col.length; i += 3, j++) {
        const h = heat[j];
        col[i] = base.r + (hot.r - base.r) * h; col[i + 1] = base.g + (hot.g - base.g) * h; col[i + 2] = base.b + (hot.b - base.b) * h;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      mat.opacity = 0.85 - burst * 0.1;
      renderer.render(scene, cam);
    });

    return () => {
      stop(); ro.disconnect(); removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown); removeEventListener("pointerup", onUp); removeEventListener("pointercancel", onCancel);
      removeEventListener("deviceorientation", onTilt); removeEventListener("devicemotion", onMotion); removeEventListener("touchend", askTilt);
      geo.dispose(); mat.dispose(); renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
