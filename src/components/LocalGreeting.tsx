"use client";
import { useEffect, useState } from "react";
import { useTr } from "@/lib/i18n";

// Một câu theo giờ thật của người xem; tính sau khi mount để không lệch với HTML render sẵn.
function line(h: number) {
  if (h < 5) return "HESTA đã khóa cửa và giảm đèn cho giấc ngủ của bạn";
  if (h < 9) return "HESTA vừa mở rèm phòng ngủ cho bạn";
  if (h < 17) return "Nhà đang vắng, HESTA đã tắt các thiết bị không cần";
  if (h < 19) return "Trời sắp tối, HESTA chuẩn bị bật đèn phòng khách";
  if (h < 23) return "HESTA vừa bật đèn phòng khách cho bạn";
  return "HESTA đã khóa cửa chính, chúc bạn ngủ ngon";
}

export default function LocalGreeting() {
  const tr = useTr();
  const [text, setText] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setText(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} · ${tr(line(d.getHours()))}`);
    };
    const t = setTimeout(tick, 0);
    const id = setInterval(tick, 30000);
    return () => { clearTimeout(t); clearInterval(id); };
  }, [tr]);
  return <p className="greet" aria-live="off">{text && <><i />{text}</>}</p>;
}
