export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Tiến độ cuộn 0→1 của một section sticky (cao hơn viewport). */
export function stickyProgress(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - window.innerHeight));
}

/** Tiến độ 0→1 khi phần tử đi từ đáy lên đỉnh viewport. */
export function passProgress(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return clamp((window.innerHeight - r.top) / (window.innerHeight + r.height));
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
