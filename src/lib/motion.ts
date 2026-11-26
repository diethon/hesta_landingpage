export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Màn cảm ứng (điện thoại/tablet): GPU yếu hơn nên giảm tải hiệu ứng. */
export const isTouch = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/** Pixel ratio cho canvas: điện thoại DPR 3 vẽ quá nhiều điểm ảnh, 1.5 vẫn nét. */
export const canvasDpr = () => Math.min(devicePixelRatio, isTouch() ? 1.5 : 2);

// Vị trí section được đo 1 lần rồi cache; chỉ đo lại khi trang đổi kích thước.
// Tránh gọi getBoundingClientRect mỗi khung hình sau khi section khác vừa ghi style (ép layout → giật khi cuộn).
let gen = 0, watching = false;
const boxes = new WeakMap<Element, { gen: number; top: number; height: number }>();
function box(el: Element) {
  if (!watching) {
    watching = true;
    addEventListener("resize", () => gen++);
    new ResizeObserver(() => gen++).observe(document.body);
  }
  let b = boxes.get(el);
  if (!b || b.gen !== gen) {
    const r = el.getBoundingClientRect();
    b = { gen, top: r.top + scrollY, height: r.height };
    boxes.set(el, b);
  }
  return b;
}

/** top/height của phần tử theo viewport, không ép layout. Chỉ dùng cho phần tử không sticky. */
export function viewRect(el: Element) {
  const b = box(el);
  return { top: b.top - scrollY, height: b.height };
}

// Làm mượt tiến độ cuộn: cuộn quán tính trên điện thoại nhảy theo từng bước, nội suy theo thời gian để chuyển động liền mạch.
const eased = new WeakMap<Element, { v: number; t: number }>();
function smooth(el: Element, target: number) {
  const now = performance.now(), s = eased.get(el);
  if (!s || now - s.t > 200 || prefersReducedMotion()) {
    eased.set(el, { v: target, t: now });
    return target;
  }
  s.v += (target - s.v) * (1 - Math.exp(-(now - s.t) / 60));
  s.t = now;
  if (Math.abs(target - s.v) < 1e-4) s.v = target;
  return s.v;
}

/** Tiến độ cuộn 0→1 của một section sticky (cao hơn viewport). */
export function stickyProgress(el: HTMLElement) {
  const r = viewRect(el);
  return smooth(el, clamp(-r.top / Math.max(1, r.height - window.innerHeight)));
}

/** Tiến độ 0→1 khi phần tử đi từ đáy lên đỉnh viewport. */
export function passProgress(el: HTMLElement) {
  const r = viewRect(el);
  return smooth(el, clamp((window.innerHeight - r.top) / (window.innerHeight + r.height)));
}

/** Chạy frame() mỗi khung hình, chỉ khi phần tử đang hiện trên màn hình và tab đang mở. */
export function runWhileVisible(el: Element, frame: (t: number) => void) {
  let visible = false;
  let id = 0;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
  io.observe(el);
  const loop = (t: number) => {
    if (visible && !document.hidden) frame(t);
    id = requestAnimationFrame(loop);
  };
  id = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(id);
    io.disconnect();
  };
}
