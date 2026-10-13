/** Falling cherry blossom petals, the same CSS animation as Nihongo Quest. */
export default function SakuraPetals({ count = 18 }: { count?: number }) {
  return (
    <div className="sakura" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${(i * 6.3 + 3) % 100}%`,
            animationDuration: `${9 + ((i * 7) % 9)}s`,
            animationDelay: `${-((i * 1.7) % 12)}s`,
          }}
        />
      ))}
    </div>
  );
}
