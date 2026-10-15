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

/** Flat Hello Kitty, waving: white head, pink bow, blue overalls, striped shirt. */
export function HelloKitty({ size = 48 }: { size?: number }) {
  const ink = "#3A3A3A";
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" aria-hidden="true">
      {/* body: striped shirt arms, blue overalls, white feet and paws */}
      <path d="M30 70 Q22 78 24 88 Q28 92 33 88 L36 78 Z" fill="#E8607E" />
      <path d="M27 76 L33 80 M25 82 L32 85" stroke="#fff" strokeWidth="2.4" />
      <path d="M70 70 Q78 72 80 62 Q82 56 77 55 L72 66 Z" fill="#E8607E" />
      <path d="M73 63 L79 65 M74 68 L80 69" stroke="#fff" strokeWidth="2.4" />
      <rect x="32" y="66" width="36" height="12" rx="4" fill="#E8607E" />
      <path d="M36 70 H64 M36 75 H64" stroke="#fff" strokeWidth="2.4" />
      <path d="M33 76 Q33 98 50 98 Q67 98 67 76 Z" fill="#1E5FA8" />
      <rect x="39" y="70" width="5" height="9" fill="#1E5FA8" />
      <rect x="56" y="70" width="5" height="9" fill="#1E5FA8" />
      <circle cx="41.5" cy="80" r="2.4" fill="#fff" />
      <circle cx="58.5" cy="80" r="2.4" fill="#fff" />
      <ellipse cx="27" cy="89" rx="6" ry="5.5" fill="#fff" />
      <ellipse cx="78" cy="52" rx="5.5" ry="6" fill="#fff" />
      <path d="M77 46 Q80 44 82 47" stroke="#BFD7EA" strokeWidth="1.5" fill="none" />
      <rect x="37" y="95" width="11" height="12" rx="5" fill="#fff" />
      <rect x="52" y="95" width="11" height="12" rx="5" fill="#fff" />
      {/* head with ears */}
      <path d="M17 22 L22 6 L34 16 Z" fill="#fff" />
      <path d="M83 22 L78 6 L66 16 Z" fill="#fff" />
      <ellipse cx="50" cy="40" rx="38" ry="28" fill="#fff" />
      {/* bow */}
      <ellipse cx="68" cy="13" rx="11" ry="8" fill="#E8607E" transform="rotate(-25 68 13)" />
      <ellipse cx="80" cy="25" rx="9" ry="7" fill="#E8607E" transform="rotate(35 80 25)" />
      <circle cx="73" cy="19" r="6" fill="#E8607E" stroke="#fff" strokeWidth="1.6" />
      <circle cx="64" cy="11" r="3" fill="none" stroke="#fff" strokeWidth="1.4" />
      {/* face: eyes, yellow nose, whiskers */}
      <ellipse cx="34" cy="43" rx="3.4" ry="4.6" fill={ink} />
      <ellipse cx="66" cy="43" rx="3.4" ry="4.6" fill={ink} />
      <ellipse cx="50" cy="51" rx="4.2" ry="3" fill="#F5C77E" />
      <path d="M4 38 L22 41 M3 46 L21 47 M5 54 L22 52 M96 38 L78 41 M97 46 L79 47 M95 54 L78 52" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
