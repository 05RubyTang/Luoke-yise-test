export default function ProgressBar({ current, total, color }) {
  const pct = Math.min((current / total) * 100, 100);

  let fillColor = color;
  if (!fillColor) {
    if (pct >= 100) fillColor = 'var(--success)';
    else if (pct >= 75) fillColor = 'var(--cta)';
    else fillColor = '#FBC839';
  }

  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%`, background: fillColor }}
      />
    </div>
  );
}
