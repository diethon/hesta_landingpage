// Logo HESTA (concepts-v7 #13) dựng lại bằng SVG: 2 khối lệch tầng + bậc nối, để animate từng mảnh.
// Khung gốc 399×624; mảnh nối chồng lên mép 2 khối nên ghép lại liền khối.
export function HMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="0 0 399 624" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect className="h-l" x="0" y="0" width="124" height="562" fill="currentColor" />
      <rect className="h-r" x="274" y="62" width="125" height="562" fill="currentColor" />
      <path className="h-c" d="M123 234H249V296H275V421H149V359H123Z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ tone = "dark", tagline = true }: { tone?: "dark" | "light"; tagline?: boolean }) {
  return (
    <span className={`logo logo-${tone}`}>
      <HMark className="logo-mark" />
      <span className="logo-words">
        <span className="logo-name">HESTA</span>
        {tagline && <span className="logo-tag">SMART HOME SYSTEM</span>}
      </span>
    </span>
  );
}
