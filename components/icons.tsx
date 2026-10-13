/* Small hand-drawn SVG pictures used instead of emoji. */

export function Narutomaki({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="#FFF7F0" stroke="#F3D9C8" strokeWidth="2" />
      <path d="M2.5 13 L5 15.5 L2.5 18 M29.5 13 L27 15.5 L29.5 18" stroke="#F3D9C8" strokeWidth="2" fill="none" />
      <path
        d="M16 16 m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.5 3.5 0 0 1 3.5 -3.5 a5.5 5.5 0 0 1 5.5 5.5 a7.5 7.5 0 0 1 -7.5 7.5 a9 9 0 0 1 -9 -9"
        stroke="#FF5CA8"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Bug({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true" className="bug">
      <g stroke="#0B3528" strokeWidth="2.5" strokeLinecap="round">
        <path d="M10 18 L4 14 M10 24 L3 24 M10 30 L4 35 M34 18 L40 14 M34 24 L41 24 M34 30 L40 35 M17 9 L13 3 M27 9 L31 3" />
      </g>
      <ellipse cx="22" cy="25" rx="12" ry="14" fill="#7CFF5B" stroke="#0B3528" strokeWidth="2.5" />
      <circle cx="22" cy="11" r="6" fill="#2BF07A" stroke="#0B3528" strokeWidth="2.5" />
      <path d="M22 13 L22 38" stroke="#0B3528" strokeWidth="2" />
      <circle cx="16" cy="22" r="2.4" fill="#0B3528" />
      <circle cx="28" cy="29" r="2.4" fill="#0B3528" />
      <circle cx="19.5" cy="10" r="1.3" fill="#fff" />
      <circle cx="24.5" cy="10" r="1.3" fill="#fff" />
    </svg>
  );
}

export function Tick({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 26 26" className={className} aria-hidden="true">
      <rect x="1" y="1" width="24" height="24" rx="6" fill="#39FF14" />
      <path d="M7 13.5 L11.5 18 L19.5 8.5" stroke="#041029" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Sakura({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d="M20 20 C 13 12, 14 4, 20 6 C 26 4, 27 12, 20 20 Z"
          fill="#FFC2D4"
          stroke="#FF8FB1"
          strokeWidth="1.2"
          transform={`rotate(${a} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="3.4" fill="#FF5CA8" />
    </svg>
  );
}
