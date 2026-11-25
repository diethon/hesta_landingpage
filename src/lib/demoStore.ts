"use client";
import { useSyncExternalStore } from "react";

// Trạng thái dùng chung cho các phần tương tác trên landing:
// mô phỏng sự cố, lệnh giọng nói, căn nhà 3D ở section Ngày & đêm và căn hộ mẫu 3D.
export type Room = "living" | "bed" | "kitchen" | "wc";
export const ROOMS: Room[] = ["living", "bed", "kitchen", "wc"];

export type DemoState = {
  incident: null | { stage: "alert" | "ticket"; ticket: number };
  lights: "auto" | "on" | "off"; // căn nhà ở section Ngày & đêm
  rooms: Record<Room, boolean>; // đèn từng phòng trong căn hộ mẫu
  ac: boolean;
  locked: boolean;
};

let state: DemoState = {
  incident: null, lights: "auto", ac: true, locked: false,
  rooms: { living: true, bed: false, kitchen: false, wc: false },
};
const listeners = new Set<() => void>();

export const demo = {
  get: () => state,
  set(patch: Partial<DemoState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export const useDemo = () => useSyncExternalStore(demo.subscribe, demo.get, demo.get);

/** Bật/tắt đèn: 1 phòng, hoặc cả nhà khi room bỏ trống (đồng bộ luôn căn nhà ở section Ngày & đêm). */
export function setLight(on: boolean, room?: Room) {
  const rooms = { ...state.rooms };
  for (const r of room ? [room] : ROOMS) rooms[r] = on;
  demo.set(room ? { rooms } : { rooms, lights: on ? "on" : "off" });
}

let timers: number[] = [];
let ticketNo = 5201;
export function triggerGas() {
  timers.forEach(clearTimeout);
  demo.set({ incident: { stage: "alert", ticket: ticketNo++ } });
  timers = [
    window.setTimeout(() => state.incident && demo.set({ incident: { ...state.incident, stage: "ticket" } }), 2600),
    window.setTimeout(endIncident, 14000),
  ];
}
export function endIncident() {
  timers.forEach(clearTimeout);
  demo.set({ incident: null });
}
