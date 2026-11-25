"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { HMark } from "./Logo";
import { passProgress, runWhileVisible } from "@/lib/motion";
import { useTr } from "@/lib/i18n";

const PHONE_DEVICES: [string, string, boolean][] = [
  ["Đèn phòng khách", "Bật · 80%", true],
  ["Điều hòa phòng ngủ", "26°C · làm mát", true],
  ["Cảm biến gas bếp", "Bình thường", false],
  ["Khóa cửa chính", "Đã khóa", true],
];

export default function Platforms() {
  const tr = useTr();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = ref.current!;
    const laptop = sec.querySelector<HTMLElement>(".laptop")!, phone = sec.querySelector<HTMLElement>(".phone")!;
    return runWhileVisible(sec, () => {
      const p = passProgress(sec), k = Math.min(1, p * 1.8); // tới giữa màn hình là phẳng
      laptop.style.transform = `perspective(1400px) rotateX(${(1 - k) * 28}deg) translateY(${(1 - k) * 60}px)`;
      phone.style.transform = `perspective(1000px) rotateY(${(1 - k) * -30}deg) translate(${(1 - k) * 80}px, ${(1 - k) * 120}px)`;
    });
  }, []);

  return (
    <section className="wrap platforms" id="platforms" ref={ref}>
      <div className="sec-head">
        <div className="eyebrow">Web · Mobile</div>
        <h2>{tr("Ở bàn làm việc hay trên đường về, nhà vẫn trong tầm tay.")}</h2>
        <p className="lead">{tr("Bản web cho quản lý chi tiết, app mobile (Flutter) cho điều khiển nhanh và nhận thông báo. Một tài khoản, dữ liệu đồng bộ realtime.")}</p>
      </div>
      <div className="devices">
        <div className="laptop">
          <div className="laptop-screen"><Image src="/screens/security-center.png" alt={tr("Màn hình Trung tâm an ninh của HESTA web")} width={1440} height={860} sizes="(max-width: 900px) 100vw, 900px" /></div>
          <div className="laptop-base" />
        </div>
        <div className="phone" aria-label={tr("Minh họa giao diện app mobile")}>
          <div className="phone-notch" />
          <div className="phone-head"><HMark className="phone-mark" /><span>{tr("Nhà của tôi")}</span></div>
          <div className="phone-alert"><b>{tr("Cảnh báo")}</b>{tr("Độ ẩm phòng tắm 82% vượt ngưỡng")}</div>
          {PHONE_DEVICES.map(([n, s, on]) => (
            <div className="phone-row" key={n}><span><b>{tr(n)}</b>{tr(s)}</span><i className={on ? "sw on" : "sw"} /></div>
          ))}
        </div>
      </div>
    </section>
  );
}
