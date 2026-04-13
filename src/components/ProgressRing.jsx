export default function ProgressRing({ current, total, size = 110 }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = total > 0 ? current / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBC839" />
          <stop offset="100%" stopColor="#D4560A" />
        </linearGradient>
      </defs>

      {/* 轨道 */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="#F0E8D5"
        strokeWidth={stroke}
      />
      {/* 进度弧 */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />

      {/* 中心文字 */}
      <text
        x={size / 2} y={size / 2 - 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="22"
        fontWeight="900"
        fill="#2B2A2E"
        fontFamily="'Noto Sans SC', sans-serif"
      >
        {current}
      </text>
      <text
        x={size / 2} y={size / 2 + 11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fill="#A09080"
        fontFamily="'Noto Sans SC', sans-serif"
      >
        / {total}
      </text>
    </svg>
  );
}
