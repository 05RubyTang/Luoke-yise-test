/**
 * PlanIcon — 方案属性图标
 * 优先使用 iconImg（PNG），回退到 icon（emoji）
 */
export default function PlanIcon({ plan, size = 28, style = {} }) {
  if (plan.iconImg) {
    return (
      <img
        src={plan.iconImg}
        alt={plan.type}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
          ...style,
        }}
      />
    );
  }
  return (
    <span style={{ fontSize: size * 0.85, lineHeight: 1, ...style }}>
      {plan.icon}
    </span>
  );
}
