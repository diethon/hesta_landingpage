// Mô hình tiêu thụ điện minh họa cho 1 căn hộ + giá điện sinh hoạt bậc thang.
// shortcut: giá EVN theo QĐ 1279/QĐ-BCT (05/2025), chưa VAT; cập nhật TIERS khi EVN điều chỉnh giá.
export const TIERS: [limit: number, price: number][] = [
  [50, 1984], [100, 2050], [200, 2380], [300, 2998], [400, 3350], [Infinity, 3460],
];

/** Tiền điện (đồng, chưa VAT) cho số kWh trong tháng, tính lũy tiến theo bậc. */
export function billVnd(kwh: number) {
  let rest = Math.max(0, kwh), prev = 0, sum = 0;
  for (const [limit, price] of TIERS) {
    const used = Math.min(rest, limit - prev);
    sum += used * price; rest -= used; prev = limit;
    if (rest <= 0) break;
  }
  return Math.round(sum);
}

export type Plan = { acOff: number; lightsAuto: boolean; heaterSchedule: boolean; standbyCut: boolean };
export const BASELINE: Plan = { acOff: 6, lightsAuto: false, heaterSchedule: false, standbyCut: false };

const AC_KW = 1.1, AC_START = 21;
/** Công suất trung bình (kW) theo từng giờ 0..23 trong ngày. */
export function hourlyKw(p: Plan) {
  const acHours = (p.acOff - AC_START + 24) % 24;
  return Array.from({ length: 24 }, (_, h) => {
    let kw = 0.25; // tủ lạnh, quạt, thiết bị khác
    if ((h - AC_START + 24) % 24 < acHours) kw += AC_KW;
    if (!p.lightsAuto && h >= 18 && h < 23) kw += 0.12; // đèn quên tắt ở phòng không người
    kw += p.heaterSchedule ? (h === 5 || h === 18 ? 0.2 : 0) : 1.6 / 24; // bình nóng lạnh giữ nhiệt cả ngày
    kw += (p.standbyCut ? 0.2 : 1) / 24; // thiết bị chờ (TV, sạc)
    return kw;
  });
}

export const monthlyKwh = (p: Plan) => Math.round(hourlyKw(p).reduce((a, b) => a + b, 0) * 30);
