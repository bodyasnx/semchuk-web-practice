// Логотип вбудовано в розмітку (а не <img>), щоб кольори бралися з CSS-змінних і мінялися з темою.
const PETALS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function Logo() {
  return (
    <svg viewBox="0 0 260 56" width="260" height="56" role="img" aria-label="Смак Традиції — на головну">
      <g transform="translate(28 28)">
        {PETALS.map((angle, index) => (
          <path
            key={angle}
            d="M0 0L4.97-12L0-24L-4.97-12Z"
            transform={`rotate(${angle})`}
            style={{ fill: index % 2 ? 'var(--color-primary,#1F5135)' : 'var(--color-ornament,#B3261E)' }}
          />
        ))}
        <path d="M0-3.2L3.2 0L0 3.2L-3.2 0Z" style={{ fill: 'var(--color-bg,#FBF6EC)' }} />
      </g>
      <text
        x="62"
        y="37"
        style={{
          fontFamily: "Lora,Georgia,'Times New Roman',serif",
          fontSize: '24px',
          fontWeight: 700,
          fill: 'var(--color-text,#1C2620)',
        }}
      >
        Смак Традиції
      </text>
    </svg>
  );
}
