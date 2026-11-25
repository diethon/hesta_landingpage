// Dòng tình huống theo giờ trong ngày, mở đầu các section "Làm gì".
export function Story({ time, children }: { time: string; children: React.ReactNode }) {
  return <p className="story"><b>{time}</b>{children}</p>;
}
