// Chạy: node --test src/lib/energy.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { BASELINE, billVnd, hourlyKw, monthlyKwh } from "./energy.ts";

test("giá bậc thang", () => {
  assert.equal(billVnd(0), 0);
  assert.equal(billVnd(50), 50 * 1984);
  assert.equal(billVnd(100), 50 * 1984 + 50 * 2050);
  assert.equal(billVnd(250), 50 * 1984 + 50 * 2050 + 100 * 2380 + 50 * 2998);
  assert.equal(billVnd(500), 50 * 1984 + 50 * 2050 + 100 * 2380 + 100 * 2998 + 100 * 3350 + 100 * 3460);
});

test("điều hòa chạy từ 21h tới giờ tắt", () => {
  const on = (off: number) => hourlyKw({ ...BASELINE, acOff: off }).filter((kw) => kw > 1).length;
  assert.equal(on(6), 9);
  assert.equal(on(23), 2);
  assert.equal(on(0), 3);
});

test("HESTA luôn tiêu thụ ít hơn hoặc bằng", () => {
  const all = { acOff: 23, lightsAuto: true, heaterSchedule: true, standbyCut: true };
  assert.ok(monthlyKwh(all) < monthlyKwh(BASELINE));
  assert.ok(billVnd(monthlyKwh(all)) < billVnd(monthlyKwh(BASELINE)));
});
