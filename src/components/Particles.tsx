"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { clamp, prefersReducedMotion, runWhileVisible } from "@/lib/motion";

export type ShapeKey = "house" | "sphere" | "wave" | "logo";
const COLORS: Record<ShapeKey, number> = { house: 0x38a9e0, sphere: 0x4dba87, wave: 0xf59e4a, logo: 0x0f1b26 };

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

export default function Particles({ shapes, count = 8000, cycleMs = 4500, burstFrom, paused = false, onShape, offset = [0, 0], className, interactive = false }: Props) {
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
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return; // không có WebGL: section vẫn đọc được nhờ nền CSS
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
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
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: COLORS[shapes[0]], size: 0.05, transparent: true, opacity: 0.85, depthWrite: false });
    const group = new THREE.Group();
    group.add(new THREE.Points(geo, mat));
    scene.add(group);

    const mouse = { x: 0, y: 0 };
    // Con trỏ = gói dữ liệu: chiếu con trỏ xuống mặt phẳng z=0 rồi đẩy (hoặc hút khi nhấn giữ) các hạt gần đó.
    const ptr = { ndc: new THREE.Vector2(), inside: false, down: false };
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1;
      const r = canvas.getBoundingClientRect();
      ptr.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      ptr.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const onDown = () => (ptr.down = ptr.inside);
    const onUp = () => (ptr.down = false);
    addEventListener("pointermove", onMove);
    if (interactive) { addEventListener("pointerdown", onDown); addEventListener("pointerup", onUp); }

    let cur = 0, last = 0, clock = 0, prev = 0;
    onShapeRef.current?.(shapes[0]);
    const stop = runWhileVisible(canvas, (t) => {
      const dt = prev ? Math.min(50, t - prev) : 16; prev = t;
      if (!pausedRef.current && !reduce) clock += dt;
      if (shapes.length > 1 && clock - last > cycleMs) {
        last = clock; cur = (cur + 1) % shapes.length;
        mat.color.setHex(COLORS[shapes[cur]]); onShapeRef.current?.(shapes[cur]);
      }
      const sec = burstFrom?.current;
      const burst = sec ? clamp(-sec.getBoundingClientRect().top / sec.offsetHeight) * 6 : 0;
      const tg = targets[cur], k = reduce ? 1 : 0.05;
      for (let i = 0; i < pos.length; i++) pos[i] += (tg[i] + jitter[i] * burst - pos[i]) * k;
      const wide = canvas.clientWidth > 860;
      group.position.set(wide ? offset[0] : 0, wide ? offset[1] : 1.1, 0);
      group.rotation.y = (shapes[cur] === "logo" ? Math.sin(clock * 0.0006) * 0.5 : clock * 0.00025) + mouse.x * 0.5;
      group.rotation.x = mouse.y * 0.2;
      if (interactive && ptr.inside && !reduce) {
        ray.setFromCamera(ptr.ndc, cam);
        if (ray.ray.intersectPlane(plane, hit)) {
          group.updateMatrixWorld(); group.worldToLocal(hit);
          const R = ptr.down ? 2.2 : 1.1, sign = ptr.down ? -0.06 : 0.12;
          for (let i = 0; i < pos.length; i += 3) {
            const dx = pos[i] - hit.x, dy = pos[i + 1] - hit.y, d = Math.hypot(dx, dy);
            if (d < R && d > 0.001) {
              const f = (1 - d / R) * sign;
              pos[i] += (dx / d) * f * (ptr.down ? d : 1); pos[i + 1] += (dy / d) * f * (ptr.down ? d : 1);
            }
          }
        }
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.85 - burst * 0.1;
      renderer.render(scene, cam);
    });

    return () => {
      stop(); ro.disconnect(); removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown); removeEventListener("pointerup", onUp);
      geo.dispose(); mat.dispose(); renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
