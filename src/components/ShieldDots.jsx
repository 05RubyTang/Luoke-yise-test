export default function ShieldDots({ breaks, max = 80 }) {
  const dots = [];
  for (let i = 0; i < max; i++) {
    const b = breaks[i];
    let cls = 'shield-dot';
    if (b) {
      cls += ` ${b.result}`;
      if (i === breaks.length - 1) cls += ' latest';
    }
    dots.push(<div key={i} className={cls} />);
  }
  return <div className="shield-dots">{dots}</div>;
}
